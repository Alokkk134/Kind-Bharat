import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";
import { requirePublicEnv } from "@/lib/env";

/** Supabase client for Client Components (runs in the browser). */
export function createClient() {
  const env = requirePublicEnv();
  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
