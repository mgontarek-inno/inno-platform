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
        <h1 className={styles.headline}>
          Twój co-founder<br />
          <span className={styles.accent}>jest tutaj.</span>
        </h1>
        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <span className={styles.metaDot} />
            5 sekcji
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaDot} />
            ~10 min
          </div>
        </div>
        <button type="button" className={styles.cta} onClick={onStart}>
          Rozpocznij ankietę →
        </button>
      </div>
    </div>
  );
}
