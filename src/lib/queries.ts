import "server-only";
import { cache } from "react";
import { getPublicEnv } from "./env";
import { createClient } from "./supabase/server";

/** Public project by slug (approved projects of verified NGOs only). */
export const getPublicProject = cache(async (slug: string) => {
  if (!getPublicEnv() || !/^[a-z0-9-]{3,120}$/.test(slug)) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("public_projects").select("*").eq("slug", slug).maybeSingle();
  return data;
});

export const getPublicNgo = cache(async (slug: string) => {
  if (!getPublicEnv() || !/^[a-z0-9-]{3,80}$/.test(slug)) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("public_ngos").select("*").eq("slug", slug).maybeSingle();
  return data;
});
