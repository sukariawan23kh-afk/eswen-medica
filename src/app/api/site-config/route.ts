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
    // Merge with defaults so newly-added top-level keys (e.g. `payment`) are
    // backfilled for configs created before those keys existed.
    const stored = cfgRow ? JSON.parse(cfgRow.config) : DEFAULT_CONFIG;
    const config = { ...DEFAULT_CONFIG, ...stored, payment: { ...DEFAULT_CONFIG.payment, ...(stored.payment || {}) } };

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
        // EN always uses the latest ID text — if auto-translate ran, use the
        // translated EN; if not, fall back to ID text (never show stale old EN)
        category: { en: s.categoryEn && s.categoryEn !== s.categoryId ? s.categoryEn : s.categoryId, id: s.categoryId },
        name: { en: s.nameEn && s.nameEn !== s.nameId ? s.nameEn : s.nameId, id: s.nameId },
        description: { en: s.descriptionEn && s.descriptionEn !== s.descriptionId ? s.descriptionEn : s.descriptionId, id: s.descriptionId },
        startingPrice: s.startingPrice,
        deposit: s.deposit,
        icon: s.icon,
        image: s.image,
        gallery: s.gallery ? JSON.parse(s.gallery) : [],
        brand: s.brand,
        order: s.order,
      })),
      doctors: doctors.map((d) => ({
        id: d.id,
        name: d.name,
        role: { en: d.roleEn && d.roleEn !== d.roleId ? d.roleEn : d.roleId, id: d.roleId },
        category: d.category as "doctor" | "wellness",
        specialty: { en: d.specialtyEn && d.specialtyEn !== d.specialtyId ? d.specialtyEn : d.specialtyId, id: d.specialtyId },
        experience: { en: d.experienceEn && d.experienceEn !== d.experienceId ? d.experienceEn : d.experienceId, id: d.experienceId },
        bio: { en: d.bioEn || "", id: d.bioId || "" },
        education: { en: d.educationEn || "", id: d.educationId || "" },
        certifications: { en: d.certificationsEn || "", id: d.certificationsId || "" },
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
