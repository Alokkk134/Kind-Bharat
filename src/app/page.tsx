import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Camera,
  EyeOff,
  FileSearch,
  HandCoins,
  HeartHandshake,
  Lock,
  Search,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { FlipStep } from "@/components/home/flip-step";
import { HeroScene } from "@/components/home/hero-scene";
import { CountUp } from "@/components/motion/count-up";
import { Aurora, Marquee, Petals } from "@/components/motion/decor";
import { Reveal } from "@/components/motion/reveal";
import { Tilt } from "@/components/motion/tilt";
import { ProjectCard } from "@/components/project/project-card";
import { ButtonLink } from "@/components/ui/button";
import type { PublicProject } from "@/lib/database.types";
import { CATEGORIES } from "@/lib/constants";
import { SUB_TAGLINE } from "@/lib/config";
import { getPublicEnv } from "@/lib/env";
import { todayIST } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

async function getHomeData() {
  if (!getPublicEnv()) return { projects: [] as PublicProject[], stats: null };
  const supabase = await createClient();
  const [{ data: projects }, { data: ngos }, { count: completed }] = await Promise.all([
    supabase
      .from("public_projects")
      .select("*")
      .in("status", ["active", "funded"])
      .gte("deadline", todayIST())
      .order("approved_at", { ascending: false })
      .limit(6),
    supabase.from("public_ngos").select("total_raised"),
    supabase.from("public_projects").select("id", { count: "exact", head: true }).eq("status", "completed"),
  ]);
  const raised = (ngos ?? []).reduce((s, n) => s + n.total_raised, 0);
  return {
    projects: projects ?? [],
    stats: { raised, ngos: ngos?.length ?? 0, completed: completed ?? 0 },
  };
}

