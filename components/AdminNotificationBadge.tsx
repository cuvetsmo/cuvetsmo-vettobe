"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase";

/**
 * Bell icon with unread issue count, visible only to admins.
 *
 * - Polls `vettobe_issue_reports` for status IN ('open','in-review') on mount.
 * - Subscribes to realtime INSERT + UPDATE so the count nudges live as users
 *   report issues or admins move them through the queue.
 * - Hides for non-admins and during SSR (no flash).
 */
export function AdminNotificationBadge() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [openCount, setOpenCount] = useState<number>(0);

  useEffect(() => {
    const sb = getSupabaseBrowser();
    if (!sb) {
      setAuthed(false);
      return;
    }
    let unsubAuth: (() => void) | undefined;
    sb.auth.getSession().then(({ data }) => {
      setAuthed(Boolean(data.session));
    });
    const { data: sub } = sb.auth.onAuthStateChange((_, session) => {
      setAuthed(Boolean(session));
      if (!session) {
        setIsAdmin(false);
        setOpenCount(0);
      }
    });
    unsubAuth = () => sub.subscription.unsubscribe();
    return unsubAuth;
  }, []);

  useEffect(() => {
    if (!authed) return;
    const sb = getSupabaseBrowser();
    if (!sb) return;
    let cancelled = false;

    sb.rpc("is_vettobe_admin").then(({ data }) => {
      if (cancelled) return;
      setIsAdmin(Boolean(data));
    });

    return () => {
      cancelled = true;
    };
  }, [authed]);

  useEffect(() => {
    if (!isAdmin) return;
    const sb = getSupabaseBrowser();
    if (!sb) return;

    let cancelled = false;
    const refreshCount = async () => {
      const { count } = await sb
        .from("vettobe_issue_reports")
        .select("id", { count: "exact", head: true })
        .in("status", ["open", "in-review"]);
      if (!cancelled) setOpenCount(count ?? 0);
    };

    refreshCount();

    const channel = sb
      .channel("vettobe_issue_reports_badge")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "vettobe_issue_reports" },
        () => {
          refreshCount();
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      sb.removeChannel(channel);
    };
  }, [isAdmin]);

  if (!isAdmin) return null;

  return (
    <Link
      href="/admin"
      aria-label={`${openCount} issue ค้างใน Admin Console`}
      title={openCount === 0 ? "Admin · ไม่มี issue ค้าง" : `Admin · ${openCount} issue ค้าง`}
      className="relative size-9 inline-flex items-center justify-center rounded-md text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-lift)] transition-colors"
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden>
        <path
          d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 20a2 2 0 0 0 4 0"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      {openCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-[var(--color-accent)] text-white text-[0.625rem] font-semibold inline-flex items-center justify-center leading-none">
          {openCount > 99 ? "99+" : openCount}
        </span>
      )}
    </Link>
  );
}
