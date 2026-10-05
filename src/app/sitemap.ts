import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/env";
import { createPublicClient } from "@/lib/supabase/public";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPages = ["", "/projects", "/ngos", "/how-it-works", "/about", "/contact", "/terms", "/privacy", "/disclaimer"].map(
    (p) => ({ url: `${siteUrl}${p}`, lastModified: now, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.6 }),
  );
  const supabase = createPublicClient();
  if (!supabase) return staticPages;
  const [{ data: projects }, { data: ngos }] = await Promise.all([
    supabase.from("public_projects").select("slug, approved_at").limit(5000),
    supabase.from("public_ngos").select("slug, verified_at").limit(5000),
  ]);
  return [
    ...staticPages,
    ...(projects ?? []).map((p) => ({
      url: `${siteUrl}/projects/${p.slug}`,
      lastModified: p.approved_at ? new Date(p.approved_at) : now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...(ngos ?? []).map((n) => ({
      url: `${siteUrl}/ngos/${n.slug}`,
      lastModified: n.verified_at ? new Date(n.verified_at) : now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
