import { createHmac } from "crypto";
import type { NextRequest } from "next/server";

/**
 * Stateless admin auth using a signed (HMAC) cookie.
 *
 * SECURITY (after rotation — do NOT use defaults in production):
 *   - Password: REQUIRED from ADMIN_PASSWORD env var (no hardcoded fallback).
 *     If unset, the server throws on startup so misconfigured deploys fail
 *     loudly instead of silently falling back to a known password.
 *   - Secret:    REQUIRED from ADMIN_SECRET env var (32+ random chars).
 *     Used to HMAC-sign the session cookie. If unset, throws.
 *
 * The cookie value is `base64url(payload).base64url(signature)`. The signature
 * is HMAC-SHA256(secret, payload). We verify by recomputing the HMAC and
 * comparing with a constant-time check, then checking the expiry.
 *
 * RATE LIMITING (anti brute-force):
 *   - Login attempts are tracked per-IP in memory (5 attempts / 15 minutes).
 *   - After 5 failed attempts, the IP is blocked for 15 minutes.
 */

function requireEnv(name: string): string {
  const v = process.env[name]?.trim();
  if (!v) {
    throw new Error(
      `SECURITY: env var ${name} is not set. Set it in your Vercel project settings (Settings → Environment Variables) with a strong random value. See .env.example.`
    );
  }
  return v;
}

// Lazy-init: only throw when actually accessed (so the serverless function
// doesn't fail at import time, only when admin auth is needed).
let _password: string | null = null;
let _secret: string | null = null;

export const ADMIN_PASSWORD = (): string => {
  if (_password === null) _password = requireEnv("ADMIN_PASSWORD");
  return _password;
};
export const ADMIN_SECRET = (): string => {
  if (_secret === null) _secret = requireEnv("ADMIN_SECRET");
  return _secret;
};

export const ADMIN_COOKIE = "eswen_admin";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// ─── Rate limiting (in-memory, per serverless instance) ──────────────
const MAX_ATTEMPTS = 5;
const BLOCK_MS = 15 * 60 * 1000; // 15 minutes
const attempts = new Map<string, { count: number; firstAt: number; blockedUntil: number }>();

/** Check if an IP is currently blocked. Returns true if blocked. */
export function isIpBlocked(ip: string): boolean {
  const e = attempts.get(ip);
  if (!e) return false;
  if (Date.now() < e.blockedUntil) return true;
  // Block expired — reset
  if (Date.now() > e.blockedUntil + BLOCK_MS) {
    attempts.delete(ip);
  }
  return false;
}

/** Record a failed login attempt. If threshold exceeded, block for 15 min. */
export function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const e = attempts.get(ip) || { count: 0, firstAt: now, blockedUntil: 0 };
  // Reset if last attempt was > 15 min ago
  if (now - e.firstAt > BLOCK_MS) {
    e.count = 0;
    e.firstAt = now;
  }
  e.count += 1;
  if (e.count >= MAX_ATTEMPTS) {
    e.blockedUntil = now + BLOCK_MS;
  }
  attempts.set(ip, e);
}

/** Clear failed attempts on successful login. */
export function clearAttempts(ip: string): void {
  attempts.delete(ip);
}

/** Extract client IP from request (respects X-Forwarded-For). */
export function getClientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

// ─── HMAC signing ─────────────────────────────────────────────────────
function b64url(input: string | Buffer) {
  return Buffer.from(input as string).toString("base64url");
}

function sign(payload: string): string {
  return createHmac("sha256", ADMIN_SECRET()).update(payload).digest("base64url");
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
  // Constant-time compare to prevent timing attacks
  if (sig.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) {
    diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  if (diff !== 0) return false;
  try {
    const payload = JSON.parse(Buffer.from(p, "base64url").toString());
    if (payload.exp && Date.now() < payload.exp) return true;
  } catch {
    return false;
  }
  return false;
}

/** Check if the request has a valid admin session cookie. */
export function isAdmin(req: NextRequest): boolean {
  const cookie = req.cookies.get(ADMIN_COOKIE)?.value;
  return verifyAdminToken(cookie);
}

/** Cookie options for the admin session cookie (httpOnly, secure, sameSite=lax). */
export const adminCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_TTL_MS / 1000, // seconds
};