export default async function HomePage() {
  const { projects, stats } = await getHomeData();

  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="relative isolate overflow-hidden">
        <Aurora />
        <Petals count={12} />
        <Container className="grid items-center gap-8 pb-12 pt-10 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:pb-20">
          <div className="relative z-10">
            <Reveal>
              <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/70 px-3 py-1.5 text-xs font-semibold text-primary shadow-sm backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-accent" /> 0% platform fee · 100% direct to NGO
              </p>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-5 font-serif text-[2.75rem] font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
                Give directly.
                <br />
                <span className="text-gradient">See the proof.</span>
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-5 max-w-xl text-lg text-muted sm:text-xl">{SUB_TAGLINE}</p>
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/projects" size="lg">
                  <Search className="h-5 w-5" /> Find a project
                </ButtonLink>
                <ButtonLink href="/signup?role=ngo" size="lg" variant="outline">
                  <Building2 className="h-5 w-5" /> I&apos;m an NGO
                </ButtonLink>
              </div>
            </Reveal>
            <Reveal delay={320}>
              <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
                <li className="flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-success" /> Documents checked</li>
                <li className="flex items-center gap-1.5"><Wallet className="h-4 w-4 text-success" /> Pay by UPI/bank</li>
                <li className="flex items-center gap-1.5"><Camera className="h-4 w-4 text-success" /> Proof required</li>
              </ul>
            </Reveal>
          </div>
          <div aria-hidden className="relative">
            <HeroScene />
          </div>
        </Container>
      </section>

      {/* ---------- TRUST MARQUEE ---------- */}
      <section aria-label="Our promises" className="border-y border-border bg-primary-deep py-4 text-white">
        <Marquee>
          {[
            "✦ Zero platform fees",
            "✦ Every NGO verified by hand",
            "✦ Every project approved",
            "✦ Money goes straight to the NGO",
            "✦ Proof of completion, always",
            "✦ Payment-detail changes re-checked",
            "✦ Your data stays private",
          ].map((t) => (
            <span key={t} className="whitespace-nowrap px-4 font-serif text-lg italic text-white/90">{t}</span>
          ))}
        </Marquee>
      </section>

      {/* ---------- STATS ---------- */}
      {stats && (stats.raised > 0 || stats.ngos > 0) && (
        <Container className="py-14">
          <dl className="grid gap-4 sm:grid-cols-3">
            {[
              { k: "Confirmed by NGOs", v: <CountUp value={stats.raised} currency />, sub: "raised directly, no middleman" },
              { k: "Verified NGOs", v: <CountUp value={stats.ngos} />, sub: "documents checked by our team" },
              { k: "Projects completed", v: <CountUp value={stats.completed} />, sub: "with photos & bills reviewed" },
            ].map((s, i) => (
              <Reveal key={s.k} delay={i * 90}>
                <div className="rounded-[2rem] border border-border bg-surface p-6 text-center shadow-[0_20px_50px_-35px_rgba(15,94,89,0.6)]">
                  <dd className="font-serif text-4xl font-semibold text-primary sm:text-5xl">{s.v}</dd>
                  <dt className="mt-1 font-semibold">{s.k}</dt>
                  <p className="text-xs text-muted">{s.sub}</p>
                </div>
              </Reveal>
            ))}
          </dl>
        </Container>
      )}

      {/* ---------- HOW IT WORKS ---------- */}
      <section className="relative py-16 sm:py-24">
        <Container>
          <Reveal>
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-accent-ink">How it works</p>
            <h2 className="mx-auto mt-2 max-w-2xl text-center font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
              Three simple steps. <span className="text-gradient">Zero middlemen.</span>
            </h2>
          </Reveal>
          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: <FileSearch />,
                title: "Find a verified project",
                front: "Small, specific, budgeted projects by NGOs whose documents we've checked.",
                back: ["Registration certificate checked", "Every project approved by hand", "Full budget, item by item", "Report anything suspicious"],
              },
              {
                icon: <HandCoins />,
                title: "Pay the NGO directly",
                front: "Use the NGO's own UPI or bank account. We never touch your money.",
                back: ["UPI, QR or bank transfer", "No platform fee, ever", "Submit your UTR so the NGO can confirm", "80G receipt comes from the NGO"],
              },
              {
                icon: <Camera />,
                title: "See the proof",
                front: "The NGO confirms your gift, then posts photos and results when the work is done.",
                back: ["Only confirmed gifts count", "Photos, bills & people reached", "Reviewed by our team", "NGOs blocked if proof is overdue"],
              },
            ].map((s, i) => (
              <Reveal as="li" key={s.title} delay={i * 120}>
                <FlipStep n={i + 1} {...s} />
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      {/* ---------- CAUSES ---------- */}
      <section className="pb-6">
        <Container>
          <Reveal>
            <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:flex-wrap sm:justify-center">
              {CATEGORIES.map((c) => (
                <Link
                  key={c.value}
                  href={`/projects?cause=${c.value}`}
                  className="group flex shrink-0 items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 font-medium shadow-sm transition hover:-translate-y-1 hover:border-primary hover:shadow-lg"
                >
                  <span className="text-2xl transition-transform group-hover:scale-125 group-hover:-rotate-6" aria-hidden>{c.emoji}</span>
                  {c.label}
                </Link>
              ))}
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ---------- FEATURED PROJECTS ---------- */}
      <section className="py-16 sm:py-20">
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <Reveal>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-ink">Raising now</p>
              <h2 className="mt-2 font-serif text-4xl font-semibold tracking-tight">Projects that need you</h2>
            </Reveal>
            <ButtonLink href="/projects" variant="outline">See all projects <ArrowRight className="h-4 w-4" /></ButtonLink>
          </div>
          {projects.length ? (
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p, i) => (
                <Reveal as="li" key={p.id} delay={(i % 3) * 100}>
                  <ProjectCard p={p} />
                </Reveal>
              ))}
            </ul>
          ) : (
            <Reveal>
              <div className="mt-10 rounded-[2rem] border border-dashed border-primary/30 bg-primary-soft/40 p-10 text-center">
                <HeartHandshake className="mx-auto h-12 w-12 animate-float text-primary" />
                <p className="mt-4 font-serif text-2xl font-semibold">The first verified projects are on their way</p>
                <p className="mx-auto mt-2 max-w-md text-muted">
                  We&apos;re onboarding NGOs and checking their documents. Are you an NGO? Be among the first.
                </p>
                <ButtonLink href="/signup?role=ngo" className="mt-6">Register your NGO</ButtonLink>
              </div>
            </Reveal>
          )}
        </Container>
      </section>

      {/* ---------- TRUST ---------- */}
      <section className="relative isolate overflow-hidden bg-primary-deep py-20 text-white sm:py-28">
        <div aria-hidden className="absolute inset-0 -z-10 opacity-40 [background:radial-gradient(60rem_30rem_at_10%_0%,#138a7f,transparent),radial-gradient(40rem_30rem_at_100%_100%,rgba(224,138,30,.45),transparent)]" />
        <Container>
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Why people trust us</p>
            <h2 className="mt-2 max-w-2xl font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
              Trust isn&apos;t a feature here. <span className="italic text-accent">It&apos;s the product.</span>
            </h2>
          </Reveal>
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: ShieldCheck, t: "Verified NGOs", d: "Registration, PAN, 12A/80G and FCRA documents checked by a person — not a bot." },
              { icon: HandCoins, t: "We never hold money", d: "No wallet, no gateway. You pay the NGO's own account. Zero fees, zero commissions." },
              { icon: Lock, t: "Anti-scam guard", d: "If an NGO changes its UPI or bank details, they're hidden until we re-check them." },
              { icon: EyeOff, t: "Privacy first", d: "Your email, phone, UTR and screenshots are never public. Only “Rahul S.” or Anonymous." },
            ].map(({ icon: Icon, t, d }, i) => (
              <Reveal as="li" key={t} delay={i * 90}>
                <Tilt className="rounded-[2rem]">
                  <div className="h-full rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-white shadow-lg shadow-accent/30 [transform:translateZ(40px)]">
                      <Icon className="h-6 w-6" />
                    </span>
                    <p className="mt-5 font-serif text-xl font-semibold [transform:translateZ(25px)]">{t}</p>
                    <p className="mt-2 text-sm leading-relaxed text-white/75">{d}</p>
                  </div>
                </Tilt>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      {/* ---------- NGO CTA ---------- */}
      <section className="py-20 sm:py-28">
        <Container>
          <div className="relative isolate overflow-hidden rounded-[2.5rem] border border-border bg-gradient-to-br from-accent-soft via-surface to-primary-soft p-8 sm:p-14">
            <Aurora className="opacity-50" />
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <Reveal>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-ink">For NGOs & social organisations</p>
                <h2 className="mt-2 font-serif text-4xl font-semibold tracking-tight">Raise funds for real work. Keep every rupee.</h2>
                <ul className="mt-6 space-y-3 text-muted">
                  {[
                    "Free forever — no listing fee, no commission",
                    "Donations land directly in your UPI / bank account",
                    "A public profile that builds trust with every completed project",
                    "Simple dashboard to confirm donations and answer questions",
                  ].map((t) => (
                    <li key={t} className="flex gap-2"><BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" /> {t}</li>
                  ))}
                </ul>
                <ButtonLink href="/signup?role=ngo" size="lg" className="mt-8">
                  Register your NGO <ArrowRight className="h-5 w-5" />
                </ButtonLink>
              </Reveal>
              <Reveal delay={150}>
                <div aria-hidden className="perspective">
                  <div className="preserve-3d rounded-[2rem] border border-border bg-surface p-5 shadow-2xl transition-transform duration-700 [transform:rotateX(14deg)_rotateY(-16deg)_rotateZ(2deg)] hover:[transform:rotateX(0)_rotateY(0)_rotateZ(0)]">
                    <p className="text-sm font-semibold">Donations to confirm</p>
                    {[["₹2,000", "Priya M.", "UTR 4123…"], ["₹500", "Anonymous", "UTR 9981…"], ["₹1,100", "Arjun K.", "UTR 7745…"]].map(([a, n, u], i) => (
                      <div key={u} className="mt-3 flex items-center justify-between rounded-2xl bg-bg p-3 [transform:translateZ(30px)]" style={{ transitionDelay: `${i * 60}ms` }}>
                        <div>
                          <p className="font-serif text-lg font-semibold">{a}</p>
                          <p className="text-xs text-muted">{n} · {u}</p>
                        </div>
                        <span className="rounded-xl bg-success px-3 py-1.5 text-xs font-semibold text-white">✓ Confirm</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
