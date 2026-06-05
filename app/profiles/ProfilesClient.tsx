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
  createdAtLabel: string | null;
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
  const [sending, setSending] = useState<string | null>(null);
  const [inviteFor, setInviteFor] = useState<ProfileItem | null>(null);
  const [startTime, setStartTime] = useState<string>("");
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [summary, setSummary] = useState<string>("");
  const [description, setDescription] = useState<string>("");

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
      <div className={styles.filters}>
        <div className={styles.filtersHeader}>
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
      </div>
      
      <div className={styles.toolbar}>
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

      {profiles.length === 0 ? (
        <p className={styles.empty}>Brak profili.</p>
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
                <span>{profile.createdAtLabel ?? "—"}</span>
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

                      const rendered = Array.isArray(value)
                        ? value.join(", ")
                        : field.id === "linkedin" ? (
                            <a href={String(value)} target="_blank" rel="noopener noreferrer">
                              {String(value)}
                            </a>
                          ) : (
                            String(value)
                          );

                      return (
                        <div key={field.id} className={styles.row}>
                          <span className={styles.label}>{field.label}</span>
                          <span className={styles.value}>{rendered}</span>
                        </div>
                      );
                    })}
                  </section>
                );
              })}
              <div className={styles.actions}>
                {profile.email ? (
                  <>
                    <button
                      type="button"
                      className={styles.inviteButton}
                      onClick={() => {
                        setInviteFor(profile);
                        // prefill summary
                        setSummary(`Spotkanie z ${profile.name ?? profile.email}`);
                        // default start time to one hour from now, formatted for datetime-local
                        const d = new Date(Date.now() + 60 * 60 * 1000);
                        const tzOffset = d.getTimezoneOffset() * 60000;
                        const localISO = new Date(d.getTime() - tzOffset)
                          .toISOString()
                          .slice(0, 16);
                        setStartTime(localISO);
                        setDurationMinutes(30);
                        setDescription("");
                      }}
                      disabled={sending === profile.id}
                    >
                      Wyślij zaproszenie Meet
                    </button>
                  </>
                ) : (
                  <span className={styles.noEmail}>Brak adresu e‑mail</span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
      {inviteFor && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <h2 className={styles.modalHeader}>Wyślij zaproszenie Meet</h2>
            <div className={styles.modalBody}>
              <p>
                Do: <strong>{inviteFor.name ?? inviteFor.email}</strong>
              </p>
              <label className={styles.fieldLabel}>
                Data i godzina rozpoczęcia
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={styles.fieldInput}
                />
              </label>
              <label className={styles.fieldLabel}>
                Czas trwania (minuty)
                <input
                  type="number"
                  min={1}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className={styles.fieldInput}
                />
              </label>
              <label className={styles.fieldLabel}>
                Temat
                <input
                  type="text"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className={styles.fieldInput}
                />
              </label>
              <label className={styles.fieldLabel}>
                Opis
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={styles.fieldInput}
                />
              </label>
            </div>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.inviteButton}
                onClick={async () => {
                  if (!inviteFor?.email) return;
                  setSending(inviteFor.id);
                  try {
                    const res = await fetch("/api/google/meet", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        attendeeEmail: inviteFor.email,
                        summary,
                        description,
                        startTime: new Date(startTime).toISOString(),
                        durationMinutes,
                      }),
                    });
                    const json = await res.json();
                    if (!res.ok) throw new Error(json?.error || "Unknown error");
                    alert("Zaproszenie wysłane — odbiorca otrzyma e‑mail.");
                    setInviteFor(null);
                  } catch (err: any) {
                    console.error(err);
                    alert("Błąd przy wysyłce zaproszenia: " + (err?.message ?? err));
                  } finally {
                    setSending(null);
                  }
                }}
                disabled={sending === inviteFor.id}
              >
                {sending === inviteFor.id ? "Wysyłanie..." : "Wyślij"}
              </button>
              <button
                type="button"
                className={styles.clearFilters}
                onClick={() => setInviteFor(null)}
                disabled={sending === inviteFor.id}
              >
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
