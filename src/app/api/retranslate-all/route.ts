import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/eswen/admin-auth";
import { translateIdToEn } from "@/lib/eswen/auto-translate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * GET /api/admin/retranslate-all
 * Re-translates ALL services' EN fields from their ID fields using AI.
 * Visit this URL once (while logged in as admin) to fix stale English text.
 */
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized. Login as admin first." }, { status: 401 });
  }

  try {
    const services = await db.service.findMany();
    const results: { id: string; name: string; translated: boolean }[] = [];

    for (const s of services) {
      const [nameEn, descEn, categoryEn] = await Promise.all([
        translateIdToEn(s.nameId),
        translateIdToEn(s.descriptionId),
        translateIdToEn(s.categoryId),
      ]);

      await db.service.update({
        where: { id: s.id },
        data: { nameEn, descriptionEn: descEn, categoryEn },
      });

      results.push({ id: s.id, name: s.nameId, translated: true });
    }

    return NextResponse.json({
      ok: true,
      message: `Re-translated ${services.length} services from ID to EN.`,
      results,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
