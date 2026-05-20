import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getYear, getYears, getDepartments, getAssignmentsByYear } from "@/lib/data/source";
import { getYearCredit } from "@/lib/data/credits";
import { TeamCredits } from "@/components/TeamCredits";

export async function generateStaticParams() {
  const years = await getYears();
  return years.map((y) => ({ year: String(y.id) }));
}

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string }>;
}): Promise<Metadata> {
  const { year } = await params;
  const y = await getYear(Number(year));
  if (!y) return { title: "ไม่พบปี" };
  return {
    title: `Vet to be ${y.id} — ภาพรวม`,
    description: `ภาพรวมโครงการ Vet to be ปี ${y.id} — ${y.total_slots} slots, ${y.unique_students} นิสิต`,
  };
}

export default async function YearPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year } = await params;
  const yearId = Number(year);
  const [y, departments, assignments] = await Promise.all([
    getYear(yearId),
    getDepartments(),
    getAssignmentsByYear(yearId),
  ]);
  if (!y) notFound();
  const credit = getYearCredit(yearId);

  // count per dept
  const countByDept = new Map<string, number>();
  for (const a of assignments) {
    countByDept.set(a.dept_slug, (countByDept.get(a.dept_slug) ?? 0) + 1);
  }
  const hasData = assignments.length > 0;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <Link href="/years" className="text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] inline-flex items-center gap-1">
            ← ทุกปี
          </Link>
          <Link
            href={`/years/${yearId}/print`}
            className="text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] rounded px-2 py-1"
          >
            🖨️ Archive print view
          </Link>
        </div>
        <div className="flex items-baseline gap-3 flex-wrap mb-2">
          <h1 className="text-4xl font-serif font-semibold">{y.id}</h1>
          <span className="text-lg text-[var(--color-ink-muted)]">{y.name.split("(")[1]?.replace(")", "")}</span>
        </div>
        <p className="text-[var(--color-ink-muted)] max-w-2xl">{y.notes}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <Stat label="Slots" value={y.total_slots.toString()} />
        <Stat label="นิสิต" value={y.unique_students.toString()} />
        <Stat label="แผนกเปิด" value={String(departments.length)} sub={yearId === 2569 ? "ศัลย์ปิด" : undefined} />
        <Stat label="ระยะ" value="14 wk" sub="14 พ.ค.–30 ธ.ค." />
      </div>

      {credit && <TeamCredits credit={credit} />}

      {hasData && (
        <>
          <div className="grid gap-4 md:grid-cols-2 mb-8">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
              <h2 className="text-lg font-serif font-semibold mb-3">การกระจาย slot ต่อสัปดาห์</h2>
              <WeekHistogram assignments={assignments} />
            </div>
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
              <h2 className="text-lg font-serif font-semibold mb-3">คุณภาพการจัด</h2>
              <RankBreakdown assignments={assignments} />
            </div>
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 mb-8">
            <h2 className="text-lg font-serif font-semibold mb-3">เกียรติบัตร</h2>
            <CertStats assignments={assignments} />
          </div>
        </>
      )}

      <h2 className="text-2xl font-serif font-semibold mb-4">แผนกทั้งหมด</h2>

      {!hasData && (
        <div className="bg-[var(--color-accent-soft)]/40 border border-[var(--color-border)] rounded-xl p-6 text-center">
          <div className="text-4xl mb-2">📦</div>
          <p className="font-medium mb-1">ยังไม่มีข้อมูลปี {yearId}</p>
          <p className="text-sm text-[var(--color-ink-muted)]">ปีนี้รอ crowdsource จากรุ่นพี่ — เปิดในเฟสถัดไป</p>
        </div>
      )}

      {hasData && (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {departments.map((d) => {
            const count = countByDept.get(d.slug) ?? 0;
            const isSurgeryClosed = d.slug === "surgery" && yearId === 2569;
            return (
              <Link
                key={d.slug}
                href={`/years/${yearId}/depts/${d.slug}`}
                className="block bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] rounded-xl p-4 transition-all hover:shadow-[var(--shadow-card)]"
              >
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="font-serif font-semibold !text-[var(--color-ink)]">{d.short_th ?? d.name_th}</span>
                  <span className="text-xs !text-[var(--color-ink-faint)]">
                    {isSurgeryClosed ? "ปิดรับ" : count > 0 ? `${count} นิสิต` : "ยังไม่มีข้อมูล"}
                  </span>
                </div>
                <div className="text-xs !text-[var(--color-ink-muted)]">{d.name_en}</div>
                {d.notes && <div className="text-xs !text-[var(--color-ink-faint)] mt-1.5 italic">{d.notes}</div>}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-wide text-[var(--color-ink-faint)] mb-0.5">{label}</div>
      <div className="font-serif text-xl font-semibold text-[var(--color-ink)]">{value}</div>
      {sub && <div className="text-[10px] text-[var(--color-ink-muted)] mt-0.5">{sub}</div>}
    </div>
  );
}

function RankBreakdown({ assignments }: { assignments: { rank: string }[] }) {
  const labels: Record<string, { label: string; cls: string }> = {
    "rank-1": { label: "อันดับ 1", cls: "chip-rank-1" },
    "rank-2": { label: "อันดับ 2", cls: "chip-rank-2" },
    "rank-3": { label: "อันดับ 3", cls: "chip-rank-3" },
    fill: { label: "เติม", cls: "chip-rank-fill" },
    random: { label: "สุ่ม", cls: "chip-rank-random" },
    manual: { label: "Manual", cls: "chip-rank-1" },
  };
  const counts = new Map<string, number>();
  for (const a of assignments) counts.set(a.rank, (counts.get(a.rank) ?? 0) + 1);
  const total = assignments.length || 1;
  const order = ["rank-1", "rank-2", "rank-3", "fill", "random", "manual"];
  return (
    <ul className="space-y-1.5 text-sm">
      {order.map((k) => {
        const n = counts.get(k) ?? 0;
        if (n === 0) return null;
        const pct = (n / total) * 100;
        const meta = labels[k] ?? { label: k, cls: "chip-rank-random" };
        return (
          <li key={k}>
            <div className="flex items-baseline justify-between mb-0.5">
              <span className={`text-xs px-1.5 py-0.5 rounded ${meta.cls}`}>{meta.label}</span>
              <span className="text-xs text-[var(--color-ink-muted)]">
                {n} <span className="text-[var(--color-ink-faint)]">({pct.toFixed(1)}%)</span>
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-[var(--color-surface-lift)] overflow-hidden">
              <div
                className="h-full bg-[var(--color-accent)]/60"
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function CertStats({
  assignments,
}: {
  assignments: { short_id: string; student_year: number; days_practiced: number }[];
}) {
  // Group by student (short_id + student_year) → sum days
  const byStudent = new Map<string, { year: number; days: number }>();
  for (const a of assignments) {
    const key = `${a.student_year}-${a.short_id}`;
    const cur = byStudent.get(key);
    if (cur) cur.days += a.days_practiced;
    else byStudent.set(key, { year: a.student_year, days: a.days_practiced });
  }
  const total = byStudent.size;
  const certOk = Array.from(byStudent.values()).filter((s) => s.days >= 7).length;
  const noCert = total - certOk;
  const avgDays = Array.from(byStudent.values()).reduce((s, x) => s + x.days, 0) / Math.max(total, 1);
  const certPct = (certOk / Math.max(total, 1)) * 100;

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div>
        <div className="text-xs uppercase tracking-wide text-[var(--color-ink-faint)] mb-0.5">
          ได้เกียรติบัตร
        </div>
        <div className="font-serif text-2xl font-semibold text-[var(--color-success)]">
          {certOk} <span className="text-base text-[var(--color-ink-muted)] font-normal">/ {total}</span>
        </div>
        <div className="text-xs text-[var(--color-ink-muted)] mt-0.5">{certPct.toFixed(1)}%</div>
      </div>
      <div>
        <div className="text-xs uppercase tracking-wide text-[var(--color-ink-faint)] mb-0.5">
          ไม่ครบ 7 วัน
        </div>
        <div className={`font-serif text-2xl font-semibold ${noCert > 0 ? "text-[var(--color-warning)]" : "text-[var(--color-ink-muted)]"}`}>
          {noCert}
        </div>
        <div className="text-xs text-[var(--color-ink-muted)] mt-0.5">
          {noCert > 0 ? "ต้องตามวันเพิ่ม" : "ครบทุกคน"}
        </div>
      </div>
      <div>
        <div className="text-xs uppercase tracking-wide text-[var(--color-ink-faint)] mb-0.5">
          วันฝึกเฉลี่ย
        </div>
        <div className="font-serif text-2xl font-semibold text-[var(--color-ink)]">
          {avgDays.toFixed(1)}
        </div>
        <div className="text-xs text-[var(--color-ink-muted)] mt-0.5">วัน/คน</div>
      </div>
    </div>
  );
}

function WeekHistogram({ assignments }: { assignments: { week: number }[] }) {
  const counts = new Array(15).fill(0);
  for (const a of assignments) counts[a.week] = (counts[a.week] ?? 0) + 1;
  const max = Math.max(...counts.slice(1), 1);
  return (
    <div className="grid grid-cols-14 gap-1.5 items-end" style={{ gridTemplateColumns: "repeat(14, 1fr)" }}>
      {Array.from({ length: 14 }, (_, i) => i + 1).map((w) => {
        const c = counts[w];
        const height = (c / max) * 100;
        return (
          <div key={w} className="flex flex-col items-center gap-1 min-w-0">
            <span className="text-[10px] text-[var(--color-ink-muted)]">{c}</span>
            <div
              className="w-full bg-[var(--color-accent)] rounded-t transition-all"
              style={{ height: `${Math.max(height, 4)}px`, minHeight: c > 0 ? 4 : 0 }}
              title={`W${w}: ${c} slots`}
            />
            <span className="text-[10px] font-mono text-[var(--color-ink-faint)]">W{w}</span>
          </div>
        );
      })}
    </div>
  );
}
