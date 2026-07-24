"use client";

import { SurveyField as FieldType } from "@/lib/survey-data";
import styles from "./SurveyField.module.css";

interface Props {
  field: FieldType;
  value: string | string[];
  onChange: (v: string | string[]) => void;
  index: number;
  error?: string;
}

export default function SurveyField({ field, value, onChange, index, error }: Props) {
  const strVal = typeof value === "string" ? value : "";
  const arrVal = Array.isArray(value) ? value : [];

  const toggleMulti = (option: string) => {
    const next = arrVal.includes(option)
      ? arrVal.filter((v) => v !== option)
      : [...arrVal, option];
    onChange(next);
  };

  const focusNextField = (current: HTMLElement) => {
    const container = current.closest<HTMLElement>("[data-survey-fields]");
    if (!container) return;
    const focusables = Array.from(
      container.querySelectorAll<HTMLElement>("[data-survey-focusable]")
    );
    const currentIndex = focusables.indexOf(current);
    const next = focusables[currentIndex + 1];
    if (next) {
      next.focus();
    } else {
      document
        .querySelector<HTMLButtonElement>("[data-survey-next-btn]")
        ?.click();
    }
  };

  const handleEnterKey = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    focusNextField(e.currentTarget);
  };

  const handleOptionArrowKey = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(e.key)) {
      return;
    }
    e.preventDefault();
    const group = e.currentTarget.parentElement;
    if (!group) return;
    const buttons = Array.from(group.querySelectorAll<HTMLButtonElement>("button"));
    const currentIndex = buttons.indexOf(e.currentTarget);
    if (currentIndex === -1) return;
    const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
    const nextIndex = (currentIndex + dir + buttons.length) % buttons.length;
    buttons[nextIndex]?.focus();
  };

  return (
    <div
      className={styles.field}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className={styles.labelRow}>
        <label className={styles.label}>
          {field.label}
          {field.required && <span className={styles.required}>*</span>}
        </label>
      </div>
      {field.hint && <p className={styles.hint}>{field.hint}</p>}

      {error && <p className={styles.error}>{error}</p>}

      {field.type === "short_text" && field.numeric && (
        <input
          className={styles.input}
          type="number"
          inputMode="numeric"
          min={0}
          value={strVal}
          placeholder="Twoja odpowiedź…"
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleEnterKey}
          data-survey-focusable
        />
      )}

      {field.type === "short_text" && !field.numeric && (
        <input
          className={styles.input}
          type="text"
          value={strVal}
          placeholder="Twoja odpowiedź…"
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleEnterKey}
          data-survey-focusable
        />
      )}

      {/* LONG TEXT */}
      {field.type === "long_text" && (
        <textarea
          className={styles.textarea}
          value={strVal}
          placeholder="Twoja odpowiedź…"
          rows={5}
          onChange={(e) => onChange(e.target.value)}
          data-survey-focusable
        />
      )}

      {/* SINGLE CHOICE */}
      {field.type === "single_choice" && (
        <div className={styles.options}>
          {field.options?.map((opt, i) => (
            <button
              key={opt}
              className={`${styles.option} ${strVal === opt ? styles.selected : ""}`}
              onClick={() => onChange(opt)}
              onKeyDown={handleOptionArrowKey}
              type="button"
              {...(i === 0 ? { "data-survey-focusable": true } : {})}
            >
              <span className={styles.optionDot} />
              {opt}
            </button>
          ))}
        </div>
      )}

      {/* MULTI CHOICE */}
      {field.type === "multi_choice" && (
        <div className={styles.options}>
          {field.options?.map((opt, i) => (
            <button
              key={opt}
              className={`${styles.option} ${styles.multiOption} ${
                arrVal.includes(opt) ? styles.selected : ""
              }`}
              onClick={() => toggleMulti(opt)}
              onKeyDown={handleOptionArrowKey}
              type="button"
              {...(i === 0 ? { "data-survey-focusable": true } : {})}
            >
              <span className={styles.optionCheckbox}>
                {arrVal.includes(opt) && "✓"}
              </span>
              {opt}
            </button>
          ))}
        </div>
      )}

      {/* SCALE */}
      {field.type === "scale" && (
        <div className={styles.scale}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              className={`${styles.scaleBtn} ${
                strVal === String(n) ? styles.selected : ""
              }`}
              onClick={() => onChange(String(n))}
              onKeyDown={handleOptionArrowKey}
              type="button"
              {...(n === 1 ? { "data-survey-focusable": true } : {})}
            >
              {n}
            </button>
          ))}
          <div className={styles.scaleLabels}>
            <span>{field.scaleMin ?? "Wcale"}</span>
            <span>{field.scaleMax ?? "Zdecydowanie"}</span>
          </div>
        </div>
      )}
    </div>
  );
}
