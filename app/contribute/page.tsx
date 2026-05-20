"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase";

type DeptOption = { slug: string; name_th: string; short_th: string | null };
type YearOption = { id: number; name: string };

export default function ContributePage() {
  const [authed, setAuthed] = useState<{ email: string; uid: string } | null>(null);
  const [email, setEmail] = useState("");
  const [magicStatus, setMagicStatus] = useState<"" | "loading" | "sent" | "err">("");
  const [msg, setMsg] = useState("");

  const [depts, setDepts] = useState<DeptOption[]>([]);
  const [years, setYears] = useState<YearOption[]>([]);

  // Form state
  const [yearId, setYearId] = useState<number>(2568);
  const [nickname, setNickname] = useState("");
  const [shortId, setShortId] = useState("");
  const [studentYear, setStudentYear] = useState<4 | 5>(4);
  const [dept, setDept] = useState("");
  const [week, setWeek] = useState(1);
  const [days, setDays] = useState(7);
  const [notes, setNotes] = useState("");
  const [submitStatus, setSubmitStatus] = useState<"" | "loading" | "ok" | "err">("");

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
    const sb = getSupabaseBrowser();
    if (!sb) return;
    sb.from("vettobe_departments").select("slug, name_th, short_th").then(({ data }) => {
      if (data) setDepts(data as DeptOption[]);
    });
    sb.from("vettobe_years").select("id, name, status").then(({ data }) => {
      if (data) {
        // contribute is meant for archive years
        const archive = (data as Array<{ id: number; name: string; status: string }>).filter(
          (y) => y.status !== "active"
        );
        setYears(archive);
        if (archive.length > 0) setYearId(archive[0].id);
      }
    });
  }, []);

  const sendMagic = async () => {
    const sb = getSupabaseBrowser();
    if (!sb) return;
    setMagicStatus("loading");
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/contribute` },
    });
    if (error) {
      setMagicStatus("err");
      setMsg(error.message);
    } else {
      setMagicStatus("sent");
      setMsg(`ส่ง magic link ไปที่ ${email}`);
    }
  };

  const submit = async () => {
    const sb = getSupabaseBrowser();
    if (!sb || !authed) return;
    setSubmitStatus("loading");
    // SECURITY DEFINER RPC writes to vettobe_assignments directly with source=verified-self-report
    const { error } = await sb.rpc("submit_vettobe_contribution", {
      p_year_id: yearId,
      p_dept_slug: dept,
      p_week: week,
      p_short_id: shortId.trim().padStart(3, "0"),
      p_nickname: nickname.trim(),
      p_full_name: "",
      p_student_year: studentYear,
      p_days_practiced: days,
      p_notes: notes.trim() || null,
    });
    if (error) {
      setSubmitStatus("err");
      setMsg(error.message);
    } else {
      setSubmitStatus("ok");
      setMsg("ขอบคุณครับ ข้อมูลถูกบันทึกในระบบแล้ว — ปรากฏใน /lookup และหน้าแผนกนั้นทันที");
      setNickname("");
      setShortId("");
      setDept("");
      setNotes("");
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-serif font-semibold mb-2">เพิ่มข้อมูลย้อนหลัง</h1>
      <p className="text-[var(--color-ink-muted)] mb-6 leading-relaxed">
        ถ้าคุณเคยฝึก Vet to be ในปีก่อนๆ ที่ไม่มีในระบบ (2567 / 2568 หรือก่อนหน้า)
        ช่วยกรอกข้อมูลตัวเองได้ที่นี่ ทีมหัวปีจะตรวจสอบและย้ายเข้า archive ให้
      </p>

      {!authed ? (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
          <h3 className="font-serif font-semibold mb-2">login ด้วย email ก่อน</h3>
          <p className="text-sm text-[var(--color-ink-muted)] mb-4">
            ใส่ email แล้วรอ magic link ในกล่องจดหมาย — ไม่ต้องสมัครสมาชิก
          </p>
          <div className="flex gap-2 flex-wrap">
            <input
              type="email"
              placeholder="your.name@student.chula.ac.th"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 min-w-[200px] bg-[var(--color-bg)] border border-[var(--color-border-strong)] rounded-lg px-3 py-2 outline-none focus:border-[var(--color-accent)]"
            />
            <button
              onClick={sendMagic}
              disabled={!email || magicStatus === "loading"}
              className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-strong)] !text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
            >
              {magicStatus === "loading" ? "กำลังส่ง..." : "ส่ง magic link"}
            </button>
          </div>
          {msg && (
            <p className={`mt-3 text-sm ${magicStatus === "err" ? "text-[var(--color-danger)]" : "text-[var(--color-success)]"}`}>
              {msg}
            </p>
          )}
        </div>
      ) : submitStatus === "ok" ? (
        <div className="bg-[var(--color-surface)] border border-[var(--color-success)] rounded-xl p-6 text-center">
          <div className="text-4xl mb-2">🙏</div>
          <p className="font-medium mb-1">ขอบคุณสำหรับข้อมูล</p>
          <p className="text-sm text-[var(--color-ink-muted)]">{msg}</p>
          <Link href="/years" className="text-sm font-medium inline-block mt-3">← กลับไปดูปีอื่น</Link>
        </div>
      ) : (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 grid gap-4">
          <p className="text-xs text-[var(--color-ink-muted)]">
            login เป็น <strong>{authed.email}</strong>
          </p>

          <Field label="ปีที่คุณฝึก">
            <select
              value={yearId}
              onChange={(e) => setYearId(Number(e.target.value))}
              className="w-full bg-[var(--color-bg)] border border-[var(--color-border-strong)] rounded px-3 py-2"
            >
              {years.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.name}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="ชื่อเล่น">
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="เช่น แบม"
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border-strong)] rounded px-3 py-2"
              />
            </Field>
            <Field label="เลขท้ายรหัสนิสิต (3 ตัว)">
              <input
                value={shortId}
                onChange={(e) => setShortId(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
                placeholder="032"
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border-strong)] rounded px-3 py-2 font-mono"
              />
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="ชั้นปีตอนฝึก">
              <select
                value={studentYear}
                onChange={(e) => setStudentYear(Number(e.target.value) as 4 | 5)}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border-strong)] rounded px-3 py-2"
              >
                <option value={4}>ปี 4 (cuvet87 series)</option>
                <option value={5}>ปี 5 (cuvet86 series)</option>
              </select>
            </Field>
            <Field label="แผนก">
              <select
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border-strong)] rounded px-3 py-2"
              >
                <option value="">— เลือกแผนก —</option>
                {depts.map((d) => (
                  <option key={d.slug} value={d.slug}>
                    {d.short_th ?? d.name_th}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="สัปดาห์ (W1–W14)">
              <input
                type="number"
                min={1}
                max={14}
                value={week}
                onChange={(e) => setWeek(Number(e.target.value))}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border-strong)] rounded px-3 py-2"
              />
            </Field>
            <Field label="จำนวนวันฝึก">
              <input
                type="number"
                min={1}
                max={14}
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border-strong)] rounded px-3 py-2"
              />
            </Field>
          </div>

          <Field label="หมายเหตุ (optional)">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="เช่น ฝึกร่วมกับใคร, มี dispute, ฯลฯ"
              className="w-full bg-[var(--color-bg)] border border-[var(--color-border-strong)] rounded px-3 py-2 resize-y"
            />
          </Field>

          <div className="flex justify-end">
            <button
              onClick={submit}
              disabled={!nickname || !shortId || !dept || submitStatus === "loading"}
              className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-strong)] !text-white px-5 py-2.5 rounded-lg font-medium disabled:opacity-50"
            >
              {submitStatus === "loading" ? "กำลังบันทึก..." : "ส่งข้อมูล"}
            </button>
          </div>

          {submitStatus === "err" && msg && (
            <p className="text-sm text-[var(--color-danger)]">{msg}</p>
          )}
        </div>
      )}

      <div className="mt-8 text-sm text-[var(--color-ink-muted)] bg-[var(--color-accent-soft)]/30 border border-[var(--color-border)] rounded-lg p-4">
        <p className="font-medium text-[var(--color-ink)] mb-1">ℹ️ ฟอร์มนี้บันทึกตรงเข้าระบบ</p>
        <p>
          ข้อมูลถูกเก็บด้วย source = <code>verified-self-report</code> — โดยใช้
          SECURITY DEFINER function · จำกัดเฉพาะปีย้อนหลังที่ status = "archive"
          (ป้องกัน random user แก้ปี 2569 ที่ live อยู่)
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium block mb-1">{label}</span>
      {children}
    </label>
  );
}
