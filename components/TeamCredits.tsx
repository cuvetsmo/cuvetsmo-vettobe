import type { YearCredit } from "@/lib/data/credits";

/**
 * Credit card for ทีมหัวปี — shown on /years/[year] and a compact version
 * on the home page disclaimer area for the active round.
 */
export function TeamCredits({ credit, variant = "card" }: { credit: YearCredit; variant?: "card" | "inline" }) {
  if (variant === "inline") {
    return (
      <div className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
        <span>จัดรอบโดย: </span>
        {credit.teams.map((t, i) => (
          <span key={t.cohort}>
            <strong className="!text-[var(--color-ink)]">{t.label}</strong>
            {t.role && <span className="text-[var(--color-ink-faint)]"> ({t.role})</span>}
            {i < credit.teams.length - 1 ? <span> + </span> : null}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 mb-8">
      <div className="flex items-baseline justify-between flex-wrap gap-2 mb-3">
        <h2 className="text-lg font-serif font-semibold text-[var(--color-ink)]">
          🙌 ทีมหัวปีที่จัดรอบ {credit.year_id}
        </h2>
        <span className="text-xs text-[var(--color-ink-faint)]">credits</span>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        {credit.teams.map((t) => (
          <div
            key={t.cohort}
            className="inline-flex items-baseline gap-2 bg-[var(--color-surface-lift)] border border-[var(--color-border)] rounded-lg px-3 py-2"
          >
            <span className="font-serif font-semibold text-[var(--color-ink)]">{t.label}</span>
            <span className="text-xs text-[var(--color-ink-faint)]">ปี {t.student_year_during_round}</span>
            {t.role && (
              <span className="text-xs text-[var(--color-ink-muted)]">· {t.role}</span>
            )}
          </div>
        ))}
      </div>
      {credit.note && (
        <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
          {credit.note}
        </p>
      )}
    </div>
  );
}
