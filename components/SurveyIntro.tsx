import styles from "./SurveyIntro.module.css";

export default function SurveyIntro({
  onStart,
  stepLabel,
}: {
  onStart: () => void;
  stepLabel?: string;
}) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.noise} />
      <div className={styles.glow} />
      <div className={styles.container}>
        <div className={styles.badge}>
          {stepLabel ?? "◈ Nabór otwarty"}
        </div>
        <h1 className={styles.headline}>
          Stwórz coś<br />
          <span className={styles.accent}>co ma znaczenie.</span>
        </h1>
        <p className={styles.sub}>
          Wypełnienie ankiety zajmuje około 10 minut. Odpowiadaj szczerze.
        </p>
        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <span className={styles.metaDot} />
            5 sekcji
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaDot} />
            ~10 min
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaDot} />
            Zapis po wysłaniu
          </div>
        </div>
        <button type="button" className={styles.cta} onClick={onStart}>
          Rozpocznij ankietę →
        </button>
      </div>
    </div>
  );
}
