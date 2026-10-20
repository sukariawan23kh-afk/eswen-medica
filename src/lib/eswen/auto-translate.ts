import ZAI from "z-ai-web-dev-sdk";

/**
 * Auto-translate Indonesian text to English using the z-ai-web-dev-sdk LLM.
 *
 * HANDLES LONG TEXT:
 *   - The ZAI chat API has a 500-char-per-query limit.
 *   - For text > 500 chars, we split on sentence boundaries (., !, ?, newline)
 *     into chunks ≤ ~480 chars, translate each chunk, and join with " ".
 *
 * ERROR-PROOF:
 *   - If the API throws, or returns an error message as content (e.g.
 *     "QUERY LENGTH LIMIT EXCEEDED..."), we fall back to the original
 *     Indonesian text. The field is never empty and never contains a raw
 *     error message.
 */

const MAX_QUERY_CHARS = 480; // safety margin below the 500-char API limit

const ERROR_PATTERNS = [
  /query length limit/i,
  /max allowed query/i,
  /exceeded/i,
  /rate limit/i,
  /unauthorized/i,
  /invalid api key/i,
  /service unavailable/i,
];

function looksLikeError(text: string): boolean {
  if (!text) return false;
  return ERROR_PATTERNS.some((p) => p.test(text));
}

function chunkText(text: string, maxChars: number): string[] {
  if (text.length <= maxChars) return [text];
  const chunks: string[] = [];
  const sentences = text.match(/[^.!?]*[.!?]+[\s]*|[^.!?]+$/g) || [text];
  let current = "";
  for (const sentence of sentences) {
    if ((current + sentence).length > maxChars) {
      if (current) chunks.push(current.trim());
      if (sentence.length > maxChars) {
        const words = sentence.split(/(\s+)/);
        let line = "";
        for (const w of words) {
          if ((line + w).length > maxChars) {
            if (line) chunks.push(line.trim());
            line = w;
          } else {
            line += w;
          }
        }
        if (line) chunks.push(line.trim());
        current = "";
      } else {
        current = sentence;
      }
    } else {
      current += sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.filter((c) => c.length > 0);
}

async function translateChunk(chunk: string): Promise<string> {
  if (!chunk || chunk.trim().length === 0) return "";
  try {
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "assistant",
          content:
            "You are a professional translator for a medical clinic in Bali. Translate the following Indonesian text to English. Keep it natural, professional, and medical-appropriate. Return ONLY the translation — no quotes, no explanation, no preamble.",
        },
        { role: "user", content: chunk },
      ],
      thinking: { type: "disabled" },
    });
    const result = completion?.choices?.[0]?.message?.content?.trim();
    if (!result) return chunk;
    if (looksLikeError(result)) return chunk;
    return result;
  } catch {
    return chunk;
  }
}

export async function translateIdToEn(text: string): Promise<string> {
  if (!text || text.trim().length === 0) return "";
  if (text.length <= MAX_QUERY_CHARS) {
    return translateChunk(text);
  }
  const chunks = chunkText(text, MAX_QUERY_CHARS);
  const translated: string[] = [];
  for (const chunk of chunks) {
    translated.push(await translateChunk(chunk));
  }
  return translated.join(" ").replace(/\s+/g, " ").trim();
}

export async function autoFillEnFromId(fields: {
  en?: string;
  id?: string;
}[]): Promise<string[]> {
  const results: string[] = [];
  for (const { en, id } of fields) {
    if (en && en.trim().length > 0) {
      results.push(en);
    } else if (id && id.trim().length > 0) {
      results.push(await translateIdToEn(id));
    } else {
      results.push(en || id || "");
    }
  }
  return results;
}