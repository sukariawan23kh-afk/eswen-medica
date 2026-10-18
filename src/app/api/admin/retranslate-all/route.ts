import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/eswen/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * GET /api/admin/retranslate-all?key=eswen2026
 * Re-translates ALL services' EN fields from their ID fields using AI.
 * Can be triggered with admin cookie OR with ?key=ADMIN_PASSWORD (no login needed).
 */
export async function GET(req: NextRequest) {
  // Auth: either admin cookie OR ?key=ADMIN_PASSWORD
  const url = new URL(req.url);
  const keyParam = url.searchParams.get("key") || "";
  const adminPassword = process.env.ADMIN_PASSWORD || "eswen2026";
  
  if (!isAdmin(req) && keyParam !== adminPassword) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized. Add ?key=eswen2026 to the URL, or login as admin first." },
      { status: 401 }
    );
  }

  try {
    const ZAI = (await import("z-ai-web-dev-sdk")).default;
    const zai = await ZAI.create();
    const services = await db.service.findMany();
    let count = 0;
    const results: any[] = [];

    for (const s of services) {
      const tr = async (text: string) => {
        if (!text || text.trim().length === 0) return "";
        try {
          const c = await zai.chat.completions.create({
            messages: [
              { role: "assistant", content: "Translate this Indonesian text to English for a medical clinic website. Return ONLY the English translation, no quotes, no explanation." },
              { role: "user", content: text }
            ],
            thinking: { type: "disabled" },
          });
          return c?.choices?.[0]?.message?.content?.trim() || text;
        } catch { return text; }
      };

      const [nameEn, descriptionEn, categoryEn] = await Promise.all([
        tr(s.nameId),
        tr(s.descriptionId),
        tr(s.categoryId),
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
