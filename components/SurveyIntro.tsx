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
          {stepLabel ?? "◈ Applications open"}
        </div>
        <h1 className={styles.headline}>
          Build something<br />
          <span className={styles.accent}>that matters.</span>
        </h1>
        <p className={styles.sub}>
          This application takes about 10 minutes. Answer honestly.
        </p>
        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <span className={styles.metaDot} />
            5 sections
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
