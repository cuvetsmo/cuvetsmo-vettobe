import Link from "next/link";
import type { ActivityItem } from "@/lib/data/source";
import type { Department } from "@/lib/types";

function timeAgo(iso: string): string {
  const t = new Date(iso).getTime();
  const diff = Date.now() - t;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec} วินาทีที่แล้ว`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} นาทีที่แล้ว`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} ชั่วโมงที่แล้ว`;
  const d = Math.floor(hr / 24);
  if (d < 30) return `${d} วันที่แล้ว`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo} เดือนที่แล้ว`;
  return `${Math.floor(mo / 12)} ปีที่แล้ว`;
}

function deptLabel(deptSlug: string, depts: Department[]): string {
  return depts.find((d) => d.slug === deptSlug)?.short_th ?? deptSlug;
}

function ratingStars(n: number): string {
  return "★".repeat(Math.max(0, Math.min(5, n))) + "☆".repeat(Math.max(0, 5 - n));
}

export function RecentActivity({
  items,
  depts,
}: {
  items: ActivityItem[];
  depts: Department[];
}) {
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <div className="flex items-baseline justify-between mb-6 flex-wrap gap-2">
        <h2 className="text-2xl font-serif font-semibold text-[var(--color-ink)]">
          เคลื่อนไหวล่าสุด
        </h2>
        <span className="text-xs text-[var(--color-ink-faint)]">
          รีวิวและการแจ้งแก้ไขจากเพื่อนๆ
        </span>
      </div>
      <ul className="space-y-2">
        {items.map((it) => {
          const href = `/years/${it.year_id}/depts/${it.dept_slug}`;
          if (it.kind === "review") {
            return (
              <li key={`r-${it.id}`}>
                <Link
                  href={href}
                  className="block bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] rounded-lg p-4 transition-colors"
                >
                  <div className="flex items-baseline justify-between flex-wrap gap-2 mb-1.5">
                    <div className="flex items-baseline gap-2 flex-wrap text-sm">
                      <span className="text-[10px] uppercase tracking-wide bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)] px-1.5 py-0.5 rounded">
                        รีวิว
                      </span>
                      <span className="font-medium !text-[var(--color-ink)]">
                        {deptLabel(it.dept_slug, depts)}
                      </span>
                      <span className="text-xs !text-[var(--color-ink-faint)]">ปี {it.year_id}</span>
                      <span className="text-[var(--color-rank-3)] text-sm font-mono" aria-label={`${it.rating} จาก 5`}>
                        {ratingStars(it.rating)}
                      </span>
                    </div>
                    <span className="text-xs !text-[var(--color-ink-faint)]">{timeAgo(it.created_at)}</span>
                  </div>
                  {it.comment && (
                    <p className="text-sm !text-[var(--color-ink-muted)] line-clamp-2 leading-relaxed">
                      {it.comment}
                    </p>
                  )}
                </Link>
              </li>
            );
          }
          return (
            <li key={`i-${it.id}`}>
              <Link
                href={href}
                className="block bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] rounded-lg p-4 transition-colors"
              >
                <div className="flex items-baseline justify-between flex-wrap gap-2">
                  <div className="flex items-baseline gap-2 flex-wrap text-sm">
                    <span className="text-[10px] uppercase tracking-wide chip-rank-3 px-1.5 py-0.5 rounded">
                      แจ้งแก้ไข
                    </span>
                    <span className="font-medium !text-[var(--color-ink)]">
                      {deptLabel(it.dept_slug, depts)}
                    </span>
                    <span className="text-xs !text-[var(--color-ink-faint)]">ปี {it.year_id}</span>
                    <span className="text-xs !text-[var(--color-ink-muted)]">{it.issue_type}</span>
                    <StatusChip status={it.status} />
                  </div>
                  <span className="text-xs !text-[var(--color-ink-faint)]">{timeAgo(it.created_at)}</span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function StatusChip({ status }: { status: string }) {
  const cls =
    status === "fixed"
      ? "chip-rank-1"
      : status === "rejected" || status === "duplicate"
        ? "chip-rank-fill"
        : "chip-rank-2";
  return <span className={`text-[10px] px-1.5 py-0.5 rounded ${cls}`}>{status}</span>;
}
