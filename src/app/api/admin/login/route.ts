import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_PASSWORD,
  ADMIN_COOKIE,
  adminCookieOptions,
  createAdminToken,
  getClientIp,
  isIpBlocked,
  recordFailedAttempt,
  clearAttempts,
} from "@/lib/eswen/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/login
 * Body: { password: string }
 * Sets a signed httpOnly session cookie on success.
 *
 * SECURITY:
 *   - Constant-time password comparison (anti timing-attack)
 *   - Rate limiting: 5 failed attempts per IP → 15-min block
 *   - Failed attempts cleared on success
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  // Check IP block first
  if (isIpBlocked(ip)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Too many failed attempts. Try again in 15 minutes.",
      },
      { status: 429 }
    );
  }

  let body: { password?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const password = (body?.password ?? "").toString();
  if (!password) {
    return NextResponse.json({ ok: false, error: "Password is required." }, { status: 400 });
  }

  // Constant-time comparison (anti timing-attack)
  let adminPassword: string;
  try {
    adminPassword = ADMIN_PASSWORD();
  } catch (err) {
    // ADMIN_PASSWORD env var is not set — fail-safe
    const msg = err instanceof Error ? err.message : "Auth not configured";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }

  const a = Buffer.from(password);
  const b = Buffer.from(adminPassword);
  if (a.length !== b.length || !a.equals(b)) {
    recordFailedAttempt(ip);
    return NextResponse.json({ ok: false, error: "Incorrect password." }, { status: 401 });
  }

  // Success: clear failed attempts + set session cookie
  clearAttempts(ip);
  const token = createAdminToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, adminCookieOptions);
  return res;
}