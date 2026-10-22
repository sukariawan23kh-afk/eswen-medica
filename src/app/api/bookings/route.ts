import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/eswen/admin-auth";
import { formatIDR } from "@/lib/eswen/booking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/bookings/[id]
 * Fetch a single booking by id. Returns all fields needed by the client
 * booking dialog (status, declared-transfer flags, deposit, refCode, etc.)
 * so the client can render the dynamic status pill ("Menunggu Pembayaran" /
 * "Menunggu Verifikasi" / "Confirmed") after a page refresh.
 *
 * Auth:
 *   - Admin (valid eswen_admin cookie) → may fetch any booking.
 *   - Patient → must supply ?email=<patient email> that case-insensitively
 *     matches the booking's patientEmail (same gate as the proof endpoint).
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { ok: false, error: "Booking id is required." },
      { status: 400 }
    );
  }

  try {
    const booking = await db.booking.findUnique({ where: { id } });
    if (!booking) {
      return NextResponse.json(
        { ok: false, error: "Booking not found." },
        { status: 404 }
      );
    }

    // Authorization: admin OR matching patient email.
    const admin = isAdmin(req);
    if (!admin) {
      const email = (new URL(req.url).searchParams.get("email") ?? "")
        .trim()
        .toLowerCase();
      const patientEmail = (booking.patientEmail ?? "").trim().toLowerCase();
      if (!email || !patientEmail || email !== patientEmail) {
        return NextResponse.json(
          {
            ok: false,
            error: "Unauthorized — email does not match this booking.",
          },
          { status: 401 }
        );
      }
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
        patientEmail: booking.patientEmail,
        clientDeclaredTransfer: booking.clientDeclaredTransfer,
        clientDeclaredAt: booking.clientDeclaredAt?.toISOString() ?? "",
        confirmedAt: booking.confirmedAt?.toISOString() ?? "",
        createdAt: booking.createdAt.toISOString(),
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
