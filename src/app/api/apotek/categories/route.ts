import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureApotekSeeded } from "@/lib/eswen/seed-apotek";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/apotek/categories
 * Public endpoint. Returns active product categories, ordered by `order`.
 * Used by the storefront overlay (apotek-store.tsx) to render the sidebar.
 *
 * Returns:
 *   { ok: true, categories: [{ id, name: { en, id }, order }] }
 *
 * EN falls back to the ID text if empty (e.g. category was created before
 * auto-translate finished), so the sidebar is never blank in either lang.
 */
export async function GET() {
  try {
    await ensureApotekSeeded();

    const cats = await db.productCategory.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      select: {
        id: true,
        nameId: true,
        nameEn: true,
        order: true,
      },
    });

    return NextResponse.json({
      ok: true,
      categories: cats.map((c) => ({
        id: c.id,
        name: {
          en: c.nameEn && c.nameEn.trim() ? c.nameEn : c.nameId,
          id: c.nameId,
        },
        order: c.order,
      })),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { ok: false, error: "Failed to load categories.", debug: msg },
      { status: 500 }
    );
  }
}
