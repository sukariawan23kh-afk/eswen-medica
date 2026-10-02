import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { formatIDR } from "@/lib/eswen/booking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PaySchema = z.object({
  paymentMethod: z.enum(["Credit Card", "Virtual Account", "E-Wallet", "QRIS", "Bank Transfer"]),
  paymentGateway: z.enum(["Midtrans", "Xendit", "Stripe"]),
  // For testing/demo: allow forcing a failed payment to show the PAYMENT_FAILED path.
  simulateFail: z.boolean().optional(),
});

/**
 * POST /api/bookings/[id]/pay
 * Simulates the payment gateway callback: verifies the deposit, then flips the
 * booking status from WAITING_PAYMENT → CONFIRMED (or → PAYMENT_FAILED if the
 * gateway reports a failure). Booking is never CONFIRMED until this verification.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ ok: false, error: "Booking id is required." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = PaySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid payment input.", issues: parsed.error.issues },
      { status: 400 }
    );
  }
  const { paymentMethod, paymentGateway, simulateFail } = parsed.data;

  try {
    const booking = await db.booking.findUnique({ where: { id } });
    if (!booking) {
      return NextResponse.json({ ok: false, error: "Booking not found." }, { status: 404 });
    }
    if (booking.status !== "WAITING_PAYMENT") {
      return NextResponse.json(
        {
          ok: false,
          error: `Booking is not awaiting payment (current status: ${booking.status}).`,
        },
        { status: 409 }
      );
    }

    // ── Manual flow: Bank Transfer ──────────────────────────────────────────
    // The client transfers offline to the clinic's bank account. We do NOT
    // auto-confirm — the booking stays WAITING_PAYMENT until an admin verifies
    // the deposit arrived in the company account and clicks "Approve Payment".
    if (paymentMethod === "Bank Transfer") {
      const updated = await db.booking.update({
        where: { id },
        data: { paymentMethod, paymentGateway: "Manual" },
      });
      return NextResponse.json({
        ok: true,
        paymentOk: false, // not yet — awaiting admin confirmation
        manual: true,
        message:
          "Transfer request recorded. Your booking is awaiting payment confirmation — our admin will confirm once your transfer is received.",
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
    }

    // ── Gateway flow: Credit Card / VA / E-Wallet / QRIS ───────────────────
    // (Currently simulated — for real money flow, integrate Midtrans/Xendit/
    //  Stripe here. See the payment guide in the admin Bookings tab.)
    await new Promise((r) => setTimeout(r, 300 + Math.floor(Math.random() * 600)));
    const gatewayOk = !simulateFail && Math.random() > 0.05;

    const updated = await db.booking.update({
      where: { id },
      data: {
        status: gatewayOk ? "CONFIRMED" : "PAYMENT_FAILED",
        paymentMethod,
        paymentGateway,
        confirmedAt: gatewayOk ? new Date() : null,
      },
    });

    return NextResponse.json({
      ok: true,
      paymentOk: gatewayOk,
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
      { ok: false, error: "Payment verification failed.", debug: msg },
      { status: 500 }
    );
  }
}
