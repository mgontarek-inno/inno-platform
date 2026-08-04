"use client";

import { useMemo, useState } from "react";
import type { UserSummary } from "@/lib/users";
import { formatProfileDate } from "@/lib/format-date";
import { SURVEY_SECTIONS, type FormValues } from "@/lib/survey-data";
import { LINK_FIELD_IDS, safeExternalUrl } from "@/lib/url-safety";
import {
  PROFILE_VIEW_LABELS,
  formatOptionValue,
  sectionHasAnswers,
} from "@/lib/survey-view";
import styles from "@/app/profiles/profiles.module.css";
import adminStyles from "./admin.module.css";

interface Props {
  users: UserSummary[];
  currentEmail: string;
}

interface SurveyPreview {
  email: string;
  name: string;
  status: "loading" | "error" | "ready";
  values: FormValues;
  createdAt: string | null;
}

export default function AdminClient({ users: initialUsers, currentEmail }: Props) {
  const [users, setUsers] = useState(initialUsers);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<SurveyPreview | null>(null);

  const updateStatus = async (email: string, status: "pending" | "approved") => {
    setError(null);
    setPendingEmail(email);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, status }),
      });
      if (!res.ok) throw new Error("Save failed");
      setUsers((prev) =>
        prev.map((u) => (u.email === email ? { ...u, status } : u))
      );
    } catch (err) {
      setError("Błąd przy zapisie statusu");
    } finally {
      setPendingEmail(null);
    }
  };

  const openSurveyPreview = async (user: UserSummary) => {
    setPreview({
      email: user.email,
      name: user.name,
      status: "loading",
      values: {},
      createdAt: null,
    });
    try {
      const res = await fetch(
        `/api/admin/users/survey?email=${encodeURIComponent(user.email)}`
      );
      if (!res.ok) throw new Error("Failed to load");
      const json = await res.json();
      setPreview({
        email: user.email,
        name: user.name,
        status: "ready",
        values: json.values ?? {},
        createdAt: json.createdAt ?? null,
      });
    } catch (err) {
      setPreview((prev) =>
        prev ? { ...prev, status: "error" } : prev
      );
    }
  };

  const sorted = [...users].sort((a, b) => {
    if (a.status !== b.status) return a.status === "pending" ? -1 : 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const stats = useMemo(() => {
    const pending = users.filter((u) => u.status === "pending").length;
    const approved = users.filter((u) => u.status === "approved").length;
    const surveys = users.filter((u) => u.surveyCompleted).length;
    return { total: users.length, pending, approved, surveys };
  }, [users]);

  return (
    <div>
      <div className={adminStyles.stats}>
        <div className={adminStyles.statCard}>
          <div className={adminStyles.statValue}>{stats.total}</div>
          <div className={adminStyles.statLabel}>Uczestnicy</div>
        </div>
        <div className={adminStyles.statCard}>
          <div className={adminStyles.statValue}>{stats.pending}</div>
          <div className={adminStyles.statLabel}>Oczekujący</div>
        </div>
        <div className={adminStyles.statCard}>
          <div className={adminStyles.statValue}>{stats.approved}</div>
          <div className={adminStyles.statLabel}>Zatwierdzeni</div>
        </div>
        <div className={adminStyles.statCard}>
          <div className={adminStyles.statValue}>{stats.surveys}</div>
          <div className={adminStyles.statLabel}>Wypełnione ankiety</div>
        </div>
      </div>

      {error && <p className={styles.dangerZoneError}>{error}</p>}

      <div className={adminStyles.tableWrap}>
        <table className={adminStyles.table}>
          <thead>
            <tr>
              <th>Uczestnik</th>
              <th>E‑mail</th>
              <th>Status</th>
              <th>Ankieta</th>
              <th>Data rejestracji</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((u) => (
              <tr key={u.email}>
                <td className={adminStyles.nameCell}>{u.name || "—"}</td>
                <td className={adminStyles.emailCell}>{u.email}</td>
                <td>
                  <span
                    className={`${adminStyles.badge} ${
                      u.status === "approved"
                        ? adminStyles.badgeApproved
                        : adminStyles.badgePending
                    }`}
                  >
                    {u.status === "approved" ? "Zatwierdzony" : "Oczekuje"}
                  </span>
                  {u.role === "admin" && (
                    <span className={adminStyles.adminTag}>Admin</span>
                  )}
                </td>
                <td>
                  {u.surveyCompleted ? (
                    <span className={adminStyles.surveyDone}>Wypełniona</span>
                  ) : (
                    <span className={adminStyles.surveyMissing}>Brak</span>
                  )}
                </td>
                <td className={adminStyles.rowMuted}>
                  {formatProfileDate(new Date(u.createdAt))}
                </td>
                <td>
                  <div className={adminStyles.rowActions}>
                    <button
                      type="button"
                      className={adminStyles.viewButton}
                      disabled={!u.surveyCompleted}
                      onClick={() => openSurveyPreview(u)}
                    >
                      Podgląd ankiety
                    </button>
                    {u.email === currentEmail ? null : u.status === "approved" ? (
                      <button
                        type="button"
                        className={styles.clearFilters}
                        disabled={pendingEmail === u.email}
                        onClick={() => updateStatus(u.email, "pending")}
                      >
                        Cofnij zatwierdzenie
                      </button>
                    ) : (
                      <button
                        type="button"
                        className={styles.saveButton}
                        disabled={pendingEmail === u.email}
                        onClick={() => updateStatus(u.email, "approved")}
                      >
                        Zatwierdź
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {preview && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={`${styles.modal} ${adminStyles.surveyModal}`}>
            <h2 className={styles.modalHeader}>
              Ankieta: {preview.name || preview.email}
            </h2>
            {preview.createdAt && (
              <p className={adminStyles.surveyMeta}>
                Wypełniono: {formatProfileDate(new Date(preview.createdAt))}
              </p>
            )}
            <div className={styles.modalBody}>
              {preview.status === "loading" && <p>Ładowanie ankiety...</p>}
              {preview.status === "error" && (
                <p className={styles.dangerZoneError}>
                  Nie udało się wczytać ankiety.
                </p>
              )}
              {preview.status === "ready" &&
                (SURVEY_SECTIONS.every(
                  (section) => !sectionHasAnswers(preview.values, section)
                ) ? (
                  <p className={adminStyles.surveyEmpty}>Brak odpowiedzi.</p>
                ) : (
                  SURVEY_SECTIONS.map((section) => {
                    if (!sectionHasAnswers(preview.values, section)) return null;

                    return (
                      <section key={section.id} className={styles.section}>
                        <h3 className={styles.sectionTitle}>{section.title}</h3>
                        {section.fields.map((field) => {
                          const value = preview.values[field.id];
                          if (
                            !value ||
                            (Array.isArray(value) && value.length === 0)
                          ) {
                            return null;
                          }

                          const otherText = preview.values[`${field.id}_other`];
                          const otherTextStr =
                            typeof otherText === "string" ? otherText : undefined;

                          const safeHref = LINK_FIELD_IDS.includes(field.id)
                            ? safeExternalUrl(value)
                            : null;

                          const rendered = Array.isArray(value)
                            ? value
                                .map((v) => formatOptionValue(v, otherTextStr))
                                .join(", ")
                            : safeHref ? (
                                <a href={safeHref} target="_blank" rel="noopener noreferrer">
                                  {safeHref}
                                </a>
                              ) : LINK_FIELD_IDS.includes(field.id) ? (
                                String(value)
                              ) : (
                                formatOptionValue(String(value), otherTextStr)
                              );

                          return (
                            <div key={field.id} className={styles.row}>
                              <span className={styles.label}>
                                {PROFILE_VIEW_LABELS[field.id] ?? field.label}
                              </span>
                              <span className={styles.value}>{rendered}</span>
                            </div>
                          );
                        })}
                      </section>
                    );
                  })
                ))}
            </div>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.clearFilters}
                onClick={() => setPreview(null)}
              >
                Zamknij
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
