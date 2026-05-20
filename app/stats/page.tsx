import Link from "next/link";
import type { Metadata } from "next";
import { getYears, getDepartments, getAssignmentsByYear } from "@/lib/data/source";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "สถิติ — แผนกไหนคนเลือกเยอะ?",
  description: "ดูภาพรวมข้ามปี — แผนกไหนนิยม / แผนกไหนเงียบ / cert rate ต่อแผนก",
};

export default async function StatsPage() {
  const [years, depts] = await Promise.all([getYears(), getDepartments()]);
  // Fetch assignments for all years in parallel
  const allByYear = await Promise.all(
    years.map((y) => getAssignmentsByYear(y.id).then((rows) => ({ year: y.id, rows })))
  );

  // Per-dept totals across all years
  type DeptStat = { slug: string; total: number; byYear: Record<number, number>; certOk: number; total_students: number };
  const stats = new Map<string, DeptStat>();
  for (const d of depts) {
    stats.set(d.slug, { slug: d.slug, total: 0, byYear: {}, certOk: 0, total_students: 0 });
  }

  // Student-level dedup per year to compute cert rate by dept
  for (const { year, rows } of allByYear) {
    // group by student in this year
    const byStudent = new Map<string, { days: number; depts: Set<string> }>();
    for (const a of rows) {
      const key = `${a.student_year}-${a.short_id}-${a.nickname}`;
      const cur = byStudent.get(key);
      if (cur) {
        cur.days += a.days_practiced;
        cur.depts.add(a.dept_slug);
      } else {
        byStudent.set(key, { days: a.days_practiced, depts: new Set([a.dept_slug]) });
      }
    }
    // accumulate
    for (const a of rows) {
      const s = stats.get(a.dept_slug);
      if (!s) continue;
      s.total += 1;
      s.byYear[year] = (s.byYear[year] ?? 0) + 1;
    }
    // cert rate: per dept, how many distinct students with >=7 total days went there
    for (const { days, depts: ds } of byStudent.values()) {
      const cert = days >= 7;
      for (const slug of ds) {
        const s = stats.get(slug);
        if (!s) continue;
        s.total_students += 1;
        if (cert) s.certOk += 1;
      }
    }
  }

  const sortedByPopularity = depts
    .map((d) => ({ dept: d, stat: stats.get(d.slug)! }))
    .sort((a, b) => b.stat.total - a.stat.total);

  const grandTotal = Array.from(stats.values()).reduce((s, x) => s + x.total, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-serif font-semibold mb-2">สถิติแผนก × ปี</h1>
      <p className="text-[var(--color-ink-muted)] mb-8 leading-relaxed max-w-2xl">
        แผนกไหนคนเลือกเยอะ? แผนกไหนเงียบ? ดูภาพรวมข้ามทุกปีในที่เดียว ·
        คลิกแผนกใดก็ตามเพื่อดูรายชื่อ + รีวิว
      </p>

      <div className="grid grid-cols-3 gap-3 mb-8">
        <Stat label="ปีในระบบ" value={String(years.length)} />
        <Stat label="แผนกที่เปิด" value={String(depts.length)} />
        <Stat label="Slot รวม" value={String(grandTotal)} />
      </div>

      <h2 className="text-xl font-serif font-semibold mb-4">เรียงจากนิยมสูงสุด</h2>
      <div className="space-y-2">
        {sortedByPopularity.map(({ dept, stat }, idx) => {
          const certPct = stat.total_students > 0 ? (stat.certOk / stat.total_students) * 100 : 0;
          const maxBar = sortedByPopularity[0].stat.total || 1;
          const widthPct = (stat.total / maxBar) * 100;
          return (
            <Link
              key={dept.slug}
              href={`/years/${years[0].id}/depts/${dept.slug}`}
              className="block bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] rounded-lg p-4 transition-colors"
            >
              <div className="flex items-baseline justify-between gap-3 mb-2 flex-wrap">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-xs text-[var(--color-ink-faint)]">#{idx + 1}</span>
                  <span className="font-serif font-semibold text-[var(--color-ink)]">
                    {dept.short_th ?? dept.name_th}
                  </span>
                  <span className="text-xs text-[var(--color-ink-faint)]">{dept.name_en}</span>
                </div>
                <div className="flex items-baseline gap-3 text-sm text-[var(--color-ink-muted)]">
                  <span>
                    <strong className="text-[var(--color-ink)]">{stat.total}</strong> slots
                  </span>
                  {stat.total_students > 0 && (
                    <span className="text-xs">
                      {stat.certOk}/{stat.total_students} cert ({certPct.toFixed(0)}%)
                    </span>
                  )}
                </div>
              </div>
              <div className="h-2 bg-[var(--color-surface-lift)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--color-accent)] transition-all"
                  style={{ width: `${Math.max(widthPct, 2)}%` }}
                />
              </div>
              <div className="flex gap-2 mt-2 text-[10px] text-[var(--color-ink-faint)]">
                {years.map((y) => (
                  <span key={y.id} className="font-mono">
                    {y.id}:{" "}
                    <strong className="text-[var(--color-ink-muted)]">{stat.byYear[y.id] ?? 0}</strong>
                  </span>
                ))}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-10 bg-[var(--color-accent-soft)]/30 border border-[var(--color-border)] rounded-xl p-5">
        <h3 className="font-serif text-lg font-semibold mb-2">วิธีอ่าน</h3>
        <ul className="text-sm text-[var(--color-ink-muted)] space-y-1 list-disc list-inside">
          <li>
            <strong className="text-[var(--color-ink)]">slots</strong> = จำนวน assignment record รวมข้ามทุกปี (1 คนอาจมีหลาย slot)
          </li>
          <li>
            <strong className="text-[var(--color-ink)]">cert %</strong> = จำนวนนิสิตที่ผ่านแผนกนี้ + ได้วันรวม ≥ 7 / นิสิตทั้งหมดที่ผ่านแผนก
          </li>
          <li>
            ปีแสดงเฉพาะที่มีข้อมูลใน <code>vettobe_assignments</code> (ปี crowdsource ยังไม่ได้เริ่ม)
          </li>
        </ul>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-4 py-3">
      <div className="text-xs uppercase tracking-wide text-[var(--color-ink-faint)] mb-0.5">{label}</div>
      <div className="font-serif text-2xl font-semibold text-[var(--color-ink)]">{value}</div>
    </div>
  );
}
