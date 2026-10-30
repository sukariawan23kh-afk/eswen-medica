/**
 * Auto-translate Indonesian text to English using the MyMemory API
 * (https://mymemory.translated.net/).
 *
 * WHY MYMEMORY:
 *   - Free, no API key required (works on Vercel production without any
 *     `.z-ai-config` or env-var setup)
 *   - Supports Indonesian → English (langpair=id|en)
 *   - 5000-char-per-request limit, but we chunk at 480 chars for safety
 *   - 1000 requests/day free tier (enough for typical admin save operations)
 *
 * HANDLES LONG TEXT:
 *   - MyMemory has a 500-char-per-query limit.
 *   - For text > 480 chars, we split on sentence boundaries (., !, ?, newline)
 *     into chunks ≤ 480 chars, translate each chunk, and join with " ".
 *
 * ERROR-PROOF:
 *   - If the API throws, or returns an error message as content (e.g.
 *     "QUERY LENGTH LIMIT EXCEEDED..."), we fall back to the original
 *     Indonesian text. The field is never empty and never contains a raw
 *     error message.
 *
 * Used by admin API routes when EN is empty — admin only inputs Indonesian,
 * English is auto-generated on save.
 */

const MAX_QUERY_CHARS = 480; // safety margin below the 500-char API limit
const MYMEMORY_ENDPOINT = "https://api.mymemory.translated.net/get";

/** Patterns that indicate the API returned an error message instead of a translation. */
const ERROR_PATTERNS = [
  /query length limit/i,
  /max allowed query/i,
  /exceeded/i,
  /rate limit/i,
  /unauthorized/i,
  /invalid api key/i,
  /service unavailable/i,
  /mymemory/i, // sometimes returns "MYMEMORY WARNING" on quota issues
];

/** Check if a string looks like an error message rather than a translation. */
function looksLikeError(text: string): boolean {
  if (!text) return false;
  return ERROR_PATTERNS.some((p) => p.test(text));
}

/**
 * Split a long string into chunks ≤ maxChars, on sentence boundaries
 * (period, exclamation, question mark, or newline). Falls back to
 * hard-splitting on whitespace if a single sentence exceeds maxChars.
 */
function chunkText(text: string, maxChars: number): string[] {
  if (text.length <= maxChars) return [text];

  const chunks: string[] = [];
  // Split on sentence-ending punctuation followed by space/newline, keeping the punctuation.
  const sentences = text.match(/[^.!?]*[.!?]+[\s]*|[^.!?]+$/g) || [text];

  let current = "";
  for (const sentence of sentences) {
    if ((current + sentence).length > maxChars) {
      if (current) chunks.push(current.trim());
      // If a single sentence exceeds maxChars, hard-split on spaces.
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

/** Translate a single chunk (≤ 500 chars) via MyMemory API. Returns translation or original on failure. */
async function translateChunk(chunk: string): Promise<string> {
  if (!chunk || chunk.trim().length === 0) return "";

  const url = `${MYMEMORY_ENDPOINT}?q=${encodeURIComponent(chunk)}&langpair=id|en`;

  try {
    // 3-second timeout per call — prevents Vercel function timeout (10s free tier)
    // when multiple keys are translated during site-config Save All.
    // If MyMemory doesn't respond in 3s, falls back to original ID text.
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(3000),
    });

    if (!res.ok) {
      return chunk; // network/HTTP error → return original
    }

    const data = (await res.json()) as {
      responseData?: { translatedText?: string; match?: number };
      responseStatus?: number;
    };

    const result = data?.responseData?.translatedText?.trim();
    if (!result) return chunk;
    if (looksLikeError(result)) return chunk; // API returned an error message as content
    return result;
  } catch {
    return chunk; // any error → return original
  }
}

/**
 * Auto-translate Indonesian text to English.
 * - Short text (≤ 480 chars): single MyMemory API call
 * - Long text: chunk + translate each + join with space
 * - Falls back to original ID text on any error
 */
export async function translateIdToEn(text: string): Promise<string> {
  if (!text || text.trim().length === 0) return "";

  // Short text: single API call
  if (text.length <= MAX_QUERY_CHARS) {
    return translateChunk(text);
  }

  // Long text: chunk + translate each + join with space
  const chunks = chunkText(text, MAX_QUERY_CHARS);
  const translated: string[] = [];
  for (const chunk of chunks) {
    translated.push(await translateChunk(chunk));
  }
  return translated.join(" ").replace(/\s+/g, " ").trim();
}

/**
 * Auto-fill missing EN fields from ID fields.
 * Only translates if EN is empty/missing — doesn't overwrite existing EN.
 */
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
