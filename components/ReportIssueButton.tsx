"use client";

import { useState, useEffect } from "react";
import { getSupabaseBrowser } from "@/lib/supabase";

const ISSUE_TYPES = [
  { v: "wrong-week", label: "ผิดสัปดาห์" },
  { v: "wrong-dept", label: "ผิดแผนก" },
  { v: "wrong-days", label: "จำนวนวันผิด" },
  { v: "wrong-rank", label: "อันดับผิด (1/2/3/เติม/สุ่ม)" },
  { v: "name-spelling", label: "สะกดชื่อผิด" },
  { v: "missing", label: "ผมเคยฝึก แต่ไม่อยู่ในระบบ" },
  { v: "duplicate", label: "ขึ้นซ้ำ" },
  { v: "other", label: "อื่นๆ" },
];

export function ReportIssueButton({
  yearId,
  deptSlug,
  assignmentId,
}: {
  yearId: number;
  deptSlug: string;
  assignmentId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [issueType, setIssueType] = useState("wrong-week");
  const [description, setDescription] = useState("");
  const [suggestedFix, setSuggestedFix] = useState("");
  const [email, setEmail] = useState("");
  const [authed, setAuthed] = useState<{ email: string; uid: string } | null>(null);
  const [status, setStatus] = useState<"" | "loading" | "ok" | "err">("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!open) return;
    const sb = getSupabaseBrowser();
    if (!sb) return;
    sb.auth.getSession().then(({ data }) => {
      if (data.session) setAuthed({ email: data.session.user.email ?? "", uid: data.session.user.id });
    });
  }, [open]);

  const submit = async () => {
    const sb = getSupabaseBrowser();
    if (!sb) return;
    setStatus("loading");
    if (!authed) {
      // First step: send magic link with redirect back to this page
      const { error } = await sb.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}${window.location.pathname}` },
      });
      if (error) {
        setStatus("err");
        setMsg(error.message);
      } else {
        setStatus("ok");
        setMsg(`ส่ง magic link ไปที่ ${email} แล้ว · เปิดอีเมล กลับมาที่หน้านี้แล้วกดส่งใหม่อีกครั้ง`);
      }
      return;
    }
    const { error } = await sb.from("vettobe_issue_reports").insert({
      year_id: yearId,
      dept_slug: deptSlug,
      assignment_id: assignmentId ?? null,
      reported_by: authed.uid,
      reporter_email: authed.email,
      issue_type: issueType,
      description: description.trim(),
      suggested_fix: suggestedFix.trim() || null,
    });
    if (error) {
      setStatus("err");
      setMsg(error.message);
    } else {
      setStatus("ok");
      setMsg("ขอบคุณครับ · ทีมหัวปีจะตรวจสอบ");
      setDescription("");
      setSuggestedFix("");
      setTimeout(() => setOpen(false), 2500);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-xs text-[var(--color-ink-faint)] hover:text-[var(--color-accent)] underline-offset-2 hover:underline transition-colors"
      >
        🚩 รายงานข้อมูลผิดในแผนกนี้
      </button>

      {open && (
        <div className="mt-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4">
          <h3 className="font-serif font-semibold mb-3">รายงานข้อมูลที่ไม่ถูกต้อง</h3>

          {!authed && (
            <div className="mb-3 bg-[var(--color-accent-soft)]/30 rounded-lg px-3 py-2 text-xs text-[var(--color-ink-muted)]">
              ต้อง login ก่อน · ใส่ email แล้วรอ magic link
            </div>
          )}

          <div className="grid gap-3">
            {!authed && (
              <label className="block">
                <span className="text-sm font-medium block mb-1">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.name@student.chula.ac.th"
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border-strong)] rounded px-3 py-2"
                />
              </label>
            )}

            <label className="block">
              <span className="text-sm font-medium block mb-1">ประเภทปัญหา</span>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border-strong)] rounded px-3 py-2"
              >
                {ISSUE_TYPES.map((t) => (
                  <option key={t.v} value={t.v}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium block mb-1">อธิบายปัญหา</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="เช่น 'แบม #032 ฝึกอายุร W3 ไม่ใช่ ไต W2'"
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border-strong)] rounded px-3 py-2 resize-y"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium block mb-1">
                แก้เป็นอะไร <span className="text-xs text-[var(--color-ink-faint)]">(optional)</span>
              </span>
              <input
                type="text"
                value={suggestedFix}
                onChange={(e) => setSuggestedFix(e.target.value)}
                placeholder="เช่น 'ย้ายไปอายุร W3 5 วัน'"
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border-strong)] rounded px-3 py-2"
              />
            </label>

            <div className="flex items-center justify-between flex-wrap gap-2">
              <button
                onClick={submit}
                disabled={status === "loading" || (!authed && !email) || (!!authed && !description)}
                className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-strong)] !text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {status === "loading" ? "กำลังส่ง..." : !authed ? "ส่ง magic link" : "ส่งรายงาน"}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="text-sm text-[var(--color-ink-faint)] hover:text-[var(--color-ink-muted)]"
              >
                ยกเลิก
              </button>
            </div>

            {msg && (
              <p
                className={`text-sm ${status === "err" ? "text-[var(--color-danger)]" : "text-[var(--color-success)]"}`}
              >
                {msg}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
