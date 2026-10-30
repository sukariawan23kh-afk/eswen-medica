import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/eswen/admin-auth";
import { translateIdToEn } from "@/lib/eswen/auto-translate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UpdateSchema = z.object({
  categoryId: z.string().min(1).optional(),
  nameId: z.string().min(1).max(200).optional(),
  nameEn: z.string().max(300).optional(),               // ignored — auto-translated
  shortDescId: z.string().max(500).optional(),
  shortDescEn: z.string().max(800).optional(),           // ignored — auto-translated
  fullDescId: z.string().max(20000).optional(),
  fullDescEn: z.string().max(30000).optional(),          // ignored — auto-translated
  dosageId: z.string().max(10000).optional(),
  dosageEn: z.string().max(15000).optional(),            // ignored — auto-translated
  usageId: z.string().max(5000).optional(),
  usageEn: z.string().max(8000).optional(),              // ignored — auto-translated
  precautionsId: z.string().max(10000).optional(),
  precautionsEn: z.string().max(15000).optional(),       // ignored — auto-translated
  price: z.string().max(60).optional(),
  image: z.string().max(500).optional(),
  stock: z.number().int().min(0).optional(),
  active: z.boolean().optional(),
  order: z.number().int().optional(),
});

/**
 * PUT /api/admin/products/[id]
 * Admin-only. Updates a product. EN fields are re-translated from the
 * latest ID text whenever the corresponding ID field is present in the
 * request body (so a quick stock-only update — body `{ stock: 12 }` —
 * does NOT re-trigger translation calls).
 *
 * This makes the admin's "quick stock +/-" buttons cheap (single PUT
 * with just `{ stock: n }` — no API calls to MyMemory).
 */
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
    const d = parsed.data as z.infer<typeof UpdateSchema>;

    // If the caller is changing categoryId, verify the new category exists.
    if (d.categoryId) {
      const cat = await db.productCategory.findUnique({ where: { id: d.categoryId } });
      if (!cat) {
        return NextResponse.json(
          { ok: false, error: "Category not found. Pick a valid category." },
          { status: 400 }
        );
      }
    }

    // FAST SAVE: copy ID → EN directly (no MyMemory API call).
    // EN translation is done later via /api/admin/apotek-retranslate endpoint.
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

/**
 * DELETE /api/admin/products/[id]
 * Admin-only. Deletes a product.
 */
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
