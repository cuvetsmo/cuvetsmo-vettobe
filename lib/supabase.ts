/**
 * Browser-safe Supabase client only.
 *
 * Server-side clients live in `lib/supabase-server.ts` (uses next/headers
 * which is forbidden in client bundles). Splitting prevents Next from
 * dragging server-only code into the browser bundle.
 */

import { createBrowserClient } from "@supabase/ssr";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function hasSupabaseEnv(): boolean {
  return Boolean(URL && ANON_KEY);
}

export function getSupabaseBrowser() {
  if (!URL || !ANON_KEY) return null;
  return createBrowserClient(URL, ANON_KEY);
}
