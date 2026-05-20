import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getYear,
  getYears,
  getDepartment,
  getDepartments,
  getAssignmentsByDept,
  getReviewsByDept,
} from "@/lib/data/source";
import { ReviewForm } from "@/components/ReviewForm";
import { ReportIssueButton } from "@/components/ReportIssueButton";

export async function generateStaticParams() {
  const [years, depts] = await Promise.all([getYears(), getDepartments()]);
  const params: Array<{ year: string; dept: string }> = [];
  for (const y of years) for (const d of depts) params.push({ year: String(y.id), dept: d.slug });
  return params;
}

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string; dept: string }>;
}): Promise<Metadata> {
  const { year, dept } = await params;
  const [y, d] = await Promise.all([getYear(Number(year)), getDepartment(dept)]);
  if (!y || !d) return { title: "ไม่พบ" };
  return {
    title: `${d.short_th ?? d.name_th} · ${y.id}`,
    description: `รายชื่อนิสิต Vet to be ${y.id} ที่ฝึก${d.name_th}`,
  };
}

const CATEGORY_LABEL: Record<string, string> = {
  "holiday-receiving": "รับวันหยุด (W1–W14)",
  "no-holiday": "ไม่รับวันหยุด (W1–W5)",
  special: "เงื่อนไขพิเศษ",
};

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

export default async function DeptYearPage({
  params,
}: {
  params: Promise<{ year: string; dept: string }>;
}) {
  const { year, dept } = await params;
  const yearId = Number(year);
  const [y, d, rows, reviews] = await Promise.all([
    getYear(yearId),
    getDepartment(dept),
    getAssignmentsByDept(yearId, dept),
    getReviewsByDept(yearId, dept),
  ]);
  if (!y || !d) notFound();

  // Group by week
  const byWeek = new Map<number, typeof rows>();
  for (const r of rows) {
    const arr = byWeek.get(r.week) ?? [];
    arr.push(r);
    byWeek.set(r.week, arr);
  }
  const weekNums = Array.from(byWeek.keys()).sort((a, b) => a - b);

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <nav className="text-sm text-[var(--color-ink-muted)] mb-4 flex items-center gap-1.5 flex-wrap">
        <Link href={`/years/${yearId}`}>{yearId}</Link>
        <span className="text-[var(--color-ink-faint)]">/</span>
        <span className="!text-[var(--color-ink)]">{d.short_th ?? d.name_th}</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-serif font-semibold mb-2">{d.name_th}</h1>
        <p className="text-[var(--color-ink-muted)] mb-3">{d.name_en}</p>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-2 py-1 rounded chip-rank-1">{CATEGORY_LABEL[d.category]}</span>
          <span className="px-2 py-1 rounded bg-[var(--color-surface-strong)] text-[var(--color-ink-muted)]">
            รับ {d.capacity_per_day} คน/วัน
          </span>
          {d.allowed_years && d.allowed_years.length > 0 && (
            <span className="px-2 py-1 rounded bg-[var(--color-accent-soft)] !text-[var(--color-accent-strong)]">
              เฉพาะปี {d.allowed_years.join(", ")}
            </span>
          )}
          {avgRating && (
            <span className="px-2 py-1 rounded bg-[var(--color-warning)]/15 text-[var(--color-warning)] font-medium">
              ⭐ {avgRating} · {reviews.length} รีวิว
            </span>
          )}
        </div>
        {d.notes && (
          <p className="mt-3 text-sm text-[var(--color-ink-muted)] italic bg-[var(--color-surface-lift)] rounded-lg px-3 py-2 border border-[var(--color-border)]">
            💡 {d.notes}
          </p>
        )}
      </div>

      {weekNums.length === 0 ? (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-8 text-center">
          <div className="text-4xl mb-2">📭</div>
          <p className="font-medium mb-1">ยังไม่มีข้อมูลในแผนกนี้ปี {yearId}</p>
          <p className="text-sm text-[var(--color-ink-muted)]">
            {d.slug === "surgery" && yearId === 2569
              ? "แผนกศัลยกรรมปิดรับในปี 2569 — เงื่อนไข 'เริ่ม 1 ก.ค. + ไม่รับวันหยุด' ขัดกับช่วงโครงการ"
              : "อาจอยู่นอกฐานข้อมูลตอนนี้ ลองดูปีถัดไปหรือแผนกอื่น"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {weekNums.map((w) => (
            <div key={w} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4">
              <h3 className="font-serif font-semibold text-[var(--color-ink)] mb-3 flex items-baseline gap-2">
                <span className="font-mono text-sm bg-[var(--color-surface-strong)] px-2 py-0.5 rounded">W{w}</span>
                <span className="text-sm text-[var(--color-ink-muted)]">{WEEK_RANGES[w] ?? ""}</span>
              </h3>
              <ul className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                {(byWeek.get(w) ?? []).map((r) => (
                  <li key={r.id} className="flex items-baseline justify-between gap-2 bg-[var(--color-surface-lift)] rounded px-3 py-1.5 text-sm">
                    <span>
                      <strong className="font-medium">{r.nickname}</strong>
                      <span className="text-[var(--color-ink-faint)] ml-1">#{r.short_id}</span>
                      <span className="text-[var(--color-ink-faint)] ml-1">ปี{r.student_year}</span>
                    </span>
                    <span className="text-xs text-[var(--color-ink-muted)] shrink-0">{r.days_practiced}ว</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Reviews */}
      <div className="mt-10 border-t border-[var(--color-border)] pt-8">
        <h2 className="text-xl font-serif font-semibold mb-2">
          รีวิวจากผู้เคยฝึก
          {reviews.length > 0 && (
            <span className="ml-2 text-base text-[var(--color-ink-muted)] font-normal">({reviews.length})</span>
          )}
        </h2>

        {reviews.length === 0 ? (
          <p className="text-sm text-[var(--color-ink-muted)] mb-6">
            ยังไม่มีรีวิว — ถ้าคุณเคยฝึกแผนกนี้ในปี {yearId} ช่วยเขียนรีวิวให้รุ่นน้องอ่านได้นะ
          </p>
        ) : (
          <ul className="space-y-3 mb-8">
            {reviews.map((r) => (
              <li key={r.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-4">
                <div className="flex items-baseline justify-between mb-1.5 flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Stars n={r.rating} />
                    <span className="text-[var(--color-ink-faint)]">#{r.reviewer_short_id}</span>
                    {r.verified && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded badge-cert">verified</span>
                    )}
                  </div>
                  <span className="text-xs text-[var(--color-ink-faint)]">
                    {new Date(r.created_at).toLocaleDateString("th-TH")}
                  </span>
                </div>
                {r.comment && (
                  <p className="text-sm text-[var(--color-ink-muted)] whitespace-pre-line">{r.comment}</p>
                )}
                {r.tags && r.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {r.tags.map((t) => (
                      <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-surface-strong)] text-[var(--color-ink-muted)]">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        <ReviewForm yearId={yearId} deptSlug={dept} />
      </div>

      <div className="mt-6">
        <ReportIssueButton yearId={yearId} deptSlug={dept} />
      </div>
    </div>
  );
}

function Stars({ n }: { n: number }) {
  return (
    <span className="text-[var(--color-warning)]">
      {"⭐".repeat(n)}
      <span className="text-[var(--color-ink-faint)]">{"☆".repeat(5 - n)}</span>
    </span>
  );
}
