import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getYear, getDepartments, getStudentAssignments } from "@/lib/data/source";
import { ShareIntents } from "@/components/ShareIntents";

export const revalidate = 60;

const WEEK_RANGES: Record<number, string> = {
  1: "14–20 พ.ค.",
  2: "21–27 พ.ค.",
  3: "28 พ.ค.–3 มิ.ย.",
  4: "4–10 มิ.ย.",
  5: "11–17 มิ.ย.",
  6: "18–21, 27–28 มิ.ย., 4 ก.ค.",
  7: "5, 11–12, 18–19, 25–26 ก.ค.",
  8: "1–2, 8–9, 15–16, 22 ส.ค.",
  9: "23, 29–30 ส.ค., 5–6, 12 ก.ย.",
  10: "13, 19–20, 26–27 ก.ย., 3–4 ต.ค.",
  11: "10–11, 17–18, 24–25, 31 ต.ค.",
  12: "1, 7–8, 14–15, 21–22 พ.ย.",
  13: "28–29 พ.ย., 5–6, 12–13, 19 ธ.ค.",
  14: "20, 26–27 ธ.ค.",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string; shortId: string }>;
}): Promise<Metadata> {
  const { year, shortId } = await params;
  return {
    title: `#${shortId} · ${year}`,
    description: `รายละเอียดการฝึก Vet to be ${year} ของนิสิต #${shortId}`,
  };
}

export default async function StudentPage({
  params,
}: {
  params: Promise<{ year: string; shortId: string }>;
}) {
  const { year, shortId } = await params;
  const yearId = Number(year);
  const padded = shortId.padStart(3, "0");

  const [y, depts, rows] = await Promise.all([
    getYear(yearId),
    getDepartments(),
    getStudentAssignments(yearId, padded),
  ]);
  if (!y) notFound();
  if (rows.length === 0) notFound();

  const first = rows[0];
  const totalDays = rows.reduce((s, r) => s + r.days_practiced, 0);
  const certOk = totalDays >= 7;
  const deptByName = new Map(depts.map((d) => [d.slug, d]));

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
      <nav className="text-sm text-[var(--color-ink-muted)] mb-4 flex items-center gap-1.5 flex-wrap">
        <Link href="/lookup">ค้นรายชื่อ</Link>
        <span className="text-[var(--color-ink-faint)]">/</span>
        <Link href={`/years/${yearId}`}>{yearId}</Link>
        <span className="text-[var(--color-ink-faint)]">/</span>
        <span className="!text-[var(--color-ink)]">#{padded}</span>
      </nav>

      <div className="mb-8">
        <div className="flex items-baseline gap-3 flex-wrap mb-1">
          <h1 className="text-4xl font-serif font-semibold text-[var(--color-ink)]">{first.nickname}</h1>
          <span className="text-2xl text-[var(--color-ink-faint)] font-mono">#{padded}</span>
        </div>
        {first.full_name && (
          <p className="text-lg text-[var(--color-ink-muted)] mb-2">{first.full_name}</p>
        )}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm text-[var(--color-ink-muted)]">
            ปี {first.student_year} (cuvet{first.student_year === 5 ? "86" : "87"}) · Vet to be {yearId}
          </p>
          <ShareIntents
            url={`/students/${yearId}/${padded}`}
            title={`${first.nickname} #${padded} — ฝึก Vet to be ${yearId} ที่ CUVETSMO`}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        <Stat label="วันรวม" value={`${totalDays} วัน`} />
        <Stat label="แผนกที่ฝึก" value={String(new Set(rows.map((r) => r.dept_slug)).size)} />
        <Stat
          label="เกียรติบัตร"
          value={certOk ? "✓ ได้" : "⚠ ไม่ครบ"}
          valueColor={certOk ? "var(--color-success)" : "var(--color-warning)"}
        />
      </div>

      <h2 className="text-xl font-serif font-semibold mb-3">ตารางฝึก</h2>
      <div className="space-y-2 mb-8">
        {rows.map((r) => {
          const dept = deptByName.get(r.dept_slug);
          return (
            <Link
              key={r.id}
              href={`/years/${yearId}/depts/${r.dept_slug}`}
              className="flex items-center justify-between gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] rounded-lg px-4 py-3 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0 flex-wrap">
                <span className="font-mono text-xs bg-[var(--color-surface-strong)] px-2 py-0.5 rounded">
                  W{r.week}
                </span>
                <span className="font-medium !text-[var(--color-ink)]">
                  {dept?.short_th ?? dept?.name_th ?? r.dept_slug}
                </span>
                <span className="text-xs !text-[var(--color-ink-faint)]">{WEEK_RANGES[r.week]}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs !text-[var(--color-ink-muted)]">{r.days_practiced} วัน</span>
                <RankChip rank={r.rank} />
              </div>
            </Link>
          );
        })}
      </div>

      {rows.some((r) => r.notes) && (
        <div className="bg-[var(--color-surface-lift)] border border-[var(--color-border)] rounded-lg p-4 mb-6">
          <h3 className="font-medium text-[var(--color-ink)] mb-2 text-sm">หมายเหตุ</h3>
          <ul className="space-y-1 text-sm text-[var(--color-ink-muted)]">
            {rows
              .filter((r) => r.notes)
              .map((r) => (
                <li key={r.id}>
                  <strong className="text-[var(--color-ink)]">W{r.week}:</strong> {r.notes}
                </li>
              ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-[var(--color-ink-faint)]">
        ข้อมูลนี้คลาดเคลื่อน? <Link href={`/years/${yearId}/depts/${first.dept_slug}`}>กลับไปที่หน้าแผนกเพื่อรายงาน</Link>
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-wide text-[var(--color-ink-faint)] mb-0.5">{label}</div>
      <div
        className="font-serif text-xl font-semibold"
        style={{ color: valueColor ?? "var(--color-ink)" }}
      >
        {value}
      </div>
    </div>
  );
}

function RankChip({ rank }: { rank: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    "rank-1": { label: "อันดับ 1", cls: "chip-rank-1" },
    "rank-2": { label: "อันดับ 2", cls: "chip-rank-2" },
    "rank-3": { label: "อันดับ 3", cls: "chip-rank-3" },
    fill: { label: "เติม", cls: "chip-rank-fill" },
    random: { label: "สุ่ม", cls: "chip-rank-random" },
    manual: { label: "manual", cls: "chip-rank-1" },
  };
  const m = map[rank] ?? { label: rank, cls: "chip-rank-random" };
  return <span className={`text-[10px] px-1.5 py-0.5 rounded ${m.cls}`}>{m.label}</span>;
}
