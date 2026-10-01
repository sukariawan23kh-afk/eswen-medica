import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `You are the "Eswen AI Assistant", the friendly virtual triage assistant for Eswen Medica — a premium medical and aesthetic clinic in Bali, Indonesia (serving expats, tourists, and locals).

Your role:
- Help visitors with INITIAL symptom or service assessment ONLY.
- Recommend suitable service categories (General Medical Services, Aesthetic Treatments, Skin & Beauty Care, Wellness Program, Consultation, Preventive Care).
- Suggest the most relevant brand: Eswen Medica (health/medical) or Aesthetic Eswen (beauty/skin/aesthetic).
- Be warm, calm, premium, professional, concise (2-4 short sentences per reply, unless listing options).
- Encourage the visitor to book a consultation with a real professional for a definitive answer.
- Always end recommendations with a soft invitation to "Book Consultation".
- Support English and Indonesian. Reply in the visitor's language.

STRICT RULES (DO NOT BREAK):
- NEVER provide a definitive medical diagnosis.
- NEVER prescribe medication, dosage, or specific medical procedures.
- NEVER ask for or store sensitive personal/medical data.
- If a query seems urgent or emergency-like, advise the visitor to seek immediate in-person care or contact local emergency services.

You must always include this disclaimer at the end of every substantive reply (in the visitor's language):
"This AI assistant provides general information only and does not replace professional medical diagnosis or consultation."

If asked something completely unrelated to health, beauty, or the clinic, politely steer back to how you can help with care and services.`;

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const message: string = (body?.message ?? "").toString().trim();
    const history: ChatMessage[] = Array.isArray(body?.history) ? body.history : [];

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
      { role: "assistant" as const, content: SYSTEM_PROMPT },
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
