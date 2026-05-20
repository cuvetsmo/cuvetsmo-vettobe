import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** RSC / page component client — no cookies, just public reads with anon role. */
export function getSupabaseServer() {
  if (!URL || !ANON_KEY) return null;
  return createClient(URL, ANON_KEY, { auth: { persistSession: false } });
}

/** Route handler / server action client — wired to cookies for auth. */
export async function getSupabaseServerWithCookies() {
  if (!URL || !ANON_KEY) return null;
  const cookieStore = await cookies();
  return createServerClient(URL, ANON_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // RSC context — set() forbidden, no-op
        }
      },
    },
  });
}
