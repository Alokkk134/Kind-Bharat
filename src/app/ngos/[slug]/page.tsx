import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BadgeCheck, CalendarDays, CheckCircle2, ExternalLink, FileCheck2, Globe, Mail, MapPin } from "lucide-react";
import { Container } from "@/components/layout/container";
import { CountUp } from "@/components/motion/count-up";
import { Aurora } from "@/components/motion/decor";
import { Reveal } from "@/components/motion/reveal";
import { ProjectCard } from "@/components/project/project-card";
import { ReportButton } from "@/components/project/report-button";
import { SampleNotice } from "@/components/project/sample-notice";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getSession } from "@/lib/auth";
import { categoryEmoji, categoryLabel, NGO_TYPES } from "@/lib/constants";
import { formatDateIST, formatNumber } from "@/lib/format";
import { getPublicNgo } from "@/lib/queries";
import { publicUrl } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({ params }: PageProps<"/ngos/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const n = await getPublicNgo(slug);
  if (!n) return { title: "NGO not found", robots: { index: false } };
  return {
    title: `${n.name} — Verified NGO`,
    description: `${(n.about ?? "").slice(0, 150)} Verified on KindBharat.`,
    alternates: { canonical: `/ngos/${n.slug}` },
    openGraph: { images: n.logo_path ? [publicUrl("ngo-logos", n.logo_path)!] : undefined },
    ...(n.is_demo ? { robots: { index: false } } : {}),
  };
}

