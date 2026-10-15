import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/eswen/admin-auth";
import { ensureSiteSeeded } from "@/lib/eswen/seed-full";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/offers — all offers (incl. inactive), priority desc. */
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  try {
    await ensureSiteSeeded();
    const offers = await db.specialOffer.findMany({
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
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
        active: o.active,
        priority: o.priority,
        startAt: o.startAt?.toISOString() ?? "",
        endAt: o.endAt?.toISOString() ?? "",
        createdAt: o.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: "Failed.", debug: msg }, { status: 500 });
  }
}

const CreateSchema = z.object({
  titleEn: z.string().min(2).max(200),
  titleId: z.string().min(2).max(200),
  descEn: z.string().min(5).max(2000),
  descId: z.string().min(5).max(2000),
  offerType: z.string().max(30).default("weekly"),
  badge: z.string().max(40).nullable().optional(),
  imageUrl: z.string().max(500).nullable().optional(),
  ctaTextEn: z.string().max(80).nullable().optional(),
  ctaTextId: z.string().max(80).nullable().optional(),
  ctaLink: z.string().max(300).nullable().optional(),
  active: z.boolean().default(true),
  priority: z.number().int().default(0),
  startAt: z.string().nullable().optional(),
  endAt: z.string().nullable().optional(),
});

/** POST /api/admin/offers — create a new offer. */
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid input.", issues: parsed.error.issues },
      { status: 400 }
    );
  }
  try {
    const d = parsed.data;
    const created = await db.specialOffer.create({
      data: {
        titleEn: d.titleEn,
        titleId: d.titleId,
        descEn: d.descEn,
        descId: d.descId,
        offerType: d.offerType,
        badge: d.badge ?? null,
        imageUrl: d.imageUrl ?? null,
        ctaTextEn: d.ctaTextEn ?? null,
        ctaTextId: d.ctaTextId ?? null,
        ctaLink: d.ctaLink ?? null,
        active: d.active,
        priority: d.priority,
        startAt: d.startAt ? new Date(d.startAt) : null,
        endAt: d.endAt ? new Date(d.endAt) : null,
      },
    });
    return NextResponse.json({ ok: true, offer: { id: created.id } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: "Failed to create.", debug: msg }, { status: 500 });
  }
}
