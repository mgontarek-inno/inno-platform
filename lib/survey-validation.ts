import { SURVEY_SECTIONS, FormValues, SurveyField } from "@/lib/survey-data";
import { LINK_FIELD_IDS, safeExternalUrl } from "@/lib/url-safety";

const SHORT_MAX_LEN = 300;
const LONG_MAX_LEN = 5000;
const MAX_ARRAY_LEN = 20;
const OTHER_OPTION = "Inne";

function allFields(): SurveyField[] {
  return SURVEY_SECTIONS.flatMap((section) => section.fields);
}

function sanitizeString(field: SurveyField, raw: string): string | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;

  const maxLen = field.type === "long_text" ? LONG_MAX_LEN : SHORT_MAX_LEN;
  const value = trimmed.slice(0, maxLen);

  if (LINK_FIELD_IDS.includes(field.id)) {
    return safeExternalUrl(value) ?? undefined;
  }

  if (field.numeric && !/^\d+$/.test(value)) {
    return undefined;
  }

  if (field.options?.length && !field.options.includes(value) && value !== OTHER_OPTION) {
    return undefined;
  }

  return value;
}

/**
 * Odrzuca nieznane klucze i wymusza kształt/typ/limity danych zgodnie z SURVEY_SECTIONS.
 * Nie egzekwuje pól wymaganych — to pozostaje odpowiedzialnością formularza klienckiego.
 */
export function sanitizeSurveyValues(input: unknown): FormValues {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {};
  }

  const raw = input as Record<string, unknown>;
  const fields = allFields();
  const allowedKeys = new Set<string>();
  for (const field of fields) {
    allowedKeys.add(field.id);
    if (field.options?.includes(OTHER_OPTION)) {
      allowedKeys.add(`${field.id}_other`);
    }
  }

  const result: FormValues = {};

  for (const field of fields) {
    const value = raw[field.id];
    if (value === undefined) continue;

    if (field.type === "multi_choice") {
      if (!Array.isArray(value)) continue;
      const cleaned = value
        .filter((v): v is string => typeof v === "string")
        .slice(0, MAX_ARRAY_LEN)
        .map((v) => v.trim().slice(0, SHORT_MAX_LEN))
        .filter((v) => v.length > 0)
        .filter((v) => !field.options?.length || field.options.includes(v) || v === OTHER_OPTION);
      if (cleaned.length > 0) {
        result[field.id] = cleaned;
      }
      continue;
    }

    if (typeof value !== "string") continue;
    const sanitized = sanitizeString(field, value);
    if (sanitized !== undefined) {
      result[field.id] = sanitized;
    }
  }

  for (const key of allowedKeys) {
    if (!key.endsWith("_other")) continue;
    const value = raw[key];
    if (typeof value === "string" && value.trim()) {
      result[key] = value.trim().slice(0, LONG_MAX_LEN);
    }
  }

  return result;
}
