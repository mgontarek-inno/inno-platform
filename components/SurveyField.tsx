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

      {field.type === "short_text" && (
        <input
          className={styles.input}
          type="text"
          value={strVal}
          placeholder="Twoja odpowiedź…"
          onChange={(e) => onChange(e.target.value)}
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
        />
      )}

      {/* SINGLE CHOICE */}
      {field.type === "single_choice" && (
        <div className={styles.options}>
          {field.options?.map((opt) => (
            <button
              key={opt}
              className={`${styles.option} ${strVal === opt ? styles.selected : ""}`}
              onClick={() => onChange(opt)}
              type="button"
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
          {field.options?.map((opt) => (
            <button
              key={opt}
              className={`${styles.option} ${styles.multiOption} ${
                arrVal.includes(opt) ? styles.selected : ""
              }`}
              onClick={() => toggleMulti(opt)}
              type="button"
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
              type="button"
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
