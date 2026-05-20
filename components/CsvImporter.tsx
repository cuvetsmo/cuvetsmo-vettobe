"use client";

import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase";

type Row = {
  year_id: number;
  dept_slug: string;
  week: number;
  short_id: string;
  nickname: string;
  full_name?: string;
  student_year: number;
  days_practiced?: number;
  rank?: string;
  source?: string;
  notes?: string;
};

const REQUIRED = ["year_id", "dept_slug", "week", "short_id", "nickname", "student_year"];

function parseCsv(text: string): { rows: Row[]; errors: string[] } {
  const lines = text.replace(/^﻿/, "").split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return { rows: [], errors: ["empty or header-only file"] };
  // Detect delimiter: tab if first line has tabs, else comma
  const delim = lines[0].includes("\t") ? "\t" : ",";
  const headers = lines[0].split(delim).map((h) => h.trim().replace(/^"|"$/g, ""));
  const missing = REQUIRED.filter((r) => !headers.includes(r));
  if (missing.length > 0) {
    return { rows: [], errors: [`missing required columns: ${missing.join(", ")}`] };
  }
  const rows: Row[] = [];
  const errors: string[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(delim).map((c) => c.trim().replace(/^"|"$/g, ""));
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => (obj[h] = cells[idx] ?? ""));
    try {
      const yr = Number(obj.year_id);
      const wk = Number(obj.week);
      const sy = Number(obj.student_year);
      if (!Number.isFinite(yr) || !Number.isFinite(wk) || !Number.isFinite(sy)) {
        throw new Error("year_id/week/student_year must be numbers");
      }
      if (wk < 1 || wk > 14) throw new Error("week out of range 1-14");
      if (!obj.dept_slug || !obj.short_id || !obj.nickname) throw new Error("missing required text fields");
      rows.push({
        year_id: yr,
        dept_slug: obj.dept_slug,
        week: wk,
        short_id: obj.short_id.padStart(3, "0"),
        nickname: obj.nickname,
        full_name: obj.full_name || undefined,
        student_year: sy,
        days_practiced: obj.days_practiced ? Number(obj.days_practiced) : undefined,
        rank: obj.rank || undefined,
        source: obj.source || undefined,
        notes: obj.notes || undefined,
      });
    } catch (e: unknown) {
      errors.push(`row ${i + 1}: ${(e as Error).message}`);
    }
  }
  return { rows, errors };
}

export function CsvImporter() {
  const [text, setText] = useState("");
  const [parseResult, setParseResult] = useState<{ rows: Row[]; errors: string[] } | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<string>("");

  const onFile = (f: File | undefined) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const t = String(reader.result || "");
      setText(t);
      setParseResult(parseCsv(t));
    };
    reader.readAsText(f, "utf-8");
  };

  const doImport = async () => {
    if (!parseResult || parseResult.rows.length === 0) return;
    const sb = getSupabaseBrowser();
    if (!sb) return;
    setImporting(true);
    const { data, error } = await sb.rpc("bulk_insert_vettobe_assignments", {
      p_rows: parseResult.rows,
    });
    setImporting(false);
    if (error) {
      setResult(`❌ ${error.message}`);
    } else {
      setResult(`✓ inserted ${data} rows`);
      setText("");
      setParseResult(null);
    }
  };

  return (
    <details className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-4">
      <summary className="font-medium cursor-pointer">📥 CSV bulk import</summary>
      <div className="mt-3 grid gap-3">
        <p className="text-xs text-[var(--color-ink-muted)]">
          Required headers: <code className="text-[var(--color-ink)]">year_id, dept_slug, week, short_id, nickname, student_year</code>
          {" · "}Optional: <code>full_name, days_practiced, rank, source, notes</code>{" · "}
          delimiter: tab or comma · year must already exist
        </p>
        <div className="grid gap-2">
          <input
            type="file"
            accept=".csv,.tsv,text/csv,text/tab-separated-values"
            onChange={(e) => onFile(e.target.files?.[0])}
            className="text-sm"
          />
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setParseResult(parseCsv(e.target.value));
            }}
            placeholder="หรือ paste CSV/TSV ตรงนี้..."
            rows={6}
            className="w-full bg-[var(--color-bg)] border border-[var(--color-border-strong)] rounded px-3 py-2 font-mono text-xs"
          />
        </div>
        {parseResult && (
          <div className="text-sm">
            <p className="text-[var(--color-ink-muted)]">
              parsed <strong className="text-[var(--color-ink)]">{parseResult.rows.length}</strong> rows
              {parseResult.errors.length > 0 && (
                <span className="text-[var(--color-warning)]">
                  {" · "}{parseResult.errors.length} errors
                </span>
              )}
            </p>
            {parseResult.errors.length > 0 && (
              <ul className="mt-1 text-xs text-[var(--color-warning)] space-y-0.5 max-h-32 overflow-y-auto">
                {parseResult.errors.slice(0, 10).map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
                {parseResult.errors.length > 10 && (
                  <li>...and {parseResult.errors.length - 10} more</li>
                )}
              </ul>
            )}
          </div>
        )}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <button
            onClick={doImport}
            disabled={!parseResult?.rows.length || importing}
            className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-strong)] !text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {importing ? "กำลัง import..." : `Import ${parseResult?.rows.length ?? 0} rows`}
          </button>
          {result && (
            <span className={`text-sm ${result.startsWith("✓") ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}>
              {result}
            </span>
          )}
        </div>
      </div>
    </details>
  );
}
