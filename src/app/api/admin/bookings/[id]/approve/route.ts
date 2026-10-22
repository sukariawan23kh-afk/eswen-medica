import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/eswen/admin-auth";
import { formatIDR } from "@/lib/eswen/booking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ApproveSchema = z.object({
  note: z.string().max(500).optional(),
});

/**
 * POST /api/admin/bookings/[id]/approve
 * Manual payment confirmation: the admin has verified that the deposit
 * arrived in the clinic's bank account (e.g. for a Bank Transfer) and is
 * now marking the booking as CONFIRMED. Records the note (bank ref / date
 * received) + confirmedAt timestamp for audit.
 *
 * This is the "approve if funds received" action the clinic uses in real life.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const parsed = ApproveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid input." }, { status: 400 });
  }

  try {
    const booking = await db.booking.findUnique({ where: { id } });
    if (!booking) {
      return NextResponse.json({ ok: false, error: "Booking not found." }, { status: 404 });
    }
    if (booking.status === "CONFIRMED") {
      return NextResponse.json({ ok: false, error: "Booking is already confirmed." }, { status: 409 });
    }
    if (booking.status === "CANCELLED" || booking.status === "NO SHOW" || booking.status === "COMPLETED") {
      return NextResponse.json(
        { ok: false, error: `Cannot approve a booking with status: ${booking.status}.` },
        { status: 409 }
      );
    }

    const updated = await db.booking.update({
      where: { id },
      data: {
        status: "CONFIRMED",
        paymentGateway: booking.paymentGateway ?? "Manual",
        paymentNote: parsed.data.note ?? booking.paymentNote ?? null,
        confirmedAt: new Date(),
      },
    });

    return NextResponse.json({
      ok: true,
      booking: {
        id: updated.id,
        refCode: updated.refCode,
        status: updated.status,
        paymentMethod: updated.paymentMethod,
        paymentGateway: updated.paymentGateway,
        paymentNote: updated.paymentNote,
        confirmedAt: updated.confirmedAt?.toISOString(),
        depositFormatted: formatIDR(updated.depositAmount),
        clientDeclaredTransfer: updated.clientDeclaredTransfer,
        clientDeclaredAt: updated.clientDeclaredAt?.toISOString() ?? "",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: "Failed to approve.", debug: msg }, { status: 500 });
  }
}