import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ไม่พบหน้าที่ค้นหา (404)",
  description: "ลิงก์อาจเก่า หรือพิมพ์เลขปีผิด ลองค้นหารายชื่อหรือกลับหน้าหลัก",
};

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-20 text-center">
      <p className="font-mono text-5xl text-[var(--color-accent)] mb-4">404</p>
      <h1 className="text-3xl font-serif font-semibold mb-3 text-[var(--color-ink)]">
        ไม่พบหน้านี้
      </h1>
      <p className="text-[var(--color-ink-muted)] mb-8 leading-relaxed">
        ลิงก์อาจเก่า · พิมพ์เลขปีผิด · หรือยังไม่มีข้อมูลใน ฐานข้อมูล
        <br className="hidden sm:block" />
        ลองค้นหารายชื่อตัวเอง หรือกลับหน้าหลัก
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-strong)] !text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
        >
          ← กลับหน้าหลัก
        </Link>
        <Link
          href="/lookup"
          className="inline-flex items-center gap-2 bg-[var(--color-surface)] hover:bg-[var(--color-surface-lift)] !text-[var(--color-ink)] px-5 py-2.5 rounded-lg font-medium transition-colors border border-[var(--color-border-strong)]"
        >
          🔍 ค้นรายชื่อ
        </Link>
        <Link
          href="/years/2569"
          className="inline-flex items-center gap-2 bg-[var(--color-surface)] hover:bg-[var(--color-surface-lift)] !text-[var(--color-ink)] px-5 py-2.5 rounded-lg font-medium transition-colors border border-[var(--color-border-strong)]"
        >
          ดูปี 2569
        </Link>
      </div>
    </div>
  );
}
