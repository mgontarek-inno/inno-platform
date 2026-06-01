"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  FormValues,
  SURVEY_SECTIONS,
  type SurveySection,
} from "@/lib/survey-data";
import styles from "./profiles.module.css";

export interface ProfileItem {
  id: string;
  values: FormValues;
  email: string | null;
  name: string | null;
  image: string | null;
  createdAt: string | null;
}

interface Props {
  profiles: ProfileItem[];
}

function profileSearchText(values: FormValues): string {
  return Object.values(values)
    .flatMap((v) => (Array.isArray(v) ? v : [v]))
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

/** Frazy rozdzielone przecinkiem; puste fragmenty są pomijane. */
function parseSearchPhrases(query: string): string[] {
  return query
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 0);
}

function sectionHasAnswers(values: FormValues, section: SurveySection): boolean {
  const fields = section.fields;

  if (!fields?.length) return false;

  return fields.some((field) => {
    const v = values[field.id];
    if (v === undefined || v === null) return false;
    if (Array.isArray(v)) return v.length > 0;
    return String(v).trim().length > 0;
  });
}

/** Pola typu single_choice — opcje biorę z definicji ankiety. */
const FILTER_FIELDS = [
  { fieldId: "program_path", label: "Ścieżka programu" },
  { fieldId: "experience_years", label: "Doświadczenie zawodowe" },
  { fieldId: "preferred_role", label: "Preferowana rola" },
  { fieldId: "has_team", label: "Zespół" },
  { fieldId: "edu_status", label: "Status edukacji" },
  { fieldId: "has_idea", label: "Pomysł na startup" },
  { fieldId: "startup_experience", label: "Doświadczenie startupowe" },
  { fieldId: "needs_members", label: "Szuka osób do zespołu" },
] as const;

function getFieldOptions(fieldId: string): string[] {
  for (const section of SURVEY_SECTIONS) {
    const field = section.fields.find((f) => f.id === fieldId);
    if (field?.options?.length) return field.options;
  }
  return [];
}

function matchesFieldFilter(
  values: FormValues,
  fieldId: string,
  selected: string
): boolean {
  if (!selected) return true;
  const v = values[fieldId];
  if (typeof v !== "string") return false;
  return v === selected;
}

type FiltersState = Record<(typeof FILTER_FIELDS)[number]["fieldId"], string>;

const EMPTY_FILTERS: FiltersState = {
  program_path: "",
  experience_years: "",
  preferred_role: "",
  has_team: "",
  edu_status: "",
  has_idea: "",
  startup_experience: "",
  needs_members: "",
};

export default function ProfilesClient({ profiles }: Props) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<FiltersState>(EMPTY_FILTERS);

  const hasActiveFilters = useMemo(
    () => Object.values(filters).some((v) => v !== ""),
    [filters]
  );

  const filtered = useMemo(() => {
    let list = profiles;

    const phrases = parseSearchPhrases(query);
    if (phrases.length > 0) {
      list = list.filter((p) => {
        const text = profileSearchText(p.values);
        return phrases.every((phrase) => text.includes(phrase));
      });
    }

    for (const { fieldId } of FILTER_FIELDS) {
      const selected = filters[fieldId];
      if (!selected) continue;
      list = list.filter((p) =>
        matchesFieldFilter(p.values, fieldId, selected)
      );
    }

    return list;
  }, [profiles, query, filters]);

  const clearFilters = () => setFilters(EMPTY_FILTERS);

  return (
    <>
      <div className={styles.toolbar}>
        <label className={styles.searchLabel} htmlFor="profile-search">
          Search profiles
        </label>
        <input
          id="profile-search"
          type="search"
          className={styles.searchInput}
          placeholder="np. DeepTech, Poland — kilka fraz po przecinku"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
        />
      </div>

      <div className={styles.filters}>
        <div className={styles.filtersHeader}>
          <h2 className={styles.filtersTitle}>Filtry</h2>
          {hasActiveFilters && (
            <button
              type="button"
              className={styles.clearFilters}
              onClick={clearFilters}
            >
              Wyczyść filtry
            </button>
          )}
        </div>
        <div className={styles.filtersGrid}>
          {FILTER_FIELDS.map(({ fieldId, label }) => {
            const options = getFieldOptions(fieldId);
            if (options.length === 0) return null;
            return (
              <div key={fieldId} className={styles.filterGroup}>
                <label className={styles.filterLabel} htmlFor={`filter-${fieldId}`}>
                  {label}
                </label>
                <select
                  id={`filter-${fieldId}`}
                  className={styles.filterSelect}
                  value={filters[fieldId]}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      [fieldId]: e.target.value,
                    }))
                  }
                >
                  <option value="">Wszystkie</option>
                  {options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
        <p className={styles.searchHint}>
          Wyświetlane: {filtered.length} z {profiles.length}. Wyszukiwarka: kilka
          fraz po przecinku — profil musi zawierać każdą; filtry działają
          jednocześnie (AND).
        </p>
      </div>

      {profiles.length === 0 ? (
        <p className={styles.empty}>No profiles yet.</p>
      ) : filtered.length === 0 ? (
        <p className={styles.empty}>Brak wyników dla podanych kryteriów.</p>
      ) : (
        <div className={styles.list}>
          {filtered.map((profile) => (
            <article key={profile.id} className={styles.card}>
              {(profile.email || profile.name || profile.image) && (
                <div className={styles.author}>
                  {profile.image && (
                    <Image
                      src={profile.image}
                      alt=""
                      width={40}
                      height={40}
                      className={styles.authorAvatar}
                      unoptimized
                    />
                  )}
                  <div className={styles.authorMeta}>
                    {profile.name && (
                      <span className={styles.authorName}>{profile.name}</span>
                    )}
                    {profile.email && (
                      <span className={styles.authorEmail}>{profile.email}</span>
                    )}
                  </div>
                </div>
              )}
              <div className={styles.meta}>
                <span>
                  {profile.createdAt
                    ? new Date(profile.createdAt).toLocaleString()
                    : "—"}
                </span>
              </div>

              {SURVEY_SECTIONS.map((section) => {
                if (!sectionHasAnswers(profile.values, section)) {
                  return null;
                }

                return (
                  <section key={section.id} className={styles.section}>
                    <h2 className={styles.sectionTitle}>{section.title}</h2>
                    {section.fields.map((field) => {
                      const value = profile.values[field.id];
                      if (
                        !value ||
                        (Array.isArray(value) && value.length === 0)
                      ) {
                        return null;
                      }

                      return (
                        <div key={field.id} className={styles.row}>
                          <span className={styles.label}>{field.label}</span>
                          <span className={styles.value}>
                            {Array.isArray(value) ? value.join(", ") : value}
                          </span>
                        </div>
                      );
                    })}
                  </section>
                );
              })}
            </article>
          ))}
        </div>
      )}
    </>
  );
}
