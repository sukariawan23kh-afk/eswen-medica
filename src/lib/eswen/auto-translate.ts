/**
 * Auto-translate Indonesian text to English using the MyMemory API
 * (https://mymemory.translated.net/).
 *
 * WHY MYMEMORY:
 *   - Free, no API key required (works on Vercel production without any
 *     `.z-ai-config` or env-var setup)
 *   - Supports Indonesian → English (langpair=id|en)
 *   - 500-char-per-request limit, but we chunk at 480 chars for safety
 *   - 1000 requests/day free tier (enough for typical admin save operations)
 */

const MAX_QUERY_CHARS = 480;
const MYMEMORY_ENDPOINT = "https://api.mymemory.translated.net/get";

const ERROR_PATTERNS = [
  /query length limit/i,
  /max allowed query/i,
  /exceeded/i,
  /rate limit/i,
  /unauthorized/i,
  /invalid api key/i,
  /service unavailable/i,
  /mymemory/i,
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
  const url = `${MYMEMORY_ENDPOINT}?q=${encodeURIComponent(chunk)}&langpair=id|en`;
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return chunk;
    const data = (await res.json()) as {
      responseData?: { translatedText?: string; match?: number };
      responseStatus?: number;
    };
    const result = data?.responseData?.translatedText?.trim();
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