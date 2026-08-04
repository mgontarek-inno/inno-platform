export const LINK_FIELD_IDS = ["linkedin", "githuba", "researchGate"];

/** Zwraca URL tylko jeśli używa protokołu https, inaczej null. */
export function safeExternalUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:") return null;
    return trimmed;
  } catch {
    return null;
  }
}
