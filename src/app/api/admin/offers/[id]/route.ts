import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/eswen/admin-auth";
import { translateIdToEn } from "@/lib/eswen/auto-translate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UpdateSchema = z.object({
  titleEn: z.string().min(2).max(200).optional(),
  titleId: z.string().min(2).max(200).optional(),
  descEn: z.string().min(5).max(2000).optional(),
  descId: z.string().min(5).max(2000).optional(),
  offerType: z.string().max(30).optional(),
  badge: z.string().max(40).nullable().optional(),
  imageUrl: z.string().max(500).nullable().optional(),
  ctaTextEn: z.string().max(80).nullable().optional(),
  ctaTextId: z.string().max(80).nullable().optional(),
  ctaLink: z.string().max(300).nullable().optional(),
  active: z.boolean().optional(),
  priority: z.number().int().optional(),
  startAt: z.string().nullable().optional(),
  endAt: z.string().nullable().optional(),
});

/** PUT /api/admin/offers/[id] — update an offer. */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
      { ok: false, error: "Invalid input.", issues: parsed.error.issues },
      { status: 400 }
    );
  }
  try {
    const d = parsed.data;
    const data: Record<string, unknown> = { ...d };
    // ALWAYS re-translate EN from ID (admin only inputs Indonesian)
    if (d.titleId) data.titleEn = await translateIdToEn(d.titleId);
    if (d.descId) data.descEn = await translateIdToEn(d.descId);
    if (d.ctaTextId) data.ctaTextEn = await translateIdToEn(d.ctaTextId);
    if (d.startAt !== undefined) data.startAt = d.startAt ? new Date(d.startAt) : null;
    if (d.endAt !== undefined) data.endAt = d.endAt ? new Date(d.endAt) : null;
    if (d.priority !== undefined) data.priority = Number(d.priority) || 0;
    const updated = await db.specialOffer.update({ where: { id }, data });
    return NextResponse.json({ ok: true, offer: { id: updated.id } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: "Failed to update.", debug: msg }, { status: 500 });
  }
}

/** DELETE /api/admin/offers/[id] — delete an offer. */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  const { id } = await params;
  try {
    await db.specialOffer.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: "Failed to delete.", debug: msg }, { status: 500 });
  }
}
