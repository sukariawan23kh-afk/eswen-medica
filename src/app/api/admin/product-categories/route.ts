import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/eswen/admin-auth";
import { ensureApotekSeeded } from "@/lib/eswen/seed-apotek";
import { translateIdToEn } from "@/lib/eswen/auto-translate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/product-categories
 * Admin-only. Returns all product categories (including inactive), ordered.
 * Used by the admin "Apotek" tab → Categories sub-section.
 */
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  try {
    await ensureApotekSeeded();
    const cats = await db.productCategory.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { products: true } } },
    });
    return NextResponse.json({
      ok: true,
      categories: cats.map((c) => ({
        id: c.id,
        nameId: c.nameId,
        nameEn: c.nameEn,
        order: c.order,
        active: c.active,
        productsCount: c._count.products,
      })),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: "Failed.", debug: msg }, { status: 500 });
  }
}

const CreateSchema = z.object({
  nameId: z.string().min(1).max(120),
  nameEn: z.string().max(200).default(""),  // ignored — auto-translated from ID
  order: z.number().int().default(0),
  active: z.boolean().default(true),
});

/**
 * POST /api/admin/product-categories
 * Admin-only. Creates a new category. Admin only inputs `nameId`
 * (Indonesian); `nameEn` is auto-translated via translateIdToEn (MyMemory
 * API; falls back to the ID text on error).
 */
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid input.", issues: parsed.error.issues },
      { status: 400 }
    );
  }
  try {
    const d = parsed.data;
    // FAST SAVE: copy ID → EN directly (no MyMemory API call).
    const created = await db.productCategory.create({
      data: {
        nameId: d.nameId,
        nameEn: d.nameId,
        order: d.order,
        active: d.active,
      },
    });
    return NextResponse.json({ ok: true, category: { id: created.id } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: "Failed to create.", debug: msg }, { status: 500 });
  }
}
