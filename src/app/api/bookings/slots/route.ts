import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { TIME_SLOTS, getBookedSlots, isValidBookingDate } from "@/lib/eswen/booking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/bookings/slots?doctorId=...&date=YYYY-MM-DD
 * Returns the full list of daily slots with a `booked` flag for each.
 * Real-time availability — slots already booked are flagged so the UI can
 * disable them and prevent double booking.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const doctorId = (searchParams.get("doctorId") ?? "").trim();
  const date = (searchParams.get("date") ?? "").trim();

  if (!doctorId) {
    return NextResponse.json(
      { ok: false, error: "doctorId is required." },
      { status: 400 }
    );
  }
  if (!(await db.doctor.findUnique({ where: { id: doctorId } }))) {
    return NextResponse.json(
      { ok: false, error: "Doctor not found." },
      { status: 404 }
    );
  }
  if (!date || !isValidBookingDate(date)) {
    return NextResponse.json(
      { ok: false, error: "Invalid or out-of-range date. Max 14 days ahead." },
      { status: 400 }
    );
  }

  try {
    const booked = new Set(await getBookedSlots(doctorId, date));
    const slots = TIME_SLOTS.map((time) => ({
      time,
      booked: booked.has(time),
    }));
    return NextResponse.json({
      ok: true,
      doctorId,
      date,
      slots,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { ok: false, error: "Failed to load slots.", debug: msg },
      { status: 500 }
    );
  }
}
