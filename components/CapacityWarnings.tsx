import Link from "next/link";
import type { CapacityWarning } from "@/lib/data/source";

/**
 * Capacity-overflow advisory for admins.
 *
 * Many of the listed cells are intentional shares per the FINAL diff
 * (e.g. ไพรซ์ split-week pharmacy/internal-med, ปอง+กิ๊ม pharmacy adds).
 * The component surfaces ALL such cells so an admin can verify rather
 * than miss the ones that ARE real bugs.
 *
 * HARD_OVER  = total student-days exceed weekly capacity (cap × 7)
 * COUNT_OVER = student count exceeds cap, but they may be sharing days
 */
export function CapacityWarnings({
  warnings,
  yearId,
}: {
  warnings: CapacityWarning[];
  yearId: number;
}) {
  if (warnings.length === 0) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-4 text-sm text-[var(--color-ink-muted)]">
        ✅ ไม่มีแผนกใดในปี {yearId} ที่เกิน capacity
      </div>
    );
  }

  const hard = warnings.filter((w) => w.status === "HARD_OVER");
  const count = warnings.filter((w) => w.status === "COUNT_OVER");

  return (
    <div className="space-y-3">
      <div className="text-xs text-[var(--color-ink-faint)] leading-relaxed">
        <strong className="text-[var(--color-ink-muted)]">HARD</strong> = วันรวม &gt; cap × 7 (เกินแน่นอน) ·{" "}
        <strong className="text-[var(--color-ink-muted)]">COUNT</strong> = นิสิตเกิน cap แต่อาจแบ่งวันกันได้
      </div>
      {hard.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-[var(--color-danger)] mb-2">
            🔴 HARD over ({hard.length})
          </h3>
          <ul className="space-y-1.5">
            {hard.map((w) => (
              <WarningRow key={`${w.dept_slug}-${w.week}`} w={w} yearId={yearId} />
            ))}
          </ul>
        </div>
      )}
      {count.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-[var(--color-warning)] mb-2">
            🟡 COUNT over ({count.length})
          </h3>
          <ul className="space-y-1.5">
            {count.map((w) => (
              <WarningRow key={`${w.dept_slug}-${w.week}`} w={w} yearId={yearId} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function WarningRow({ w, yearId }: { w: CapacityWarning; yearId: number }) {
  return (
    <li className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-3 text-sm">
      <div className="flex items-baseline justify-between flex-wrap gap-2 mb-1">
        <div className="flex items-baseline gap-2 flex-wrap">
          <Link
            href={`/years/${yearId}/depts/${w.dept_slug}`}
            className="font-medium !text-[var(--color-ink)]"
          >
            {w.dept_short_th}
          </Link>
          <span className="font-mono text-xs bg-[var(--color-surface-strong)] px-1.5 py-0.5 rounded">
            W{w.week}
          </span>
        </div>
        <div className="text-xs text-[var(--color-ink-muted)]">
          {w.students}/{w.capacity_per_day} · {w.student_days}/{w.weekly_capacity} วัน
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 text-xs text-[var(--color-ink-muted)]">
        {w.occupants.map((o) => (
          <Link
            key={`${o.short_id}-${o.nickname}-${o.student_year}`}
            href={`/students/${yearId}/${o.short_id}`}
            className="inline-flex items-center gap-1 bg-[var(--color-surface-lift)] hover:bg-[var(--color-surface-strong)] px-1.5 py-0.5 rounded transition-colors"
          >
            <span className="font-mono text-[10px] !text-[var(--color-ink-faint)]">#{o.short_id}</span>
            <span>{o.nickname}</span>
            <span className="text-[10px] !text-[var(--color-ink-faint)]">
              y{o.student_year} · {o.days_practiced}d
            </span>
          </Link>
        ))}
      </div>
    </li>
  );
}
