/**
 * Team credits per Vet to be round (year_id).
 *
 * Each round is organized by ทีมหัวปี (year-leaders team) — sometimes one cohort,
 * sometimes two cohorts collaborate. Keep this list updated as new rounds happen.
 */

export type CohortCredit = {
  /** Cohort name (e.g., "cuvet86") */
  cohort: string;
  /** Human-readable label (e.g., "Vet 86") */
  label: string;
  /** Their student year DURING this round (4 or 5 typically) */
  student_year_during_round: 4 | 5 | 6;
  /** Optional note about role split */
  role?: string;
};

export type YearCredit = {
  year_id: number;
  teams: CohortCredit[];
  /** Optional acknowledgement note */
  note?: string;
};

export const YEAR_CREDITS: YearCredit[] = [
  {
    year_id: 2569,
    teams: [
      {
        cohort: "cuvet86",
        label: "Vet 86",
        student_year_during_round: 5,
        role: "หัวปีรุ่นพี่",
      },
      {
        cohort: "cuvet87",
        label: "Vet 87",
        student_year_during_round: 4,
        role: "หัวปีรุ่นน้อง",
      },
    ],
    note: "ทีมหัวปี cuvet86 และ cuvet87 ช่วยกันจัดรอบ 2569 — รับฟอร์ม จัดอันดับ swap manual หลายรอบ และตรวจรอบสุดท้ายร่วมกัน",
  },
];

export function getYearCredit(yearId: number): YearCredit | null {
  return YEAR_CREDITS.find((c) => c.year_id === yearId) ?? null;
}
