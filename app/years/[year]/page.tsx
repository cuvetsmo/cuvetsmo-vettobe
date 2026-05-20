import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { YEAR_BY_ID, YEARS } from "@/lib/data/years";
import { DEPARTMENTS } from "@/lib/data/departments";
import { SEED_2569, ASSIGNMENTS_BY_DEPT } from "@/lib/data/seed-2569";

export async function generateStaticParams() {
  return YEARS.map((y) => ({ year: String(y.id) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string }>;
}): Promise<Metadata> {
  const { year } = await params;
  const y = YEAR_BY_ID.get(Number(year));
  if (!y) return { title: "ไม่พบปี" };
  return {
    title: `Vet to be ${y.id} — ภาพรวม`,
    description: `ภาพรวมโครงการ Vet to be ปี ${y.id} — แผนก ${DEPARTMENTS.length} แผนก, ${y.total_slots} slots, ${y.unique_students} นิสิต`,
  };
}

export default async function YearPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year } = await params;
  const yearId = Number(year);
  const y = YEAR_BY_ID.get(yearId);
  if (!y) notFound();

  // Only 2569 has actual seed; future years will fetch from Supabase
  const hasData = yearId === 2569 && SEED_2569.length > 0;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/years"
          className="text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] inline-flex items-center gap-1 mb-3"
        >
          ← ทุกปี
        </Link>
        <div className="flex items-baseline gap-3 flex-wrap mb-2">
          <h1 className="text-4xl font-serif font-semibold">{y.id}</h1>
          <span className="text-lg text-[var(--color-ink-muted)]">{y.name.split("(")[1]?.replace(")", "")}</span>
        </div>
        <p className="text-[var(--color-ink-muted)] max-w-2xl">{y.notes}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        <Stat label="Slots" value={y.total_slots.toString()} />
        <Stat label="นิสิต" value={y.unique_students.toString()} />
        <Stat label="แผนกเปิด" value={String(DEPARTMENTS.filter((d) => d.slug !== "surgery" || yearId !== 2569).length)} sub={yearId === 2569 ? "ศัลย์ปิด" : ""} />
        <Stat label="ระยะ" value="14 wk" sub="14 พ.ค.–30 ธ.ค." />
      </div>

      {/* Departments grid for this year */}
      <h2 className="text-2xl font-serif font-semibold mb-4">แผนกทั้งหมด</h2>

      {!hasData && (
        <div className="bg-[var(--color-accent-soft)]/40 border border-[var(--color-border)] rounded-xl p-6 text-center">
          <div className="text-4xl mb-2">📦</div>
          <p className="font-medium mb-1">ยังไม่มีข้อมูลปี {yearId}</p>
          <p className="text-sm text-[var(--color-ink-muted)]">
            ปีนี้รอ crowdsource จากรุ่นพี่ — เปิดในเฟสถัดไป
          </p>
        </div>
      )}

      {hasData && (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {DEPARTMENTS.map((d) => {
            const rows = ASSIGNMENTS_BY_DEPT.get(d.slug) ?? [];
            const isSurgeryClosed = d.slug === "surgery" && yearId === 2569;
            return (
              <Link
                key={d.slug}
                href={`/years/${yearId}/depts/${d.slug}`}
                className="block bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] rounded-xl p-4 transition-all hover:shadow-[var(--shadow-card)]"
              >
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="font-serif font-semibold !text-[var(--color-ink)]">
                    {d.short_th ?? d.name_th}
                  </span>
                  <span className="text-xs !text-[var(--color-ink-faint)]">
                    {isSurgeryClosed ? "ปิดรับ" : `${rows.length} ใน seed`}
                  </span>
                </div>
                <div className="text-xs !text-[var(--color-ink-muted)]">{d.name_en}</div>
                {d.notes && (
                  <div className="text-xs !text-[var(--color-ink-faint)] mt-1.5 italic">{d.notes}</div>
                )}
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
