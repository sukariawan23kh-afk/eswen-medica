import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/eswen/admin-auth";
import { ensureSiteSeeded } from "@/lib/eswen/seed-full";
import { DEFAULT_CONFIG } from "@/lib/eswen/seed-full";

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
    const config = { ...DEFAULT_CONFIG, ...stored, payment: { ...DEFAULT_CONFIG.payment, ...(stored.payment || {}) } };
    return NextResponse.json({ ok: true, config });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: "Failed.", debug: msg }, { status: 500 });
  }
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
    const configStr = JSON.stringify(body);
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
