import "server-only";
import { createClient } from "@/lib/supabase/server";

/** Counts for the admin badges and overview. */
export async function adminCounts() {
  const supabase = await createClient();
  const c = (q: PromiseLike<{ count: number | null }>) => q.then((r) => r.count ?? 0);
  const [ngos, projects, proofs, reports, payments, comments] = await Promise.all([
    c(supabase.from("ngos").select("id", { count: "exact", head: true }).eq("status", "pending")),
    c(supabase.from("projects").select("id", { count: "exact", head: true }).eq("status", "under_review")),
    c(supabase.from("completion_proofs").select("id", { count: "exact", head: true }).eq("status", "pending")),
    c(supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "open")),
    c(supabase.from("ngo_payment_details").select("id", { count: "exact", head: true }).eq("review_status", "pending")),
    c(
      supabase
        .from("comments")
        .select("id", { count: "exact", head: true })
        .gte("created_at", new Date(Date.now() - 7 * 86400_000).toISOString()),
    ),
  ]);
  return { ngos, projects, proofs, reports, payments, comments };
}
