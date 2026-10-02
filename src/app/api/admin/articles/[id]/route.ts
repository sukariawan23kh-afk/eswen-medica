import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/eswen/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UpdateSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  excerpt: z.string().min(10).max(500).optional(),
  content: z.string().max(20000).optional(),
  category: z.string().min(1).max(60).optional(),
  imageUrl: z.string().max(500).optional(),
  language: z.enum(["en", "id"]).optional(),
  readTime: z.string().max(40).optional(),
  published: z.boolean().optional(),
});

/** PUT /api/admin/articles/[id] — update an article. */
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
    const data: Record<string, unknown> = {};
    const d = parsed.data;
    if (d.title !== undefined) data.title = d.title;
    if (d.excerpt !== undefined) data.excerpt = d.excerpt;
    if (d.content !== undefined) data.content = d.content || null;
    if (d.category !== undefined) data.category = d.category;
    if (d.imageUrl !== undefined) data.imageUrl = d.imageUrl || null;
    if (d.language !== undefined) data.language = d.language;
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
