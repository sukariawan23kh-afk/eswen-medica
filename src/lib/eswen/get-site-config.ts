import { db } from "@/lib/db";
import { ensureSiteSeeded } from "@/lib/eswen/seed-full";
import { DEFAULT_CONFIG } from "@/lib/eswen/seed-full";

/**
 * Shared server-side function to fetch the full site config (config JSON +
 * published services + published doctors) from the DB.
 *
 * Used by:
 *   - layout.tsx (server component) → passes result to SiteConfigProvider
 *     as `initialConfig` → SSR renders with correct DB data from the start
 *     (eliminates the "old static data flash" before client fetch resolves)
 *   - /api/site-config/route.ts (API) → returns same data as JSON
 *
 * Deep-merges DEFAULT_CONFIG with stored config so newly-added top-level
 * keys (hero_image, about_image, new translation keys) are always available.
 */
export async function getSiteConfigData() {
  await ensureSiteSeeded();

  const cfgRow = await db.siteConfig.findUnique({ where: { id: "singleton" } });
  const stored = cfgRow ? JSON.parse(cfgRow.config) : DEFAULT_CONFIG;

  // Deep-merge: stored overrides DEFAULT_CONFIG, but new keys from
  // DEFAULT_CONFIG are always available (backfill for older DB seeds).
  const config = {
    ...DEFAULT_CONFIG,
    ...stored,
    hero_image: stored.hero_image ?? "",
    about_image: stored.about_image ?? "",
    logo: { ...DEFAULT_CONFIG.logo, ...(stored.logo || {}) },
    brand: { ...DEFAULT_CONFIG.brand, ...(stored.brand || {}) },
    contact: { ...DEFAULT_CONFIG.contact, ...(stored.contact || {}) },
    social: { ...DEFAULT_CONFIG.social, ...(stored.social || {}) },
    payment: { ...DEFAULT_CONFIG.payment, ...(stored.payment || {}) },
    translations: {
      en: { ...DEFAULT_CONFIG.translations.en, ...(stored.translations?.en || {}) },
      id: { ...DEFAULT_CONFIG.translations.id, ...(stored.translations?.id || {}) },
    },
  };

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

  return {
    ok: true as const,
    config,
    services: services.map((s) => ({
      id: s.id,
      category: { en: s.categoryEn && s.categoryEn !== s.categoryId ? s.categoryEn : s.categoryId, id: s.categoryId },
      name: { en: s.nameEn && s.nameEn !== s.nameId ? s.nameEn : s.nameId, id: s.nameId },
      description: { en: s.descriptionEn && s.descriptionEn !== s.descriptionId ? s.descriptionEn : s.descriptionId, id: s.descriptionId },
      startingPrice: s.startingPrice,
      deposit: s.deposit,
      icon: s.icon,
      image: s.image,
      gallery: s.gallery ? safeParseGallery(s.gallery) : [],
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
      bio: { en: d.bioEn || "", id: d.bioId || "" },
      education: { en: d.educationEn || "", id: d.educationId || "" },
      certifications: { en: d.certificationsEn || "", id: d.certificationsId || "" },
      languages: d.languages.split(",").map((x) => x.trim()),
      image: d.image,
      initials: d.initials,
      order: d.order,
    })),
  };
}

function safeParseGallery(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((x) => typeof x === "string" && x.length > 0);
    }
  } catch { /* ignore */ }
  return [];
}
