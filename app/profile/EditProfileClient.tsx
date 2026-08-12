"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { ProfileItem } from "@/app/profiles/ProfilesClient";
import { SURVEY_SECTIONS, FormValues } from "@/lib/survey-data";
import SurveySectionForm from "@/components/SurveySection";
import styles from "@/app/profiles/profiles.module.css";

interface Props {
  profile: ProfileItem;
  emailVisible: boolean;
  profileVisible: boolean;
  isAdmin: boolean;
}

export default function EditProfileClient({ profile, emailVisible, profileVisible, isAdmin }: Props) {
  const router = useRouter();
  const [draftValues, setDraftValues] = useState<FormValues>(profile.values);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [hideEmail, setHideEmail] = useState(!emailVisible);
  const [hideProfile, setHideProfile] = useState(!profileVisible);
  const [visibilitySaving, setVisibilitySaving] = useState(false);
  const [visibilityError, setVisibilityError] = useState<string | null>(null);

  const handleHideEmailChange = async (checked: boolean) => {
    setHideEmail(checked);
    setVisibilityError(null);
    setVisibilitySaving(true);
    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailVisible: !checked }),
      });
      if (!res.ok) throw new Error("Save failed");
      router.refresh();
    } catch (err) {
      setHideEmail(!checked);
      setVisibilityError("Błąd przy zapisie widoczności e-maila");
    } finally {
      setVisibilitySaving(false);
    }
  };

  const handleHideProfileChange = async (checked: boolean) => {
    setHideProfile(checked);
    setVisibilityError(null);
    setVisibilitySaving(true);
    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileVisible: !checked }),
      });
      if (!res.ok) throw new Error("Save failed");
      router.refresh();
    } catch (err) {
      setHideProfile(!checked);
      setVisibilityError("Błąd przy zapisie widoczności profilu");
    } finally {
      setVisibilitySaving(false);
    }
  };

  const CONFIRM_WORD = "DELETE";
  const canDeleteAccount = deleteConfirmText.trim().toUpperCase() === CONFIRM_WORD;

  const handleDeleteAccount = async () => {
    if (!canDeleteAccount) return;
    setDeleteError(null);
    setDeleting(true);
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      await signOut({ callbackUrl: "/login" });
    } catch (err) {
      setDeleteError("Błąd przy usuwaniu konta");
      setDeleting(false);
    }
  };

  const handleChange = (fieldId: string, value: string | string[]) => {
    setDraftValues((p) => ({ ...p, [fieldId]: value }));
  };

  const isFieldVisible = (field: (typeof SURVEY_SECTIONS)[number]["fields"][number], values: FormValues) => {
    if (!field.conditionalOn) return true;

    const fieldValue = values[field.conditionalOn.field];
    if (fieldValue === undefined || fieldValue === null || fieldValue === "") return false;

    if (field.conditionalOn.values) {
      return field.conditionalOn.values.includes(String(fieldValue));
    }

    if (field.conditionalOn.value) {
      return String(fieldValue) === field.conditionalOn.value;
    }

    return true;
  };

  const validateValues = (values: FormValues) => {
    const errs: Record<string, string> = {};
    for (const section of SURVEY_SECTIONS) {
      for (const field of section.fields) {
        if (!field.required || !isFieldVisible(field, values)) continue;
        const v = values[field.id];
        if (field.type === "multi_choice") {
          if (!Array.isArray(v) || v.length === 0) errs[field.id] = "To pole jest wymagane";
        } else if (!v || String(v).trim().length === 0) {
          errs[field.id] = "To pole jest wymagane";
        } else if (field.numeric && !/^\d+$/.test(String(v).trim())) {
          errs[field.id] = "Podaj poprawną liczbę";
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

      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button
          type="button"
          className={styles.clearFilters}
          onClick={() => router.push("/profiles")}
          disabled={saving}
        >
          Wróć
        </button>
        <button
          type="button"
          className={styles.saveButton}
          onClick={async () => {
            const errs = validateValues(draftValues);
            setErrors(errs);
            console.log(errs)
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

      <div className={styles.privacyRow}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            className={styles.checkboxInput}
            checked={hideEmail}
            disabled={visibilitySaving}
            onChange={(e) => handleHideEmailChange(e.target.checked)}
          />
          <span className={styles.checkboxBox} aria-hidden="true" />
          Ukryj mój e‑mail dla innych uczestników
        </label>
        {visibilitySaving && <span className={styles.savingHint}>Zapisywanie...</span>}
      </div>
      {isAdmin && (
        <div className={styles.privacyRow}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              className={styles.checkboxInput}
              checked={hideProfile}
              disabled={visibilitySaving}
              onChange={(e) => handleHideProfileChange(e.target.checked)}
            />
            <span className={styles.checkboxBox} aria-hidden="true" />
            Ukryj mój profil w liście profili
          </label>
        </div>
      )}
      {visibilityError && <p className={styles.dangerZoneError}>{visibilityError}</p>}

      <div className={styles.dangerZone}>
        <h3 className={styles.dangerZoneTitle}>Strefa zagrożenia</h3>
        <p className={styles.dangerZoneText}>
          Usunięcie konta jest nieodwracalne i skasuje Twój profil oraz wszystkie dane. Aby
          potwierdzić, wpisz <strong>{CONFIRM_WORD}</strong> poniżej.
        </p>
        <input
          type="text"
          className={styles.fieldInput}
          value={deleteConfirmText}
          onChange={(e) => setDeleteConfirmText(e.target.value)}
          placeholder={CONFIRM_WORD}
          style={{ marginBottom: 12, maxWidth: 240 }}
        />
        {deleteError && <p className={styles.dangerZoneError}>{deleteError}</p>}
        <div>
          <button
            type="button"
            className={styles.dangerButton}
            onClick={handleDeleteAccount}
            disabled={deleting || !canDeleteAccount}
          >
            {deleting ? 'Usuwanie...' : 'Usuń konto'}
          </button>
        </div>
      </div>
    </div>
  );
}
