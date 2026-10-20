import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { isAdmin } from "@/lib/eswen/admin-auth";
import { put as blobPut } from "@vercel/blob";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const UPLOAD_DIR = path.join(process.cwd(), "public", "images", "uploads");
const PUBLIC_PREFIX = "/images/uploads";

const MAX_FILE_SIZE = 8 * 1024 * 1024;

const ALLOWED_MIME: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
};

const IS_VERCEL = !!process.env.VERCEL;
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized. Log in to admin first." },
      { status: 401 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid form data. Expected multipart/form-data with a 'file' field." },
      { status: 400 }
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { ok: false, error: "No 'file' field found in form data." },
      { status: 400 }
    );
  }

  if (file.size === 0) {
    return NextResponse.json({ ok: false, error: "Empty file." }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { ok: false, error: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 8 MB.` },
      { status: 413 }
    );
  }

  const ext = ALLOWED_MIME[file.type];
  if (!ext) {
    return NextResponse.json(
      { ok: false, error: `Unsupported file type: ${file.type || "unknown"}. Allowed: PNG, JPEG, GIF, WebP, SVG.` },
      { status: 415 }
    );
  }

  const stamp = Date.now().toString(36);
  const rand = randomBytes(4).toString("hex");
  const filename = `${stamp}-${rand}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  if (IS_VERCEL) {
    if (!BLOB_TOKEN) {
      return NextResponse.json(
        { ok: false, error: "Vercel Blob is not configured. Set BLOB_READ_WRITE_TOKEN env var on Vercel." },
        { status: 500 }
      );
    }
    try {
      const blob = await blobPut(`uploads/${filename}`, buffer, {
        access: "public",
        contentType: file.type || "application/octet-stream",
        addRandomSuffix: false,
        token: BLOB_TOKEN,
      });
      return NextResponse.json({
        ok: true, url: blob.url, filename,
        size: buffer.length, mime: file.type, storage: "vercel-blob",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      return NextResponse.json(
        { ok: false, error: "Vercel Blob upload failed.", debug: msg },
        { status: 500 }
      );
    }
  }

  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const filepath = path.join(UPLOAD_DIR, filename);
    await fs.writeFile(filepath, buffer);
    const url = `${PUBLIC_PREFIX}/${filename}`;
    return NextResponse.json({
      ok: true, url, filename,
      size: buffer.length, mime: file.type, storage: "local-fs",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { ok: false, error: "Failed to write file to disk.", debug: msg },
      { status: 500 }
    );
  }
}