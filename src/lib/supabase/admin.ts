import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { requirePublicEnv } from "@/lib/env";

/**
 * Backend client using the SECRET key. Bypasses RLS — use only in server code,
 * only after validating input, and only where the spec needs it (guest donations).
 */
export function createAdminClient() {
  const env = requirePublicEnv();
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!secret) {
    throw new Error("SUPABASE_SECRET_KEY is not set. Add it to .env.local (see .env.example).");
  }
  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
