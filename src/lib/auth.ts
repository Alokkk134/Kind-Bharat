import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import type { Ngo, Profile, UserRole } from "@/lib/database.types";
import { getPublicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export type Session = { userId: string; email: string | null; profile: Profile };

/** Current signed-in user + profile, or null. Cached per request. */
export const getSession = cache(async (): Promise<Session | null> => {
  if (!getPublicEnv()) return null;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) return null;
  return { userId: user.id, email: user.email ?? null, profile };
});

export async function requireSession(next?: string): Promise<Session> {
  const session = await getSession();
  if (!session) redirect(`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  return session;
}

/** Server-side role check. Never trust the client for this. */
export async function requireRole(role: UserRole, next?: string): Promise<Session> {
  const session = await requireSession(next);
  if (session.profile.role !== role) redirect(dashboardPath(session.profile.role));
  return session;
}

export function dashboardPath(role: UserRole): string {
  if (role === "admin") return "/admin";
  if (role === "ngo") return "/ngo";
  return "/dashboard";
}

/** The signed-in NGO user's organisation row (null until they save their profile). */
export const getMyNgo = cache(async (): Promise<Ngo | null> => {
  const session = await getSession();
  if (!session || session.profile.role !== "ngo") return null;
  const supabase = await createClient();
  const { data } = await supabase.from("ngos").select("*").eq("owner_id", session.userId).maybeSingle();
  return data;
});

/** NGO account with a saved organisation profile (otherwise sends them to create one). */
export async function requireNgo(): Promise<Ngo> {
  await requireRole("ngo");
  const ngo = await getMyNgo();
  if (!ngo) redirect("/ngo/profile");
  return ngo;
}
