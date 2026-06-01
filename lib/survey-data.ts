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
    title: "Personal Information",
    fields: [
      { id: "age", label: "Age", type: "short_text", required: true },
      {
        id: "country",
        label: "Country of residence",
        type: "short_text",
        required: true,
      },
      {
        id: "region",
        label: "Region / City",
        type: "short_text",
        required: true,
      },
    ],
  },
  {
    id: "education",
    title: "Education",
    fields: [
      {
        id: "edu_status",
        label: "Current educational status",
        type: "single_choice",
        required: true,
        options: [
          "Currently studying",
          "Recently graduated (last 12 months)",
          "Graduate (1+ years ago)",
          "No higher education",
        ],
      },
      {
        id: "university",
        label: "University name",
        hint: "Leave blank if not applicable",
        type: "short_text",
      },
      {
        id: "field_of_study",
        label: "Field of study",
        type: "short_text",
      },
      {
        id: "degree_level",
        label: "Degree level",
        type: "single_choice",
        options: [
          "Bachelor's (in progress)",
          "Bachelor's (completed)",
          "Master's (in progress)",
          "Master's (completed)",
          "PhD",
          "Other",
        ],
      },
      {
        id: "study_year",
        label: "Current year of study",
        hint: "If applicable",
        type: "single_choice",
        options: ["1st", "2nd", "3rd", "4th", "5th+"],
      },
    ],
  },
  {
    id: "professional",
    title: "Professional Background",
    fields: [
      {
        id: "industry",
        label: "Industry you work / have worked in",
        type: "short_text",
        required: true,
      },
      {
        id: "experience_years",
        label: "Years of professional experience",
        type: "single_choice",
        required: true,
        options: ["None", "Less than 1 year", "1–3 years", "3–5 years", "5+ years"],
      },
    ],
  },
  {
    id: "startup",
    title: "Startup & Program",
    fields: [
      {
        id: "has_idea",
        label: "Do you already have a startup idea to develop within the program?",
        type: "single_choice",
        required: true,
        options: [
          "Yes — well-defined idea",
          "Yes — early-stage concept",
          "No — still exploring",
        ],
      },
      {
        id: "program_path",
        label: "Which program path do you choose?",
        type: "single_choice",
        required: true,
        options: ["DeepTech", "SocialImpact", "B2B SaaS"],
      },
      {
        id: "has_team",
        label: "Do you currently have a team?",
        type: "single_choice",
        required: true,
        options: [
          "Yes — complete team",
          "Yes — partial team",
          "No — looking for co-founders",
          "No — planning to work solo",
        ],
      },
      {
        id: "needs_members",
        label: "Are you looking for additional team members?",
        type: "single_choice",
        options: ["Yes", "No", "Maybe later"],
      },
      {
        id: "looking_for_roles",
        label: "What roles are you looking for in your team?",
        hint: "Select all that apply",
        type: "multi_choice",
        options: [
          "Technical / Developer",
          "Product / UX",
          "Marketing / Growth",
          "Sales / Business Development",
          "Finance / Legal",
          "Operations",
          "Other",
        ],
      },
      {
        id: "startup_experience",
        label: "Have you previously built or co-founded a startup?",
        type: "single_choice",
        required: true,
        options: [
          "Yes — exited or active",
          "Yes — failed / shut down",
          "Side project only",
          "No experience",
        ],
      },
    ],
  },
  {
    id: "profile",
    title: "Your Profile",
    fields: [
      {
        id: "strengths",
        label: "What are you good at?",
        hint: "Describe your key skills and competencies",
        type: "long_text",
        required: true,
      },
      {
        id: "interests",
        label: "What are your main interests?",
        hint: "Topics, domains, or fields you are passionate about",
        type: "long_text",
        required: true,
      },
      {
        id: "personality",
        label: "I am the type of person who…",
        hint: "Describe your working style, mindset, and personality in a startup context",
        type: "long_text",
        required: true,
      },
      {
        id: "preferred_role",
        label: "In which role would you feel most comfortable?",
        type: "single_choice",
        required: true,
        options: [
          "CEO / Visionary",
          "CTO / Technical Lead",
          "CPO / Product Lead",
          "CMO / Growth Lead",
          "COO / Operations",
          "Domain Expert / Specialist",
        ],
      },
    ],
  },
];

export type FormValues = Record<string, string | string[]>;
