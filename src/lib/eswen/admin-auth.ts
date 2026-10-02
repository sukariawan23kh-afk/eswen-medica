import { createHmac } from "crypto";
import type { NextRequest } from "next/server";

/**
 * Stateless admin auth using a signed (HMAC) cookie.
 *
 * - Password: read from ADMIN_PASSWORD env (default "eswen2026").
 * - Secret:    read from ADMIN_SECRET env (default fallback).
 *
 * The cookie value is `base64url(payload).base64url(signature)`. The signature
 * is HMAC-SHA256(secret, payload). We verify by recomputing the HMAC and
 * comparing with a constant-time check, then checking the expiry.
 */

const DEFAULT_PASSWORD = "eswen2026";
const DEFAULT_SECRET = "eswen-medica-dev-secret";

export const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD?.trim() || DEFAULT_PASSWORD;
export const ADMIN_SECRET =
  process.env.ADMIN_SECRET?.trim() || DEFAULT_SECRET;

export const ADMIN_COOKIE = "eswen_admin";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function b64url(input: string | Buffer) {
  return Buffer.from(input as string).toString("base64url");
}

function sign(payload: string): string {
  return createHmac("sha256", ADMIN_SECRET).update(payload).digest("base64url");
}

/** Create a signed session token for the admin. */
export function createAdminToken(): string {
  const payload = JSON.stringify({
    role: "admin",
    exp: Date.now() + SESSION_TTL_MS,
  });
  const p = b64url(payload);
  return `${p}.${sign(p)}`;
}

/** Verify a token string; returns true if valid + not expired. */
export function verifyAdminToken(token: string | undefined | null): boolean {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [p, sig] = parts;
  const expected = sign(p);
  // constant-time-ish comparison
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) {
    diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  if (diff !== 0) return false;
  try {
    const payload = JSON.parse(Buffer.from(p, "base64url").toString("utf8"));
    if (payload?.role !== "admin") return false;
    if (typeof payload?.exp !== "number" || payload.exp < Date.now())
      return false;
    return true;
  } catch {
    return false;
  }
}

/** Check whether the incoming request carries a valid admin session. */
export function isAdmin(req: NextRequest): boolean {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  return verifyAdminToken(token);
}

/** Cookie options for the admin session cookie. */
export const adminCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_TTL_MS / 1000,
};
