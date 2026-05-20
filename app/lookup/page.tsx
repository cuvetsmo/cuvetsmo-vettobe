"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { SEED_2569 } from "@/lib/data/seed-2569";
import { DEPT_BY_SLUG } from "@/lib/data/departments";
import type { Assignment } from "@/lib/types";

export default function LookupPage() {
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (query.length < 1) return [];

    // Match against nickname, short_id, full_name
    return SEED_2569.filter((a) => {
      return (
        a.nickname.toLowerCase().includes(query) ||
        a.short_id.includes(query) ||
        a.full_name?.toLowerCase().includes(query)
      );
    });
  }, [q]);

  // Group results by student
  const byStudent = useMemo(() => {
    const map = new Map<string, { student: Pick<Assignment, "nickname" | "short_id" | "full_name" | "student_year">; rows: Assignment[] }>();
    for (const r of results) {
      const key = `${r.short_id}-${r.nickname}`;
      if (!map.has(key)) {
        map.set(key, {
          student: {
            nickname: r.nickname,
            short_id: r.short_id,
            full_name: r.full_name,
            student_year: r.student_year,
          },
          rows: [],
        });
      }
      map.get(key)!.rows.push(r);
    }
    return Array.from(map.values()).sort((a, b) =>
      a.student.nickname.localeCompare(b.student.nickname, "th")
    );
  }, [results]);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-serif font-semibold mb-2">ค้นหารายชื่อตัวเอง</h1>
      <p className="text-[var(--color-ink-muted)] mb-6 leading-relaxed">
        พิมพ์ <strong className="text-[var(--color-ink)]">ชื่อเล่น</strong>{" "}
        หรือ <strong className="text-[var(--color-ink)]">เลขท้าย #รหัสนิสิต</strong>{" "}
        เพื่อดูว่าตัวเองอยู่แผนกไหน ฝึกกี่วันในแต่ละปี
      </p>

      <div className="relative mb-6">
        <input
          type="search"
          placeholder="เช่น &quot;แบม&quot; หรือ &quot;032&quot;"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoFocus
          className="w-full bg-[var(--color-surface)] border border-[var(--color-border-strong)] focus:border-[var(--color-accent)] rounded-lg px-4 py-3 text-lg outline-none focus:ring-2 focus:ring-[var(--color-accent-soft)] transition"
        />
        {q && (
          <button
            onClick={() => setQ("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-faint)] hover:text-[var(--color-ink)]"
            aria-label="ล้างค่าค้น"
          >
            ✕
          </button>
        )}
      </div>

      {q.length === 0 && (
        <div className="text-center py-12 text-[var(--color-ink-muted)]">
          <div className="text-5xl mb-3">🔎</div>
          <p>เริ่มพิมพ์เพื่อค้นหา</p>
          <p className="text-xs mt-2 text-[var(--color-ink-faint)]">
            หมายเหตุ: เห็นเฉพาะข้อมูล 2569 ที่อยู่ใน partial seed ตอนนี้ ส่วนปีก่อนหน้า {" "}
            <Link href="/years">รอเปิด crowdsource</Link>
          </p>
        </div>
      )}

      {q.length > 0 && byStudent.length === 0 && (
        <div className="text-center py-12 text-[var(--color-ink-muted)]">
          <div className="text-4xl mb-3">🤔</div>
          <p>ไม่เจอ <strong className="text-[var(--color-ink)]">{q}</strong> ในข้อมูล 2569</p>
          <p className="text-xs mt-2 text-[var(--color-ink-faint)]">
            อาจเพราะยังไม่ได้ import เข้า seed (ตอนนี้มี ~60 รายชื่อ จากทั้งหมด 290)
          </p>
        </div>
      )}

      <div className="space-y-4">
        {byStudent.map(({ student, rows }) => {
          const totalDays = rows.reduce((s, r) => s + r.days_practiced, 0);
          const certOk = totalDays >= 7;
          return (
            <div
              key={`${student.short_id}-${student.nickname}`}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5"
            >
              <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
                <div>
                  <span className="font-serif text-xl font-semibold text-[var(--color-ink)]">
                    {student.nickname}
                  </span>
                  <span className="text-[var(--color-ink-faint)] ml-1.5 text-sm">
                    #{student.short_id} · ปี {student.student_year}
                  </span>
                  {student.full_name && (
                    <span className="block text-sm text-[var(--color-ink-muted)] mt-0.5">
                      {student.full_name}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[var(--color-ink-muted)]">
                    รวม {totalDays} วัน
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${certOk ? "badge-cert" : "badge-no-cert"}`}>
                    {certOk ? "✓ ครบเกียรติบัตร" : "⚠ ไม่ครบ 7 วัน"}
                  </span>
                </div>
              </div>

              <div className="grid gap-2">
                {rows
                  .sort((a, b) => a.week - b.week)
                  .map((r) => {
                    const dept = DEPT_BY_SLUG.get(r.dept_slug);
                    return (
                      <Link
                        key={r.id}
                        href={`/years/${r.year_id}/depts/${r.dept_slug}`}
                        className="flex items-center justify-between gap-3 bg-[var(--color-surface-lift)] hover:bg-[var(--color-surface-strong)] rounded-lg px-3 py-2 text-sm transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="font-mono text-xs text-[var(--color-ink-faint)] shrink-0 bg-[var(--color-surface)] px-2 py-0.5 rounded">
                            W{r.week}
                          </span>
                          <span className="font-medium !text-[var(--color-ink)] truncate">
                            {dept?.short_th ?? dept?.name_th ?? r.dept_slug}
                          </span>
                          {r.notes && (
                            <span className="text-xs !text-[var(--color-ink-faint)] truncate">
                              {r.notes}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs !text-[var(--color-ink-muted)]">{r.days_practiced} วัน</span>
                          <RankChip rank={r.rank} />
                        </div>
                      </Link>
                    );
                  })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RankChip({ rank }: { rank: Assignment["rank"] }) {
  const map: Record<Assignment["rank"], { label: string; cls: string }> = {
    "rank-1": { label: "อันดับ 1", cls: "chip-rank-1" },
    "rank-2": { label: "อันดับ 2", cls: "chip-rank-2" },
    "rank-3": { label: "อันดับ 3", cls: "chip-rank-3" },
    fill: { label: "เติม", cls: "chip-rank-fill" },
    random: { label: "สุ่ม", cls: "chip-rank-random" },
    manual: { label: "manual", cls: "chip-rank-1" },
  };
  const m = map[rank];
  return <span className={`text-[10px] px-1.5 py-0.5 rounded ${m.cls}`}>{m.label}</span>;
}
