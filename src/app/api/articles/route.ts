import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureArticlesSeeded } from "@/lib/eswen/seed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/articles?lang=en|id
 * Public endpoint used by the blog section. Returns published articles,
 * newest first. Seeds defaults on first run so the blog is never empty.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const langParam = (searchParams.get("lang") ?? "").toLowerCase();
  const lang: "en" | "id" = langParam === "id" ? "id" : "en";

  try {
    await ensureArticlesSeeded();
    const articles = await db.article.findMany({
      where: { published: true, language: lang },
      orderBy: { createdAt: "desc" },
      take: 12,
    });
    return NextResponse.json({
      ok: true,
      articles: articles.map((a) => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        excerpt: a.excerpt,
        category: a.category,
        imageUrl: a.imageUrl,
        language: a.language,
        readTime: a.readTime,
        date: a.createdAt.toISOString().slice(0, 10),
      })),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { ok: false, error: "Failed to load articles.", debug: msg },
      { status: 500 }
    );
  }
}
