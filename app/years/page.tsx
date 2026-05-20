import Link from "next/link";
import type { Metadata } from "next";
import { getYears } from "@/lib/data/source";

export const metadata: Metadata = {
  title: "ทุกปีที่บันทึก",
  description: "ดูข้อมูลโครงการ Vet to be ย้อนหลังทุกปีที่บันทึกไว้",
};

export const revalidate = 300;

export default async function YearsPage() {
  const years = await getYears();
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-serif font-semibold mb-2">ทุกปีที่บันทึก</h1>
      <p className="text-[var(--color-ink-muted)] mb-8 leading-relaxed">
        เก็บข้อมูลโครงการย้อนหลัง — ปีก่อนๆ ส่วนใหญ่เป็นข้อมูลที่เพื่อนๆ ช่วยกันกรอก
        (crowdsourced) ตอนนี้มีแค่ 2569 ที่ข้อมูลครบที่สุด ส่วนปีอื่นๆ จะค่อยๆ เพิ่มเมื่อเปิดให้รุ่นพี่กรอกย้อนหลังในเฟสถัดไป
      </p>

      <div className="space-y-3">
        {years.map((y) => (
          <Link
            key={y.id}
            href={`/years/${y.id}`}
            className="block bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] rounded-xl p-5 transition-all hover:shadow-[var(--shadow-card)]"
          >
            <div className="flex items-baseline justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="font-serif text-3xl font-semibold !text-[var(--color-ink)]">{y.id}</span>
                  <span className="text-sm !text-[var(--color-ink-muted)]">{y.name}</span>
                </div>
                {y.notes && <p className="text-sm !text-[var(--color-ink-muted)] mt-2 max-w-xl">{y.notes}</p>}
              </div>
              <div className="text-right text-sm">
                <div className="!text-[var(--color-ink)] font-medium">
                  {y.total_slots > 0 ? `${y.total_slots} slots` : "ยังไม่มีข้อมูล"}
                </div>
                {y.unique_students > 0 && (
                  <div className="!text-[var(--color-ink-faint)] text-xs">{y.unique_students} นิสิต</div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10 bg-[var(--color-accent-soft)]/30 border border-[var(--color-border)] rounded-xl p-5">
        <h3 className="font-serif text-lg font-semibold mb-2">เคยฝึก Vet to be ปีก่อนๆ?</h3>
        <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
          ถ้าจำได้ว่าตัวเองเคยฝึกแผนกไหน สัปดาห์ไหน ปีไหน ช่วยกรอกได้ในเฟสถัดไป —
          เรากำลังเปิด crowdsource เพื่อให้ข้อมูลเหล่านี้กลับมามีชีวิตอีกครั้ง บอกเพื่อนรุ่นพี่ให้รอติดตาม
        </p>
      </div>
    </div>
  );
}
