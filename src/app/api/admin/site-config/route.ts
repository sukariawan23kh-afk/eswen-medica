import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/eswen/admin-auth";
import { ensureSiteSeeded, DEFAULT_CONFIG } from "@/lib/eswen/seed-full";
import { translateIdToEn } from "@/lib/eswen/auto-translate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/site-config — returns the full config for the editor. */
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  try {
    await ensureSiteSeeded();
    const cfgRow = await db.siteConfig.findUnique({ where: { id: "singleton" } });
    // Merge with defaults so newly-added top-level keys (e.g. `payment`) are
    // backfilled for configs created before those keys existed — prevents the
    // editor from crashing on undefined fields.
    const stored = cfgRow ? JSON.parse(cfgRow.config) : DEFAULT_CONFIG;
    const config = {
      ...DEFAULT_CONFIG,
      ...stored,
      payment: { ...DEFAULT_CONFIG.payment, ...(stored.payment || {}) },
    };
    return NextResponse.json({ ok: true, config });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: "Failed.", debug: msg }, { status: 500 });
  }
}

/**
 * Shape we expect to receive from the admin editor. The admin only inputs
 * Indonesian — EN fields are auto-translated below by overriding them from
 * their ID counterparts (only when the ID value actually changed since the
 * last save, to conserve the MyMemory daily quota of 1000 req/day).
 */
type Translations = Record<string, string>;
type ConfigShape = {
  brand?: { tagline?: { en?: string; id?: string } };
  contact?: { hours?: { en?: string; id?: string } };
  payment?: { instructionsEn?: string; instructionsId?: string };
  translations?: { en?: Translations; id?: Translations };
  [k: string]: unknown;
};

/** Read the previously-saved config from the DB (or fall back to defaults). */
async function getOldConfig(): Promise<ConfigShape> {
  const cfgRow = await db.siteConfig.findUnique({ where: { id: "singleton" } });
  const stored = cfgRow ? JSON.parse(cfgRow.config) : DEFAULT_CONFIG;
  return {
    ...DEFAULT_CONFIG,
    ...stored,
    payment: { ...DEFAULT_CONFIG.payment, ...(stored.payment || {}) },
  } as ConfigShape;
}

/**
 * Translate ID → EN with a per-request in-memory cache so that if the same
 * Indonesian string appears twice in one Save All (e.g. a duplicated value
 * across two keys), we only call the MyMemory API once.
 */
async function makeTranslator() {
  const cache = new Map<string, string>();
  return async (id: string): Promise<string> => {
    const trimmed = (id ?? "").trim();
    if (trimmed.length === 0) return "";
    const cached = cache.get(trimmed);
    if (cached !== undefined) return cached;
    const en = await translateIdToEn(trimmed);
    cache.set(trimmed, en);
    return en;
  };
}

/**
 * Re-translate EN from ID for any pair where the ID value changed since the
 * last save. If the ID is unchanged, the existing EN value is preserved (no
 * MyMemory call) — this is what protects the daily quota under repeated
 * saves. Always re-translates when there was no previous EN value.
 */
async function reconcilePair(
  newId: string,
  oldId: string | undefined,
  oldEn: string | undefined,
  translate: (s: string) => Promise<string>,
): Promise<string> {
  const id = (newId ?? "").trim();
  if (id.length === 0) return "";
  // Unchanged ID → keep the existing EN translation (skip API call).
  if (oldId !== undefined && id === oldId && oldEn && oldEn.trim().length > 0) {
    return oldEn;
  }
  return translate(id);
}

/** PUT /api/admin/site-config — replace the whole config JSON. */
export async function PUT(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Config object required." }, { status: 400 });
  }
  try {
    const incoming = body as ConfigShape;
    // INSTANT SAVE — no MyMemory API calls at all.
    // Admin inputs ID text. EN values are preserved as-is from admin's
    // input (manual EN for hero_h1_l1/l2) or from existing DB values.
    // Use /api/admin/retranslate-all for bulk EN translation later.

    // 2) Brand tagline — copy ID → EN.
    if (incoming.brand?.tagline) {
      incoming.brand.tagline.en = incoming.brand.tagline.id ?? "";
    }

    // 3) Contact hours — copy ID → EN.
    if (incoming.contact?.hours) {
      incoming.contact.hours.en = incoming.contact.hours.id ?? "";
    }

    // 4) Payment instructions — copy ID → EN.
    if (incoming.payment) {
      incoming.payment.instructionsEn = incoming.payment.instructionsId ?? "";
    }

    const configStr = JSON.stringify(incoming);
    // Validate it parses back
    JSON.parse(configStr);
    await db.siteConfig.upsert({
      where: { id: "singleton" },
      create: { id: "singleton", config: configStr },
      update: { config: configStr },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: "Failed to save.", debug: msg }, { status: 500 });
  }
}
