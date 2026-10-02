import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSiteSeeded } from "@/lib/eswen/seed-full";
import { DEFAULT_CONFIG } from "@/lib/eswen/seed-full";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/site-config
 * Public endpoint. Returns the full editable site config (logo, brand,
 * translations, contact, social, theme) + published services + published
 * doctors. This is what powers the entire editable website.
 */
export async function GET() {
  try {
    await ensureSiteSeeded();

    const cfgRow = await db.siteConfig.findUnique({ where: { id: "singleton" } });
    const config = cfgRow ? JSON.parse(cfgRow.config) : DEFAULT_CONFIG;

    const [services, doctors] = await Promise.all([
      db.service.findMany({
        where: { published: true },
        orderBy: { order: "asc" },
      }),
      db.doctor.findMany({
        where: { published: true },
        orderBy: { order: "asc" },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      config,
      services: services.map((s) => ({
        id: s.id,
        category: { en: s.categoryEn, id: s.categoryId },
        name: { en: s.nameEn, id: s.nameId },
        description: { en: s.descriptionEn, id: s.descriptionId },
        startingPrice: s.startingPrice,
        deposit: s.deposit,
        icon: s.icon,
        image: s.image,
        brand: s.brand,
        order: s.order,
      })),
      doctors: doctors.map((d) => ({
        id: d.id,
        name: d.name,
        role: { en: d.roleEn, id: d.roleId },
        category: d.category as "doctor" | "wellness",
        specialty: { en: d.specialtyEn, id: d.specialtyId },
        experience: { en: d.experienceEn, id: d.experienceId },
        languages: d.languages.split(",").map((x) => x.trim()),
        image: d.image,
        initials: d.initials,
        order: d.order,
      })),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { ok: false, error: "Failed to load site config.", debug: msg },
      { status: 500 }
    );
  }
}
