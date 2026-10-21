import { SEED_SERVICES } from "@/lib/eswen/seed-full-data";
import { translateIdToEn } from "@/lib/eswen/auto-translate";

const SEED_BY_ID = new Map(SEED_SERVICES.map((s) => [s.id, s]));

type Field = "name" | "description" | "category";

/**
 * Smart English translation for a service field.
 *
 * PRIORITY (Opsi B — auto-translate dulu, SEED sebagai fallback):
 *   1. Try MyMemory API to translate the actual ID text (handles chunking
 *      for long descriptions, returns high-quality natural English that
 *      matches the Indonesian source).
 *   2. If MyMemory succeeded (result is different from original ID) → use it
 *   3. If MyMemory failed (result equals original ID, e.g. quota exhausted) →
 *      fall back to SEED hand-written EN for default services (so EN toggle
 *      still shows English instead of Indonesian)
 *   4. Last resort (admin-added service, no SEED, MyMemory failed) →
 *      return original ID text (Indonesian — better than nothing)
 *
 * This means: admin inputs only Indonesian, EN toggle shows proper English
 * that matches the actual ID text. No API key needed (MyMemory is free).
 */
export async function getServiceEnTranslation(
  serviceId: string | undefined,
  field: Field,
  idText: string
): Promise<string> {
  if (!idText || idText.trim().length === 0) return "";

  // 1. Try MyMemory auto-translate FIRST
  const autoResult = await translateIdToEn(idText);

  // 2. If auto-translate succeeded (result is different from original), use it
  if (autoResult && autoResult !== idText) {
    return autoResult;
  }

  // 3. Auto-translate failed (returned original ID text) — try SEED EN as fallback
  if (serviceId) {
    const seed = SEED_BY_ID.get(serviceId);
    if (seed) {
      const seedEn =
        field === "name" ? seed.nameEn
        : field === "description" ? seed.descriptionEn
        : seed.categoryEn;
      if (seedEn) {
        return seedEn;
      }
    }
  }

  // 4. Last resort: return original ID text
  return idText;
}