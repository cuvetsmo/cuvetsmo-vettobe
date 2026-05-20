"use client";

import { useState, useEffect } from "react";
import { getSupabaseBrowser } from "@/lib/supabase";

export function ReviewForm({ yearId, deptSlug }: { yearId: number; deptSlug: string }) {
  const [email, setEmail] = useState("");
  const [shortId, setShortId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [tags, setTags] = useState("");
  const [authed, setAuthed] = useState<{ email: string; uid: string } | null>(null);
  const [status, setStatus] = useState<"" | "loading" | "magic-sent" | "ok" | "err">("");
  const [msg, setMsg] = useState<string>("");

  // Check auth state on mount + listen
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

  const sendMagicLink = async () => {
    const sb = getSupabaseBrowser();
    if (!sb) return setMsg("Supabase ไม่ได้ตั้งค่า — กรุณาแจ้งทีมหัวปี");
    setStatus("loading");
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(window.location.pathname)}` },
    });
    if (error) {
      setStatus("err");
      setMsg(error.message);
    } else {
      setStatus("magic-sent");
      setMsg(`ส่งลิงก์ไปที่ ${email} แล้ว เปิดอีเมลแล้วกดลิงก์เพื่อ login`);
    }
  };

  const submit = async () => {
    const sb = getSupabaseBrowser();
    if (!sb || !authed) return;
    setStatus("loading");
    const { error } = await sb.from("vettobe_reviews").insert({
      year_id: yearId,
      dept_slug: deptSlug,
      reviewer_short_id: shortId.trim(),
      reviewer_uid: authed.uid,
      rating,
      comment: comment.trim() || null,
      tags: tags.trim() ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      verified: false, // will be flipped by a server check later
    });
    if (error) {
      setStatus("err");
      setMsg(error.message);
    } else {
      setStatus("ok");
      setMsg("ขอบคุณครับ รีวิวถูกบันทึกแล้ว · refresh เพื่อดู");
      setComment("");
      setTags("");
    }
  };

  if (!authed) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
        <h3 className="font-serif font-semibold mb-2">เขียนรีวิว — login ด้วย email ก่อน</h3>
        <p className="text-sm text-[var(--color-ink-muted)] mb-4">
          ใส่ email (แนะนำ @student.chula.ac.th) แล้วรับ magic link ในกล่องจดหมาย —
          ไม่ต้องสมัครสมาชิก ไม่ต้องตั้งรหัสผ่าน
        </p>
        <div className="flex flex-wrap gap-2">
          <input
            type="email"
            placeholder="your.name@student.chula.ac.th"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 min-w-[200px] bg-[var(--color-bg)] border border-[var(--color-border-strong)] rounded-lg px-3 py-2 outline-none focus:border-[var(--color-accent)]"
          />
          <button
            onClick={sendMagicLink}
            disabled={!email || status === "loading"}
            className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-strong)] !text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
          >
            {status === "loading" ? "กำลังส่ง..." : "ส่ง magic link"}
          </button>
        </div>
        {msg && (
          <p className={`mt-3 text-sm ${status === "err" ? "text-[var(--color-danger)]" : "text-[var(--color-success)]"}`}>
            {msg}
          </p>
        )}
      </div>
    );
  }

  if (status === "ok") {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-success)] rounded-xl p-5 text-center">
        <div className="text-4xl mb-2">🙏</div>
        <p className="font-medium mb-1">ขอบคุณสำหรับรีวิว</p>
        <p className="text-sm text-[var(--color-ink-muted)]">รุ่นน้องจะมีข้อมูลตัดสินใจมากขึ้น · กด refresh เพื่อดูที่ลิสต์ด้านบน</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
      <h3 className="font-serif font-semibold mb-1">เขียนรีวิว</h3>
      <p className="text-xs text-[var(--color-ink-muted)] mb-4">
        login เป็น <strong>{authed.email}</strong>
      </p>

      <div className="grid gap-3">
        <label className="block">
          <span className="text-sm font-medium block mb-1">เลขท้ายรหัสนิสิตของคุณ (3 ตัว)</span>
          <input
            type="text"
            placeholder="032"
            value={shortId}
            onChange={(e) => setShortId(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
            className="w-32 bg-[var(--color-bg)] border border-[var(--color-border-strong)] rounded px-3 py-2 outline-none focus:border-[var(--color-accent)] font-mono"
          />
          <span className="text-xs text-[var(--color-ink-faint)] ml-2">
            ใช้สำหรับ verify ว่าคุณเคยฝึกแผนกนี้จริง (ไม่แสดงเต็มต่อสาธารณะ)
          </span>
        </label>

        <label className="block">
          <span className="text-sm font-medium block mb-1">คะแนน</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className={`text-2xl transition-transform hover:scale-110 ${
                  n <= rating ? "text-[var(--color-warning)]" : "text-[var(--color-ink-faint)]"
                }`}
                aria-label={`${n} stars`}
              >
                {n <= rating ? "⭐" : "☆"}
              </button>
            ))}
          </div>
        </label>

        <label className="block">
          <span className="text-sm font-medium block mb-1">รีวิวของคุณ</span>
          <textarea
            placeholder="อาจารย์/พี่ supervisor เป็นยังไง · งานที่ได้ทำ · บรรยากาศ · เหนื่อยมาก/น้อย · อะไรน่าจดจำ ..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full bg-[var(--color-bg)] border border-[var(--color-border-strong)] rounded-lg px-3 py-2 outline-none focus:border-[var(--color-accent)] resize-y"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium block mb-1">Tags (คั่นด้วยลูกน้ำ)</span>
          <input
            type="text"
            placeholder="อ.ใจดี, hands-on, เรียนรู้เยอะ, งานหนัก"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full bg-[var(--color-bg)] border border-[var(--color-border-strong)] rounded-lg px-3 py-2 outline-none focus:border-[var(--color-accent)]"
          />
        </label>

        <div className="flex items-center justify-between gap-3 flex-wrap mt-1">
          <button
            onClick={submit}
            disabled={!shortId || status === "loading"}
            className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-strong)] !text-white px-5 py-2.5 rounded-lg font-medium disabled:opacity-50"
          >
            {status === "loading" ? "กำลังบันทึก..." : "ส่งรีวิว"}
          </button>
          <button
            onClick={async () => {
              const sb = getSupabaseBrowser();
              await sb?.auth.signOut();
            }}
            className="text-sm text-[var(--color-ink-faint)] hover:text-[var(--color-ink-muted)]"
          >
            ออกจากระบบ
          </button>
        </div>

        {msg && status === "err" && (
          <p className="text-sm text-[var(--color-danger)]">{msg}</p>
        )}
      </div>
    </div>
  );
}
