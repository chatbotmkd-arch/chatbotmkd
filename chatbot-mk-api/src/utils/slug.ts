import { Chatbot } from "../models/Chatbot";

// Cyrillic to Latin transliteration map (Macedonian)
const cyrToLat: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", ѓ: "gj", е: "e", ж: "zh",
  з: "z", ѕ: "dz", и: "i", ј: "j", к: "k", л: "l", љ: "lj", м: "m",
  н: "n", њ: "nj", о: "o", п: "p", р: "r", с: "s", т: "t", ќ: "kj",
  у: "u", ф: "f", х: "h", ц: "c", ч: "ch", џ: "dj", ш: "sh",
};

function transliterate(text: string): string {
  return text
    .split("")
    .map((ch) => cyrToLat[ch] || cyrToLat[ch.toLowerCase()] || ch)
    .join("");
}

function toSlug(text: string): string {
  return transliterate(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")  // remove non-alphanumeric
    .replace(/\s+/g, "-")           // spaces to hyphens
    .replace(/-+/g, "-")            // collapse multiple hyphens
    .replace(/^-|-$/g, "")          // trim hyphens
    .slice(0, 60);                  // max length
}

/**
 * Generate a unique slug for a chatbot.
 * Appends a number suffix if the base slug is taken.
 */
export async function generateUniqueSlug(name: string): Promise<string> {
  const base = toSlug(name) || "chatbot";

  // Check if base slug is available
  const existing = await Chatbot.findOne({ slug: base });
  if (!existing) return base;

  // Try with numeric suffix
  for (let i = 2; i <= 100; i++) {
    const candidate = `${base}-${i}`;
    const taken = await Chatbot.findOne({ slug: candidate });
    if (!taken) return candidate;
  }

  // Fallback: append random chars
  const random = Math.random().toString(36).slice(2, 8);
  return `${base}-${random}`;
}
