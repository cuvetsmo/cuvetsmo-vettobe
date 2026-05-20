import { NextResponse } from "next/server";
import { getAssignmentsByYear, getDepartments } from "@/lib/data/source";

export const revalidate = 60;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const yearParam = searchParams.get("year");
  const yearId = yearParam ? Number(yearParam) : 2569;
  if (!Number.isFinite(yearId)) {
    return NextResponse.json({ error: "Invalid year" }, { status: 400 });
  }
  const [rows, depts] = await Promise.all([
    getAssignmentsByYear(yearId),
    getDepartments(),
  ]);
  // Enrich with dept short_th for nicer client rendering
  const deptByName = new Map(depts.map((d) => [d.slug, d.short_th ?? d.name_th]));
  const enriched = rows.map((r) => ({
    ...r,
    dept_short_th: deptByName.get(r.dept_slug) ?? r.dept_slug,
  }));
  return NextResponse.json({ year_id: yearId, count: enriched.length, assignments: enriched });
}
