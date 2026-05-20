// Core types for Vet to be ecosystem
// Year is a first-class entity — design supports unlimited historical years.

export type YearStatus = "archive" | "active" | "planning";
export type DataConfidence = "verified" | "estimated" | "crowdsourced";
export type DeptCategory = "holiday-receiving" | "no-holiday" | "special";
export type StudentYear = 3 | 4 | 5 | 6;
export type Rank = "rank-1" | "rank-2" | "rank-3" | "fill" | "random" | "manual";

export interface VettobeYear {
  id: number; // 2569, 2568, etc.
  name: string;
  start_date: string;
  end_date: string;
  total_slots: number;
  unique_students: number;
  status: YearStatus;
  data_confidence: DataConfidence;
  notes?: string;
}

export interface Department {
  slug: string;
  name_th: string;
  short_th?: string;
  name_en: string;
  category: DeptCategory;
  capacity_per_day: number;
  notes?: string;
  /** Year restrictions — empty means any year */
  allowed_years?: StudentYear[];
}

export interface Student {
  /** Anonymized public ID. Last 4 digits of รหัสนิสิต — safe to expose. */
  short_id: string;
  /** Full รหัสนิสิต — never rendered publicly; only used server-side for verification. */
  full_id?: string;
  /** ชื่อเล่น — primary public identifier. */
  nickname: string;
  /** Full ชื่อ-นามสกุล — may or may not be public depending on year's policy. */
  full_name?: string;
  year: StudentYear;
  /** "cuvet86", "cuvet87" — class cohort, used for filtering. */
  cohort?: string;
}

export interface Assignment {
  id: string;
  year_id: number;
  dept_slug: string;
  week: number; // 1-14
  short_id: string; // points to Student
  nickname: string; // denormalized for fast display
  full_name?: string;
  student_year: StudentYear;
  days_practiced: number;
  rank: Rank;
  source: "algorithm" | "manual-swap" | "late-add" | "verified-self-report";
  notes?: string;
}

export interface DeptReview {
  id: string;
  year_id: number;
  dept_slug: string;
  reviewer_short_id: string;
  rating: number; // 1-5
  comment: string;
  tags?: string[]; // ["hands-on", "อ.ใจดี", "เรียนรู้เยอะ", "งานหนัก"]
  created_at: string;
  verified: boolean; // matches an assignment row → can trust
}

export interface YearStats {
  year_id: number;
  total_slots: number;
  unique_students: number;
  cert_obtained: number;
  cert_at_risk: number;
  rank_1_count: number;
  rank_2_count: number;
  rank_3_count: number;
  fill_count: number;
  random_count: number;
  dept_utilization: Array<{ slug: string; used: number; capacity: number }>;
}
