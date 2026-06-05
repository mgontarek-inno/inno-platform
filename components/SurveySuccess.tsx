import { FormValues, SURVEY_SECTIONS } from "@/lib/survey-data";
import styles from "./SurveySuccess.module.css";

interface Props {
  values: FormValues;
}

export default function SurveySuccess({ values }: Props) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.glow} />
      <div className={styles.container}>
        <div className={styles.icon}>✓</div>
        <h1 className={styles.title}>Aplikacja wysłana.</h1>
        <p className={styles.sub}>
          Przejrzymy Twoje odpowiedzi i skontaktujemy się w ciągu 5 dni
          roboczych. Powodzenia — trzymamy kciuki.
        </p>

        <details className={styles.details}>
          <summary className={styles.summary}>Przejrzyj odpowiedzi</summary>
          <div className={styles.answers}>
            {SURVEY_SECTIONS.map((section) => (
              <div key={section.id} className={styles.section}>
                <h3 className={styles.sectionTitle}>{section.title}</h3>
                {section.fields.map((field) => {
                  const val = values[field.id];
                  if (!val || (Array.isArray(val) && val.length === 0)) return null;
                  return (
                    <div key={field.id} className={styles.answer}>
                      <span className={styles.q}>{field.label}</span>
                      <span className={styles.a}>
                        {Array.isArray(val) ? val.join(", ") : val}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}
