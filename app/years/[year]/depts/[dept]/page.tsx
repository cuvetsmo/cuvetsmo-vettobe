import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { YEAR_BY_ID, YEARS } from "@/lib/data/years";
import { DEPARTMENTS, DEPT_BY_SLUG, CATEGORY_LABEL } from "@/lib/data/departments";
import { ASSIGNMENTS_BY_DEPT } from "@/lib/data/seed-2569";

export async function generateStaticParams() {
  const params: Array<{ year: string; dept: string }> = [];
  for (const y of YEARS) {
    for (const d of DEPARTMENTS) {
      params.push({ year: String(y.id), dept: d.slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string; dept: string }>;
}): Promise<Metadata> {
  const { year, dept } = await params;
  const y = YEAR_BY_ID.get(Number(year));
  const d = DEPT_BY_SLUG.get(dept);
  if (!y || !d) return { title: "ไม่พบ" };
  return {
    title: `${d.short_th ?? d.name_th} · ${y.id}`,
    description: `รายชื่อนิสิต Vet to be ${y.id} ที่ฝึก${d.name_th}`,
  };
}

export default async function DeptYearPage({
  params,
}: {
  params: Promise<{ year: string; dept: string }>;
}) {
  const { year, dept } = await params;
  const yearId = Number(year);
  const y = YEAR_BY_ID.get(yearId);
  const d = DEPT_BY_SLUG.get(dept);
  if (!y || !d) notFound();

  const rows = yearId === 2569 ? ASSIGNMENTS_BY_DEPT.get(d.slug) ?? [] : [];

  // Group by week
  const byWeek = new Map<number, typeof rows>();
  for (const r of rows) {
    const arr = byWeek.get(r.week) ?? [];
    arr.push(r);
    byWeek.set(r.week, arr);
  }
  const weekNums = Array.from(byWeek.keys()).sort((a, b) => a - b);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      {/* Breadcrumb */}
      <nav className="text-sm text-[var(--color-ink-muted)] mb-4 flex items-center gap-1.5 flex-wrap">
        <Link href={`/years/${yearId}`}>{yearId}</Link>
        <span className="text-[var(--color-ink-faint)]">/</span>
        <span className="!text-[var(--color-ink)]">{d.short_th ?? d.name_th}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-semibold mb-2">{d.name_th}</h1>
        <p className="text-[var(--color-ink-muted)] mb-3">{d.name_en}</p>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2 py-1 rounded chip-rank-1">
            {CATEGORY_LABEL[d.category]}
          </span>
          <span className="px-2 py-1 rounded bg-[var(--color-surface-strong)] text-[var(--color-ink-muted)]">
            รับ {d.capacity_per_day} คน/วัน
          </span>
          {d.allowed_years && (
            <span className="px-2 py-1 rounded bg-[var(--color-accent-soft)] !text-[var(--color-accent-strong)]">
              เฉพาะปี {d.allowed_years.join(", ")}
            </span>
          )}
        </div>
        {d.notes && (
          <p className="mt-3 text-sm text-[var(--color-ink-muted)] italic bg-[var(--color-surface-lift)] rounded-lg px-3 py-2 border border-[var(--color-border)]">
            💡 {d.notes}
          </p>
        )}
      </div>

      {/* Assignments by week */}
      {weekNums.length === 0 ? (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-8 text-center">
          <div className="text-4xl mb-2">📭</div>
          <p className="font-medium mb-1">ยังไม่มีข้อมูลในแผนกนี้ปี {yearId}</p>
          <p className="text-sm text-[var(--color-ink-muted)]">
            {d.slug === "surgery" && yearId === 2569
              ? "แผนกศัลยกรรมปิดรับในปี 2569 — เงื่อนไข 'เริ่ม 1 ก.ค. + ไม่รับวันหยุด' ขัดกับช่วงโครงการ"
              : yearId === 2569
                ? "อาจอยู่นอก partial seed ตอนนี้ ลองดู FINAL PDF เต็มได้ที่ทีมหัวปี"
                : "ปีนี้รอ crowdsource"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {weekNums.map((w) => (
            <div
              key={w}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4"
            >
              <h3 className="font-serif font-semibold text-[var(--color-ink)] mb-3 flex items-baseline gap-2">
                <span className="font-mono text-sm bg-[var(--color-surface-strong)] px-2 py-0.5 rounded">
                  W{w}
                </span>
                <span className="text-sm text-[var(--color-ink-muted)]">
                  {WEEK_RANGES[w] ?? ""}
                </span>
              </h3>
              <ul className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                {(byWeek.get(w) ?? []).map((r) => (
                  <li
                    key={r.id}
                    className="flex items-baseline justify-between gap-2 bg-[var(--color-surface-lift)] rounded px-3 py-1.5 text-sm"
                  >
                    <span>
                      <strong className="font-medium">{r.nickname}</strong>
                      <span className="text-[var(--color-ink-faint)] ml-1">
                        #{r.short_id}
                      </span>
                      <span className="text-[var(--color-ink-faint)] ml-1">
                        ปี{r.student_year}
                      </span>
                    </span>
                    <span className="text-xs text-[var(--color-ink-muted)] shrink-0">
                      {r.days_practiced}ว
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Reviews placeholder */}
      <div className="mt-10 border-t border-[var(--color-border)] pt-8">
        <h2 className="text-xl font-serif font-semibold mb-2">รีวิวจากผู้เคยฝึก</h2>
        <p className="text-sm text-[var(--color-ink-muted)] mb-4">
          ฟีเจอร์รีวิวเปิดเร็วๆ นี้ — ผู้ที่เคยฝึกแผนกนี้ในปี {yearId} จะมายืนยันตัวตน
          แล้วให้คะแนน + แชร์ประสบการณ์ได้
        </p>
        <div className="bg-[var(--color-accent-soft)]/30 rounded-lg px-4 py-3 text-sm text-[var(--color-ink-muted)]">
          🚧 Phase 1d coming — เปิดเขียนรีวิวได้เมื่อมีระบบ auth + verify trainee
        </div>
      </div>
    </div>
  );
}

const WEEK_RANGES: Record<number, string> = {
  1: "14–20 พ.ค.",
  2: "21–27 พ.ค.",
  3: "28 พ.ค. – 3 มิ.ย. (มีวันหยุด · 4 วัน)",
  4: "4–10 มิ.ย.",
  5: "11–17 มิ.ย.",
  6: "18–21, 27–28 มิ.ย., 4 ก.ค.",
  7: "5, 11–12, 18–19, 25–26 ก.ค.",
  8: "1–2, 8–9, 15–16, 22 ส.ค.",
  9: "23, 29–30 ส.ค., 5–6, 12 ก.ย. (6 วัน)",
  10: "13, 19–20, 26–27 ก.ย., 3–4 ต.ค.",
  11: "10–11, 17–18, 24–25, 31 ต.ค.",
  12: "1, 7–8, 14–15, 21–22 พ.ย.",
  13: "28–29 พ.ย., 5–6, 12–13, 19 ธ.ค. (มีสอบ · 5 วัน)",
  14: "20, 26–27 ธ.ค. (3 วัน)",
};
