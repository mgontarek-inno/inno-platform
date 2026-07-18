export type FieldType =
  | "short_text"
  | "long_text"
  | "single_choice"
  | "multi_choice"
  | "scale";

export interface SurveyField {
  id: string;
  label: string;
  hint?: string;
  type: FieldType;
  options?: string[];
  required?: boolean;
  scaleMin?: string;
  scaleMax?: string;
  conditionalOn?: { field: string; value: string };
}

export interface SurveySection {
  id: string;
  title: string;
  fields: SurveyField[];
}

export const SURVEY_SECTIONS: SurveySection[] = [
  {
    id: "personal",
    title: "Informacje osobiste",
    fields: [
      { id: "age", label: "Wiek", type: "short_text", required: true },
      {
        id: "country",
        label: "Kraj zamieszkania",
        type: "short_text",
        required: true,
      },
      {
        id: "region",
        label: "Region / Miasto",
        type: "short_text",
        required: true,
      },
    ],
  },
  {
    id: "education",
    title: "Edukacja",
    fields: [
      {
        id: "edu_status",
        label: "Status edukacji",
        type: "single_choice",
        required: true,
        options: [
          "Obecnie studiuję",
          "Niedawno ukończone (ostatnie 12 miesięcy)",
          "Absolwent (1+ lat temu)",
          "Brak wyższego wykształcenia",
        ],
      },
      {
        id: "university",
        label: "Nazwa uczelni",
        hint: "Pozostaw puste, jeśli nie dotyczy",
        type: "short_text",
      },
      {
        id: "field_of_study",
        label: "Kierunek / Specjalizacja",
        type: "short_text",
      },
      {
        id: "degree_level",
        label: "Poziom studiów / stopień",
        type: "single_choice",
        options: [
          "Licencjat / In progress",
          "Licencjat / Ukończony",
          "Magister / In progress",
          "Magister / Ukończony",
          "Doktorat (PhD)",
          "Inne",
        ],
      },
      {
        id: "study_year",
        label: "Bieżący rok studiów",
        hint: "Jeśli dotyczy",
        type: "single_choice",
        options: ["1st", "2nd", "3rd", "4th", "5th+"],
      },
    ],
  },
  {
    id: "professional",
    title: "Doświadczenie zawodowe",
    fields: [
      {
        id: "industry",
        label: "Branża, w której pracujesz / pracowałeś",
        type: "short_text",
        required: true,
      },
      {
        id: "experience_years",
        label: "Lata doświadczenia zawodowego",
        type: "single_choice",
        required: true,
        options: ["Brak", "<1 roku", "1–3 lata", "3–5 lat", "5+ lat"],
      },
    ],
  },
  {
    id: "startup",
    title: "Startup i program",
    fields: [
      {
        id: "has_idea",
        label: "Czy masz pomysł na startup, który chcesz rozwijać w programie?",
        type: "single_choice",
        required: true,
        options: [
          "Tak — dobrze dopracowany pomysł",
          "Tak — wstępna koncepcja",
          "Nie — nadal szukam pomysłu",
        ],
      },
      {
        id: "program_path",
        label: "Którą ścieżkę programu wybierasz?",
        type: "single_choice",
        required: true,
        options: ["Space Path", "Life Science Lab", "Green Challenge", "Dual-use & Defence", "AI Tech Path"],
      },
      {
        id: "has_team",
        label: "Czy masz już zespół?",
        type: "single_choice",
        required: true,
        options: [
          "Tak — pełny zespół",
          "Tak — częściowy zespół",
          "Nie — szukam współzałożycieli",
          "Nie — planuję działać solo",
        ],
      },
      {
        id: "needs_members",
        label: "Szukasz dodatkowych członków zespołu?",
        type: "single_choice",
        options: ["Tak", "Nie", "Może później"],
      },
      {
        id: "looking_for_roles",
        label: "Jakich ról szukasz w zespole?",
        hint: "Wybierz wszystkie pasujące",
        type: "multi_choice",
        options: [
          "Techniczne / Developer",
          "Product / UX",
          "Marketing / Growth",
          "Sales / Biznes",
          "Finanse / Prawne",
          "Operacje",
          "Inne",
        ],
      },
      {
        id: "startup_experience",
        label: "Czy wcześniej budowałeś lub współzałożyłeś startup?",
        type: "single_choice",
        required: true,
        options: [
          "Tak — działający lub sprzedany",
          "Tak — niepowodzenie / zamknięty",
          "Tylko projekt poboczny",
          "Brak doświadczenia",
        ],
      },
    ],
  },
  {
    id: "profile",
    title: "Twój profil",
    fields: [
      {
        id: "strengths",
        label: "Twoje mocne strony",
        hint: "Opisz kluczowe umiejętności i kompetencje",
        type: "long_text",
        required: true,
      },
      {
        id: "interests",
        label: "Twoje zainteresowania",
        hint: "Tematy, dziedziny lub obszary, które Cię interesują",
        type: "long_text",
        required: true,
      },
      {
        id: "personality",
        label: "Jestem osobą, która…",
        hint: "Opisz swój styl pracy, podejście i osobowość w kontekście startupu",
        type: "long_text",
        required: true,
      },
      {
        id: "preferred_role",
        label: "W jakiej roli czujesz się najlepiej?",
        type: "single_choice",
        required: true,
        options: [
          "CEO / Visioner",
          "CTO / Lider techniczny",
          "CPO / Lider produktu",
          "CMO / Growth",
          "COO / Operacje",
          "Ekspert domenowy / Specjalista",
        ],
      },
      {
        id: "linkedin",
        label: "Link do LinkedIn",
        hint: "Pełny URL do profilu LinkedIn",
        type: "short_text",
        required: true,
      },
    ],
  },
];

export type FormValues = Record<string, string | string[]>;
