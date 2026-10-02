import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSiteSeeded } from "@/lib/eswen/seed-full";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/offers — public endpoint.
 * Returns the active, in-date special offers, ordered by priority desc,
 * limited to 10. Powers the public PromoSection + OfferPopup.
 */
export async function GET() {
  try {
    await ensureSiteSeeded();
    const now = new Date();
    const offers = await db.specialOffer.findMany({
      where: {
        active: true,
        AND: [
          { OR: [{ startAt: null }, { startAt: { lte: now } }] },
          { OR: [{ endAt: null }, { endAt: { gte: now } }] },
        ],
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      take: 10,
    });
    return NextResponse.json({
      ok: true,
      offers: offers.map((o) => ({
        id: o.id,
        titleEn: o.titleEn,
        titleId: o.titleId,
        descEn: o.descEn,
        descId: o.descId,
        offerType: o.offerType,
        badge: o.badge ?? "",
        imageUrl: o.imageUrl ?? "",
        ctaTextEn: o.ctaTextEn ?? "",
        ctaTextId: o.ctaTextId ?? "",
        ctaLink: o.ctaLink ?? "",
        priority: o.priority,
      })),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { ok: false, error: "Failed to load offers.", debug: msg },
      { status: 500 }
    );
  }
}
