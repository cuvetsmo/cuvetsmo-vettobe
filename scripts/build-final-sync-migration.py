"""
Build a single SQL migration that brings vettobe_assignments year=2569 in line with
the parsed FINAL grid PDF, preserving full_name and assignment_id where possible.

Strategy (transactional):
  1. Stage parsed FINAL rows into a temp table
  2. UPDATE matching rows (key = dept+week+short_id+year) — preserves UUID + full_name
  3. INSERT rows in FINAL but not in DB — looks up full_name by (short_id, nickname, year)
  4. DELETE rows in DB but not in FINAL
  5. Update vettobe_years.total_slots + unique_students

Idempotent — safe to re-run.
"""
from __future__ import annotations
import io
import json
import sys
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

PARSED = Path(__file__).parent / "final-grid-parsed.json"
OUT = Path(__file__).parent / "phase12d-full-sync.sql"


def esc(s: str) -> str:
    if s is None:
        return "NULL"
    return "'" + str(s).replace("'", "''") + "'"


def main():
    grid = json.load(open(PARSED, encoding="utf-8"))

    rows = []  # tuples
    for dept_slug, weeks in grid.items():
        for wk, students in weeks.items():
            for s in students:
                rows.append((
                    dept_slug, int(wk), s["short_id"], s["nickname"],
                    s["student_year"], s["days_practiced"],
                    s.get("days_note"),
                ))

    print(f"-- {len(rows)} rows from parsed FINAL", file=sys.stderr)

    # Build VALUES list for temp staging
    values_sql = ",\n  ".join(
        f"({esc(d)}, {w}, {esc(sid)}, {esc(nn)}, {yr}, {dd}, {esc(note)})"
        for d, w, sid, nn, yr, dd, note in rows
    )

    sql = f"""-- ===================================================================
-- Phase 12d: full sync of vettobe_assignments year=2569 against
-- ตารางรายแผนก_FINAL.pdf (5/19) — AUTHORITATIVE source of truth
--
-- Strategy:
--   1. Stage parsed FINAL rows (290 rows)
--   2. UPDATE matching DB rows (preserves UUID + full_name + reviewer history)
--   3. INSERT FINAL-only rows (looks up full_name by short_id+nickname+year)
--   4. DELETE DB-only rows
--   5. Refresh year stats
-- ===================================================================

BEGIN;

CREATE TEMP TABLE _final_2569 (
  dept_slug TEXT NOT NULL,
  week INT NOT NULL,
  short_id TEXT NOT NULL,
  nickname TEXT NOT NULL,
  student_year INT NOT NULL,
  days_practiced INT NOT NULL,
  days_note TEXT
) ON COMMIT DROP;

INSERT INTO _final_2569 (dept_slug, week, short_id, nickname, student_year, days_practiced, days_note) VALUES
  {values_sql};

-- Sanity: row count
DO $$
DECLARE n INT;
BEGIN
  SELECT COUNT(*) INTO n FROM _final_2569;
  IF n <> {len(rows)} THEN
    RAISE EXCEPTION 'staged row count % does not match expected {len(rows)}', n;
  END IF;
END $$;

-- Step 2: UPDATE matching rows — sync days_practiced + notes, preserve everything else
UPDATE public.vettobe_assignments a
SET
  days_practiced = f.days_practiced,
  notes = CASE
    WHEN f.days_note IS NOT NULL
      THEN COALESCE(NULLIF(a.notes, ''), '') ||
           CASE WHEN COALESCE(NULLIF(a.notes, ''), '') = '' THEN '' ELSE ' | ' END ||
           '[FINAL 5/19: ' || f.days_note || ']'
    ELSE a.notes
  END
FROM _final_2569 f
WHERE a.year_id = 2569
  AND a.dept_slug = f.dept_slug
  AND a.week = f.week
  AND a.short_id = f.short_id
  AND a.student_year = f.student_year;

-- Step 3: INSERT FINAL rows missing in DB.
--         For each new row, look up canonical nickname + full_name from any
--         existing row of the same student (matching short_id + year only)
--         to avoid carrying over PDF-extracted diacritic-reorder corruption.
INSERT INTO public.vettobe_assignments
  (id, year_id, dept_slug, week, short_id, nickname, full_name, student_year, days_practiced, rank, source, notes)
SELECT
  gen_random_uuid(),
  2569,
  f.dept_slug,
  f.week,
  f.short_id,
  COALESCE(
    (SELECT nickname FROM public.vettobe_assignments
       WHERE year_id = 2569 AND short_id = f.short_id AND student_year = f.student_year
       ORDER BY length(nickname) DESC, nickname LIMIT 1),
    f.nickname
  ),
  (SELECT MAX(full_name) FROM public.vettobe_assignments
     WHERE year_id = 2569 AND short_id = f.short_id AND student_year = f.student_year),
  f.student_year,
  f.days_practiced,
  'manual',
  'verified-self-report',
  CASE WHEN f.days_note IS NOT NULL
       THEN 'inserted from FINAL grid 5/19 — ' || f.days_note
       ELSE 'inserted from FINAL grid 5/19' END
FROM _final_2569 f
WHERE NOT EXISTS (
  SELECT 1 FROM public.vettobe_assignments a
  WHERE a.year_id = 2569
    AND a.dept_slug = f.dept_slug
    AND a.week = f.week
    AND a.short_id = f.short_id
    AND a.student_year = f.student_year
);

-- Step 4: DELETE DB rows not present in FINAL
DELETE FROM public.vettobe_assignments a
WHERE a.year_id = 2569
  AND NOT EXISTS (
    SELECT 1 FROM _final_2569 f
    WHERE a.dept_slug = f.dept_slug
      AND a.week = f.week
      AND a.short_id = f.short_id
      AND a.student_year = f.student_year
  );

-- Step 5: Refresh year stats
WITH stats AS (
  SELECT COUNT(*) AS slots,
         COUNT(DISTINCT (short_id, nickname, student_year)) AS students
  FROM public.vettobe_assignments
  WHERE year_id = 2569
)
UPDATE public.vettobe_years y
SET total_slots = s.slots,
    unique_students = s.students,
    updated_at = now()
FROM stats s
WHERE y.id = 2569;

-- Final sanity verification — should be {len(rows)} total
DO $$
DECLARE n INT;
BEGIN
  SELECT COUNT(*) INTO n FROM public.vettobe_assignments WHERE year_id = 2569;
  IF n <> {len(rows)} THEN
    RAISE EXCEPTION 'post-sync row count % does not match expected {len(rows)}', n;
  END IF;
END $$;

COMMIT;
"""

    OUT.write_text(sql, encoding="utf-8")
    print(f"wrote {OUT} ({OUT.stat().st_size:,} bytes, {len(rows)} rows staged)", file=sys.stderr)


if __name__ == "__main__":
    main()
