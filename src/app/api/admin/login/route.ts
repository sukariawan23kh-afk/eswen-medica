import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_PASSWORD,
  ADMIN_COOKIE,
  adminCookieOptions,
  createAdminToken,
} from "@/lib/eswen/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/login
 * Body: { password: string }
 * Sets a signed httpOnly session cookie on success.
 */
export async function POST(req: NextRequest) {
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

  // Constant-time-ish comparison
  const a = Buffer.from(password);
  const b = Buffer.from(ADMIN_PASSWORD);
  if (a.length !== b.length || !a.equals(b)) {
    return NextResponse.json({ ok: false, error: "Incorrect password." }, { status: 401 });
  }

  const token = createAdminToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, adminCookieOptions);
  return res;
}
