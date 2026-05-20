"use client";

import { useState } from "react";

type Props = {
  /** Path or absolute URL to share. Path is preferred — origin is resolved at click time. */
  url: string;
  /** Short label text for the share blurb. */
  title: string;
};

export function ShareIntents({ url, title }: Props) {
  const [copied, setCopied] = useState(false);

  const absUrl = () => {
    if (typeof window === "undefined") return url;
    if (url.startsWith("http")) return url;
    return `${window.location.origin}${url.startsWith("/") ? url : `/${url}`}`;
  };

  const onCopy = async () => {
    const u = absUrl();
    try {
      await navigator.clipboard.writeText(u);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // graceful fallback — older browsers
      const ta = document.createElement("textarea");
      ta.value = u;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      } catch {}
      document.body.removeChild(ta);
    }
  };

  const onNativeShare = async () => {
    if (typeof navigator === "undefined") return;
    const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void> };
    if (!nav.share) {
      onCopy();
      return;
    }
    try {
      await nav.share({ title, url: absUrl() });
    } catch {
      // user cancelled — silent
    }
  };

  const openIntent = (intent: "line" | "twitter" | "facebook") => {
    const u = absUrl();
    const enc = encodeURIComponent;
    let target = "";
    if (intent === "line") {
      target = `https://line.me/R/msg/text/?${enc(`${title}\n${u}`)}`;
    } else if (intent === "twitter") {
      target = `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(u)}`;
    } else {
      target = `https://www.facebook.com/sharer/sharer.php?u=${enc(u)}`;
    }
    window.open(target, "_blank", "noopener,noreferrer,width=600,height=540");
  };

  return (
    <div className="inline-flex items-center gap-1 flex-wrap">
      <button
        type="button"
        onClick={onNativeShare}
        className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] !text-[var(--color-ink-muted)] hover:!text-[var(--color-ink)] transition-colors"
        aria-label="แชร์"
      >
        <svg viewBox="0 0 24 24" className="size-3.5" fill="none" aria-hidden>
          <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="2" />
          <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
          <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="2" />
          <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        แชร์
      </button>
      <button
        type="button"
        onClick={onCopy}
        className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] !text-[var(--color-ink-muted)] hover:!text-[var(--color-ink)] transition-colors"
        aria-label="คัดลอกลิงก์"
      >
        {copied ? (
          <>
            <svg viewBox="0 0 24 24" className="size-3.5 text-[var(--color-success)]" fill="none" aria-hidden>
              <path d="m5 12 4 4 10-10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            คัดลอกแล้ว
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" className="size-3.5" fill="none" aria-hidden>
              <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M5 15V5a2 2 0 0 1 2-2h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            คัดลอก
          </>
        )}
      </button>
      <button
        type="button"
        onClick={() => openIntent("line")}
        className="inline-flex items-center justify-center size-7 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] !text-[var(--color-ink-muted)] hover:!text-[var(--color-ink)] transition-colors"
        aria-label="แชร์ผ่าน LINE"
        title="LINE"
      >
        <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor" aria-hidden>
          <path d="M12 3C6.48 3 2 6.62 2 11.08c0 4 3.55 7.34 8.35 7.98.32.07.76.21.87.49.1.25.07.64.03.9l-.14.85c-.04.25-.2.97.84.53 1.05-.44 5.66-3.33 7.73-5.7C20.92 14.79 22 13.05 22 11.08 22 6.62 17.52 3 12 3z" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => openIntent("twitter")}
        className="inline-flex items-center justify-center size-7 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] !text-[var(--color-ink-muted)] hover:!text-[var(--color-ink)] transition-colors"
        aria-label="แชร์ผ่าน X"
        title="X / Twitter"
      >
        <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor" aria-hidden>
          <path d="M18.244 2H21l-6.52 7.452L22 22h-6.59l-5.16-6.747L4.42 22H1.66l6.972-7.968L1.5 2h6.738l4.665 6.166L18.244 2zm-1.156 18h1.83L7.005 4h-1.95l12.033 16z" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => openIntent("facebook")}
        className="inline-flex items-center justify-center size-7 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] !text-[var(--color-ink-muted)] hover:!text-[var(--color-ink)] transition-colors"
        aria-label="แชร์ผ่าน Facebook"
        title="Facebook"
      >
        <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor" aria-hidden>
          <path d="M22 12.07C22 6.51 17.52 2 12 2S2 6.51 2 12.07c0 4.99 3.66 9.13 8.44 9.93v-7.02H7.9v-2.91h2.54V9.84c0-2.52 1.49-3.91 3.78-3.91 1.1 0 2.24.2 2.24.2v2.47h-1.27c-1.25 0-1.64.78-1.64 1.58v1.89h2.79l-.45 2.91h-2.34V22c4.78-.8 8.44-4.94 8.44-9.93z" />
        </svg>
      </button>
    </div>
  );
}
