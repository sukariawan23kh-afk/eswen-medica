import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/eswen/admin-auth";
import { formatIDR } from "@/lib/eswen/booking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Notif = {
  kind: "booking" | "article";
  id: string;
  title: string;
  detail: string;
  createdAt: string;
};

/**
 * GET /api/admin/notifications?since=ISO
 * Returns a unified feed of the latest activity for the admin bell:
 *   - the 8 most recent bookings
 *   - the 5 most recent articles
 * Plus an `unread` count (events newer than the `since` query param, or the
 * total when `since` is absent) and the current server time.
 */
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  try {
    const sinceRaw = req.nextUrl.searchParams.get("since");
    const since = sinceRaw ? new Date(sinceRaw) : null;
    const sinceOk = since && !isNaN(since.getTime());

    const [bookings, articles] = await Promise.all([
      db.booking.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      db.article.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    const notifs: Notif[] = [
      ...bookings.map((b) => ({
        kind: "booking" as const,
        id: b.id,
        title: `${b.refCode} · ${b.patientName}`,
        detail: `${b.serviceName} — ${b.bookingDate} ${b.bookingTime} · ${formatIDR(b.depositAmount)} · ${b.status}`,
        createdAt: b.createdAt.toISOString(),
      })),
      ...articles.map((a) => ({
        kind: "article" as const,
        id: a.id,
        title: a.title,
        detail: `${a.category} · ${a.language.toUpperCase()} · ${a.published ? "Published" : "Draft"}`,
        createdAt: a.createdAt.toISOString(),
      })),
    ].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

    const unread = sinceOk
      ? notifs.filter((n) => new Date(n.createdAt) > (since as Date)).length
      : notifs.length;

    return NextResponse.json({
      ok: true,
      notifications: notifs,
      unread,
      serverTime: new Date().toISOString(),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: "Failed.", debug: msg }, { status: 500 });
  }
}
