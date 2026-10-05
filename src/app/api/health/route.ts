import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";

export const dynamic = "force-dynamic";

/**
 * Lightweight check that runs a tiny real database query.
 * Called daily by the GitHub Actions keep-alive so the free Supabase project doesn't pause.
 */
export async function GET() {
  const supabase = createPublicClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, supabase: "not_configured" }, { status: 503 });
  }
  const { error } = await supabase.from("public_ngos").select("id", { head: true, count: "exact" }).limit(1);
  if (error) {
    return NextResponse.json({ ok: false, supabase: "error" }, { status: 502 });
  }
  return NextResponse.json({ ok: true, supabase: "reachable", at: new Date().toISOString() });
}
