import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Building2, MapPin } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Aurora } from "@/components/motion/decor";
import { Reveal } from "@/components/motion/reveal";
import { Tilt } from "@/components/motion/tilt";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/card";
import type { PublicNgo } from "@/lib/database.types";
import { CATEGORIES, categoryEmoji, INDIAN_STATES } from "@/lib/constants";
import { getPublicEnv } from "@/lib/env";
import { formatINR } from "@/lib/format";
import { publicUrl } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Verified NGOs",
  description: "Browse NGOs verified by KindBharat — registration documents checked, projects approved, proof required.",
};

export default async function NgosPage({ searchParams }: PageProps<"/ngos">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 80) : "";
  const state = typeof sp.state === "string" && (INDIAN_STATES as readonly string[]).includes(sp.state) ? sp.state : "";
  const focus = typeof sp.focus === "string" && CATEGORIES.some((c) => c.value === sp.focus) ? sp.focus : "";

  let ngos: PublicNgo[] = [];
  if (getPublicEnv()) {
    const supabase = await createClient();
    let query = supabase.from("public_ngos").select("*").order("verified_at", { ascending: false }).limit(60);
    if (q) query = query.ilike("name", `%${q.replace(/[%_,()]/g, " ")}%`);
    if (state) query = query.eq("state", state);
    if (focus) query = query.contains("focus_areas", [focus]);
    ngos = (await query).data ?? [];
  }
  const link = (patch: Record<string, string>) => {
    const u = new URLSearchParams({ q, state, focus, ...patch });
    for (const [k, v] of [...u.entries()]) if (!v) u.delete(k);
    return `/ngos?${u}`;
  };

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-border">
        <Aurora className="opacity-60" />
        <Container className="py-10 sm:py-14">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-ink">Verified organisations</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
            NGOs you can <span className="text-gradient">trust</span>
          </h1>
          <p className="mt-3 max-w-2xl text-muted">
            Each NGO&apos;s registration documents were checked by our team before they could post projects.
          </p>
          <form className="mt-8 grid gap-3 rounded-3xl border border-border bg-surface/90 p-3 shadow-xl backdrop-blur sm:grid-cols-[2fr_1fr_auto]" role="search">
            <input name="q" defaultValue={q} placeholder="Search by name…" aria-label="Search NGOs" className="kb-input" />
            <select name="state" defaultValue={state} aria-label="State" className="kb-input">
              <option value="">All states</option>
              {INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <input type="hidden" name="focus" value={focus} />
            <button className="btn-shine rounded-xl bg-primary px-5 py-2.5 font-semibold text-white">Search</button>
          </form>
          <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
            <Link href={link({ focus: "" })} className={cn("chip", !focus && "chip-on")}>All</Link>
            {CATEGORIES.map((c) => (
              <Link key={c.value} href={link({ focus: c.value })} className={cn("chip", focus === c.value && "chip-on")}>
                {c.emoji} {c.label}
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <Container className="py-10">
        {!ngos.length ? (
          <EmptyState icon={<Building2 className="h-7 w-7" />} title="No NGOs found">Try a different search or state.</EmptyState>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ngos.map((n, i) => (
              <Reveal as="li" key={n.id} delay={(i % 3) * 90}>
                <Tilt className="rounded-[1.75rem]" max={8}>
                  <Link
                    href={`/ngos/${n.slug}`}
                    className="flex h-full flex-col rounded-[1.75rem] border border-border bg-surface p-6 shadow-[0_18px_40px_-28px_rgba(15,94,89,0.55)]"
                  >
                    <div className="flex items-center gap-4 [transform:translateZ(30px)]">
                      {n.logo_path ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={publicUrl("ngo-logos", n.logo_path) ?? ""} alt="" className="h-16 w-16 rounded-2xl object-cover shadow-lg" loading="lazy" />
                      ) : (
                        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[#138a7f] font-serif text-2xl font-semibold text-white shadow-lg">
                          {n.name.charAt(0)}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="font-serif text-lg font-semibold leading-tight">{n.name}</p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-success"><BadgeCheck className="h-4 w-4" /> Verified NGO</p>
                      </div>
                    </div>
                    <p className="mt-4 line-clamp-3 text-sm text-muted">{n.about}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {n.focus_areas.slice(0, 4).map((f) => <span key={f} className="text-lg" title={f}>{categoryEmoji(f)}</span>)}
                      {n.has_80g && <Badge tone="info">80G</Badge>}
                      {n.has_12a && <Badge tone="info">12A</Badge>}
                    </div>
                    <div className="mt-auto flex items-end justify-between pt-5 text-sm">
                      <span className="flex items-center gap-1 text-muted"><MapPin className="h-4 w-4" /> {n.city}, {n.state}</span>
                      <span className="text-right">
                        <span className="block text-xs text-muted">Raised</span>
                        <strong>{formatINR(n.total_raised)}</strong>
                      </span>
                    </div>
                  </Link>
                </Tilt>
              </Reveal>
            ))}
          </ul>
        )}
      </Container>
    </>
  );
}
