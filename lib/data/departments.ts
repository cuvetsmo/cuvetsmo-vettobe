import type { Department } from "../types";

/** 18 departments at โรงพยาบาลสัตว์เล็ก จุฬาฯ that received Vet to be trainees in 2569.
 *  Source: ตารางรายแผนก_FINAL.pdf (2026-05-19) — same 18 used across all years.
 *  Categories from the 2569 spec — may shift slightly year-to-year. */
export const DEPARTMENTS: Department[] = [
  {
    slug: "nephrology-cardiac",
    name_th: "คลินิกโรคไต หัวใจ และระบบขับถ่ายปัสสาวะ",
    short_th: "ไต-หัวใจ",
    name_en: "Nephrology & Cardiac Clinic",
    category: "holiday-receiving",
    capacity_per_day: 3,
  },
  {
    slug: "dermatology",
    name_th: "คลินิกโรคผิวหนัง",
    short_th: "ผิวหนัง",
    name_en: "Dermatology Clinic",
    category: "holiday-receiving",
    capacity_per_day: 2,
    allowed_years: [5, 6],
  },
  {
    slug: "oncology",
    name_th: "คลินิกโรคมะเร็ง",
    short_th: "มะเร็ง",
    name_en: "Oncology Clinic",
    category: "holiday-receiving",
    capacity_per_day: 2,
  },
  {
    slug: "exotic-pet",
    name_th: "คลินิกสัตว์พิเศษ",
    short_th: "สัตว์พิเศษ",
    name_en: "Exotic Pet Clinic",
    category: "no-holiday",
    capacity_per_day: 2,
    allowed_years: [5, 6],
  },
  {
    slug: "necropsy",
    name_th: "แผนกชันสูตรโรคสัตว์ (ผ่าซาก)",
    short_th: "ชันสูตร (ผ่าซาก)",
    name_en: "Necropsy",
    category: "no-holiday",
    capacity_per_day: 2,
  },
  {
    slug: "surgery",
    name_th: "แผนกศัลยกรรม",
    short_th: "ศัลยกรรม",
    name_en: "Surgery",
    category: "special",
    capacity_per_day: 2,
    notes: "ในปี 2569 ปิดรับ — เงื่อนไข 'เริ่ม 1 ก.ค. + ไม่รับวันหยุด' ขัดกัน",
  },
  {
    slug: "obstetrics",
    name_th: "แผนกสูติกรรม",
    short_th: "สูติ",
    name_en: "Obstetrics",
    category: "holiday-receiving",
    capacity_per_day: 2,
  },
  {
    slug: "internal-medicine",
    name_th: "แผนกอายุรกรรม",
    short_th: "อายุร",
    name_en: "Internal Medicine",
    category: "no-holiday",
    capacity_per_day: 2,
  },
  {
    slug: "ophthalmology",
    name_th: "หน่วยจักษุ",
    short_th: "จักษุ",
    name_en: "Ophthalmology",
    category: "holiday-receiving",
    capacity_per_day: 2,
  },
  {
    slug: "medical-records",
    name_th: "หน่วยเวชระเบียน",
    short_th: "เวชระเบียน",
    name_en: "Medical Records",
    category: "no-holiday",
    capacity_per_day: 2,
    notes: "ครึ่งวันเช้า 08:00–13:00",
  },
  {
    slug: "emergency",
    name_th: "หน่วยเวชศาสตร์ฉุกเฉิน",
    short_th: "ฉุกเฉิน (ER)",
    name_en: "Emergency Medicine",
    category: "holiday-receiving",
    capacity_per_day: 2,
  },
  {
    slug: "alternative-medicine",
    name_th: "หน่วยเวชศาสตร์ทางเลือก",
    short_th: "ทางเลือก",
    name_en: "Alternative Medicine",
    category: "no-holiday",
    capacity_per_day: 2,
  },
  {
    slug: "rehabilitation",
    name_th: "หน่วยเวชศาสตร์ฟื้นฟู",
    short_th: "ฟื้นฟู",
    name_en: "Rehabilitation",
    category: "special",
    capacity_per_day: 2,
    notes: "เปิดเฉพาะ จ.–พ. (3 วัน/สัปดาห์)",
  },
  {
    slug: "operating-room",
    name_th: "ห้องผ่าตัด",
    short_th: "ห้องผ่าตัด",
    name_en: "Operating Room",
    category: "no-holiday",
    capacity_per_day: 2,
    notes: "ชั้นปีละ 1 คน/วัน (ปี 4 = 1 + ปี 5 = 1)",
  },
  {
    slug: "pharmacy",
    name_th: "ห้องยา",
    short_th: "ห้องยา",
    name_en: "Pharmacy",
    category: "holiday-receiving",
    capacity_per_day: 1,
  },
  {
    slug: "ccu",
    name_th: "หออภิบาลสัตว์ป่วยขั้นวิกฤติ CCU",
    short_th: "CCU",
    name_en: "Critical Care Unit",
    category: "holiday-receiving",
    capacity_per_day: 2,
  },
  {
    slug: "pr-vdo",
    name_th: "สำนักงาน (ประชาสัมพันธ์ PR VDO)",
    short_th: "PR",
    name_en: "PR & Video Office",
    category: "no-holiday",
    capacity_per_day: 1,
  },
  {
    slug: "aquatic",
    name_th: "ศูนย์วิจัยโรคสัตว์น้ำ",
    short_th: "สัตว์น้ำ",
    name_en: "Aquatic Animal Research Center",
    category: "special",
    capacity_per_day: 2,
    allowed_years: [5, 6],
    notes: "ปี 5 + ฝึก ≥ 2 สัปดาห์ต่อเนื่อง · ปิด อาทิตย์",
  },
];

export const DEPT_BY_SLUG = new Map(DEPARTMENTS.map((d) => [d.slug, d]));

export const DEPT_BY_NAME_TH = new Map(
  DEPARTMENTS.flatMap((d) => [
    [d.name_th, d] as const,
    ...(d.short_th ? [[d.short_th, d] as const] : []),
  ])
);

export const CATEGORY_LABEL: Record<string, string> = {
  "holiday-receiving": "รับวันหยุด (W1–W14)",
  "no-holiday": "ไม่รับวันหยุด (W1–W5)",
  special: "เงื่อนไขพิเศษ",
};
