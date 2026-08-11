import { FormValues, SurveySection } from "@/lib/survey-data";

export const OTHER_OPTION = "Inne";

export const PROFILE_VIEW_LABELS: Record<string, string> = {
  industry: "Branża zawodowa",
  has_idea: "Pomysł na startup",
  program_path: "Ścieżka programu",
  has_team: "Status zespołu",
  needs_members: "Szuka dodatkowych członków zespołu",
  looking_for_roles: "Szukane role w zespole",
  startup_experience: "Doświadczenie startupowe",
  startup_name: "Nazwa startupu",
  startup_description: "Opis startupu",
  strengths: "Mocne strony",
  interests: "Zainteresowania",
  personality: "Osobowość / styl pracy",
  preferred_role: "Preferowana rola",
};

export interface StartupOverview {
  name: string | null;
  description: string | null;
}

export function getStartupOverview(values: FormValues): StartupOverview | null {
  const name = typeof values.startup_name === "string" ? values.startup_name.trim() : "";
  const description =
    typeof values.startup_description === "string" ? values.startup_description.trim() : "";

  if (!name && !description) {
    return null;
  }

  return {
    name: name || null,
    description: description || null,
  };
}

export function formatOptionValue(v: string, otherText?: string): string {
  return v === OTHER_OPTION && otherText ? `\n${OTHER_OPTION}: \n${otherText}` : v;
}

export function sectionHasAnswers(values: FormValues, section: SurveySection): boolean {
  const fields = section.fields;

  if (!fields?.length) return false;

  return fields.some((field) => {
    const v = values[field.id];
    if (v === undefined || v === null) return false;
    if (Array.isArray(v)) return v.length > 0;
    return String(v).trim().length > 0;
  });
}
