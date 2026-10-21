import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/eswen/admin-auth";
import { translateIdToEn } from "@/lib/eswen/auto-translate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const keyParam = url.searchParams.get("key") || "";
  const adminPassword = process.env.ADMIN_PASSWORD || "eswen2026";
  const customText = url.searchParams.get("text") || "";

  if (!isAdmin(req) && keyParam !== adminPassword) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized. Add ?key=eswen2026 to URL." },
      { status: 401 }
    );
  }

  const testText = customText || "Konsultasi Medis Umum";
  const longText =
    "Klinik kami menawarkan berbagai layanan medis yang dirancang untuk meningkatkan kesehatan, mencegah penyakit, dan meningkatkan kesejahteraan masyarakat. Layanan kami meliputi Pemeriksaan Kesehatan menyeluruh, Konsultasi Dokter Umum, Skrining Penyakit Kronis, Vaksinasi, dan Konsultasi Gaya Hidup Sehat. Tim dokter kami berpengalaman, bersertifikat internasional.";

  const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(testText)}&langpair=id|en`;
  let directResult: { ok: boolean; status?: number; translatedText?: string; error?: string; ms: number } = {
    ok: false, ms: 0,
  };
  const t1 = Date.now();
  try {
    const res = await fetch(myMemoryUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    const ms = Date.now() - t1;
    if (res.ok) {
      const data = (await res.json()) as {
        responseData?: { translatedText?: string; match?: number };
        responseStatus?: number;
      };
      directResult = { ok: true, status: res.status, translatedText: data?.responseData?.translatedText, ms };
    } else {
      directResult = { ok: false, status: res.status, error: `HTTP ${res.status}`, ms };
    }
  } catch (err) {
    directResult = { ok: false, error: err instanceof Error ? err.message : String(err), ms: Date.now() - t1 };
  }

  const t2 = Date.now();
  const longResult = await translateIdToEn(longText);
  const longMs = Date.now() - t2;

  return NextResponse.json({
    ok: true,
    environment: {
      isVercel: !!process.env.VERCEL,
      region: process.env.VERCEL_REGION || "local",
      nodeVersion: process.version,
    },
    test1_shortText: {
      input: testText,
      myMemoryDirect: directResult,
    },
    test2_longText: {
      input: longText.slice(0, 100) + "...",
      inputLength: longText.length,
      translateIdToEnResult: longResult,
      isTranslated: longResult !== longText,
      ms: longMs,
    },
    diagnosis: directResult.ok && directResult.translatedText && directResult.translatedText !== testText
      ? "OK: MyMemory WORKING. Issue is: (a) code not deployed, OR (b) data not updated - hit /api/admin/retranslate-all?key=eswen2026"
      : directResult.ok
      ? "WARNING: MyMemory reachable but no translation (quota exhausted?). Wait 24h."
      : "FAILED: MyMemory NOT reachable. Error: " + directResult.error,
  });
}