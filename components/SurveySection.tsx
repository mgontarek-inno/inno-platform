import { SurveySection as SurveySectionType, FormValues } from "@/lib/survey-data";
import SurveyField from "./SurveyField";
import styles from "./SurveySection.module.css";

interface Props {
  section: SurveySectionType;
  values: FormValues;
  onChange: (fieldId: string, value: string | string[]) => void;
  errors?: Record<string, string>;
}

function isFieldVisible(field: any, values: FormValues): boolean {
  if (!field.conditionalOn) return true;
  
  const fieldValue = values[field.conditionalOn.field];
  if (!fieldValue) return false;
  
  if (field.conditionalOn.values) {
    return field.conditionalOn.values.includes(String(fieldValue));
  }
  
  if (field.conditionalOn.value) {
    return String(fieldValue) === field.conditionalOn.value;
  }
  
  return true;
}

export default function SurveySection({ section, values, onChange, errors }: Props) {
  return (
    <div className={styles.fields} data-survey-fields>
      {section.fields
        .filter((field) => isFieldVisible(field, values))
        .map((field, i) => (
        <SurveyField
          key={field.id}
          field={field}
          value={values[field.id] ?? (field.type === "multi_choice" ? [] : "")}
          onChange={(v) => onChange(field.id, v)}
          otherValue={values[`${field.id}_other`]}
          onOtherChange={(v) => onChange(`${field.id}_other`, v)}
          index={i}
          error={errors?.[field.id]}
        />
      ))}
    </div>
  );
}
