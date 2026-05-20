"use client";

import { useState, useEffect } from "react";
import { getSupabaseBrowser } from "@/lib/supabase";
import type { Assignment } from "@/lib/types";

type Dept = { slug: string; name_th: string; short_th: string | null };

const RANK_OPTIONS = ["rank-1", "rank-2", "rank-3", "fill", "random", "manual"];

export function AssignmentEditPanel({
  yearId,
  onSaved,
}: {
  yearId: number;
  onSaved?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<Assignment[]>([]);
  const [depts, setDepts] = useState<Dept[]>([]);
  const [editing, setEditing] = useState<Assignment | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!open) return;
    const sb = getSupabaseBrowser();
    if (!sb) return;
    Promise.all([
      sb.from("vettobe_assignments").select("*").eq("year_id", yearId).order("dept_slug").order("week"),
      sb.from("vettobe_departments").select("slug, name_th, short_th").order("slug"),
    ]).then(([a, d]) => {
      if (a.data) setRows(a.data as Assignment[]);
      if (d.data) setDepts(d.data as Dept[]);
    });
  }, [open, yearId]);

  const filtered = search.trim()
    ? rows.filter((r) => {
        const q = search.toLowerCase();
        return (
          r.nickname.toLowerCase().includes(q) ||
          r.short_id.includes(q) ||
          (r.full_name && r.full_name.toLowerCase().includes(q)) ||
          r.dept_slug.includes(q)
        );
      })
    : rows.slice(0, 50);

  const save = async () => {
    if (!editing) return;
    const sb = getSupabaseBrowser();
    if (!sb) return;
    setSaving(true);
    const { error } = await sb.rpc("update_vettobe_assignment", {
      p_id: editing.id,
      p_dept_slug: editing.dept_slug,
      p_week: editing.week,
      p_days_practiced: editing.days_practiced,
      p_rank: editing.rank,
      p_notes: editing.notes ?? "",
    });
    setSaving(false);
    if (error) {
      setMsg(`❌ ${error.message}`);
    } else {
      setMsg("✓ saved");
      // refresh local
      setRows((rs) => rs.map((r) => (r.id === editing.id ? editing : r)));
      setEditing(null);
      onSaved?.();
      setTimeout(() => setMsg(""), 2500);
    }
  };

  const del = async () => {
    if (!editing) return;
    if (!confirm(`ลบ ${editing.nickname} #${editing.short_id} (${editing.dept_slug} W${editing.week}) ?`)) return;
    const sb = getSupabaseBrowser();
    if (!sb) return;
    setSaving(true);
    const { error } = await sb.rpc("delete_vettobe_assignment", { p_id: editing.id });
    setSaving(false);
    if (error) {
      setMsg(`❌ ${error.message}`);
    } else {
      setRows((rs) => rs.filter((r) => r.id !== editing.id));
      setEditing(null);
      setMsg("✓ deleted");
      onSaved?.();
      setTimeout(() => setMsg(""), 2500);
    }
  };

  return (
    <details
      className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-4"
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
    >
      <summary className="font-medium cursor-pointer">
        ✏️ Inline edit assignments ({rows.length} rows in {yearId})
      </summary>
      <div className="mt-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้น nickname / รหัส / dept slug"
          className="w-full bg-[var(--color-bg)] border border-[var(--color-border-strong)] rounded px-3 py-2 mb-3"
        />

        <div className="max-h-96 overflow-y-auto border border-[var(--color-border)] rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-surface-strong)] text-xs text-[var(--color-ink-muted)]">
              <tr>
                <th className="text-left px-2 py-1.5">W</th>
                <th className="text-left px-2 py-1.5">Dept</th>
                <th className="text-left px-2 py-1.5">Student</th>
                <th className="text-left px-2 py-1.5">Days</th>
                <th className="text-left px-2 py-1.5">Rank</th>
                <th className="text-left px-2 py-1.5"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-[var(--color-border)] hover:bg-[var(--color-surface-lift)]">
                  <td className="px-2 py-1 font-mono text-xs">W{r.week}</td>
                  <td className="px-2 py-1 text-xs">{r.dept_slug}</td>
                  <td className="px-2 py-1">
                    <strong>{r.nickname}</strong>
                    <span className="text-[var(--color-ink-faint)] ml-1 text-xs">#{r.short_id}</span>
                  </td>
                  <td className="px-2 py-1 text-xs">{r.days_practiced}</td>
                  <td className="px-2 py-1 text-xs">{r.rank}</td>
                  <td className="px-2 py-1 text-right">
                    <button
                      onClick={() => setEditing(r)}
                      className="text-[var(--color-accent)] hover:text-[var(--color-accent-strong)] text-xs font-medium"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length > 50 && search.trim() === "" && (
            <p className="text-xs text-[var(--color-ink-faint)] text-center p-2">
              แสดง 50 จาก {rows.length} · พิมพ์ในช่องค้นหาเพื่อกรอง
            </p>
          )}
        </div>

        {msg && (
          <p className={`mt-2 text-sm ${msg.startsWith("✓") ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}>
            {msg}
          </p>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setEditing(null)}>
          <div
            className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border-strong)] max-w-md w-full p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-baseline justify-between mb-3">
              <h3 className="font-serif text-lg font-semibold">Edit assignment</h3>
              <button onClick={() => setEditing(null)} className="text-[var(--color-ink-faint)] hover:text-[var(--color-ink)]">
                ✕
              </button>
            </div>
            <p className="text-sm text-[var(--color-ink-muted)] mb-3">
              <strong>{editing.nickname}</strong>{" "}
              <span className="text-[var(--color-ink-faint)]">#{editing.short_id} · ปี {editing.student_year}</span>
              <span className="block text-xs text-[var(--color-ink-faint)] mt-0.5">{editing.full_name}</span>
            </p>
            <div className="grid gap-3">
              <label className="block">
                <span className="text-sm font-medium block mb-1">แผนก</span>
                <select
                  value={editing.dept_slug}
                  onChange={(e) => setEditing({ ...editing, dept_slug: e.target.value })}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border-strong)] rounded px-3 py-2"
                >
                  {depts.map((d) => (
                    <option key={d.slug} value={d.slug}>
                      {d.short_th ?? d.name_th} ({d.slug})
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <label className="block">
                  <span className="text-sm font-medium block mb-1">Week</span>
                  <input
                    type="number"
                    min={1}
                    max={14}
                    value={editing.week}
                    onChange={(e) => setEditing({ ...editing, week: Number(e.target.value) })}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border-strong)] rounded px-3 py-2"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium block mb-1">Days</span>
                  <input
                    type="number"
                    min={1}
                    max={14}
                    value={editing.days_practiced}
                    onChange={(e) => setEditing({ ...editing, days_practiced: Number(e.target.value) })}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border-strong)] rounded px-3 py-2"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium block mb-1">Rank</span>
                  <select
                    value={editing.rank}
                    onChange={(e) => setEditing({ ...editing, rank: e.target.value as Assignment["rank"] })}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border-strong)] rounded px-3 py-2"
                  >
                    {RANK_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="block">
                <span className="text-sm font-medium block mb-1">Notes</span>
                <input
                  type="text"
                  value={editing.notes ?? ""}
                  onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border-strong)] rounded px-3 py-2"
                />
              </label>
              <div className="flex items-center justify-between gap-2 mt-2">
                <button
                  onClick={del}
                  disabled={saving}
                  className="text-sm text-[var(--color-danger)] hover:underline disabled:opacity-50"
                >
                  ลบ row
                </button>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(null)} className="text-sm text-[var(--color-ink-muted)] px-3 py-1.5">
                    ยกเลิก
                  </button>
                  <button
                    onClick={save}
                    disabled={saving}
                    className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-strong)] !text-white px-4 py-1.5 rounded text-sm font-medium disabled:opacity-50"
                  >
                    {saving ? "บันทึก..." : "บันทึก"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </details>
  );
}
