import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/eswen/admin-auth";
import { ensureArticlesSeeded } from "@/lib/eswen/seed";
import { translateIdToEn } from "@/lib/eswen/auto-translate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/articles — all articles (including unpublished), newest first.
 *  Returns the FULL bilingual shape so the admin tab can display the ID version
 *  the admin authored, and (optionally) the EN auto-translation. */
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
        titleEn: a.titleEn,
        titleId: a.titleId,
        slug: a.slug,
        excerptEn: a.excerptEn,
        excerptId: a.excerptId,
        contentEn: a.contentEn ?? "",
        contentId: a.contentId ?? "",
        categoryEn: a.categoryEn,
        categoryId: a.categoryId,
        imageUrl: a.imageUrl ?? "",
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
  titleEn: z.string().max(200).default(""),        // optional — auto-translated from ID
  titleId: z.string().min(3).max(200),
  slug: z.string().min(3).max(120).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only."),
  excerptEn: z.string().max(1000).default(""),      // optional — auto-translated from ID
  excerptId: z.string().min(10).max(1000),
  contentEn: z.string().max(20000).optional().default(""),   // optional — auto-translated from ID
  contentId: z.string().max(20000).optional().default(""),
  categoryEn: z.string().max(60).default(""),        // optional — auto-translated from ID
  categoryId: z.string().min(1).max(60).default("Medical"),
  imageUrl: z.string().max(500).optional().default(""),
  readTime: z.string().max(40).optional().default(""),
  published: z.boolean().default(true),
});

/** POST /api/admin/articles — create a new article.
 *  Admin only inputs the Indonesian fields (titleId, excerptId, contentId,
 *  categoryId). The EN variants are ALWAYS overridden by auto-translating
 *  from the ID text via translateIdToEn (MyMemory API; chunked for long
 *  markdown content). Falls back to the ID text on API error. */
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
    // ALWAYS auto-translate EN from the ID input. Admin only inputs Indonesian;
    // EN is derived on save. (Mirrors the services POST handler pattern.)
    // Run in parallel — three independent API calls.
    const [titleEn, excerptEn, contentEn, categoryEn] = await Promise.all([
      translateIdToEn(d.titleId),
      translateIdToEn(d.excerptId),
      d.contentId ? translateIdToEn(d.contentId) : Promise.resolve(""),
      translateIdToEn(d.categoryId),
    ]);

    // Auto-ensure a unique slug if it collides
    let slug = d.slug;
    for (let i = 0; i < 5; i++) {
      const existing = await db.article.findUnique({ where: { slug } });
      if (!existing) break;
      slug = `${d.slug}-${Math.random().toString(36).slice(2, 5)}`;
    }

    const created = await db.article.create({
      data: {
        titleEn,
        titleId: d.titleId,
        slug,
        excerptEn,
        excerptId: d.excerptId,
        contentEn: contentEn || null,
        contentId: d.contentId || null,
        categoryEn,
        categoryId: d.categoryId,
        imageUrl: d.imageUrl || null,
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
