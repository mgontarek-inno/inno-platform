import { SurveySection } from "@/lib/survey-data";
import styles from "./SurveyProgress.module.css";

interface Props {
  sections: SurveySection[];
  current: number;
  onNavigate: (index: number) => void;
}

export default function SurveyProgress({ sections, current, onNavigate }: Props) {
  return (
    <nav className={styles.nav}>
      {sections.map((section, i) => {
        const state = i < current ? "done" : i === current ? "active" : "todo";
        return (
          <button
            key={section.id}
            className={`${styles.item} ${styles[state]}`}
            onClick={() => onNavigate(i)}
            disabled={i > current}
          >
            <span className={styles.marker}>
              {state === "done" ? "✓" : String(i + 1).padStart(2, "0")}
            </span>
            <span className={styles.label}>{section.title}</span>
          </button>
        );
      })}
    </nav>
  );
}
