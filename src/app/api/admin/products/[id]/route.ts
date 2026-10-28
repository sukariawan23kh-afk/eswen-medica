import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/eswen/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UpdateSchema = z.object({
  categoryId: z.string().optional(),
  nameId: z.string().max(200).optional(),
  nameEn: z.string().max(200).optional(),
  shortDescId: z.string().max(500).optional(),
  shortDescEn: z.string().max(500).optional(),
  fullDescId: z.string().optional(),
  fullDescEn: z.string().optional(),
  dosageId: z.string().optional(),
  dosageEn: z.string().optional(),
  usageId: z.string().optional(),
  usageEn: z.string().optional(),
  precautionsId: z.string().optional(),
  precautionsEn: z.string().optional(),
  price: z.string().max(40).optional(),
  image: z.string().max(500).optional(),
  stock: z.number().int().optional(),
  active: z.boolean().optional(),
  order: z.number().int().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  const { id } = await params;
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid input.", issues: parsed.error.issues }, { status: 400 });
  }
  try {
    const d = parsed.data as Record<string, unknown>;
    // FAST SAVE: copy ID → EN directly (no MyMemory API call).
    if (d.nameId !== undefined) d.nameEn = d.nameId;
    if (d.shortDescId !== undefined) d.shortDescEn = d.shortDescId;
    if (d.fullDescId !== undefined) d.fullDescEn = d.fullDescId || null;
    if (d.dosageId !== undefined) d.dosageEn = d.dosageId || null;
    if (d.usageId !== undefined) d.usageEn = d.usageId || null;
    if (d.precautionsId !== undefined) d.precautionsEn = d.precautionsId || null;
    const updated = await db.product.update({ where: { id }, data: d });
    return NextResponse.json({ ok: true, product: { id: updated.id } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: "Failed to update.", debug: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  const { id } = await params;
  try {
    await db.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: "Failed to delete.", debug: msg }, { status: 500 });
  }
}