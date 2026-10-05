import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { getPublicEnv } from "@/lib/env";

/** Cookie-less guest client for public data (sitemap, OG images). RLS applies as a visitor. */
export function createPublicClient() {
  const env = getPublicEnv();
  if (!env) return null;
  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
