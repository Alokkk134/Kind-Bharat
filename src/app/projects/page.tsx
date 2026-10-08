import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/motion/reveal";
import { Aurora } from "@/components/motion/decor";
import { ProjectCard } from "@/components/project/project-card";
import { EmptyState } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { CATEGORIES, INDIAN_STATES } from "@/lib/constants";
import { todayIST } from "@/lib/format";
import { getPublicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Browse verified projects",
  description: "Find verified NGO projects across India by cause, city and state. Pay the NGO directly.",
};

const PAGE_SIZE = 12;
const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "ending", label: "Ending soon" },
  { value: "funded", label: "Most funded" },
];

function str(v: string | string[] | undefined) {
  return typeof v === "string" ? v.trim().slice(0, 80) : "";
}

export default async function ProjectsPage({ searchParams }: PageProps<"/projects">) {
  const sp = await searchParams;
  const q = str(sp.q);
  const cause = CATEGORIES.some((c) => c.value === sp.cause) ? str(sp.cause) : "";
  const state = (INDIAN_STATES as readonly string[]).includes(str(sp.state)) ? str(sp.state) : "";
  const city = str(sp.city);
  const status = ["active", "completed", "all"].includes(str(sp.status)) ? str(sp.status) : "active";
  const sort = SORTS.some((s) => s.value === sp.sort) ? str(sp.sort) : "newest";
  const page = Math.max(1, Number(str(sp.page)) || 1);

  let projects: import("@/lib/database.types").PublicProject[] = [];
  let total = 0;
  if (getPublicEnv()) {
    const supabase = await createClient();
    let query = supabase.from("public_projects").select("*", { count: "exact" });
    if (status === "active") query = query.in("status", ["active", "funded"]).gte("deadline", todayIST());
    if (status === "completed") query = query.in("status", ["completed", "proof_submitted"]);
    if (cause) query = query.eq("category", cause);
    if (state) query = query.eq("state", state);
    if (city) query = query.ilike("city", `%${city.replace(/[%_,()]/g, "")}%`);
    if (q) {
      const safe = q.replace(/[%_,()]/g, " ");
      query = query.or(`title.ilike.%${safe}%,summary.ilike.%${safe}%,ngo_name.ilike.%${safe}%`);
    }
    if (sort === "ending") query = query.order("deadline", { ascending: true });
    else if (sort === "funded") query = query.order("raised", { ascending: false });
    else query = query.order("approved_at", { ascending: false });
    const { data, count } = await query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
    projects = data ?? [];
    total = count ?? 0;
  }

  const params = (patch: Record<string, string>) => {
    const u = new URLSearchParams({ q, cause, state, city, status, sort, ...patch });
    for (const [k, v] of [...u.entries()]) if (!v) u.delete(k);
    return `/projects?${u.toString()}`;
  };
  const pages = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-border">
        <Aurora className="opacity-60" />
        <Container className="py-10 sm:py-14">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-ink">Projects</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
            Browse <span className="text-gradient">verified projects</span>
          </h1>
          <p className="mt-3 max-w-2xl text-muted">
            Every project here is approved by our team and run by a verified NGO. You pay the NGO directly.
          </p>

          <form className="mt-8 grid gap-3 rounded-3xl border border-border bg-surface/90 p-3 shadow-xl shadow-primary/5 backdrop-blur sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]" role="search">
            <input name="q" defaultValue={q} placeholder="Search projects or NGOs…" aria-label="Search" className="kb-input" />
            <select name="state" defaultValue={state} aria-label="State" className="kb-input">
              <option value="">All states</option>
              {INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <input name="city" defaultValue={city} placeholder="City" aria-label="City" className="kb-input" />
            <select name="sort" defaultValue={sort} aria-label="Sort" className="kb-input">
              {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <input type="hidden" name="cause" value={cause} />
            <input type="hidden" name="status" value={status} />
            <button className="btn-shine rounded-xl bg-primary px-5 py-2.5 font-semibold text-white hover:bg-primary-hover">Search</button>
          </form>

          <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
            <Link href={params({ cause: "", page: "" })} className={cn("chip", !cause && "chip-on")}>All causes</Link>
            {CATEGORIES.map((c) => (
              <Link key={c.value} href={params({ cause: c.value, page: "" })} className={cn("chip", cause === c.value && "chip-on")}>
                <span aria-hidden>{c.emoji}</span> {c.label}
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <Container className="py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex gap-1 rounded-2xl bg-stone-100 p-1">
            {[
              { v: "active", l: "Raising now" },
              { v: "completed", l: "Completed" },
              { v: "all", l: "All" },
            ].map((t) => (
              <Link
                key={t.v}
                href={params({ status: t.v, page: "" })}
                className={cn("rounded-xl px-3.5 py-2 text-sm font-medium", status === t.v ? "bg-surface text-primary shadow" : "text-muted")}
              >
                {t.l}
              </Link>
            ))}
          </div>
          <p className="text-sm text-muted">{total} project{total === 1 ? "" : "s"}</p>
        </div>

        {!projects.length ? (
          <EmptyState icon={<SearchX className="h-7 w-7" />} title="No projects match">
            Try another cause or state, or <Link href="/projects" className="text-primary underline">clear filters</Link>.
          </EmptyState>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => (
              <Reveal as="li" key={p.id} delay={(i % 3) * 90}>
                <ProjectCard p={p} priority={i < 3} />
              </Reveal>
            ))}
          </ul>
        )}

        {pages > 1 && (
          <nav aria-label="Pages" className="mt-10 flex justify-center gap-2">
            {page > 1 && <ButtonLink href={params({ page: String(page - 1) })} variant="outline">← Previous</ButtonLink>}
            <span className="self-center px-3 text-sm text-muted">Page {page} of {pages}</span>
            {page < pages && <ButtonLink href={params({ page: String(page + 1) })} variant="outline">Next →</ButtonLink>}
          </nav>
        )}
      </Container>
    </>
  );
}
