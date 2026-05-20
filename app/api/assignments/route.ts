import { NextResponse } from "next/server";
import { getAssignmentsByYear } from "@/lib/data/source";

export const revalidate = 60;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const yearParam = searchParams.get("year");
  const yearId = yearParam ? Number(yearParam) : 2569;
  if (!Number.isFinite(yearId)) {
    return NextResponse.json({ error: "Invalid year" }, { status: 400 });
  }
  const rows = await getAssignmentsByYear(yearId);
  return NextResponse.json({ year_id: yearId, count: rows.length, assignments: rows });
}
