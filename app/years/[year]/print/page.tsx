import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getYear, getDepartments, getAssignmentsByYear } from "@/lib/data/source";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string }>;
}): Promise<Metadata> {
  const { year } = await params;
  return {
    title: `Vet to be ${year} — Print archive`,
    description: `1-page archive of Vet to be ${year} for handoff`,
    robots: { index: false }, // hide from search — internal handoff use
  };
}

export default async function YearPrintPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year } = await params;
  const yearId = Number(year);
  const [y, depts, assignments] = await Promise.all([
    getYear(yearId),
    getDepartments(),
    getAssignmentsByYear(yearId),
  ]);
  if (!y) notFound();

  // Group by student then by dept
  const studentMap = new Map<
    string,
    { nickname: string; short_id: string; full_name?: string; year: number; rows: typeof assignments }
  >();
  for (const a of assignments) {
    const key = `${a.student_year}-${a.short_id}-${a.nickname}`;
    if (!studentMap.has(key))
      studentMap.set(key, {
        nickname: a.nickname,
        short_id: a.short_id,
        full_name: a.full_name,
        year: a.student_year,
        rows: [],
      });
    studentMap.get(key)!.rows.push(a);
  }
  const students = Array.from(studentMap.values()).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year; // ปี 5 first
    return a.short_id.localeCompare(b.short_id, "th");
  });

  // Dept totals
  const deptTotals = new Map<string, number>();
  for (const a of assignments) deptTotals.set(a.dept_slug, (deptTotals.get(a.dept_slug) ?? 0) + 1);

  // Cert stats
  const certOk = students.filter((s) => s.rows.reduce((sum, r) => sum + r.days_practiced, 0) >= 7).length;

  const deptByName = new Map(depts.map((d) => [d.slug, d]));

  return (
    <div className="print-root mx-auto max-w-5xl px-6 py-8 print:p-4 print:max-w-none">
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 10mm; }
          .print-hide { display: none !important; }
          body { background: white; }
          .print-root { background: white; color: black; }
          a { color: inherit; text-decoration: none; }
        }
      `}</style>

      <div className="print-hide flex items-baseline justify-between mb-6 flex-wrap gap-3">
        <Link href={`/years/${yearId}`} className="text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]">
          ← กลับไปหน้า {yearId}
        </Link>
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (typeof window !== "undefined") window.print();
            }}
            className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-strong)] !text-white px-4 py-2 rounded-lg text-sm font-medium"
            type="button"
          >
            🖨️ พิมพ์ / Save as PDF
          </button>
        </div>
      </div>

      <header className="border-b-2 border-[var(--color-ink)] pb-4 mb-6 print:border-black">
        <h1 className="text-3xl font-serif font-semibold">Vet to be {y.id} — Archive</h1>
        <p className="text-sm mt-1 text-[var(--color-ink-muted)]">
          {y.name} · {y.start_date} → {y.end_date} · status: {y.status} · data: {y.data_confidence}
        </p>
      </header>

      <section className="mb-6 grid grid-cols-4 gap-4 text-sm">
        <Box label="ผู้สมัคร" value={String(students.length)} />
        <Box label="Slots" value={String(assignments.length)} />
        <Box label="ได้เกียรติบัตร" value={`${certOk}/${students.length}`} />
        <Box label="แผนกที่เปิด" value={String(deptTotals.size)} />
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-serif font-semibold mb-2 border-b border-[var(--color-border)] pb-1 print:border-black">
          จำนวนนิสิตต่อแผนก
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1 text-sm">
          {depts.map((d) => (
            <div key={d.slug} className="flex items-baseline justify-between border-b border-dashed border-[var(--color-border)] py-0.5 print:border-gray-300">
              <span>{d.short_th ?? d.name_th}</span>
              <span className="font-mono text-[var(--color-ink-muted)]">{deptTotals.get(d.slug) ?? 0}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-serif font-semibold mb-2 border-b border-[var(--color-border)] pb-1 print:border-black">
          รายชื่อทั้งหมด · เรียงปี → รหัส
        </h2>
        <table className="w-full text-sm">
          <thead className="border-b border-[var(--color-border)] print:border-black">
            <tr className="text-left text-xs text-[var(--color-ink-muted)]">
              <th className="py-1.5 pr-2">ปี</th>
              <th className="py-1.5 pr-2">#</th>
              <th className="py-1.5 pr-2">ชื่อเล่น</th>
              <th className="py-1.5 pr-2">ชื่อ-นามสกุล</th>
              <th className="py-1.5 pr-2">Slot 1</th>
              <th className="py-1.5 pr-2">Slot 2+</th>
              <th className="py-1.5 pr-2">วัน</th>
              <th className="py-1.5">Cert</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => {
              const sorted = s.rows.slice().sort((a, b) => a.week - b.week);
              const total = sorted.reduce((sum, r) => sum + r.days_practiced, 0);
              const cert = total >= 7;
              return (
                <tr key={`${s.year}-${s.short_id}`} className="border-b border-dashed border-[var(--color-border)] print:border-gray-300">
                  <td className="py-1 pr-2 text-xs">{s.year}</td>
                  <td className="py-1 pr-2 font-mono text-xs">#{s.short_id}</td>
                  <td className="py-1 pr-2 font-medium">{s.nickname}</td>
                  <td className="py-1 pr-2 text-xs text-[var(--color-ink-muted)]">{s.full_name ?? "—"}</td>
                  <td className="py-1 pr-2 text-xs">
                    {sorted[0] ? `${deptByName.get(sorted[0].dept_slug)?.short_th ?? sorted[0].dept_slug} W${sorted[0].week}` : "—"}
                  </td>
                  <td className="py-1 pr-2 text-xs">
                    {sorted
                      .slice(1)
                      .map((r) => `${deptByName.get(r.dept_slug)?.short_th ?? r.dept_slug} W${r.week}`)
                      .join(" · ") || "—"}
                  </td>
                  <td className="py-1 pr-2 text-xs">{total}</td>
                  <td className="py-1 text-xs">{cert ? "✓" : "✗"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <footer className="mt-8 pt-4 border-t border-[var(--color-border)] text-xs text-[var(--color-ink-muted)] print:border-black">
        Generated {new Date().toLocaleString("th-TH")} · vettobe.cuvetsmo.com · for ทีมหัวปีรุ่นถัดไป handoff
      </footer>
    </div>
  );
}

function Box({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[var(--color-border)] rounded p-3 print:border-black">
      <div className="text-xs uppercase tracking-wide text-[var(--color-ink-muted)] mb-0.5">{label}</div>
      <div className="font-serif text-xl font-semibold">{value}</div>
    </div>
  );
}
