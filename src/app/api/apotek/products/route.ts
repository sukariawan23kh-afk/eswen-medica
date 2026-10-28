import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureApotekSeeded } from "@/lib/eswen/seed-apotek";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PAGE_SIZE = 8;

/**
 * GET /api/apotek/products?categoryId=xxx&page=1&search=xxx
 * Public endpoint. Returns active products, optionally filtered by
 * category, paginated (8 per page). Used by the storefront overlay
 * (apotek-store.tsx) for the product grid.
 *
 * Search: filters by nameId/nameEn containing the search string (case-
 * insensitive). Empty search returns all (within the active category).
 *
 * Returns:
 *   {
 *     ok: true,
 *     products: [{ id, name: {en,id}, shortDesc: {en,id},
 *                  fullDesc: {en,id}, dosage: {en,id}, usage: {en,id},
 *                  precautions: {en,id}, price, image, stock,
 *                  category: {en,id} }],
 *     total, page, totalPages
 *   }
 *
 * EN falls back to ID when empty (matches the established services/docs
 * pattern) so the storefront never shows blank fields in either lang.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId")?.trim() || undefined;
    const search = searchParams.get("search")?.trim() || "";
    const pageRaw = Number(searchParams.get("page") ?? "1");
    const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1;

    await ensureApotekSeeded();

    // Build the where clause — only active products, optional category
    // filter, optional name search (case-insensitive contains on either
    // the ID or EN name).
    const where: {
      active: boolean;
      categoryId?: string;
      OR?: Array<{ nameId: { contains: string } } | { nameEn: { contains: string } }>;
    } = { active: true };
    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { nameId: { contains: search } },
        { nameEn: { contains: search } },
      ];
    }

    const [total, products] = await Promise.all([
      db.product.count({ where }),
      db.product.findMany({
        where,
        orderBy: { order: "asc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          category: {
            select: { nameId: true, nameEn: true },
          },
        },
      }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    // EN-fallback helper (matches the services/site-config pattern).
    const en = (enVal: string | null | undefined, idVal: string | null | undefined) =>
      enVal && enVal.trim() ? enVal : (idVal ?? "");

    return NextResponse.json({
      ok: true,
      products: products.map((p) => ({
        id: p.id,
        // categoryId exposed so the storefront can filter by it without
        // an extra round-trip (e.g. "show only products in this category").
        categoryId: p.categoryId,
        name: { en: en(p.nameEn, p.nameId), id: p.nameId },
        shortDesc: { en: en(p.shortDescEn, p.shortDescId), id: p.shortDescId },
        fullDesc: { en: en(p.fullDescEn, p.fullDescId), id: p.fullDescId ?? "" },
        dosage: { en: en(p.dosageEn, p.dosageId), id: p.dosageId ?? "" },
        usage: { en: en(p.usageEn, p.usageId), id: p.usageId ?? "" },
        precautions: { en: en(p.precautionsEn, p.precautionsId), id: p.precautionsId ?? "" },
        price: p.price,
        image: p.image,
        stock: p.stock,
        category: {
          en: en(p.category.nameEn, p.category.nameId),
          id: p.category.nameId,
        },
        order: p.order,
      })),
      total,
      page,
      totalPages,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { ok: false, error: "Failed to load products.", debug: msg },
      { status: 500 }
    );
  }
}
