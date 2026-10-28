import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/eswen/admin-auth";
import { translateIdToEn } from "@/lib/eswen/auto-translate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UpdateSchema = z.object({
  nameId: z.string().min(1).max(120).optional(),
  nameEn: z.string().max(200).optional(), // ignored — auto-translated from ID
  order: z.number().int().optional(),
  active: z.boolean().optional(),
});

/**
 * PUT /api/admin/product-categories/[id]
 * Admin-only. Updates a category. If `nameId` changes, `nameEn` is
 * re-translated from the latest ID text (always reflects current ID).
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
    const d = parsed.data as z.infer<typeof UpdateSchema> & { nameId?: string };
    // FAST SAVE: copy ID → EN directly (no MyMemory API call).
    if (d.nameId) {
      d.nameEn = d.nameId;
    }
    const updated = await db.productCategory.update({
      where: { id },
      data: d,
    });
    return NextResponse.json({ ok: true, category: { id: updated.id } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: "Failed to update.", debug: msg }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/product-categories/[id]
 * Admin-only. Deletes a category. If the category still has products
 * attached, the deletion is blocked (responds 400 with a helpful error
 * so the admin knows to reassign or delete the products first).
 *
 * Why block instead of cascade: products carry price + stock + medical
 * info that the admin would lose silently — better to force them to
 * explicitly reassign (PUT product.categoryId) or delete the products
 * before removing the category.
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  const { id } = await params;
  try {
    const productsInCategory = await db.product.count({ where: { categoryId: id } });
    if (productsInCategory > 0) {
      return NextResponse.json(
        {
          ok: false,
          error: `Cannot delete: ${productsInCategory} product(s) still belong to this category. Reassign or delete them first.`,
        },
        { status: 400 }
      );
    }
    await db.productCategory.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: "Failed to delete.", debug: msg }, { status: 500 });
  }
}
