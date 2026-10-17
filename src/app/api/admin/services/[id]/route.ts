import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/eswen/admin-auth";
import { translateIdToEn } from "@/lib/eswen/auto-translate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UpdateSchema = z.object({
  categoryEn: z.string().min(1).max(80).optional(),
  categoryId: z.string().min(1).max(80).optional(),
  nameEn: z.string().min(2).max(200).optional(),
  nameId: z.string().min(2).max(200).optional(),
  descriptionEn: z.string().min(5).max(1000).optional(),
  descriptionId: z.string().min(5).max(1000).optional(),
  startingPrice: z.string().max(40).optional(),
  deposit: z.number().int().min(0).max(10000000).optional(),
  icon: z.string().max(60).optional(),
  image: z.string().max(500).optional(),
  brand: z.string().max(20).optional(),
  order: z.number().int().optional(),
  published: z.boolean().optional(),
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
    const d = parsed.data;
    // Auto-translate ID → EN if EN fields are empty (admin only inputs Indonesian)
    if (d.nameEn === "" && d.nameId) d.nameEn = await translateIdToEn(d.nameId);
    if (d.descEn === "" && d.descId) d.descEn = await translateIdToEn(d.descId);
    if (d.categoryEn === "" && d.categoryId) d.categoryEn = await translateIdToEn(d.categoryId);
    const { gallery, ...rest } = d;
    const data: Record<string, unknown> = { ...rest };
    if (gallery !== undefined) {
      data.gallery = gallery.length > 0 ? JSON.stringify(gallery) : null;
    }
    const updated = await db.service.update({ where: { id }, data });
    return NextResponse.json({ ok: true, service: { id: updated.id } });
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
    await db.service.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: "Failed to delete.", debug: msg }, { status: 500 });
  }
}
