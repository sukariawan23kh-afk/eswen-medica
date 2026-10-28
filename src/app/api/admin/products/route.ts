import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/eswen/admin-auth";
import { ensureApotekSeeded } from "@/lib/eswen/seed-apotek";
import { translateIdToEn } from "@/lib/eswen/auto-translate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * GET /api/admin/products
 * Admin-only. Returns all products (including inactive), with their
 * category name. Ordered by `order`, then createdAt (newest first) as
 * a tiebreaker so newly-added products appear at the top of the admin
 * grid even before the admin sets an order value.
 */
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  try {
    await ensureApotekSeeded();
    const products = await db.product.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: {
        category: { select: { id: true, nameId: true, nameEn: true } },
      },
    });
    return NextResponse.json({
      ok: true,
      products: products.map((p) => ({
        id: p.id,
        categoryId: p.categoryId,
        category: {
          id: p.category.id,
          nameId: p.category.nameId,
          nameEn: p.category.nameEn,
        },
        nameId: p.nameId,
        nameEn: p.nameEn,
        shortDescId: p.shortDescId,
        shortDescEn: p.shortDescEn,
        fullDescId: p.fullDescId ?? "",
        fullDescEn: p.fullDescEn ?? "",
        dosageId: p.dosageId ?? "",
        dosageEn: p.dosageEn ?? "",
        usageId: p.usageId ?? "",
        usageEn: p.usageEn ?? "",
        precautionsId: p.precautionsId ?? "",
        precautionsEn: p.precautionsEn ?? "",
        price: p.price,
        image: p.image,
        stock: p.stock,
        active: p.active,
        order: p.order,
      })),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: "Failed.", debug: msg }, { status: 500 });
  }
}

const CreateSchema = z.object({
  categoryId: z.string().min(1),
  nameId: z.string().min(1).max(200),
  nameEn: z.string().max(300).default(""),               // ignored — auto-translated
  shortDescId: z.string().max(500).default(""),
  shortDescEn: z.string().max(800).default(""),           // ignored — auto-translated
  fullDescId: z.string().max(20000).optional().default(""),
  fullDescEn: z.string().max(30000).optional().default(""),// ignored — auto-translated
  dosageId: z.string().max(10000).optional().default(""),
  dosageEn: z.string().max(15000).optional().default(""), // ignored — auto-translated
  usageId: z.string().max(5000).optional().default(""),
  usageEn: z.string().max(8000).optional().default(""),   // ignored — auto-translated
  precautionsId: z.string().max(10000).optional().default(""),
  precautionsEn: z.string().max(15000).optional().default(""),// ignored — auto-translated
  price: z.string().max(60).default("Rp 0"),
  image: z.string().max(500).default("/images/service-medical.png"),
  stock: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
  order: z.number().int().default(0),
});

/**
 * POST /api/admin/products
 * Admin-only. Creates a new product. Admin only inputs the ID variants
 * (nameId, shortDescId, fullDescId, dosageId, usageId, precautionsId);
 * the EN counterparts are auto-translated on save via translateIdToEn
 * (MyMemory API; falls back to the ID text on error).
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
    // Verify the category exists (FK constraint would catch this anyway,
    // but we return a friendlier error message here).
    const cat = await db.productCategory.findUnique({ where: { id: d.categoryId } });
    if (!cat) {
      return NextResponse.json(
        { ok: false, error: "Category not found. Pick a valid category." },
        { status: 400 }
      );
    }

    // FAST SAVE: copy ID → EN directly (no MyMemory API call).
    // EN translation is done later via /api/admin/apotek-retranslate endpoint
    // to avoid Vercel function timeout (10s free tier) when 6+ fields
    // each take 1-3 seconds to translate.
    const created = await db.product.create({
      data: {
        categoryId: d.categoryId,
        nameId: d.nameId,
        nameEn: d.nameId,           // copy ID as EN fallback
        shortDescId: d.shortDescId,
        shortDescEn: d.shortDescId,  // copy ID as EN fallback
        fullDescId: d.fullDescId || null,
        fullDescEn: d.fullDescId || null,
        dosageId: d.dosageId || null,
        dosageEn: d.dosageId || null,
        usageId: d.usageId || null,
        usageEn: d.usageId || null,
        precautionsId: d.precautionsId || null,
        precautionsEn: d.precautionsId || null,
        price: d.price,
        image: d.image,
        stock: d.stock,
        active: d.active,
        order: d.order,
      },
    });
    return NextResponse.json({ ok: true, product: { id: created.id } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: "Failed to create.", debug: msg }, { status: 500 });
  }
}
