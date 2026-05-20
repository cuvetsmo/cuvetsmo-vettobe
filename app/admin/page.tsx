"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase";
import { CsvImporter } from "@/components/CsvImporter";
import { AssignmentEditPanel } from "@/components/AssignmentEditPanel";

type YearRow = {
  id: number;
  name: string;
  total_slots: number;
  unique_students: number;
  status: string;
  data_confidence: string;
  start_date?: string;
  end_date?: string;
};

type IssueRow = {
  id: string;
  year_id: number;
  dept_slug: string;
  issue_type: string;
  description: string;
  suggested_fix: string | null;
  status: string;
  created_at: string;
  reporter_email: string | null;
};

const STATUS_OPTIONS = ["planning", "active", "archive"];
const ISSUE_STATUS_OPTIONS = ["open", "in-review", "fixed", "rejected", "duplicate"];

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [authed, setAuthed] = useState<{ email: string; uid: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [years, setYears] = useState<YearRow[]>([]);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [issues, setIssues] = useState<IssueRow[]>([]);
  const [magicStatus, setMagicStatus] = useState<"" | "loading" | "sent" | "err">("");
  const [msg, setMsg] = useState("");
  const [claimStatus, setClaimStatus] = useState<"" | "loading" | "ok" | "denied" | "err">("");

  // Year creation form state
  const [newYearId, setNewYearId] = useState<number>(2570);
  const [newYearName, setNewYearName] = useState("Vet to be 2570 (2027)");
  const [newYearStart, setNewYearStart] = useState("2027-05-14");
  const [newYearEnd, setNewYearEnd] = useState("2027-12-30");
  const [creatingYear, setCreatingYear] = useState(false);

  useEffect(() => {
    const sb = getSupabaseBrowser();
    if (!sb) return;
    sb.auth.getSession().then(({ data }) => {
      if (data.session) setAuthed({ email: data.session.user.email ?? "", uid: data.session.user.id });
    });
    const { data: sub } = sb.auth.onAuthStateChange((_, session) => {
      if (session) setAuthed({ email: session.user.email ?? "", uid: session.user.id });
      else setAuthed(null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const reload = useCallback(async () => {
    const sb = getSupabaseBrowser();
    if (!sb || !authed) return;
    const [yr, rv, iss] = await Promise.all([
      sb.from("vettobe_years").select("*").order("id", { ascending: false }),
      sb.from("vettobe_reviews").select("*", { count: "exact", head: true }),
      sb
        .from("vettobe_issue_reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50),
    ]);
    if (yr.data) setYears(yr.data as YearRow[]);
    setReviewCount(rv.count ?? 0);
    if (iss.data) setIssues(iss.data as IssueRow[]);
  }, [authed]);

  useEffect(() => {
    if (!authed) return;
    const sb = getSupabaseBrowser();
    if (!sb) return;
    sb.rpc("is_vettobe_admin").then(({ data }) => {
      setIsAdmin(Boolean(data));
      if (data) reload();
    });
  }, [authed, reload]);

  const sendMagic = async () => {
    const sb = getSupabaseBrowser();
    if (!sb) return setMsg("Supabase not configured");
    setMagicStatus("loading");
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/admin` },
    });
    if (error) {
      setMagicStatus("err");
      setMsg(error.message);
    } else {
      setMagicStatus("sent");
      setMsg(`ส่ง magic link ไปที่ ${email}`);
    }
  };

  const claimAdmin = async () => {
    const sb = getSupabaseBrowser();
    if (!sb) return;
    setClaimStatus("loading");
    const { data, error } = await sb.rpc("claim_vettobe_admin");
    if (error) {
      setClaimStatus("err");
      setMsg(error.message);
    } else if (data === true) {
      setClaimStatus("ok");
      setIsAdmin(true);
      reload();
    } else {
      setClaimStatus("denied");
    }
  };

  const setStatus = async (yearId: number, status: string) => {
    const sb = getSupabaseBrowser();
    if (!sb) return;
    await sb.rpc("set_vettobe_year_status", { p_year_id: yearId, p_status: status });
    reload();
  };

  const resolveIssue = async (issueId: string, status: string, note: string) => {
    const sb = getSupabaseBrowser();
    if (!sb) return;
    await sb.rpc("resolve_vettobe_issue", {
      p_issue_id: issueId,
      p_status: status,
      p_resolution_note: note,
    });
    reload();
  };

  const createYear = async () => {
    const sb = getSupabaseBrowser();
    if (!sb) return;
    setCreatingYear(true);
    const { error } = await sb.rpc("create_vettobe_year", {
      p_id: newYearId,
      p_name: newYearName,
      p_start_date: newYearStart,
      p_end_date: newYearEnd,
      p_status: "planning",
    });
    setCreatingYear(false);
    if (error) {
      setMsg(error.message);
    } else {
      setMsg(`สร้างปี ${newYearId} เรียบร้อย`);
      reload();
    }
  };

  if (!authed) {
    return (
      <Login email={email} setEmail={setEmail} magicStatus={magicStatus} sendMagic={sendMagic} msg={msg} />
    );
  }

  if (isAdmin === null) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12 text-center text-[var(--color-ink-muted)]">
        กำลังตรวจสอบสิทธิ์...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-serif font-semibold mb-3">🔒 ไม่มีสิทธิ์เข้า /admin</h1>
        <p className="text-[var(--color-ink-muted)] mb-4">
          คุณ login ในชื่อ <strong>{authed.email}</strong>{" "}
          แต่ยังไม่อยู่ในตาราง <code>vettobe_admins</code>
        </p>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
          <p className="text-sm mb-3">
            ถ้าคุณคือ Palm (ผู้ดูแลโครงการ) กดปุ่มข้างล่างเพื่อ self-promote — ระบบจะ
            verify email กับ allowlist ภายใน
          </p>
          <button
            onClick={claimAdmin}
            disabled={claimStatus === "loading"}
            className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-strong)] !text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
          >
            {claimStatus === "loading" ? "กำลังตรวจสอบ..." : "Claim admin spot"}
          </button>
          {claimStatus === "denied" && (
            <p className="mt-3 text-sm text-[var(--color-danger)]">
              email ของคุณไม่อยู่ใน bootstrap allowlist · ติดต่อ Palm ให้เพิ่ม uid ของคุณ
            </p>
          )}
          {claimStatus === "err" && (
            <p className="mt-3 text-sm text-[var(--color-danger)]">{msg}</p>
          )}
        </div>
        <p className="mt-4 text-sm text-[var(--color-ink-faint)]">
          <Link href="/">← กลับหน้าหลัก</Link>
        </p>
      </div>
    );
  }

  const openIssues = issues.filter((i) => i.status === "open" || i.status === "in-review");

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <div className="flex items-baseline justify-between flex-wrap gap-3 mb-6">
        <h1 className="text-3xl font-serif font-semibold">🛠️ Admin Console</h1>
        <span className="text-sm text-[var(--color-ink-muted)]">
          {authed.email} · admin ·{" "}
          <button
            onClick={async () => {
              const sb = getSupabaseBrowser();
              await sb?.auth.signOut();
            }}
            className="underline hover:text-[var(--color-ink)]"
          >
            ออกจากระบบ
          </button>
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-4">
        <Stat label="ปีที่บันทึก" value={String(years.length)} />
        <Stat label="Slots ทั้งหมด" value={String(years.reduce((s, y) => s + (y.total_slots ?? 0), 0))} />
        <Stat label="รีวิวรวม" value={String(reviewCount)} />
        <Stat label="Issue ค้าง" value={String(openIssues.length)} />
      </div>

      <div className="mb-8">
        <Link
          href="/admin/audit"
          prefetch={false}
          className="inline-flex items-center gap-2 text-sm bg-[var(--color-surface)] hover:bg-[var(--color-surface-lift)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] !text-[var(--color-ink)] px-3 py-2 rounded-lg transition-colors"
        >
          🔍 Data audit (capacity overflow)
        </Link>
      </div>

      {/* Years management */}
      <section className="mb-10">
        <h2 className="text-xl font-serif font-semibold mb-3">จัดการปี</h2>
        <div className="space-y-2 mb-4">
          {years.map((y) => (
            <div
              key={y.id}
              className="flex items-center justify-between gap-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-4 py-3 flex-wrap"
            >
              <div className="min-w-0">
                <div className="font-serif text-lg font-semibold text-[var(--color-ink)]">{y.id}</div>
                <div className="text-xs text-[var(--color-ink-muted)]">{y.name}</div>
              </div>
              <div className="flex items-center gap-3 text-sm flex-wrap">
                <span className="text-[var(--color-ink-muted)]">{y.total_slots} slots</span>
                <span className="text-[var(--color-ink-muted)]">{y.unique_students} นิสิต</span>
                <select
                  value={y.status}
                  onChange={(e) => setStatus(y.id, e.target.value)}
                  className="bg-[var(--color-bg)] border border-[var(--color-border-strong)] rounded px-2 py-1 text-xs"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>

        <details className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-4">
          <summary className="font-medium cursor-pointer">+ สร้างปีใหม่</summary>
          <div className="grid gap-3 sm:grid-cols-2 mt-4">
            <label className="block">
              <span className="text-sm font-medium block mb-1">ID (พ.ศ.)</span>
              <input
                type="number"
                value={newYearId}
                onChange={(e) => setNewYearId(Number(e.target.value))}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border-strong)] rounded px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium block mb-1">ชื่อเต็ม</span>
              <input
                value={newYearName}
                onChange={(e) => setNewYearName(e.target.value)}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border-strong)] rounded px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium block mb-1">เริ่ม</span>
              <input
                type="date"
                value={newYearStart}
                onChange={(e) => setNewYearStart(e.target.value)}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border-strong)] rounded px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium block mb-1">จบ</span>
              <input
                type="date"
                value={newYearEnd}
                onChange={(e) => setNewYearEnd(e.target.value)}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border-strong)] rounded px-3 py-2"
              />
            </label>
          </div>
          <button
            onClick={createYear}
            disabled={creatingYear || !newYearId || !newYearName}
            className="mt-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent-strong)] !text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {creatingYear ? "กำลังสร้าง..." : "สร้างปี (status = planning)"}
          </button>
          {msg && <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{msg}</p>}
        </details>
      </section>

      {/* Issue queue */}
      <section className="mb-10">
        <h2 className="text-xl font-serif font-semibold mb-3">
          Issue queue{" "}
          {openIssues.length > 0 && (
            <span className="text-base text-[var(--color-ink-muted)] font-normal">({openIssues.length} open)</span>
          )}
        </h2>
        {issues.length === 0 ? (
          <p className="text-sm text-[var(--color-ink-muted)]">ยังไม่มี issue · 🙌</p>
        ) : (
          <ul className="space-y-2">
            {issues.map((it) => (
              <IssueCard key={it.id} issue={it} onResolve={resolveIssue} />
            ))}
          </ul>
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-serif font-semibold mb-3">Inline edit (per year)</h2>
        <div className="space-y-2">
          {years.map((y) => (
            <AssignmentEditPanel key={y.id} yearId={y.id} onSaved={reload} />
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-serif font-semibold mb-3">Bulk import</h2>
        <CsvImporter />
      </section>

      <section>
        <h2 className="text-xl font-serif font-semibold mb-3">🚧 Coming next</h2>
        <ul className="grid gap-2 sm:grid-cols-2 text-sm">
          <li className="bg-[var(--color-surface-lift)] rounded-lg p-3">
            <strong className="block text-[var(--color-ink)]">Form intake integration</strong>
            <span className="text-[var(--color-ink-muted)]">connect Google Forms for next-year auto-sync</span>
          </li>
          <li className="bg-[var(--color-surface-lift)] rounded-lg p-3">
            <strong className="block text-[var(--color-ink)]">Email notify on issue resolved</strong>
            <span className="text-[var(--color-ink-muted)]">Supabase Edge Function + Resend</span>
          </li>
        </ul>
      </section>
    </div>
  );
}

function IssueCard({
  issue,
  onResolve,
}: {
  issue: IssueRow;
  onResolve: (id: string, status: string, note: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(issue.status);
  const [note, setNote] = useState("");
  const isResolved = !["open", "in-review"].includes(issue.status);

  return (
    <li className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-3 ${isResolved ? "opacity-60" : ""}`}>
      <div className="flex items-baseline gap-2 flex-wrap text-sm">
        <Link
          href={`/years/${issue.year_id}/depts/${issue.dept_slug}`}
          className="font-mono text-xs bg-[var(--color-surface-strong)] px-2 py-0.5 rounded hover:bg-[var(--color-surface-lift)]"
        >
          {issue.year_id} · {issue.dept_slug}
        </Link>
        <span className="text-xs px-2 py-0.5 rounded chip-rank-3">{issue.issue_type}</span>
        <span className={`text-xs px-2 py-0.5 rounded ${isResolved ? "chip-rank-1" : "chip-rank-2"}`}>{issue.status}</span>
        <span className="text-xs text-[var(--color-ink-faint)]">
          {new Date(issue.created_at).toLocaleString("th-TH")}
        </span>
        <button
          onClick={() => setOpen((v) => !v)}
          className="ml-auto text-xs text-[var(--color-accent)] hover:text-[var(--color-accent-strong)]"
        >
          {open ? "ปิด" : "จัดการ"}
        </button>
      </div>
      <p className="mt-1.5 text-sm text-[var(--color-ink-muted)] whitespace-pre-line">{issue.description}</p>
      {issue.suggested_fix && (
        <p className="mt-1 text-xs text-[var(--color-ink-faint)] italic">→ {issue.suggested_fix}</p>
      )}
      {open && !isResolved && (
        <div className="mt-3 pt-3 border-t border-[var(--color-border)] grid gap-2">
          <div className="flex items-center gap-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-[var(--color-bg)] border border-[var(--color-border-strong)] rounded px-2 py-1 text-sm"
            >
              {ISSUE_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="resolution note (optional)"
              className="flex-1 bg-[var(--color-bg)] border border-[var(--color-border-strong)] rounded px-2 py-1 text-sm"
            />
            <button
              onClick={() => onResolve(issue.id, status, note)}
              className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-strong)] !text-white px-3 py-1 rounded text-sm font-medium"
            >
              บันทึก
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

function Login({
  email,
  setEmail,
  magicStatus,
  sendMagic,
  msg,
}: {
  email: string;
  setEmail: (s: string) => void;
  magicStatus: string;
  sendMagic: () => void;
  msg: string;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-serif font-semibold mb-3">🔐 Admin Console</h1>
      <p className="text-[var(--color-ink-muted)] mb-6">
        เฉพาะทีมหัวปี · login ด้วย email ที่ลงทะเบียนไว้
      </p>
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
        <div className="flex gap-2 flex-wrap">
          <input
            type="email"
            placeholder="your.name@student.chula.ac.th"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 min-w-[220px] bg-[var(--color-bg)] border border-[var(--color-border-strong)] rounded-lg px-3 py-2 outline-none focus:border-[var(--color-accent)]"
          />
          <button
            onClick={sendMagic}
            disabled={!email || magicStatus === "loading"}
            className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-strong)] !text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
          >
            ส่ง magic link
          </button>
        </div>
        {msg && (
          <p
            className={`mt-3 text-sm ${magicStatus === "err" ? "text-[var(--color-danger)]" : "text-[var(--color-success)]"}`}
          >
            {msg}
          </p>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-4 py-3">
      <div className="text-xs uppercase tracking-wide text-[var(--color-ink-faint)] mb-0.5">{label}</div>
      <div className="font-serif text-2xl font-semibold text-[var(--color-ink)]">{value}</div>
    </div>
  );
}
