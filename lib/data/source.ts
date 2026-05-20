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

/* ── Status badge ────────────────────────────────────────────────────────── */

export function dataSourceBadge(): "supabase" | "seed" {
  return hasSupabaseEnv() ? "supabase" : "seed";
}