export default async function NgoProfilePage({ params }: PageProps<"/ngos/[slug]">) {
  const { slug } = await params;
  const n = await getPublicNgo(slug);
  if (!n) notFound();
  const supabase = await createClient();
  const [{ data: projects }, { data: past }, session] = await Promise.all([
    supabase.from("public_projects").select("*").eq("ngo_id", n.id).order("approved_at", { ascending: false }),
    supabase.from("past_projects").select("*").eq("ngo_id", n.id).order("date", { ascending: false, nullsFirst: false }),
    getSession(),
  ]);
  const active = (projects ?? []).filter((p) => p.status === "active" || p.status === "funded");
  const done = (projects ?? []).filter((p) => p.status === "completed" || p.status === "proof_submitted");
  const links = (n.social_links ?? "").split(/\s+/).filter((l) => /^https?:\/\//i.test(l)).slice(0, 6);

  const checks = [
    n.has_registration && "Registration certificate",
    n.has_darpan && "NGO Darpan ID",
    n.has_12a && "12A certificate",
    n.has_80g && "80G certificate (tax benefit)",
    n.has_fcra && "FCRA registration",
  ].filter(Boolean) as string[];

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-border">
        <Aurora />
        <Container className="py-10 sm:py-16">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="perspective">
              {n.logo_path ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={publicUrl("ngo-logos", n.logo_path) ?? ""} alt={`${n.name} logo`} className="h-28 w-28 animate-float rounded-[2rem] border-4 border-white object-cover shadow-2xl" />
              ) : (
                <span className="flex h-28 w-28 animate-float items-center justify-center rounded-[2rem] border-4 border-white bg-gradient-to-br from-primary to-[#138a7f] font-serif text-5xl font-semibold text-white shadow-2xl">
                  {n.name.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge tone="success"><BadgeCheck className="h-3.5 w-3.5" /> Verified NGO</Badge>
                {n.is_demo && <Badge tone="accent">Sample · for reference only</Badge>}
                {n.has_80g && <Badge tone="info">80G</Badge>}
                {n.has_12a && <Badge tone="info">12A</Badge>}
                {n.has_fcra && <Badge tone="info">FCRA</Badge>}
              </div>
              <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">{n.name}</h1>
              <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {n.city}, {n.state}</span>
                <span>{NGO_TYPES.find((t) => t.value === n.type)?.label}{n.year_founded ? ` · since ${n.year_founded}` : ""}</span>
                <span className="flex items-center gap-1"><CalendarDays className="h-4 w-4" /> On KindBharat since {formatDateIST(n.verified_at ?? n.created_at)}</span>
              </p>
            </div>
          </div>

          <dl className="mt-10 grid grid-cols-3 gap-3 sm:max-w-2xl">
            {[
              { k: "Confirmed funds raised", v: <CountUp value={n.total_raised} currency /> },
              { k: "Active projects", v: <CountUp value={n.active_projects} /> },
              { k: "Completed with proof", v: <CountUp value={n.completed_projects} /> },
            ].map((s) => (
              <div key={s.k} className="rounded-3xl border border-white/70 bg-white/70 p-4 shadow-lg backdrop-blur">
                <dt className="text-xs text-muted">{s.k}</dt>
                <dd className="mt-1 font-serif text-xl font-semibold text-primary sm:text-3xl">{s.v}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <Container className="grid gap-10 py-10 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-12">
          {n.is_demo && <SampleNotice what="NGO" />}
          <Reveal>
            <section>
              <h2 className="font-serif text-2xl font-semibold">About</h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed">{n.about}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {n.focus_areas.map((f) => (
                  <span key={f} className="chip">{categoryEmoji(f)} {categoryLabel(f)}</span>
                ))}
              </div>
            </section>
          </Reveal>

          <section>
            <h2 className="font-serif text-2xl font-semibold">Active projects</h2>
            {!active.length ? (
              <p className="mt-3 text-sm text-muted">No active projects right now.</p>
            ) : (
              <ul className="mt-5 grid gap-6 sm:grid-cols-2">
                {active.map((p, i) => <Reveal as="li" key={p.id} delay={i * 80}><ProjectCard p={p} /></Reveal>)}
              </ul>
            )}
          </section>

          <section>
            <h2 className="flex items-center gap-2 font-serif text-2xl font-semibold">
              <CheckCircle2 className="h-6 w-6 text-success" /> Completed on KindBharat
            </h2>
            <p className="mt-1 text-sm text-muted">Platform-verified: proof of completion reviewed by our team.</p>
            {!done.length ? (
              <p className="mt-3 text-sm text-muted">None yet.</p>
            ) : (
              <ul className="mt-5 grid gap-6 sm:grid-cols-2">
                {done.map((p, i) => <Reveal as="li" key={p.id} delay={i * 80}><ProjectCard p={p} /></Reveal>)}
              </ul>
            )}
          </section>

          {!!past?.length && (
            <section>
              <h2 className="font-serif text-2xl font-semibold">Earlier work</h2>
              <p className="mt-1 text-sm text-muted">Shared by the NGO about work before joining. Not verified by KindBharat.</p>
              <ul className="mt-5 space-y-4">
                {past.map((pp) => (
                  <Reveal as="li" key={pp.id}>
                    <Card className="!p-5">
                      <Badge tone="neutral">Self-reported (before joining)</Badge>
                      <p className="mt-2 font-serif text-lg font-semibold">{pp.title}</p>
                      <p className="text-xs text-muted">
                        {pp.date ? formatDateIST(pp.date) : ""}{pp.beneficiaries ? ` · ${formatNumber(pp.beneficiaries)} people helped` : ""}
                      </p>
                      <p className="mt-2 whitespace-pre-line text-sm">{pp.description}</p>
                      {pp.images.length > 0 && (
                        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                          {pp.images.map((img) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img key={img} src={publicUrl("media", img) ?? ""} alt="" className="h-24 w-32 shrink-0 rounded-2xl object-cover" loading="lazy" />
                          ))}
                        </div>
                      )}
                    </Card>
                  </Reveal>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Card className="!p-5">
            <p className="flex items-center gap-2 font-semibold"><FileCheck2 className="h-5 w-5 text-primary" /> Documents verified</p>
            <p className="mt-1 text-xs text-muted">Checked by our team. Files stay private.</p>
            <ul className="mt-3 space-y-2 text-sm">
              {checks.map((c) => (
                <li key={c} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> {c}</li>
              ))}
            </ul>
          </Card>
          {(n.website || n.contact_email || links.length > 0) && (
            <Card className="!p-5">
              <p className="font-semibold">Contact</p>
              <ul className="mt-3 space-y-2 text-sm">
                {n.website && (
                  <li><a href={n.website} target="_blank" rel="noopener noreferrer nofollow" className="flex items-center gap-2 text-primary hover:underline"><Globe className="h-4 w-4" /> Website</a></li>
                )}
                {n.contact_email && (
                  <li><a href={`mailto:${n.contact_email}`} className="flex items-center gap-2 break-all text-primary hover:underline"><Mail className="h-4 w-4" /> {n.contact_email}</a></li>
                )}
                {links.map((l) => (
                  <li key={l}><a href={l} target="_blank" rel="noopener noreferrer nofollow" className="flex items-center gap-2 break-all text-primary hover:underline"><ExternalLink className="h-4 w-4" /> {new URL(l).hostname.replace("www.", "")}</a></li>
                ))}
              </ul>
            </Card>
          )}
          <ReportButton targetType="ngo" targetId={n.id} signedIn={!!session} next={`/ngos/${n.slug}`} />
        </aside>
      </Container>
    </>
  );
}
