import { db } from "@/lib/db";
import { APOTEK_CATEGORIES, APOTEK_PRODUCTS } from "@/lib/eswen/apotek-data";

/**
 * Seed the Apotek (pharmacy) catalog if the DB tables are empty.
 *
 * Idempotent: only runs the inserts when ProductCategory / Product tables
 * are empty (i.e. first run after `db:push` or after a manual wipe).
 *
 * Pulls the SAME 16 products + 14 categories that are hardcoded in
 * `src/lib/eswen/apotek-data.ts` (and re-exported by the storefront
 * overlay `src/components/eswen/apotek-store.tsx`) so first-run
 * visitors see identical content in the storefront overlay — and the
 * admin can edit everything from there. Each product is given a random
 * stock between 10 and 50 to simulate a freshly-stocked pharmacy.
 *
 * After seeding, the admin can edit every field — categories, names,
 * descriptions, prices, images, stock, active flag — from the "Apotek"
 * tab in the admin panel; the public API + storefront reads from the
 * DB and falls back to the hardcoded constants if the API is empty.
 */

/** A random stock between min and max (inclusive) — simulated inventory. */
function randStock(min = 10, max = 50): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Ensure ProductCategory + Product tables are seeded. Idempotent.
 * Called from the public `/api/apotek/*` + admin `/api/admin/products*`
 * routes on every request (cheap `count()` short-circuits when populated).
 */
export async function ensureApotekSeeded() {
  // ---- Categories ----
  const catCount = await db.productCategory.count();
  if (catCount === 0) {
    await db.productCategory.createMany({
skipDuplicates: true,
      data: APOTEK_CATEGORIES.map((c, i) => ({
        nameId: c.id,
        nameEn: c.en, // pre-translated (hand-written) in apotek-data.ts
        order: i,
        active: true,
      })),
    });
  }

  // ---- Products ----
  const prodCount = await db.product.count();
  if (prodCount === 0) {
    // Build a slug → category-id map so we can attach products to the
    // correct ProductCategory row (categories were seeded above).
    const cats = await db.productCategory.findMany({ select: { id: true, nameId: true } });
    const slugToCatId = new Map<string, string>();
    APOTEK_CATEGORIES.forEach((c) => {
      const row = cats.find((r) => r.nameId === c.id);
      if (row) slugToCatId.set(c.slug, row.id);
    });

    const rows = APOTEK_PRODUCTS.map((p, i) => {
      const categoryId = slugToCatId.get(p.categorySlug);
      if (!categoryId) {
        // Should never happen — every seeded product's categorySlug is
        // in APOTEK_CATEGORIES. Skip silently if it does.
        return null;
      }
      return {
        categoryId,
        nameId: p.name,
        nameEn: p.name, // product names are mostly brand names — keep verbatim
        shortDescId: p.descriptionId,
        shortDescEn: p.descriptionEn,
        fullDescId: p.fullDescriptionId,
        fullDescEn: p.fullDescriptionEn,
        dosageId: p.dosageId,
        dosageEn: p.dosageEn,
        usageId: p.usageId,
        usageEn: p.usageEn,
        precautionsId: p.precautionsId,
        precautionsEn: p.precautionsEn,
        price: p.price,
        image: p.image,
        stock: randStock(),
        active: true,
        order: i,
      };
    }).filter((r): r is NonNullable<typeof r> => r !== null);

    if (rows.length > 0) {
        await db.product.createMany({ data: rows, skipDuplicates: true });
    }
  }
}
