import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/eswen/admin-auth";
import { ensureSiteSeeded } from "@/lib/eswen/seed-full";
import { getServiceEnTranslation } from "@/lib/eswen/service-translate";
import { translateIdToEn } from "@/lib/eswen/auto-translate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/doctors — all doctors (incl. unpublished), ordered. */
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  try {
    await ensureSiteSeeded();
    const doctors = await db.doctor.findMany({ orderBy: { order: "asc" } });
    return NextResponse.json({
      ok: true,
      doctors: doctors.map((d) => ({
        id: d.id,
        name: d.name,
        roleEn: d.roleEn,
        roleId: d.roleId,
        category: d.category,
        specialtyEn: d.specialtyEn,
        specialtyId: d.specialtyId,
        experienceEn: d.experienceEn,
        experienceId: d.experienceId,
        bioEn: d.bioEn || "",
        bioId: d.bioId || "",
        educationEn: d.educationEn || "",
        educationId: d.educationId || "",
        certificationsEn: d.certificationsEn || "",
        certificationsId: d.certificationsId || "",
        languages: d.languages,
        image: d.image,
        initials: d.initials,
        order: d.order,
        published: d.published,
      })),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: "Failed.", debug: msg }, { status: 500 });
  }
}

const CreateSchema = z.object({
  name: z.string().min(2).max(100),
  roleEn: z.string().max(60).default(""),           // ignored — auto-translated from ID
  roleId: z.string().min(1).max(60),
  category: z.enum(["doctor", "wellness"]).default("doctor"),
  specialtyEn: z.string().max(100).default(""),     // ignored — auto-translated from ID
  specialtyId: z.string().min(1).max(100),
  experienceEn: z.string().max(40).default(""),      // ignored — auto-translated from ID
  experienceId: z.string().max(40).default(""),
  bioEn: z.string().default(""),                    // ignored — auto-translated from ID
  bioId: z.string().default(""),
  educationEn: z.string().default(""),              // ignored — auto-translated from ID
  educationId: z.string().default(""),
  certificationsEn: z.string().default(""),          // ignored — auto-translated from ID
  certificationsId: z.string().default(""),
  languages: z.string().max(120).default("EN, ID"),
  image: z.string().max(500).default("/images/doctor-1.png"),
  initials: z.string().max(4).default("XX"),
  order: z.number().int().default(0),
  published: z.boolean().default(true),
});

/** POST /api/admin/doctors — create a doctor. */
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
    const d = parsed.data;
    // ALWAYS translate EN from ID (admin only inputs Indonesian; serviceId=undefined
    // for new doctors → skips SEED lookup → falls through to MyMemory API which
    // works on Vercel without any API key config).
    if (d.roleId) d.roleEn = await getServiceEnTranslation(undefined, "name", d.roleId);
    if (d.specialtyId) d.specialtyEn = await getServiceEnTranslation(undefined, "name", d.specialtyId);
    if (d.experienceId) d.experienceEn = await getServiceEnTranslation(undefined, "name", d.experienceId);
    // Long-form fields (bio/education/certifications) are always custom admin text
    // → never match SEED → use translateIdToEn directly (handles long-text chunking).
    if (d.bioId) d.bioEn = await translateIdToEn(d.bioId);
    if (d.educationId) d.educationEn = await translateIdToEn(d.educationId);
    if (d.certificationsId) d.certificationsEn = await translateIdToEn(d.certificationsId);
    const created = await db.doctor.create({ data: d });
    return NextResponse.json({ ok: true, doctor: { id: created.id } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: "Failed to create.", debug: msg }, { status: 500 });
  }
}
