"""
Parse ตารางรายแผนก_FINAL.pdf (the dept × week grid) → structured row data.

PDF source: C:/Users/palmz/Desktop/Vet_to_be_2569_FINAL/ตารางรายแผนก_FINAL.pdf
This is the AUTHORITATIVE 5/19 source of truth — supersedes the xlsx (5/7).

Challenges handled:
  - Thai diacritic reorder bug in pdf extraction (มะเรง็ vs มะเร็ง)
  - Continuation rows (LEFT='' rolls under the previous dept)
  - Each cell can contain 1-3 students, each spanning 2-4 text lines

Outputs:
  - scripts/final-grid-parsed.json — full parsed structure (for review/diff)
  - scripts/final-grid-seed.sql    — DELETE + INSERT migration
"""
from __future__ import annotations
import io
import json
import re
import sys
from pathlib import Path
from collections import defaultdict

import pdfplumber

# Force UTF-8 stdout on Windows
if sys.stdout.encoding != "utf-8":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
if sys.stderr.encoding != "utf-8":
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8")

PDF = Path("C:/Users/palmz/Desktop/Vet_to_be_2569_FINAL/ตารางรายแผนก_FINAL.pdf")


def normalize_thai(s: str) -> str:
    """Strip whitespace + remove zero-width chars + collapse spaces inside Thai."""
    if not s:
        return ""
    s = s.replace("​", "").replace(" ", " ")
    # Drop spaces ENTIRELY for matching (Thai PDFs often misplace spaces
    # between consonants and their diacritics)
    return re.sub(r"\s+", "", s)


# Match dept by KEYWORDS — robust against PDF text extraction bugs.
# Order: more specific → less specific (first match wins).
DEPT_KEYWORDS = [
    ("nephrology-cardiac", ["คลินิกโรคไต", "ระบบขับถ่ายปัสสาวะ", "หัวใจและระบบ", "หวัใจและระบบ"]),
    ("dermatology", ["คลินิกโรคผิวหนัง", "คลินิกโรคผวิหนัง"]),
    ("oncology", ["คลินิกโรคมะเร็ง", "คลินิกโรคมะเรง็"]),
    ("exotic-pet", ["คลินิกสัตว์พิเศษ", "คลินิกสตัว์พิเศษ"]),
    ("necropsy", ["ชันสูตรโรคสัตว์", "ชันสตูรโรคสตัว์", "ผ่าซาก"]),
    ("surgery", ["แผนกศัลยกรรม", "แผนกศลัยกรรม"]),
    ("obstetrics", ["แผนกสูติกรรม", "แผนกสตูิกรรม"]),
    ("internal-medicine", ["แผนกอายุรกรรม"]),
    ("ophthalmology", ["หน่วยจักษุ"]),
    ("medical-records", ["หน่วยเวชระเบียน", "หน่วยเวชระเบยีน"]),
    ("emergency", ["เวชศาสตร์ฉุกเฉิน", "เวชศาสตรฉ์ุกเฉิน"]),
    ("alternative-medicine", ["เวชศาสตร์ทางเลือก", "เวชศาสตรท์างเลือก"]),
    ("rehabilitation", ["เวชศาสตร์ฟื้นฟู", "เวชศาสตรฟ์ื้นฟู", "เวชศาสตรฟ์้นืฟู"]),
    ("operating-room", ["ห้องผ่าตัด", "หอ้งผา่ตัด"]),
    ("pharmacy", ["ห้องยา", "หอ้งยา"]),
    ("ccu", ["CCU", "หออภิบาลสัตว์ป่วย", "หออภิบาลสตัว์ป่วย"]),
    ("pr-vdo", ["สำนักงาน", "สา นักงาน", "ประชาสัมพันธ์", "ประชาสมัพันธ์"]),
    ("aquatic", ["ศูนย์วิจัยโรคสัตว์น้ำ", "ศูนยว์ิจัยโรคสตัว์น า"]),
]


def detect_dept(left_cell: str) -> str | None:
    norm = normalize_thai(left_cell)
    if not norm:
        return None
    for slug, keywords in DEPT_KEYWORDS:
        for kw in keywords:
            if normalize_thai(kw) in norm:
                return slug
    return None


# Match "(nickname#shortid) ปีN" — captures nickname, short_id, year
# PDF often misplaces Thai diacritics so "ี" ends up AFTER "#" (e.g. "(ปาล์มม่#ี 88)").
# Capture optional misplaced Thai diacritic in group 2 and append to nickname.
ENTRY_RE = re.compile(
    r"\(([^#)]+?)#([ะ-๏]?)\s*(\d+)\s*\)\s*ปี\s*(\d)"
)

# "เฉพาะ ..." or "เฉพาะ DD,DD,DD เดือน" — partial-week notes
DAYS_NOTE_RE = re.compile(r"\(\s*เฉพาะ[^)]{1,80}\)")


def parse_cell(cell_text: str) -> list[dict]:
    """Parse a single cell's text into list of student entries."""
    if not cell_text or not cell_text.strip():
        return []
    students = []
    # Find all (nickname#id) ปีN occurrences
    for m in ENTRY_RE.finditer(cell_text):
        nickname = m.group(1).strip()
        misplaced = m.group(2)  # diacritic that should belong to nickname
        if misplaced:
            nickname = nickname + misplaced
        short_id = m.group(3).zfill(3)
        year = int(m.group(4))
        # Look for "เฉพาะ" pattern in surrounding text (next 100 chars)
        tail = cell_text[m.end():m.end()+150]
        days_note = None
        days = 7  # default: full week
        n = DAYS_NOTE_RE.search(tail)
        if n:
            days_note = n.group(0).strip()
            # Count comma/space-separated date entries
            content = re.search(r"เฉพาะ\s*(.+)", days_note).group(1)
            # Count digit clusters as day mentions
            day_count = len(re.findall(r"\b\d{1,2}\b", content))
            if day_count > 0:
                days = day_count
        students.append({
            "nickname": nickname,
            "short_id": short_id,
            "student_year": year,
            "days_practiced": days,
            "days_note": days_note,
        })
    return students


