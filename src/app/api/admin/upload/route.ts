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

  let file: File | null = null;
  try {
    const form = await req.formData();
    file = form.get("file") as File | null;
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "No file in request." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ ok: false, error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB (max 5MB).` }, { status: 400 });
    }
    const ext = safeExt(file.name);
    if (!ext) {
      return NextResponse.json({ ok: false, error: "Unsupported file type. Allowed: png, jpg, jpeg, gif, webp, svg." }, { status: 400 });
    }

    const stamp = Date.now();
    const rand = Math.random().toString(36).slice(2, 8);
    const filename = `eswen-${stamp}-${rand}.${ext}`;
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

    if (blobToken) {
      // ── Vercel production: use Vercel Blob Storage ──
      try {
        const blob = await put(filename, file, {
          access: "public",
          token: blobToken,
        });
        return NextResponse.json({ ok: true, url: blob.url, filename, size: file.size });
      } catch (blobErr) {
        const blobMsg = blobErr instanceof Error ? blobErr.message : String(blobErr);
        // Blob failed — fall through to filesystem attempt
        console.error("[upload] Blob failed:", blobMsg);
      }
    }

    // ── Fallback: local filesystem (dev or if Blob failed) ──
    try {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
      const buf = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(path.join(UPLOAD_DIR, filename), buf);
      return NextResponse.json({ ok: true, url: `/images/uploads/${filename}`, filename, size: file.size });
    } catch (fsErr) {
      const fsMsg = fsErr instanceof Error ? fsErr.message : String(fsErr);
      const blobStatus = blobToken ? "Blob token set but upload failed" : "No Blob token set";
      return NextResponse.json(
        {
          ok: false,
          error: `Upload failed — ${blobStatus}. Filesystem error: ${fsMsg}. Make sure BLOB_READ_WRITE_TOKEN is set in Vercel env vars.`,
        },
        { status: 500 }
      );
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, error: `Upload error: ${msg}` },
      { status: 500 }
    );
  }
}
