import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]/70 backdrop-blur supports-[backdrop-filter]:bg-[var(--color-surface)]/60">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 group !text-[var(--color-ink)]"
        >
          <BrandMark className="size-8" />
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif text-[1.05rem] font-semibold tracking-tight">
              Vet to be
            </span>
            <span className="text-[0.72rem] text-[var(--color-ink-faint)] hidden sm:inline">
              cuvetsmo
            </span>
          </div>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <NavLink href="/lookup">ค้นรายชื่อ</NavLink>
          <NavLink href="/years/2569">ปี 2569</NavLink>
          <NavLink href="/years">ทุกปี</NavLink>
          <NavLink href="/about" hideOnMobile>เกี่ยวกับ</NavLink>
        </nav>
      </div>
    </header>
  );
}

function NavLink({
  href,
  children,
  hideOnMobile,
}: {
  href: string;
  children: React.ReactNode;
  hideOnMobile?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 rounded-md !text-[var(--color-ink-muted)] hover:!text-[var(--color-ink)] hover:bg-[var(--color-surface-lift)] transition-colors ${
        hideOnMobile ? "hidden md:inline-block" : ""
      }`}
    >
      {children}
    </Link>
  );
}

export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* Stylized vet stethoscope/leaf combo — soft circles + organic stroke */}
      <circle cx="20" cy="20" r="18" fill="var(--color-accent-soft)" />
      <path
        d="M12 14c0 6 4 10 8 10s8-4 8-10"
        stroke="var(--color-accent)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="12" cy="14" r="2" fill="var(--color-accent)" />
      <circle cx="28" cy="14" r="2" fill="var(--color-accent)" />
      <path
        d="M20 24v4M18 29h4"
        stroke="var(--color-success)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)]/40 mt-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 grid gap-8 md:grid-cols-3 text-sm">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BrandMark className="size-6" />
            <span className="font-serif font-semibold text-[var(--color-ink)]">
              Vet to be
            </span>
          </div>
          <p className="text-[var(--color-ink-muted)] leading-relaxed">
            ศูนย์รวมโครงการ Vet to be — ฝึกงานคลินิกที่โรงพยาบาลสัตว์เล็กจุฬาฯ
            สำหรับนิสิตคณะสัตวแพทยศาสตร์
          </p>
        </div>
        <div>
          <h4 className="text-[var(--color-ink)] font-medium mb-3 font-sans">เมนู</h4>
          <ul className="space-y-2 text-[var(--color-ink-muted)]">
            <li><Link href="/lookup">ค้นรายชื่อ</Link></li>
            <li><Link href="/years">ดูทุกปี</Link></li>
            <li><Link href="/years/2569">ปี 2569 (รุ่นล่าสุด)</Link></li>
            <li><Link href="/about">เกี่ยวกับเว็บนี้</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[var(--color-ink)] font-medium mb-3 font-sans">CUVETSMO</h4>
          <ul className="space-y-2 text-[var(--color-ink-muted)]">
            <li><a href="https://cuvetsmo.com" rel="noopener">cuvetsmo.com</a></li>
            <li><a href="https://labs.cuvetsmo.com" rel="noopener">Labs</a></li>
            <li><a href="https://imaging.cuvetsmo.com" rel="noopener">Imaging</a></li>
            <li><a href="https://web3.cuvetsmo.com" rel="noopener">Web3</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[var(--color-border)] py-5 text-center text-xs text-[var(--color-ink-faint)]">
        © {new Date().getFullYear()} CUVETSMO · สโมสรนิสิตคณะสัตวแพทยศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย
      </div>
    </footer>
  );
}
