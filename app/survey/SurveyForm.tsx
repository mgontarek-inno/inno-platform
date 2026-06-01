"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SURVEY_SECTIONS, FormValues } from "@/lib/survey-data";
import SurveySection from "@/components/SurveySection";
import SurveyProgress from "@/components/SurveyProgress";
import SurveyIntro from "@/components/SurveyIntro";
import AppHeader from "@/components/AppHeader";
import styles from "./survey.module.css";

interface Props {
  email: string;
  name?: string | null;
  image?: string | null;
}

export default function SurveyForm({ email, name, image }: Props) {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [values, setValues] = useState<FormValues>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const total = SURVEY_SECTIONS.length;

  const handleChange = (fieldId: string, value: string | string[]) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleNext = async () => {
    if (currentSection < total - 1) {
      setCurrentSection((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      try {
        setIsSubmitting(true);
        setSubmitError(null);

        const response = await fetch("/api/survey", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ values }),
        });

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Nie udało się zapisać ankiety");
        }

        router.push("/profiles");
        router.refresh();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd";
        setSubmitError(message);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (currentSection > 0) {
      setCurrentSection((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (!started) {
    return (
      <>
        <AppHeader email={email} name={name} image={image} />
        <SurveyIntro
          stepLabel="Krok 2 z 2 — Ankieta"
          onStart={() => setStarted(true)}
        />
      </>
    );
  }

  const section = SURVEY_SECTIONS[currentSection];

  return (
    <>
      <AppHeader email={email} name={name} image={image} />
      <main className={styles.main}>
        <aside className={styles.sidebar}>
          <div className={styles.logo}>
            <span className={styles.logoMark}>◈</span>
            <span className={styles.logoText}>Founders Program</span>
          </div>
          <SurveyProgress
            sections={SURVEY_SECTIONS}
            current={currentSection}
            onNavigate={(i) => i < currentSection && setCurrentSection(i)}
          />
          <div className={styles.sidebarFooter}>
            <p className={styles.footerNote}>
              Krok 2 rejestracji — po wysłaniu przejdziesz do profili.
            </p>
          </div>
        </aside>

        <div className={styles.content}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIndex}>
              {String(currentSection + 1).padStart(2, "0")} /{" "}
              {String(total).padStart(2, "0")}
            </span>
            <h1 className={styles.sectionTitle}>{section.title}</h1>
          </div>

          <SurveySection
            section={section}
            values={values}
            onChange={handleChange}
          />

          <div className={styles.nav}>
            {currentSection > 0 && (
              <button type="button" className={styles.btnBack} onClick={handleBack}>
                ← Wstecz
              </button>
            )}
            <button
              type="button"
              className={styles.btnNext}
              onClick={handleNext}
              disabled={isSubmitting}
            >
              {currentSection === total - 1
                ? isSubmitting
                  ? "Zapisywanie..."
                  : "Wyślij aplikację"
                : "Dalej →"}
            </button>
          </div>
          {submitError && (
            <p className={styles.submitError}>{submitError}</p>
          )}
        </div>
      </main>
    </>
  );
}
