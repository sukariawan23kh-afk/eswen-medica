import { SEED_SERVICES } from "@/lib/eswen/seed-full-data";
import { translateIdToEn } from "@/lib/eswen/auto-translate";

const SEED_BY_ID = new Map(SEED_SERVICES.map((s) => [s.id, s]));

type Field = "name" | "description" | "category";

/**
 * Smart English translation for a service field.
 *
 * PRIORITY:
 *   1. If the service is one of the 6 DEFAULT services (matched by ID)
 *      → ALWAYS return the hand-written SEED EN translation.
 *      (No API call needed — works on Vercel without ZAI SDK configured.
 *       We don't check if the ID text matches the seed, because the admin
 *       may have modified the Indonesian text — better to show a slightly
 *       stale English than to fall back to Indonesian.)
 *   2. Otherwise → auto-translate via ZAI SDK (handles long text via chunking).
 *      Falls back to original ID text if the API fails.
 */
export async function getServiceEnTranslation(
  serviceId: string | undefined,
  field: Field,
  idText: string
): Promise<string> {
  if (!idText || idText.trim().length === 0) return "";

  // 1. SEED lookup for default services — ALWAYS use SEED EN if service ID matches
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

  // 2. Auto-translate for admin-added services (handles long text via chunking)
  return await translateIdToEn(idText);
}