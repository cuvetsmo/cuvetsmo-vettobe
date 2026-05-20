"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface in browser console for ad-hoc debugging.
    console.error("[vettobe] runtime error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-20 text-center">
      <p className="font-mono text-5xl text-[var(--color-danger)] mb-4">500</p>
      <h1 className="text-3xl font-serif font-semibold mb-3 text-[var(--color-ink)]">
        เกิดข้อผิดพลาด
      </h1>
      <p className="text-[var(--color-ink-muted)] mb-2 leading-relaxed">
        ระบบเจอปัญหาในการแสดงหน้านี้ · ลองโหลดใหม่ดูครับ
      </p>
      {error.digest && (
        <p className="text-xs text-[var(--color-ink-faint)] font-mono mb-8">
          ref: {error.digest}
        </p>
      )}
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-strong)] !text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
        >
          ลองใหม่
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[var(--color-surface)] hover:bg-[var(--color-surface-lift)] !text-[var(--color-ink)] px-5 py-2.5 rounded-lg font-medium transition-colors border border-[var(--color-border-strong)]"
        >
          ← กลับหน้าหลัก
        </Link>
      </div>
    </div>
  );
}
