import Link from "next/link";
import {
  getYears,
  getDepartments,
  getAssignmentsByYear,
  getRecentActivity,
} from "@/lib/data/source";
import { RecentActivity } from "@/components/RecentActivity";

export const revalidate = 300;

export default async function Home() {
  const [years, departments, assignments, recent] = await Promise.all([
    getYears(),
    getDepartments(),
    getAssignmentsByYear(2569),
    getRecentActivity(8),
  ]);
  const totalAssignments = assignments.length;
  const totalStudents = new Set(assignments.map((a) => a.short_id)).size;
  const latest = years.find((y) => y.status === "active") ?? years[0];

  return (
    <>
      {/* Hero */}
      <section className="bg-paper border-b border-[var(--color-border)]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 md:py-24">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-[var(--color-accent)] mb-3 tracking-wide uppercase">
              vettobe.cuvetsmo.com
            </p>
            <h1 className="text-4xl md:text-5xl font-semibold text-[var(--color-ink)] leading-[1.15] mb-5">
              ทุกอย่างของโครงการ Vet to be
              <br />
              <span className="text-[var(--color-accent)]">รวมไว้ในที่เดียว</span>
            </h1>
            <p className="text-lg text-[var(--color-ink-muted)] leading-relaxed mb-8 max-w-2xl">
              ค้นหาประสบการณ์ฝึกงานของตัวเองและรุ่นพี่ย้อนหลัง รีวิวแผนกต่างๆ
              จากนิสิตที่เคยฝึกจริง และเป็นเครื่องมือให้ทีมหัวปีรุ่นต่อไปจัดรอบฝึกใหม่ได้สะดวกขึ้น
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/lookup"
                className="inline-flex items-center gap-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-strong)] !text-white px-5 py-3 rounded-lg font-medium transition-colors shadow-sm"
              >
                🔍 ค้นหารายชื่อตัวเอง
              </Link>
              <Link
                href={`/years/${latest?.id ?? 2569}`}
                className="inline-flex items-center gap-2 bg-[var(--color-surface)] hover:bg-[var(--color-surface-lift)] !text-[var(--color-ink)] px-5 py-3 rounded-lg font-medium transition-colors border border-[var(--color-border-strong)]"
              >
                ดูผลปีล่าสุด ({latest?.id ?? 2569})
              </Link>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-3xl">
            <Stat label="ปีที่บันทึก" value={years.length.toString()} sub={`${years.filter((y) => y.status === "archive").length} ย้อนหลัง + ${years.filter((y) => y.status === "active").length} ปัจจุบัน`} />
            <Stat label="แผนกที่เปิดรับ" value={String(departments.length)} sub="ใน รพ.สัตว์เล็ก จุฬาฯ" />
            <Stat label={`Slot ปี ${latest?.id ?? 2569}`} value={String(latest?.total_slots ?? 0)} sub="หลัง manual round-2+" />
            <Stat label="ในฐานข้อมูล" value={totalAssignments.toString()} sub={`${totalStudents} นิสิต`} />
          </div>
        </div>
      </section>

      {/* Featured years */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-2xl font-serif font-semibold text-[var(--color-ink)]">เลือกปีที่อยากดู</h2>
          <Link href="/years" className="text-sm font-medium">ดูทั้งหมด →</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {years.map((y) => (
            <Link
              key={y.id}
              href={`/years/${y.id}`}
              className="group bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] rounded-xl p-5 transition-all hover:shadow-[var(--shadow-card)]"
            >
              <div className="flex items-baseline justify-between mb-2">
                <span className="font-serif text-2xl font-semibold !text-[var(--color-ink)]">{y.id}</span>
                <StatusBadge status={y.status} />
              </div>
              <p className="text-sm !text-[var(--color-ink-muted)] mb-3">{y.name}</p>
              <div className="flex flex-wrap gap-3 text-xs !text-[var(--color-ink-faint)]">
                <span>📋 {y.total_slots} slots</span>
                <span>👥 {y.unique_students} นิสิต</span>
                <ConfidenceBadge conf={y.data_confidence} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Departments showcase */}
      <section className="border-t border-[var(--color-border)] bg-[var(--color-surface)]/40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
          <h2 className="text-2xl font-serif font-semibold text-[var(--color-ink)] mb-2">
            {departments.length} แผนกที่เปิดรับ
          </h2>
          <p className="text-[var(--color-ink-muted)] mb-6">
            แต่ละแผนกมีเงื่อนไขเฉพาะ — บางแผนกเปิดเฉพาะ ปี 5+ บางแผนกเปิดเฉพาะ W1–W5 ปิดเทอม
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {departments.map((d) => (
              <Link
                key={d.slug}
                href={`/years/${latest?.id ?? 2569}/depts/${d.slug}`}
                className="group flex items-start justify-between gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-lift)] rounded-lg px-4 py-3 transition-colors"
              >
                <div className="min-w-0">
                  <div className="font-medium !text-[var(--color-ink)] truncate">{d.short_th ?? d.name_th}</div>
                  <div className="text-xs !text-[var(--color-ink-faint)] mt-0.5 truncate">{d.name_en}</div>
                </div>
                <CategoryChip cat={d.category} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* What you can do here */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
        <h2 className="text-2xl font-serif font-semibold text-[var(--color-ink)] mb-8">เว็บนี้ทำอะไรได้บ้าง</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Feature icon="🔎" title="ค้นรายชื่อย้อนหลัง" desc="พิมพ์ชื่อเล่นหรือ #รหัส เพื่อดูว่าตัวเอง (หรือเพื่อน) ปีไหนได้แผนกอะไร ฝึกกี่วัน" href="/lookup" />
          <Feature icon="⭐" title="รีวิวแต่ละแผนก × ปี" desc="คนที่เคยฝึกจริงรีวิวแผนก แต่ละปีก็ไม่เหมือนกัน รุ่นพี่อาจารย์เปลี่ยน บรรยากาศต่าง" href={`/years/${latest?.id ?? 2569}`} />
          <Feature icon="📋" title="ดูตารางทั้งโครงการ" desc="ตารางรายแผนก × 14 สัปดาห์ ของแต่ละปี ดู capacity ความหนาแน่นได้ทั้งหมด" href={`/years/${latest?.id ?? 2569}`} />
          <Feature icon="🎓" title="ตรวจสถานะเกียรติบัตร" desc="ใครได้/ใครยังไม่ได้เกียรติบัตร W9-only เสี่ยงไม่ครบ 7 วัน รู้ทันก่อน" href={`/years/${latest?.id ?? 2569}`} />
          <Feature icon="🛠️" title="ทีมหัวปีจัดรอบใหม่" desc="รุ่นหัวปีต่อไปสามารถใช้เว็บนี้เป็น operations console — รับฟอร์ม จัดสรร ประกาศ ในที่เดียว" href="/about" badge="Phase 2" />
          <Feature icon="📚" title="คลังข้อมูลระยะยาว" desc="เก็บข้อมูลย้อนหลังตลอดไป — รุ่นน้องจะดูได้ว่า 5 ปีก่อนมีใครเคยฝึกตรงไหน บรรยากาศเป็นยังไง" href="/years" />
        </div>
      </section>

      {/* Recent activity */}
      <RecentActivity items={recent} depts={departments} />

      {/* Disclaimer */}
      <section className="bg-[var(--color-accent-soft)]/40 border-y border-[var(--color-border)]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
          <div className="flex items-start gap-3">
            <span className="text-xl shrink-0">⚠️</span>
            <div className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
              <strong className="text-[var(--color-ink)]">ข้อมูลอาจยังไม่ถูกต้องทั้งหมด</strong> —
              ปี 2569 ข้อมูลส่วนใหญ่มาจากผลจัดเวรอัตโนมัติ + manual swaps ของทีมหัวปี
              ส่วนปีก่อนหน้าเป็นข้อมูลที่เพื่อนๆ ช่วยกันกรอก (crowdsourced)
              ถ้าเจอข้อมูลของตัวเองคลาดเคลื่อน{" "}
              <Link href="/about" className="font-medium">แจ้งได้ที่ปุ่ม "report" ในแต่ละหน้า</Link>{" "}
              จะอัปเดตให้ครับ
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-4 py-3">
      <div className="text-xs uppercase tracking-wide text-[var(--color-ink-faint)] mb-1">{label}</div>
      <div className="font-serif text-2xl font-semibold text-[var(--color-ink)]">{value}</div>
      <div className="text-xs text-[var(--color-ink-muted)] mt-0.5">{sub}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: "active" | "archive" | "planning" }) {
  const map = {
    active: { label: "กำลังจัด", cls: "badge-cert" },
    archive: { label: "ย้อนหลัง", cls: "bg-[var(--color-surface-strong)] !text-[var(--color-ink-muted)]" },
    planning: { label: "กำลังวางแผน", cls: "badge-at-risk" },
  };
  const m = map[status];
  return <span className={`text-xs px-2 py-0.5 rounded ${m.cls}`}>{m.label}</span>;
}

function ConfidenceBadge({ conf }: { conf: "verified" | "estimated" | "crowdsourced" }) {
  const label = { verified: "✓ ยืนยันแล้ว", estimated: "ประมาณการ", crowdsourced: "🤝 ช่วยกันกรอก" }[conf];
  return <span className="text-xs">{label}</span>;
}

function CategoryChip({ cat }: { cat: "holiday-receiving" | "no-holiday" | "special" }) {
  const map = {
    "holiday-receiving": { label: "รับ ส.-อา.", cls: "chip-rank-1" },
    "no-holiday": { label: "W1–W5", cls: "chip-rank-2" },
    special: { label: "พิเศษ", cls: "chip-rank-3" },
  };
  const m = map[cat];
  return <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded ${m.cls} h-fit`}>{m.label}</span>;
}

function Feature({ icon, title, desc, href, badge }: { icon: string; title: string; desc: string; href: string; badge?: string }) {
  return (
    <Link
      href={href}
      className="block bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] rounded-xl p-5 transition-all hover:shadow-[var(--shadow-card)]"
    >
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        {badge && (
          <span className="text-[10px] uppercase tracking-wide bg-[var(--color-accent-soft)] !text-[var(--color-accent-strong)] px-2 py-0.5 rounded">
            {badge}
          </span>
        )}
      </div>
      <h3 className="font-serif text-lg font-semibold !text-[var(--color-ink)] mb-1.5">{title}</h3>
      <p className="text-sm !text-[var(--color-ink-muted)] leading-relaxed">{desc}</p>
    </Link>
  );
}
