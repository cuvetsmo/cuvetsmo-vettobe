"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "Home", icon: "🏠", match: (p: string) => p === "/" },
  { href: "/lookup", label: "ค้น", icon: "🔍", match: (p: string) => p.startsWith("/lookup") || p.startsWith("/students") },
  { href: "/years", label: "ปี", icon: "📅", match: (p: string) => p.startsWith("/years") },
  { href: "/contribute", label: "เพิ่ม", icon: "➕", match: (p: string) => p.startsWith("/contribute") },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  // Hide on admin pages where mobile nav distracts from console
  if (pathname?.startsWith("/admin")) return null;

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[var(--color-surface)]/95 backdrop-blur border-t border-[var(--color-border)] pb-[env(safe-area-inset-bottom)]">
      <ul className="grid grid-cols-4">
        {ITEMS.map((item) => {
          const active = item.match(pathname ?? "");
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-0.5 py-2 transition-colors ${
                  active
                    ? "!text-[var(--color-accent)]"
                    : "!text-[var(--color-ink-muted)] hover:!text-[var(--color-ink)]"
                }`}
              >
                <span className="text-lg leading-none">{item.icon}</span>
                <span className={`text-[11px] ${active ? "font-medium" : ""}`}>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
