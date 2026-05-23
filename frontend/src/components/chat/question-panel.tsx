"use client";

import { HelpCircle } from "lucide-react";

const TOTAL_QUESTIONS = 28;

/** Prominent display of the active screening question */
export function QuestionPanel({
  questionText,
  section,
  sectionLabel,
  questionNumber,
}: {
  questionText: string;
  section: string | null;
  sectionLabel: string;
  questionNumber: number;
}) {
  const lines = questionText.split("\n").filter(Boolean);
  const mainQuestion = lines[lines.length - 1] || questionText;
  const intro = lines.length > 1 ? lines.slice(0, -1).join(" ") : null;

  return (
    <div
      className="shrink-0 border-b-2 border-[var(--border)] bg-[color-mix(in_srgb,var(--primary)_6%,var(--card))] px-4 py-5 sm:px-6"
      role="region"
      aria-label="Current screening question"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--primary)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--primary-foreground)]">
          <HelpCircle className="h-3.5 w-3.5" />
          {section ? `Section ${section}` : "Question"}
        </span>
        <span className="text-xs font-medium text-[var(--muted-foreground)]">
          {questionNumber} of {TOTAL_QUESTIONS}
        </span>
      </div>
      {section && (
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
          {sectionLabel}
        </p>
      )}
      {intro && (
        <p className="mb-2 text-sm text-[var(--muted-foreground)]">{intro}</p>
      )}
      <h2 className="text-lg font-bold leading-snug text-[var(--foreground)] sm:text-xl">
        {mainQuestion}
      </h2>
      <p className="mt-2 text-sm font-medium text-[var(--muted-foreground)]">
        Select an option below or type your answer
      </p>
    </div>
  );
}
