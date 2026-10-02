import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/eswen/admin-auth";
import { ensureArticlesSeeded } from "@/lib/eswen/seed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/articles — all articles (including unpublished), newest first. */
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  try {
    await ensureArticlesSeeded();
    const articles = await db.article.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json({
      ok: true,
      articles: articles.map((a) => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        excerpt: a.excerpt,
        content: a.content ?? "",
        category: a.category,
        imageUrl: a.imageUrl ?? "",
        language: a.language,
        readTime: a.readTime ?? "",
        published: a.published,
        date: a.createdAt.toISOString().slice(0, 10),
      })),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: "Failed.", debug: msg }, { status: 500 });
  }
}

const CreateSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().min(3).max(120).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only."),
  excerpt: z.string().min(10).max(500),
  content: z.string().max(20000).optional().default(""),
  category: z.string().min(1).max(60).default("Medical"),
  imageUrl: z.string().max(500).optional().default(""),
  language: z.enum(["en", "id"]).default("en"),
  readTime: z.string().max(40).optional().default(""),
  published: z.boolean().default(true),
});

/** POST /api/admin/articles — create a new article. */
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
  const d = parsed.data;
  try {
    // Auto-ensure a unique slug if it collides
    let slug = d.slug;
    for (let i = 0; i < 5; i++) {
      const existing = await db.article.findUnique({ where: { slug } });
      if (!existing) break;
      slug = `${d.slug}-${Math.random().toString(36).slice(2, 5)}`;
    }
    const created = await db.article.create({
      data: {
        title: d.title,
        slug,
        excerpt: d.excerpt,
        content: d.content || null,
        category: d.category,
        imageUrl: d.imageUrl || null,
        language: d.language,
        readTime: d.readTime || null,
        published: d.published,
      },
    });
    return NextResponse.json({ ok: true, article: { id: created.id, slug: created.slug } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: "Failed to create.", debug: msg }, { status: 500 });
  }
}
