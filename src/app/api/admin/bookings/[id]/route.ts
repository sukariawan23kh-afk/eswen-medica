import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/eswen/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_STATUSES = [
  "WAITING_PAYMENT",
  "CONFIRMED",
  "PAYMENT_FAILED",
  "CHECKED IN",
  "IN TREATMENT",
  "COMPLETED",
  "CANCELLED",
  "NO SHOW",
] as const;

const UpdateSchema = z.object({
  status: z.enum(VALID_STATUSES),
});

/**
 * PUT /api/admin/bookings/[id]
 * Update a booking's status (e.g. mark CONFIRMED → CHECKED IN → COMPLETED, or CANCELLED).
 */
export async function PUT(
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
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid status.", issues: parsed.error.issues },
      { status: 400 }
    );
  }
  try {
    const updated = await db.booking.update({
      where: { id },
      data: { status: parsed.data.status },
    });
    return NextResponse.json({ ok: true, booking: { id: updated.id, status: updated.status } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: "Failed to update.", debug: msg }, { status: 500 });
  }
}
