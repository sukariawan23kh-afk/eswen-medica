import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/eswen/admin-auth";
import { translateIdToEn } from "@/lib/eswen/auto-translate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UpdateSchema = z.object({
  titleEn: z.string().max(200).optional(),        // ignored when titleId is provided — re-translated
  titleId: z.string().min(3).max(200).optional(),
  excerptEn: z.string().max(1000).optional(),     // ignored when excerptId is provided — re-translated
  excerptId: z.string().min(10).max(1000).optional(),
  contentEn: z.string().max(20000).optional(),    // ignored when contentId is provided — re-translated
  contentId: z.string().max(20000).optional(),
  categoryEn: z.string().max(60).optional(),      // ignored when categoryId is provided — re-translated
  categoryId: z.string().min(1).max(60).optional(),
  imageUrl: z.string().max(500).optional(),
  readTime: z.string().max(40).optional(),
  published: z.boolean().optional(),
});

/** PUT /api/admin/articles/[id] — update an article.
 *  Admin only inputs the Indonesian fields. When an ID field is updated,
 *  the matching EN field is ALWAYS re-translated from the new ID text so the
 *  English stays in sync with whatever the admin authored in Indonesian. */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const data: Record<string, unknown> = {};

    // For each ID field present, re-translate the matching EN field so the
    // English always reflects the current Indonesian content. (Mirrors the
    // services PUT handler pattern.)
    if (d.titleId !== undefined) {
      data.titleId = d.titleId;
      data.titleEn = await translateIdToEn(d.titleId);
    }
    if (d.excerptId !== undefined) {
      data.excerptId = d.excerptId;
      data.excerptEn = await translateIdToEn(d.excerptId);
    }
    if (d.contentId !== undefined) {
      data.contentId = d.contentId || null;
      data.contentEn = d.contentId ? await translateIdToEn(d.contentId) : null;
    }
    if (d.categoryId !== undefined) {
      data.categoryId = d.categoryId;
      data.categoryEn = await translateIdToEn(d.categoryId);
    }
    if (d.imageUrl !== undefined) data.imageUrl = d.imageUrl || null;
    if (d.readTime !== undefined) data.readTime = d.readTime || null;
    if (d.published !== undefined) data.published = d.published;

    const updated = await db.article.update({ where: { id }, data });
    return NextResponse.json({ ok: true, article: { id: updated.id } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: "Failed to update.", debug: msg }, { status: 500 });
  }
}

/** DELETE /api/admin/articles/[id] — delete an article. */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  const { id } = await params;
  try {
    await db.article.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: "Failed to delete.", debug: msg }, { status: 500 });
  }
}
