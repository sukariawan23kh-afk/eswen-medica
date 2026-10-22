import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { formatIDR } from "@/lib/eswen/booking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/bookings/[id]/pay
 *
 * Online payment methods (Credit Card / QRIS / E-Wallet / Virtual Account)
 * were removed — the clinic ONLY accepts Bank Transfer to its company bank
 * account. The booking dialog no longer calls this endpoint; the booking is
 * created with `paymentMethod = "Bank Transfer"` + `paymentGateway = "Manual"`
 * directly and stays in WAITING_PAYMENT until an admin verifies the deposit.
 *
 * This endpoint is kept as a thin no-op so any older link/client that still
 * targets it gets a friendly "you must transfer offline" response instead of
 * a 404, and so the audit trail (paymentMethod / paymentGateway on the
 * booking) is set consistently regardless of the entry point.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ ok: false, error: "Booking id is required." }, { status: 400 });
  }

  try {
    const booking = await db.booking.findUnique({ where: { id } });
    if (!booking) {
      return NextResponse.json({ ok: false, error: "Booking not found." }, { status: 404 });
    }

    // Always reflect the manual bank-transfer state on the booking.
    const updated = await db.booking.update({
      where: { id },
      data: {
        paymentMethod: "Bank Transfer",
        paymentGateway: "Manual",
      },
    });

    return NextResponse.json({
      ok: true,
      paymentOk: false, // still awaiting admin confirmation
      manual: true,
      message:
        "Please transfer the deposit to the clinic's bank account. Our admin will confirm your booking once the transfer is received.",
      booking: {
        id: updated.id,
        refCode: updated.refCode,
        status: updated.status,
        serviceName: updated.serviceName,
        doctorName: updated.doctorName,
        bookingDate: updated.bookingDate,
        bookingTime: updated.bookingTime,
        depositAmount: updated.depositAmount,
        depositFormatted: formatIDR(updated.depositAmount),
        paymentMethod: updated.paymentMethod,
        paymentGateway: updated.paymentGateway,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { ok: false, error: "Payment request failed.", debug: msg },
      { status: 500 }
    );
  }
}
