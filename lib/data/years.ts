import type { VettobeYear } from "../types";

/** Year registry. Add new years as they happen.
 *  Year ID is the Buddhist year (พ.ศ.) for clarity with Thai users — 2569 = 2026 AD.
 *  Some years (2567, 2568) we know happened but don't have data — listed as planning/archive
 *  to make multi-year support a first-class feature, not an afterthought. */
export const YEARS: VettobeYear[] = [
  {
    id: 2569,
    name: "Vet to be 2569 (2026)",
    start_date: "2026-05-14",
    end_date: "2026-12-30",
    total_slots: 290,
    unique_students: 163,
    status: "active",
    data_confidence: "verified",
    notes:
      "รอบล่าสุด — ทีมหัวปี cuvet86 จัดผ่านอัลกอริทึม + manual round-2+ swaps · 23 students adjusted post-publish · 5 W9-only students at risk of not getting cert",
  },
  {
    id: 2568,
    name: "Vet to be 2568 (2025)",
    start_date: "2025-05-14",
    end_date: "2025-12-30",
    total_slots: 0,
    unique_students: 0,
    status: "archive",
    data_confidence: "crowdsourced",
    notes: "รอ trainee เก่ามาช่วยกรอกย้อนหลัง — เปิด crowdsource ในเฟสถัดไป",
  },
  {
    id: 2567,
    name: "Vet to be 2567 (2024)",
    start_date: "2024-05-14",
    end_date: "2024-12-31",
    total_slots: 0,
    unique_students: 0,
    status: "archive",
    data_confidence: "crowdsourced",
    notes: "รอ trainee เก่ามาช่วยกรอกย้อนหลัง · Google Drive folder ของรอบนี้ยังเข้าถึงได้",
  },
];

export const YEAR_BY_ID = new Map(YEARS.map((y) => [y.id, y]));

export const LATEST_YEAR = YEARS.find((y) => y.status === "active") ?? YEARS[0];
