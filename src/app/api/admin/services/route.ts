import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/eswen/admin-auth";
import { ensureSiteSeeded } from "@/lib/eswen/seed-full";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/services — all services (incl. unpublished), ordered. */
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  try {
    await ensureSiteSeeded();
    const services = await db.service.findMany({ orderBy: { order: "asc" } });
    return NextResponse.json({
      ok: true,
      services: services.map((s) => ({
        id: s.id,
        categoryEn: s.categoryEn,
        categoryId: s.categoryId,
        nameEn: s.nameEn,
        nameId: s.nameId,
        descriptionEn: s.descriptionEn,
        descriptionId: s.descriptionId,
        startingPrice: s.startingPrice,
        deposit: s.deposit,
        icon: s.icon,
        image: s.image,
        brand: s.brand,
        order: s.order,
        published: s.published,
      })),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: "Failed.", debug: msg }, { status: 500 });
  }
}

const CreateSchema = z.object({
  categoryEn: z.string().min(1).max(80),
  categoryId: z.string().min(1).max(80),
  nameEn: z.string().min(2).max(200),
  nameId: z.string().min(2).max(200),
  descriptionEn: z.string().min(5).max(1000),
  descriptionId: z.string().min(5).max(1000),
  startingPrice: z.string().max(40).default("IDR 0"),
  deposit: z.number().int().min(0).max(10000000).default(0),
  icon: z.string().max(60).default("Stethoscope"),
  image: z.string().max(500).default("/images/service-medical.png"),
  brand: z.string().max(20).default("medical"),
  order: z.number().int().default(0),
  published: z.boolean().default(true),
});

/** POST /api/admin/services — create a service. */
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid input.", issues: parsed.error.issues }, { status: 400 });
  }
  try {
    const created = await db.service.create({ data: parsed.data });
    return NextResponse.json({ ok: true, service: { id: created.id } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: "Failed to create.", debug: msg }, { status: 500 });
  }
}
