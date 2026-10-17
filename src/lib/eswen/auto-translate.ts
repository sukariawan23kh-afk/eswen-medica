import ZAI from "z-ai-web-dev-sdk";

/**
 * Auto-translate Indonesian text to English using the z-ai-web-dev-sdk LLM.
 * If translation fails, returns the original Indonesian text as fallback
 * (so the field is never empty).
 *
 * Used by the admin API routes when the EN field is empty — admin only
 * needs to input Indonesian, and English is auto-generated on save.
 */
export async function translateIdToEn(text: string): Promise<string> {
  if (!text || text.trim().length === 0) return "";
  try {
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "assistant",
          content:
            "You are a professional translator for a medical clinic in Bali. Translate the following Indonesian text to English. Keep it natural, professional, and medical-appropriate. Return ONLY the translation — no quotes, no explanation.",
        },
        { role: "user", content: text },
      ],
      thinking: { type: "disabled" },
    });
    const result = completion?.choices?.[0]?.message?.content?.trim();
    return result || text;
  } catch {
    // If translation fails, return the original Indonesian text (not empty)
    return text;
  }
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
