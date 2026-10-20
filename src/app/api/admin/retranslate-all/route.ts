import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/eswen/admin-auth";
import { getServiceEnTranslation } from "@/lib/eswen/service-translate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * RE-TRANSLATE all services from Indonesian to English.
 *
 * For EACH service in the DB:
 *   - Default services (general-medical, dermatology, dll) → SEED EN (hand-written)
 *   - Admin-added services OR modified descriptions → MyMemory API
 *   - Preserves non-text fields (price, deposit, image, icon, order, brand, gallery)
 *
 * Usage (admin-authed OR ?key=eswen2026):
 *   GET /api/admin/retranslate-all
 *   GET /api/admin/retranslate-all?key=eswen2026
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const keyParam = url.searchParams.get("key") || "";
  const adminPassword = process.env.ADMIN_PASSWORD || "eswen2026";

  if (!isAdmin(req) && keyParam !== adminPassword) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized. Add ?key=eswen2026 to URL." },
      { status: 401 }
    );
  }

  try {
    const services = await db.service.findMany();
    if (services.length === 0) {
      return NextResponse.json({
        ok: true,
        message: "No services in DB. Site-config API will auto-seed defaults on next load.",
        results: [],
      });
    }

    let count = 0;
    const results: Array<{
      id: string;
      nameId: string;
      nameEn: string;
      categoryEn: string;
      descriptionEn: string;
    }> = [];

    for (const s of services) {
      const [nameEn, descriptionEn, categoryEn] = await Promise.all([
        getServiceEnTranslation(s.id, "name", s.nameId),
        getServiceEnTranslation(s.id, "description", s.descriptionId),
        getServiceEnTranslation(s.id, "category", s.categoryId),
      ]);

      await db.service.update({
        where: { id: s.id },
        data: { nameEn, descriptionEn, categoryEn },
      });

      results.push({
        id: s.id,
        nameId: s.nameId,
        nameEn,
        categoryEn,
        descriptionEn: descriptionEn.slice(0, 80) + (descriptionEn.length > 80 ? "..." : ""),
      });
      count++;
    }

    return NextResponse.json({
      ok: true,
      message: `Re-translated ${count} of ${services.length} services.`,
      results,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}