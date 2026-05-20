/**
 * Supabase client placeholder for vettobe.cuvetsmo.com
 *
 * Phase 1a: not yet wired — site reads from local seed in lib/data/seed-2569.ts
 * Phase 1b: replace seed reads with Supabase queries against vettobe_* tables
 *
 * When connecting in Phase 1b, set in `.env.local`:
 *   NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon>
 *
 * Schema target (4 tables):
 *   - vettobe_years         (id PK INT, name, status, data_confidence, ...)
 *   - vettobe_departments   (slug PK TEXT, name_th, category, capacity_per_day, ...)
 *   - vettobe_assignments   (id UUID, year_id FK, dept_slug FK, week, short_id, ...)
 *   - vettobe_reviews       (id UUID, year_id FK, dept_slug FK, reviewer_short_id, rating, ...)
 *
 * RLS:
 *   - Public SELECT on years, departments, assignments, reviews(verified=true)
 *   - Authenticated INSERT/UPDATE on reviews (where reviewer_short_id matches user metadata)
 *   - Service-role only on assignments (admin imports)
 */

import { createBrowserClient } from "@supabase/ssr";

export function getSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    // Phase 1a: env not set yet — return null and let callers fall back to seed
    return null;
  }
  return createBrowserClient(url, key);
}
