import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/eswen/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/session — returns whether the caller is authenticated. */
export async function GET(req: NextRequest) {
  return NextResponse.json({ ok: true, authed: isAdmin(req) });
}
