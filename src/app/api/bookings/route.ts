import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  generateRefCode,
  getServiceById,
  getDoctorById,
  isValidBookingDate,
  isValidSlot,
  getBookedSlots,
  formatIDR,
} from "@/lib/eswen/booking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CreateSchema = z.object({
  serviceId: z.string().min(1),
  doctorId: z.string().min(1),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  bookingTime: z.string().min(1),
  patientName: z.string().min(2).max(80),
  patientEmail: z.string().email(),
  patientPhone: z.string().min(6).max(24),
  patientNotes: z.string().max(500).optional(),
});

/**
 * POST /api/bookings
 * Creates a booking in WAITING_PAYMENT status. The slot is reserved atomically:
 * if another booking already occupies the same doctor + date + time (and is in
 * an active status), the request is rejected → no double booking.
 *
 * The ENTIRE handler body is wrapped in a try/catch so that ANY error (DB
 * connection, missing table/column, Prisma Client mismatch, etc.) returns a
 * JSON 500 response instead of crashing and returning Vercel's default HTML
 * error page (which the client can't parse as JSON → "Unexpected end of JSON
 * input").
 */
export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
    }

    const parsed = CreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid input.", issues: parsed.error.issues },
        { status: 400 }
      );
    }
    const data = parsed.data;

    // Look up the service + doctor from the DB (admin-editable catalog).
    const service = await db.service.findUnique({ where: { id: data.serviceId } });
    const doctor = await db.doctor.findUnique({ where: { id: data.doctorId } });
    if (!service || !doctor) {
      return NextResponse.json(
        { ok: false, error: "Service or doctor not found." },
        { status: 404 }
      );
    }

    // Doctors must be medical professionals (category "doctor" or "wellness").
    if (doctor.category !== "doctor" && doctor.category !== "wellness") {
      return NextResponse.json(
        { ok: false, error: "Selected professional is not available for this service." },
        { status: 400 }
      );
    }

    if (!isValidBookingDate(data.bookingDate)) {
      return NextResponse.json(
        { ok: false, error: "Invalid or out-of-range date." },
        { status: 400 }
      );
    }
    if (!isValidSlot(data.bookingTime)) {
      return NextResponse.json(
        { ok: false, error: "Invalid time slot." },
        { status: 400 }
      );
    }

    // Atomic double-booking guard: check + create in a transaction.
    const created = await db.$transaction(async (tx) => {
      const booked = await getBookedSlots(data.doctorId, data.bookingDate);
      if (booked.includes(data.bookingTime)) {
        throw new Error("SLOT_TAKEN");
      }

      // Generate a unique ref code (retry on collision, max 5 attempts)
      let refCode = generateRefCode();
      for (let i = 0; i < 5; i++) {
        const existing = await tx.booking.findUnique({ where: { refCode } });
        if (!existing) break;
        refCode = generateRefCode();
      }

      return tx.booking.create({
        data: {
          refCode,
          serviceId: service.id,
          serviceName: service.nameEn,
          doctorId: doctor.id,
          doctorName: doctor.name,
          brand: service.brand,
          bookingDate: data.bookingDate,
          bookingTime: data.bookingTime,
          status: "WAITING_PAYMENT",
          paymentMethod: "Bank Transfer",
          paymentGateway: "Manual",
          patientName: data.patientName,
          patientEmail: data.patientEmail,
          patientPhone: data.patientPhone,
          patientNotes: data.patientNotes ?? null,
          depositAmount: service.deposit,
        },
      });
    });

    return NextResponse.json({
      ok: true,
      booking: {
        id: created.id,
        refCode: created.refCode,
        status: created.status,
        serviceId: created.serviceId,
        serviceName: created.serviceName,
        doctorId: created.doctorId,
        doctorName: created.doctorName,
        bookingDate: created.bookingDate,
        bookingTime: created.bookingTime,
        depositAmount: created.depositAmount,
        depositFormatted: formatIDR(created.depositAmount),
        paymentMethod: created.paymentMethod,
        paymentGateway: created.paymentGateway,
        patientName: created.patientName,
        patientEmail: created.patientEmail,
        clientDeclaredTransfer: created.clientDeclaredTransfer,
        clientDeclaredAt: created.clientDeclaredAt?.toISOString() ?? "",
        createdAt: created.createdAt,
      },
    });
  } catch (err) {
    // Catch ALL errors → return JSON 500 instead of crashing → HTML error page
    const msg = err instanceof Error ? err.message : String(err);
    if (msg === "SLOT_TAKEN") {
      return NextResponse.json(
        {
          ok: false,
          error: "This slot was just booked by someone else. Please choose another time.",
          code: "SLOT_TAKEN",
        },
        { status: 409 }
      );
    }
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to create booking.",
        debug: msg,
        stack: err instanceof Error ? err.stack?.split("\n").slice(0, 5).join(" | ") : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/bookings?ref=ESM-XXXXXX
 * Look up a booking by its human-friendly reference code (for the "check my
 * booking" use case). Returns a 404 if not found.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ref = (searchParams.get("ref") ?? "").trim().toUpperCase();

  if (!ref) {
    return NextResponse.json(
      { ok: false, error: "Reference code is required." },
      { status: 400 }
    );
  }

  try {
    const booking = await db.booking.findUnique({ where: { refCode: ref } });
    if (!booking) {
      return NextResponse.json(
        { ok: false, error: "Booking not found. Check your reference code." },
        { status: 404 }
      );
    }
    return NextResponse.json({
      ok: true,
      booking: {
        id: booking.id,
        refCode: booking.refCode,
        status: booking.status,
        serviceName: booking.serviceName,
        doctorName: booking.doctorName,
        bookingDate: booking.bookingDate,
        bookingTime: booking.bookingTime,
        depositAmount: booking.depositAmount,
        depositFormatted: formatIDR(booking.depositAmount),
        paymentMethod: booking.paymentMethod,
        paymentGateway: booking.paymentGateway,
        patientName: booking.patientName,
        clientDeclaredTransfer: booking.clientDeclaredTransfer,
        clientDeclaredAt: booking.clientDeclaredAt?.toISOString() ?? "",
        confirmedAt: booking.confirmedAt?.toISOString() ?? "",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { ok: false, error: "Failed to fetch booking.", debug: msg },
      { status: 500 }
    );
  }
}