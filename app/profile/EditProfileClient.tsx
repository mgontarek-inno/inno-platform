"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProfileItem } from "@/app/profiles/ProfilesClient";
import { SURVEY_SECTIONS, FormValues } from "@/lib/survey-data";
import SurveySectionForm from "@/components/SurveySection";
import styles from "@/app/profiles/profiles.module.css";

export default function EditProfileClient({ profile }: { profile: ProfileItem }) {
  const router = useRouter();
  const [draftValues, setDraftValues] = useState<FormValues>(profile.values);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const handleChange = (fieldId: string, value: string | string[]) => {
    setDraftValues((p) => ({ ...p, [fieldId]: value }));
  };

  const validateValues = (values: FormValues) => {
    const errs: Record<string, string> = {};
    for (const section of SURVEY_SECTIONS) {
      for (const field of section.fields) {
        if (!field.required) continue;
        const v = values[field.id];
        if (field.type === "multi_choice") {
          if (!Array.isArray(v) || v.length === 0) errs[field.id] = "To pole jest wymagane";
        } else {
          if (!v || String(v).trim().length === 0) errs[field.id] = "To pole jest wymagane";
        }
      }
    }
    return errs;
  };

  return (
    <div>
      <div className={styles.editSections}>
        {SURVEY_SECTIONS.map((section) => (
          <div key={section.id} className={styles.editSection}>
            <h3 className={styles.editSectionTitle}>{section.title}</h3>
            <SurveySectionForm section={section} values={draftValues} onChange={handleChange} errors={errors} />
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12 }}>
        <button
          type="button"
          className={styles.saveButton}
          onClick={async () => {
            const errs = validateValues(draftValues);
            setErrors(errs);
            if (Object.keys(errs).length > 0) return;
            setSaving(true);
            try {
              const res = await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profileId: profile.id, values: draftValues }),
              });
              if (!res.ok) throw new Error('Save failed');
              router.push('/profiles');
            } catch (err) {
              alert('Błąd zapisu profilu');
            } finally {
              setSaving(false);
            }
          }}
          disabled={saving}
        >
          {saving ? 'Zapisywanie...' : 'Zapisz zmiany'}
        </button>
      </div>
    </div>
  );
}
