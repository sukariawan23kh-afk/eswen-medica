import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/eswen/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Translate Indonesian text to English using MyMemory free API.
 * No config/API key needed — works on Vercel out of the box.
 */
async function translateIdToEn(text: string): Promise<string> {
  if (!text || text.trim().length === 0) return "";
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=id|en`;
    const res = await fetch(url);
    const data = await res.json();
    const translated = data?.responseData?.translatedText;
    if (translated && translated.length > 0) {
      // MyMemory sometimes wraps in quotes
      return translated.replace(/^"|"$/g, "").trim();
    }
    return text; // fallback to original
  } catch {
    return text; // fallback to original
  }
}

/**
 * GET /api/admin/retranslate-all?key=eswen2026
 * Re-translates ALL services' EN fields from ID using free translation API.
 * No login needed — just add ?key=eswen2026
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const keyParam = url.searchParams.get("key") || "";
  const adminPassword = process.env.ADMIN_PASSWORD || "eswen2026";

  if (!isAdmin(req) && keyParam !== adminPassword) {
    return NextResponse.json(
      { ok: false, error: "Add ?key=eswen2026 to the URL." },
      { status: 401 }
    );
  }

  try {
    const services = await db.service.findMany();
    let count = 0;
    const results: { id: string; nameId: string; nameEn: string }[] = [];

    for (const s of services) {
      const [nameEn, descriptionEn, categoryEn] = await Promise.all([
        translateIdToEn(s.nameId),
        translateIdToEn(s.descriptionId),
        translateIdToEn(s.categoryId),
      ]);

      await db.service.update({
        where: { id: s.id },
        data: { nameEn, descriptionEn, categoryEn },
      });

      results.push({ id: s.id, nameId: s.nameId, nameEn });
      count++;
    }

    return NextResponse.json({
      ok: true,
      message: `Re-translated ${count} services from ID to EN.`,
      results,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
