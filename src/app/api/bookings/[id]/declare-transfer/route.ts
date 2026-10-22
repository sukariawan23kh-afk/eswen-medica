import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/eswen/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/bookings/[id]/declare-transfer
 * Body: { email: string }  // must match booking.patientEmail for security
 *
 * Client self-declares that they've made the bank transfer.
 * Sets clientDeclaredTransfer=true + clientDeclaredAt=now().
 * Status STAYS WAITING_PAYMENT (admin must still verify + approve).
 * Returns the updated booking.
 *
 * Security:
 *   - Admin (valid eswen_admin cookie) → can declare on behalf of any booking
 *     (without email check).
 *   - Patient → MUST supply `email` that case-insensitively matches the
 *     booking's patientEmail. Without this any visitor could flip any booking's
 *     declared flag.
 *
 * Idempotent: re-declaring returns a 200 with the existing booking (no error).
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: { email?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON." },
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

    // Security: admin bypasses the email check; everyone else must supply the
    // matching patient email (case-insensitive).
    const admin = isAdmin(req);
    if (!admin) {
      const providedEmail = (body.email ?? "").trim().toLowerCase();
      const patientEmail = (booking.patientEmail ?? "").trim().toLowerCase();
      if (!providedEmail || !patientEmail || providedEmail !== patientEmail) {
        return NextResponse.json(
          {
            ok: false,
            error: "Email does not match this booking.",
          },
          { status: 403 }
        );
      }
    }

    // Only meaningful on a booking that's still awaiting payment/verification.
    // If the booking has already advanced past WAITING_PAYMENT, the declaration
    // is a no-op (we still return the booking so the client UI stays in sync).
    if (booking.status !== "WAITING_PAYMENT") {
      return NextResponse.json({
        ok: true,
        message: "Booking is no longer awaiting transfer.",
        booking,
      });
    }

    // Idempotent: if already declared, just return the booking as-is.
    if (booking.clientDeclaredTransfer) {
      return NextResponse.json({
        ok: true,
        message: "Already declared.",
        booking,
      });
    }

    const updated = await db.booking.update({
      where: { id },
      data: {
        clientDeclaredTransfer: true,
        clientDeclaredAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true, booking: updated });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, error: "Failed to declare transfer.", debug: msg },
      { status: 500 }
    );
  }
}
