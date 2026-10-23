import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/eswen/admin-auth";
import { getServiceEnTranslation } from "@/lib/eswen/service-translate";
import { translateIdToEn } from "@/lib/eswen/auto-translate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  roleEn: z.string().max(60).optional(),          // ignored — auto-translated from ID
  roleId: z.string().min(1).max(60).optional(),
  category: z.enum(["doctor", "wellness"]).optional(),
  specialtyEn: z.string().max(100).optional(),    // ignored — auto-translated from ID
  specialtyId: z.string().min(1).max(100).optional(),
  experienceEn: z.string().max(40).optional(),     // ignored — auto-translated from ID
  experienceId: z.string().max(40).optional(),
  bioEn: z.string().optional(),                    // ignored — auto-translated from ID
  bioId: z.string().optional(),
  educationEn: z.string().optional(),              // ignored — auto-translated from ID
  educationId: z.string().optional(),
  certificationsEn: z.string().optional(),          // ignored — auto-translated from ID
  certificationsId: z.string().optional(),
  languages: z.string().max(120).optional(),
  image: z.string().max(500).optional(),
  initials: z.string().max(4).optional(),
  order: z.number().int().optional(),
  published: z.boolean().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  const { id } = await params;
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid input.", issues: parsed.error.issues }, { status: 400 });
  }
  try {
    const d = parsed.data;
    // ALWAYS re-translate EN from the latest ID text (admin only inputs Indonesian,
    // so EN should always reflect the current ID content). Use the doctor's `id`
    // from URL params as serviceId — for doctors it will never match a SEED
    // service, so it falls through to MyMemory API (works on Vercel).
    if (d.roleId) d.roleEn = await getServiceEnTranslation(id, "name", d.roleId);
    if (d.specialtyId) d.specialtyEn = await getServiceEnTranslation(id, "name", d.specialtyId);
    if (d.experienceId) d.experienceEn = await getServiceEnTranslation(id, "name", d.experienceId);
    // Long-form fields (bio/education/certifications) are always custom admin text
    // → never match SEED → use translateIdToEn directly (handles long-text chunking).
    if (d.bioId) d.bioEn = await translateIdToEn(d.bioId);
    if (d.educationId) d.educationEn = await translateIdToEn(d.educationId);
    if (d.certificationsId) d.certificationsEn = await translateIdToEn(d.certificationsId);
    const updated = await db.doctor.update({ where: { id }, data: d });
    return NextResponse.json({ ok: true, doctor: { id: updated.id } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: "Failed to update.", debug: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  const { id } = await params;
  try {
    await db.doctor.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: "Failed to delete.", debug: msg }, { status: 500 });
  }
}
