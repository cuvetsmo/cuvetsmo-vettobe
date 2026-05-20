"use client";

import { useState, useEffect } from "react";
import { getSupabaseBrowser } from "@/lib/supabase";

type YearRow = {
  id: number;
  name: string;
  total_slots: number;
  unique_students: number;
  status: string;
  data_confidence: string;
};

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [authed, setAuthed] = useState<{ email: string; uid: string } | null>(null);
  const [years, setYears] = useState<YearRow[]>([]);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [magicStatus, setMagicStatus] = useState<"" | "loading" | "sent" | "err">("");
  const [msg, setMsg] = useState("");

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

  useEffect(() => {
    if (!authed) return;
    const sb = getSupabaseBrowser();
    if (!sb) return;
    sb.from("vettobe_years").select("*").order("id", { ascending: false }).then(({ data }) => {
      if (data) setYears(data as YearRow[]);
    });
    sb.from("vettobe_reviews").select("*", { count: "exact", head: true }).then(({ count }) => {
      setReviewCount(count ?? 0);
    });
  }, [authed]);

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

  if (!authed) {
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
            <p className={`mt-3 text-sm ${magicStatus === "err" ? "text-[var(--color-danger)]" : "text-[var(--color-success)]"}`}>
              {msg}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <div className="flex items-baseline justify-between flex-wrap gap-3 mb-6">
        <h1 className="text-3xl font-serif font-semibold">🛠️ Admin Console</h1>
        <span className="text-sm text-[var(--color-ink-muted)]">
          {authed.email} ·{" "}
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

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Stat label="ปีที่บันทึก" value={String(years.length)} />
        <Stat
          label="Slots ทั้งหมด"
          value={String(years.reduce((s, y) => s + (y.total_slots ?? 0), 0))}
        />
        <Stat label="รีวิวรวม" value={String(reviewCount)} />
      </div>

      <section className="mb-10">
        <h2 className="text-xl font-serif font-semibold mb-3">ปีทั้งหมด</h2>
        <div className="space-y-2">
          {years.map((y) => (
            <div
              key={y.id}
              className="flex items-center justify-between gap-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-4 py-3 flex-wrap"
            >
              <div>
                <div className="font-serif text-lg font-semibold text-[var(--color-ink)]">{y.id}</div>
                <div className="text-xs text-[var(--color-ink-muted)]">{y.name}</div>
              </div>
              <div className="flex gap-3 text-sm text-[var(--color-ink-muted)] items-center">
                <span>{y.total_slots} slots</span>
                <span>{y.unique_students} นิสิต</span>
                <StatusPill v={y.status} />
                <span className="text-xs">{y.data_confidence}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-serif font-semibold mb-3">🚧 Ops actions (Phase 3+)</h2>
        <ul className="grid gap-2 sm:grid-cols-2 text-sm">
          <li className="bg-[var(--color-surface-lift)] rounded-lg p-3">
            <strong className="block text-[var(--color-ink)]">CSV import</strong>
            <span className="text-[var(--color-ink-muted)]">upload year results — coming soon</span>
          </li>
          <li className="bg-[var(--color-surface-lift)] rounded-lg p-3">
            <strong className="block text-[var(--color-ink)]">Form intake</strong>
            <span className="text-[var(--color-ink-muted)]">connect Google Forms for next year — coming soon</span>
          </li>
          <li className="bg-[var(--color-surface-lift)] rounded-lg p-3">
            <strong className="block text-[var(--color-ink)]">Toggle year status</strong>
            <span className="text-[var(--color-ink-muted)]">planning → active → archive — coming soon</span>
          </li>
          <li className="bg-[var(--color-surface-lift)] rounded-lg p-3">
            <strong className="block text-[var(--color-ink)]">Verify reviews</strong>
            <span className="text-[var(--color-ink-muted)]">match reviewer_short_id → assignment row — coming soon</span>
          </li>
        </ul>
      </section>

      <p className="text-xs text-[var(--color-ink-faint)]">
        Note: role-based access (admin-only) จะมาในเฟสถัดไป · ตอนนี้ใครก็ตามที่ login เห็นหน้านี้ได้
      </p>
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

function StatusPill({ v }: { v: string }) {
  const map: Record<string, string> = {
    active: "badge-cert",
    archive: "bg-[var(--color-surface-strong)] text-[var(--color-ink-muted)]",
    planning: "badge-at-risk",
  };
  return <span className={`text-xs px-2 py-0.5 rounded ${map[v] ?? ""}`}>{v}</span>;
}
