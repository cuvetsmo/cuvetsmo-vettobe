"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const COOKIE_KEY = "vettobe-theme";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function readTheme(): Theme {
  if (typeof document === "undefined") return "light";
  const ds = document.documentElement.dataset.theme;
  if (ds === "dark" || ds === "light") return ds;
  return "light";
}

function applyTheme(next: Theme, withTransition: boolean) {
  const html = document.documentElement;
  if (withTransition) {
    html.classList.add("theme-transitioning");
    window.setTimeout(() => html.classList.remove("theme-transitioning"), 220);
  }
  html.dataset.theme = next;
  document.cookie = `${COOKIE_KEY}=${next}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
}

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(readTheme());
    setMounted(true);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next, true);
  };

  // Render placeholder until mount to avoid SSR/CSR icon mismatch flash
  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        className={`${
          compact ? "size-8" : "size-9"
        } rounded-md inline-flex items-center justify-center text-[var(--color-ink-muted)]`}
      >
        <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "เปลี่ยนเป็นโหมดสว่าง" : "เปลี่ยนเป็นโหมดมืด"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={`${
        compact ? "size-8" : "size-9"
      } rounded-md inline-flex items-center justify-center text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-lift)] transition-colors`}
    >
      {isDark ? (
        // Sun icon (currently dark → click to go light)
        <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
          <path
            d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        // Moon icon (currently light → click to go dark)
        <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden>
          <path
            d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
