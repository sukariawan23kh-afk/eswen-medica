import { SEED_SERVICES } from "@/lib/eswen/seed-full-data";
import { translateIdToEn } from "@/lib/eswen/auto-translate";

/**
 * Lookup map: serviceId → seed service (with hand-written English translations).
 */
const SEED_BY_ID = new Map(SEED_SERVICES.map((s) => [s.id, s]));

type Field = "name" | "description" | "category";

/**
 * Smart English translation for a service field.
 *
 * PRIORITY:
 *   1. If the service is one of the 6 DEFAULT services (general-medical,
 *      dermatology, wellness-program, consultation, preventive-care,
 *      travel-medicine) AND the Indonesian text is UNCHANGED from the seed
 *      → return the hand-written SEED English translation.
 *      (No API call needed — works on Vercel without ZAI SDK configured.)
 *   2. Otherwise → auto-translate via ZAI SDK (handles long text via chunking).
 *      Falls back to original ID text if the API fails.
 *
 * WHY THIS EXISTS:
 *   The auto-translate API has a 500-char-per-query limit and requires the
 *   ZAI SDK to be configured (with an API key). On Vercel production where
 *   the SDK isn't configured, auto-translate always fails and returns the
 *   original Indonesian text — making the EN toggle show Indonesian. By
 *   using the hand-written SEED translations for default services, the
 *   English is always correct without needing the API at all.
 */
export async function getServiceEnTranslation(
  serviceId: string | undefined,
  field: Field,
  idText: string
): Promise<string> {
  if (!idText || idText.trim().length === 0) return "";

  // 1. SEED lookup for default services
  if (serviceId) {
    const seed = SEED_BY_ID.get(serviceId);
    if (seed) {
      const seedEn =
        field === "name" ? seed.nameEn
        : field === "description" ? seed.descriptionEn
        : seed.categoryEn;
      const seedId =
        field === "name" ? seed.nameId
        : field === "description" ? seed.descriptionId
        : seed.categoryId;

      // Use the hand-written EN ONLY if the ID text matches the seed
      // (i.e., admin hasn't modified the Indonesian text). If the admin
      // changed the ID text, the seed EN is stale — fall through to
      // auto-translate.
      if (idText === seedId && seedEn) {
        return seedEn;
      }
    }
  }

  // 2. Auto-translate (handles long text via chunking, falls back to ID)
  return await translateIdToEn(idText);
}
