import { SurveySection as SurveySectionType, FormValues } from "@/lib/survey-data";
import SurveyField from "./SurveyField";
import styles from "./SurveySection.module.css";

interface Props {
  section: SurveySectionType;
  values: FormValues;
  onChange: (fieldId: string, value: string | string[]) => void;
}

export default function SurveySection({ section, values, onChange }: Props) {
  return (
    <div className={styles.fields}>
      {section.fields.map((field, i) => (
        <SurveyField
          key={field.id}
          field={field}
          value={values[field.id] ?? (field.type === "multi_choice" ? [] : "")}
          onChange={(v) => onChange(field.id, v)}
          index={i}
        />
      ))}
    </div>
  );
}
