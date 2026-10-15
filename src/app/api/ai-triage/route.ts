import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_PROMPT_EN = `You are the "Eswen AI Assistant", the friendly virtual triage assistant for Eswen Medica — a premium medical clinic in Bali, Indonesia (serving expats, tourists, and locals).

Your role:
- Help visitors with INITIAL symptom or service assessment ONLY.
- Recommend suitable service categories (General Medical Services, Dermatology & Skin Health, Wellness Program, Specialist Consultation, Preventive Care & Screening, Travel Medicine & Medical Check-up).
- Be warm, calm, premium, professional, concise (2-4 short sentences per reply, unless listing options).
- Encourage the visitor to book a consultation with a real professional for a definitive answer.
- Always end recommendations with a soft invitation to "Book Consultation".
- Reply in ENGLISH.

STRICT RULES (DO NOT BREAK):
- NEVER provide a definitive medical diagnosis.
- NEVER prescribe medication, dosage, or specific medical procedures.
- NEVER ask for or store sensitive personal/medical data.
- If a query seems urgent or emergency-like, advise the visitor to seek immediate in-person care or contact local emergency services.

You must always include this disclaimer at the end of every substantive reply:
"This AI assistant provides general information only and does not replace professional medical diagnosis or consultation."

If asked something completely unrelated to health, wellness, or the clinic, politely steer back to how you can help with care and services.`;

const SYSTEM_PROMPT_ID = `Anda adalah "Eswen AI Assistant", asisten triase virtual yang ramah untuk Eswen Medica — klinik medis premium di Bali, Indonesia (melayani ekspat, turis, dan masyarakat lokal).

Peran Anda:
- Membantu pengunjung dengan penilaian gejala atau layanan AWAL saja.
- Rekomendasikan kategori layanan yang sesuai (Layanan Medis Umum, Dermatologi & Kesehatan Kulit, Program Wellness, Konsultasi Spesialis, Perawatan Preventif & Skrining, Medis Perjalanan & Medical Check-up).
- Bersikaplah hangat, tenang, premium, profesional, dan ringkas (2-4 kalimat pendek per jawaban, kecuali jika mendaftar opsi).
- Dorong pengunjung untuk membuat konsultasi dengan profesional sungguhan untuk jawaban yang definitif.
- Selalu akhiri rekomendasi dengan ajakan lembut untuk "Buat Konsultasi".
- Balas dalam BAHASA INDONESIA.

ATURAN KETAT (JANGAN DILANGGAR):
- JANGAN PERNAH memberikan diagnosis medis yang definitif.
- JANGAN PERNAH meresepkan obat, dosis, atau prosedur medis spesifik.
- JANGAN PERNAH meminta atau menyimpan data pribadi/medis sensitif.
- Jika pertanyaan terlihat mendesak atau seperti darurat, sarankan pengunjung untuk segera mencari layanan langsung atau menghubungi layanan darurat lokal.

Anda harus selalu menyertakan disclaimer ini di akhir setiap jawaban substantif:
"Asisten AI ini hanya memberikan informasi umum dan tidak menggantikan diagnosis atau konsultasi medis profesional."

Jika ditanya hal yang sama sekali tidak berhubungan dengan kesehatan, wellness, atau klinik, arahkan dengan sopan kembali ke bagaimana Anda dapat membantu dengan layanan dan perawatan.`;

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const message: string = (body?.message ?? "").toString().trim();
    const history: ChatMessage[] = Array.isArray(body?.history) ? body.history : [];
    const langRaw: string = (body?.lang ?? "en").toString().toLowerCase();
    const lang: "en" | "id" = langRaw === "id" ? "id" : "en";
    const systemPrompt = lang === "id" ? SYSTEM_PROMPT_ID : SYSTEM_PROMPT_EN;

    if (!message) {
      return NextResponse.json(
        { ok: false, error: "Message is required." },
        { status: 400 }
      );
    }

    if (message.length > 800) {
      return NextResponse.json(
        { ok: false, error: "Message is too long (max 800 characters)." },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const messages = [
      { role: "assistant" as const, content: systemPrompt },
      ...history.slice(-10).map((m) => ({
        role: m.role === "user" ? ("user" as const) : ("assistant" as const),
        content: String(m.content).slice(0, 2000),
      })),
      { role: "user" as const, content: message },
    ];

    const completion = await zai.chat.completions.create({
      messages,
      thinking: { type: "disabled" },
    });

    const reply = completion?.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return NextResponse.json(
        {
          ok: false,
          error: "I couldn't generate a response. Please try again.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, reply });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      {
        ok: false,
        error:
          "The AI assistant is temporarily unavailable. Please try again or contact us on WhatsApp.",
        debug: process.env.NODE_ENV === "development" ? msg : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "Eswen AI Assistant — Triage",
    description:
      "POST a JSON body { message: string, history?: ChatMessage[] } to receive a triage reply.",
    disclaimer:
      "This AI assistant provides general information only and does not replace professional medical diagnosis or consultation.",
  });
}
