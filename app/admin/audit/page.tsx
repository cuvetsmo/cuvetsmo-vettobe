import Link from "next/link";
import type { Metadata } from "next";
import { getYears, getCapacityWarnings } from "@/lib/data/source";
import { CapacityWarnings } from "@/components/CapacityWarnings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Data audit",
  description: "ตรวจ over-capacity weeks ในแต่ละปี",
  robots: { index: false, follow: false },
};

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const sp = await searchParams;
  const years = await getYears();
  const requestedYear = Number(sp.year || years[0]?.id || 2569);
  const activeYear = years.find((y) => y.id === requestedYear) ?? years[0];
  const warnings = activeYear ? await getCapacityWarnings(activeYear.id) : [];

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <nav className="text-sm text-[var(--color-ink-muted)] mb-3 flex items-center gap-1.5 flex-wrap">
        <Link href="/admin">Admin</Link>
        <span className="text-[var(--color-ink-faint)]">/</span>
        <span className="!text-[var(--color-ink)]">Audit</span>
      </nav>

      <h1 className="text-3xl font-serif font-semibold mb-2">🔍 Data Audit</h1>
      <p className="text-[var(--color-ink-muted)] mb-6 leading-relaxed max-w-2xl">
        ตรวจสอบ data quality issues ที่อาจต้องการ admin review · ปัจจุบันแสดง
        <strong className="text-[var(--color-ink)]"> over-capacity weeks </strong>
        (สัปดาห์ที่นิสิตเกิน capacity ของแผนก)
      </p>

      <div className="flex gap-2 mb-6 flex-wrap">
        {years.map((y) => {
          const isActive = y.id === activeYear?.id;
          return (
            <Link
              key={y.id}
              href={`/admin/audit?year=${y.id}`}
              prefetch={false}
              className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                isActive
                  ? "bg-[var(--color-accent)] !text-white border-[var(--color-accent)]"
                  : "bg-[var(--color-surface)] !text-[var(--color-ink-muted)] hover:!text-[var(--color-ink)] border-[var(--color-border)]"
              }`}
            >
              {y.id}
            </Link>
          );
        })}
      </div>

      <h2 className="text-xl font-serif font-semibold mb-3">
        Capacity overflow{" "}
        {warnings.length > 0 && (
          <span className="text-base text-[var(--color-ink-muted)] font-normal">({warnings.length})</span>
        )}
      </h2>
      <CapacityWarnings warnings={warnings} yearId={activeYear?.id ?? requestedYear} />

      <div className="mt-10 bg-[var(--color-accent-soft)]/30 border border-[var(--color-border)] rounded-xl p-5 text-sm text-[var(--color-ink-muted)]">
        <h3 className="font-serif text-lg font-semibold text-[var(--color-ink)] mb-2">วิธีอ่าน</h3>
        <ul className="space-y-1 list-disc list-inside">
          <li>
            <strong className="text-[var(--color-ink)]">HARD</strong> — student-days รวม &gt; capacity × 7 วัน
            (เกินแน่นอน ไม่ว่าจะแบ่งวันกันยังไง)
          </li>
          <li>
            <strong className="text-[var(--color-ink)]">COUNT</strong> — จำนวนนิสิต &gt; capacity_per_day
            แต่ student-days ยังไม่ทะลุ — อาจเป็นการแบ่งวันกันโดยตั้งใจ (per FINAL)
          </li>
          <li>
            เคสที่เกิดจากการ split-week จงใจ (เช่น ไพรซ์ 4 วัน internal-med + 3 วัน pharmacy ใน W1)
            จะปรากฏที่นี่ — admin ดูเพื่อยืนยันว่าทุก slot ถูกต้อง
          </li>
        </ul>
      </div>
    </div>
  );
}
