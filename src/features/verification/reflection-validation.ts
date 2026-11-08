export function validateReflection(text: string): string | null {
  const normalized = text.trim().replace(/\s+/g, " ");
  if (normalized.length < 100) return "Reflection must contain at least 100 characters.";
  const letters = normalized.match(/[\p{L}\p{N}]/gu)?.length ?? 0;
  if (letters < 30) return "Write a meaningful reflection about what you learned.";
  const unique = new Set(normalized.toLowerCase().match(/[\p{L}\p{N}]/gu) ?? []).size;
  if (unique < 8) return "Write a meaningful reflection about what you learned.";
  return null;
}
