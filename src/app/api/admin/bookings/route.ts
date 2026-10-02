import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/eswen/admin-auth";
import { formatIDR } from "@/lib/eswen/booking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/bookings
 * Returns all bookings (newest first) for the admin dashboard.
 */
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  try {
    const bookings = await db.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return NextResponse.json({
      ok: true,
      bookings: bookings.map((b) => ({
        id: b.id,
        refCode: b.refCode,
        serviceName: b.serviceName,
        doctorName: b.doctorName,
        bookingDate: b.bookingDate,
        bookingTime: b.bookingTime,
        status: b.status,
        patientName: b.patientName,
        patientEmail: b.patientEmail,
        patientPhone: b.patientPhone,
        patientNotes: b.patientNotes ?? "",
        depositAmount: b.depositAmount,
        depositFormatted: formatIDR(b.depositAmount),
        paymentMethod: b.paymentMethod ?? "",
        paymentGateway: b.paymentGateway ?? "",
        paymentNote: b.paymentNote ?? "",
        confirmedAt: b.confirmedAt?.toISOString() ?? "",
        createdAt: b.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: "Failed.", debug: msg }, { status: 500 });
  }
}
