/**
 * Data source abstraction — prefers Supabase, falls back to local seed.
 *
 * Server-side helpers used by page components (RSC). For client-side lookup,
 * we expose all assignments via a single /api/assignments/2569 endpoint
 * since dataset is small enough (< 1 MB) and React Server cache handles caching.
 */

import "server-only";
import { unstable_cache } from "next/cache";
import { getSupabaseServer } from "../supabase-server";
import { hasSupabaseEnv } from "../supabase";
import type { Assignment, Department, DeptReview, VettobeYear } from "../types";
import { YEARS as SEED_YEARS } from "./years";
import { DEPARTMENTS as SEED_DEPTS } from "./departments";
import { SEED_2569 } from "./seed-2569";

/* ── Years ───────────────────────────────────────────────────────────────── */

export const getYears = unstable_cache(
  async (): Promise<VettobeYear[]> => {
    const sb = getSupabaseServer();
    if (!sb) return SEED_YEARS;
    const { data, error } = await sb.from("vettobe_years").select("*").order("id", { ascending: false });
    if (error || !data) return SEED_YEARS;
    return data as VettobeYear[];
  },
  ["vettobe-years"],
  { revalidate: 300, tags: ["vettobe-years"] }
);

export async function getYear(id: number): Promise<VettobeYear | null> {
  const years = await getYears();
  return years.find((y) => y.id === id) ?? null;
}

/* ── Departments ─────────────────────────────────────────────────────────── */

export const getDepartments = unstable_cache(
  async (): Promise<Department[]> => {
    const sb = getSupabaseServer();
    if (!sb) return SEED_DEPTS;
    const { data, error } = await sb.from("vettobe_departments").select("*").order("slug");
    if (error || !data) return SEED_DEPTS;
    return data as Department[];
  },
  ["vettobe-departments"],
  { revalidate: 600, tags: ["vettobe-departments"] }
);

export async function getDepartment(slug: string): Promise<Department | null> {
  const list = await getDepartments();
  return list.find((d) => d.slug === slug) ?? null;
}

/* ── Assignments ─────────────────────────────────────────────────────────── */

export const getAssignmentsByYear = unstable_cache(
  async (yearId: number): Promise<Assignment[]> => {
    const sb = getSupabaseServer();
    if (!sb) {
      return yearId === 2569 ? (SEED_2569 as Assignment[]) : [];
    }
    const { data, error } = await sb
      .from("vettobe_assignments")
      .select("*")
      .eq("year_id", yearId)
      .order("week");
    if (error || !data) {
      return yearId === 2569 ? (SEED_2569 as Assignment[]) : [];
    }
    return data as Assignment[];
  },
  ["vettobe-assignments-by-year"],
  { revalidate: 60, tags: ["vettobe-assignments"] }
);

export async function getAssignmentsByDept(
  yearId: number,
  deptSlug: string
): Promise<Assignment[]> {
  const all = await getAssignmentsByYear(yearId);
  return all.filter((a) => a.dept_slug === deptSlug);
}

/* ── Cross-year dept stats ───────────────────────────────────────────────── */

export async function getDeptCountByYear(deptSlug: string): Promise<Record<number, number>> {
  const years = await getYears();
  const counts: Record<number, number> = {};
  for (const y of years) {
    const rows = await getAssignmentsByDept(y.id, deptSlug);
    counts[y.id] = rows.length;
  }
  return counts;
}

/* ── Student profile ─────────────────────────────────────────────────────── */

export async function getStudentAssignments(
  yearId: number,
  shortId: string
): Promise<Assignment[]> {
  const all = await getAssignmentsByYear(yearId);
  return all
    .filter((a) => a.short_id === shortId)
    .sort((a, b) => a.week - b.week);
}

/* ── Reviews ─────────────────────────────────────────────────────────────── */

export const getReviewsByDept = unstable_cache(
  async (yearId: number, deptSlug: string): Promise<DeptReview[]> => {
    const sb = getSupabaseServer();
    if (!sb) return [];
    const { data, error } = await sb
      .from("vettobe_reviews")
      .select("*")
      .eq("year_id", yearId)
      .eq("dept_slug", deptSlug)
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data as DeptReview[];
  },
  ["vettobe-reviews"],
  { revalidate: 30, tags: ["vettobe-reviews"] }
);

/* ── Recent activity (home feed) ────────────────────────────────────────── */

export type ActivityItem =
  | {
      kind: "review";
      id: string;
      year_id: number;
      dept_slug: string;
      rating: number;
      comment: string;
      created_at: string;
    }
  | {
      kind: "issue";
      id: string;
      year_id: number;
      dept_slug: string;
      issue_type: string;
      status: string;
      created_at: string;
    };

export const getRecentActivity = unstable_cache(
  async (limit: number = 8): Promise<ActivityItem[]> => {
    const sb = getSupabaseServer();
    if (!sb) return [];
    const [reviews, issues] = await Promise.all([
      sb
        .from("vettobe_reviews")
        .select("id,year_id,dept_slug,rating,comment,created_at")
        .order("created_at", { ascending: false })
        .limit(limit),
      sb
        .from("vettobe_issue_reports")
        .select("id,year_id,dept_slug,issue_type,status,created_at")
        .order("created_at", { ascending: false })
        .limit(limit),
    ]);
    const r: ActivityItem[] = (reviews.data ?? []).map((row) => ({
      kind: "review",
      id: row.id as string,
      year_id: row.year_id as number,
      dept_slug: row.dept_slug as string,
      rating: row.rating as number,
      comment: row.comment as string,
      created_at: row.created_at as string,
    }));
    const i: ActivityItem[] = (issues.data ?? []).map((row) => ({
      kind: "issue",
      id: row.id as string,
      year_id: row.year_id as number,
      dept_slug: row.dept_slug as string,
      issue_type: row.issue_type as string,
      status: row.status as string,
      created_at: row.created_at as string,
    }));
    return [...r, ...i]
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
      .slice(0, limit);
  },
  ["vettobe-recent-activity"],
  { revalidate: 60, tags: ["vettobe-reviews", "vettobe-issues"] }
);

/* ── Status badge ────────────────────────────────────────────────────────── */

export function dataSourceBadge(): "supabase" | "seed" {
  return hasSupabaseEnv() ? "supabase" : "seed";
}
