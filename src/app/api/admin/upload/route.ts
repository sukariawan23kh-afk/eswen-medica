import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import { isAdmin } from "@/lib/eswen/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED = new Set(["png", "jpg", "jpeg", "gif", "webp", "svg"]);
const MAX_BYTES = 5 * 1024 * 1024;
const UPLOAD_DIR = path.join(process.cwd(), "public", "images", "uploads");

function safeExt(name: string): string | null {
  const m = /\.([a-z0-9]+)$/i.exec(name || "");
  if (!m) return null;
  const ext = m[1].toLowerCase();
  return ALLOWED.has(ext) ? ext : null;
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "No file in request." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ ok: false, error: `File too large (max 5MB).` }, { status: 400 });
    }
    const ext = safeExt(file.name);
    if (!ext) {
      return NextResponse.json({ ok: false, error: "Unsupported type." }, { status: 400 });
    }

    const stamp = Date.now();
    const rand = Math.random().toString(36).slice(2, 8);
    const filename = `eswen-${stamp}-${rand}.${ext}`;
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    const buffer = Buffer.from(await file.arrayBuffer());

    if (blobToken) {
      try {
          const blob = await put(filename, buffer, {
          access: "public",
          token: blobToken,
        });;
        return NextResponse.json({ ok: true, url: blob.url, filename, size: file.size });
      } catch (blobErr) {
        const blobMsg = blobErr instanceof Error ? blobErr.message : String(blobErr);
        return NextResponse.json(
          { ok: false, error: `Blob upload failed: ${blobMsg}` },
          { status: 500 }
        );
      }
    }

    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.writeFile(path.join(UPLOAD_DIR, filename), buffer);
    return NextResponse.json({ ok: true, url: `/images/uploads/${filename}`, filename, size: file.size });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: `Upload error: ${msg}` }, { status: 500 });
  }
}