def extract_grid(pdf_path: Path) -> dict[str, dict[int, list[dict]]]:
    """Return {dept_slug: {week: [student_dicts]}}."""
    grid: dict[str, dict[int, list[dict]]] = defaultdict(lambda: defaultdict(list))
    current_dept: str | None = None  # rolling state for continuation rows
    with pdfplumber.open(pdf_path) as pdf:
        for page_no, page in enumerate(pdf.pages):
            print(f"-- page {page_no+1}", file=sys.stderr)
            tables = page.extract_tables()
            for ti, table in enumerate(tables):
                if not table:
                    continue
                for row_i, row in enumerate(table):
                    if not row or len(row) < 2:
                        continue
                    left_cell = (row[0] or "").strip()
                    # Detect dept; if not found, may be a continuation row → reuse current_dept
                    dept_slug = detect_dept(left_cell)
                    if left_cell and "แผนก" in normalize_thai(left_cell)[:6] and not dept_slug:
                        # Header row (column labels)
                        if "W1" in (row[1] or "")[:5]:
                            continue
                    if dept_slug:
                        current_dept = dept_slug
                        print(f"   row{row_i:2d}: dept={dept_slug} (from {left_cell[:40]!r})", file=sys.stderr)
                    elif not left_cell and current_dept:
                        # continuation row
                        print(f"   row{row_i:2d}: continuation of {current_dept}", file=sys.stderr)
                    else:
                        # unmatched
                        if left_cell:
                            print(f"   row{row_i:2d}: UNMATCHED left={left_cell[:50]!r}", file=sys.stderr)
                        continue
                    if not current_dept:
                        continue
                    # Cells row[1]..row[14] are W1..W14
                    for col_i in range(1, min(15, len(row))):
                        week = col_i
                        cell_text = (row[col_i] or "").strip()
                        if not cell_text:
                            continue
                        students = parse_cell(cell_text)
                        grid[current_dept][week].extend(students)
    return dict(grid)


def emit_sql(grid: dict[str, dict[int, list[dict]]], year_id: int = 2569) -> str:
    """Build DELETE + INSERT SQL for the parsed grid (transactional)."""
    rows = []
    total = 0
    students = set()
    rank_default = "manual"
    source_default = "verified-self-report"  # PDF FINAL is hand-verified
    for dept_slug, weeks in grid.items():
        for week, students_in_cell in weeks.items():
            for s in students_in_cell:
                nick_sql = s["nickname"].replace("'", "''")
                note = s.get("days_note")
                note_sql = (
                    "NULL" if not note
                    else "'imported from FINAL grid PDF — " + note.replace("'", "''") + "'"
                )
                rows.append(
                    f"  (gen_random_uuid(), {year_id}, '{dept_slug}', {week}, "
                    f"'{s['short_id']}', '{nick_sql}', NULL, {s['student_year']}, "
                    f"{s['days_practiced']}, '{rank_default}', '{source_default}', {note_sql})"
                )
                total += 1
                students.add((s["short_id"], s["nickname"], s["student_year"]))
    if not rows:
        return "-- no rows parsed"
    out = []
    out.append("-- Phase 12 full re-sync · parsed from ตารางรายแผนก_FINAL.pdf (5/19) — AUTHORITATIVE")
    out.append("BEGIN;")
    out.append(f"DELETE FROM public.vettobe_assignments WHERE year_id = {year_id};")
    out.append("")
    out.append("INSERT INTO public.vettobe_assignments")
    out.append("  (id, year_id, dept_slug, week, short_id, nickname, full_name, student_year, days_practiced, rank, source, notes)")
    out.append("VALUES")
    out.append(",\n".join(rows) + ";")
    out.append("")
    out.append(f"UPDATE public.vettobe_years SET total_slots = {total}, unique_students = {len(students)}, updated_at = now() WHERE id = {year_id};")
    out.append("COMMIT;")
    return "\n".join(out)


def main():
    if not PDF.exists():
        print(f"PDF not found: {PDF}", file=sys.stderr)
        sys.exit(1)

    grid = extract_grid(PDF)

    total_slots = 0
    total_students = set()
    print("\n-- Per-dept tally:", file=sys.stderr)
    for slug in sorted(grid.keys()):
        weeks = grid[slug]
        ct = sum(len(v) for v in weeks.values())
        total_slots += ct
        for v in weeks.values():
            for s in v:
                total_students.add((s["short_id"], s["nickname"], s["student_year"]))
        print(f"   {slug:24s} {ct:3d} slots", file=sys.stderr)

    print(f"\n-- TOTAL: {total_slots} slots · {len(total_students)} unique students", file=sys.stderr)

    out_json = Path(__file__).parent / "final-grid-parsed.json"
    out_json.write_text(json.dumps(grid, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"wrote {out_json}", file=sys.stderr)

    out_sql = Path(__file__).parent / "final-grid-seed.sql"
    out_sql.write_text(emit_sql(grid), encoding="utf-8")
    print(f"wrote {out_sql} ({out_sql.stat().st_size:,} bytes)", file=sys.stderr)


if __name__ == "__main__":
    main()
