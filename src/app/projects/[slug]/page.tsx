import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  CalendarClock,
  Camera,
  HandHeart,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { CountUp } from "@/components/motion/count-up";
import { Reveal } from "@/components/motion/reveal";
import { Comments } from "@/components/project/comments";
import { Gallery } from "@/components/project/gallery";
import { SampleNotice } from "@/components/project/sample-notice";
import { ReportButton } from "@/components/project/report-button";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getMyNgo, getSession } from "@/lib/auth";
import { categoryEmoji, categoryLabel } from "@/lib/constants";
import { daysLeft, formatDateIST, formatINR, formatNumber, percent, timeAgo } from "@/lib/format";
import { siteUrl } from "@/lib/env";
import { getPublicProject } from "@/lib/queries";
import { publicUrl } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPublicProject(slug);
  if (!p) return { title: "Project not found", robots: { index: false } };
  const title = `${p.title} — ${formatINR(p.goal_amount)} needed`;
  return {
    title,
    description: `${p.summary} By ${p.ngo_name}, ${p.city}. Verified on KindBharat — pay the NGO directly.`,
    alternates: { canonical: `/projects/${p.slug}` },
    openGraph: { title, description: p.summary, type: "article", url: `/projects/${p.slug}` },
    ...(p.ngo_is_demo ? { robots: { index: false } } : {}),
  };
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const p = await getPublicProject(slug);
  if (!p) notFound();

  const supabase = await createClient();
  const [session, myNgo, imagesRes, budgetRes, donationsRes, commentsRes, ngoRes, proofRes, payRes] = await Promise.all([
    getSession(),
    getMyNgo(),
    supabase.from("project_images").select("file_path").eq("project_id", p.id).order("sort_order"),
    supabase.from("project_budget_items").select("*").eq("project_id", p.id).order("sort_order"),
    supabase.from("public_donations").select("*").eq("project_id", p.id).order("confirmed_at", { ascending: false }).limit(30),
    supabase.from("public_comments").select("*").eq("project_id", p.id).order("created_at", { ascending: true }).limit(300),
    supabase.from("public_ngos").select("*").eq("id", p.ngo_id).single(),
    supabase.from("completion_proofs").select("*").eq("project_id", p.id).eq("status", "approved").maybeSingle(),
    supabase.rpc("get_payment_details", { p_project_id: p.id }),
  ]);

  const images = (imagesRes.data ?? []).map((i) => publicUrl("media", i.file_path)!).filter(Boolean);
  const budget = budgetRes.data ?? [];
  const donations = donationsRes.data ?? [];
  const ngo = ngoRes.data;
  const proof = proofRes.data;
  const accepting = (payRes.data ?? []).length > 0;
  const pct = percent(p.raised, p.goal_amount);
  const left = daysLeft(p.deadline);
  const completed = p.status === "completed";
  const isOwnerNgo = myNgo?.id === p.ngo_id;
  const shareText = encodeURIComponent(`${p.title} — verified project on KindBharat. ${siteUrl}/projects/${p.slug}`);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DonateAction",
    name: p.title,
    description: p.summary,
    recipient: { "@type": "NGO", name: p.ngo_name },
    url: `${siteUrl}/projects/${p.slug}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Container className="py-8 sm:py-12">
        {p.ngo_is_demo && <SampleNotice what="project" />}
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted">
          <Link href="/projects" className="hover:text-primary">Projects</Link> /{" "}
          <Link href={`/projects?cause=${p.category}`} className="hover:text-primary">{categoryLabel(p.category)}</Link>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:gap-12">
          {/* Main column */}
          <div className="min-w-0 space-y-10">
            <header>
              <div className="flex flex-wrap gap-2">
                <Badge tone="success"><ShieldCheck className="h-3.5 w-3.5" /> Verified Project</Badge>
                <Badge tone="accent">{categoryEmoji(p.category)} {categoryLabel(p.category)}</Badge>
                {completed && <Badge tone="success">✓ Completed with proof</Badge>}
                {p.status === "funded" && <Badge tone="accent">Goal reached</Badge>}
                {p.status === "proof_submitted" && <Badge tone="info">Proof under review</Badge>}
              </div>
              <h1 className="mt-3 font-serif text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">{p.title}</h1>
              <p className="mt-3 text-lg text-muted">{p.summary}</p>
              <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {p.city}, {p.state}</span>
                {p.beneficiaries_count && (
                  <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {formatNumber(p.beneficiaries_count)} beneficiaries</span>
                )}
                {p.deadline && (
                  <span className="flex items-center gap-1"><CalendarClock className="h-4 w-4" /> Deadline {formatDateIST(p.deadline)}</span>
                )}
              </p>
            </header>

            <Gallery images={images} alt={p.title} fallback={categoryEmoji(p.category)} />

            {/* Mobile funding card */}
            <div className="lg:hidden">
              <FundingCard p={p} pct={pct} left={left} accepting={accepting} completed={completed} shareText={shareText} isDemo={p.ngo_is_demo} />
            </div>

            {completed && proof && (
              <Reveal>
                <section className="relative overflow-hidden rounded-[2rem] border-2 border-success/30 bg-gradient-to-br from-emerald-50 to-surface p-6">
                  <h2 className="flex items-center gap-2 font-serif text-2xl font-semibold text-success">
                    <Camera className="h-6 w-6" /> Proof of completion
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    Reviewed and approved by KindBharat on {proof.reviewed_at ? formatDateIST(proof.reviewed_at) : "—"} ·{" "}
                    <strong className="text-ink">{formatNumber(proof.beneficiaries_reached)}</strong> people reached
                  </p>
                  <p className="mt-4 whitespace-pre-line">{proof.description}</p>
                  <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {proof.files.map((f) => (
                      <li key={f}>
                        <a href={publicUrl("media", f) ?? "#"} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-2xl">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={publicUrl("media", f) ?? ""} alt="Proof photo" className="aspect-square w-full object-cover transition hover:scale-105" loading="lazy" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              </Reveal>
            )}

            <Reveal>
              <section>
                <h2 className="font-serif text-2xl font-semibold">About this project</h2>
                <p className="mt-2 text-sm font-medium text-primary">Who benefits: {p.beneficiaries_desc}</p>
                <div className="mt-4 whitespace-pre-line leading-relaxed">{p.description}</div>
              </section>
            </Reveal>

            <Reveal>
              <section>
                <h2 className="font-serif text-2xl font-semibold">Where every rupee goes</h2>
                <div className="mt-4 overflow-hidden rounded-3xl border border-border bg-surface">
                  <table className="w-full text-sm">
                    <thead className="bg-bg text-left text-xs uppercase tracking-wide text-muted">
                      <tr>
                        <th className="px-4 py-3">Item</th>
                        <th className="px-2 py-3 text-right">Qty</th>
                        <th className="hidden px-2 py-3 text-right sm:table-cell">Unit cost</th>
                        <th className="px-4 py-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {budget.map((b) => (
                        <tr key={b.id}>
                          <td className="px-4 py-3">{b.item}</td>
                          <td className="px-2 py-3 text-right tabular-nums">{formatNumber(b.quantity)}</td>
                          <td className="hidden px-2 py-3 text-right tabular-nums sm:table-cell">{formatINR(b.unit_cost)}</td>
                          <td className="px-4 py-3 text-right font-medium tabular-nums">{formatINR(b.total ?? 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-primary-soft font-semibold">
                        <td className="px-4 py-3" colSpan={2}>Goal</td>
                        <td className="hidden sm:table-cell" />
                        <td className="px-4 py-3 text-right font-serif text-lg tabular-nums">{formatINR(p.goal_amount)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </section>
            </Reveal>

            <Reveal>
              <section>
                <h2 className="flex items-center gap-2 font-serif text-2xl font-semibold">
                  <HandHeart className="h-6 w-6 text-primary" /> Confirmed donations
                  <span className="text-base font-normal text-muted">({formatNumber(p.donor_count)})</span>
                </h2>
                <p className="mt-1 text-sm text-muted">Only donations the NGO has confirmed receiving are shown and counted.</p>
                {!donations.length ? (
                  <p className="mt-4 text-sm text-muted">No confirmed donations yet.</p>
                ) : (
                  <ul className="mt-4 divide-y divide-border rounded-3xl border border-border bg-surface">
                    {donations.map((d) => (
                      <li key={d.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-sm">
                        <strong className="font-serif text-base tabular-nums">{formatINR(d.amount)}</strong>
                        <span>· {d.display_name}</span>
                        <span className="text-success">· ✅ {d.verified_by_admin ? "Verified by KindBharat" : "Confirmed by NGO"}</span>
                        <span className="ml-auto text-muted">{timeAgo(d.confirmed_at)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </Reveal>

            <Comments
              projectId={p.id}
              slug={p.slug}
              comments={commentsRes.data ?? []}
              signedIn={!!session}
              isOwnerNgo={isOwnerNgo}
              canComment
            />

            <div className="border-t border-border pt-6">
              <ReportButton targetType="project" targetId={p.id} signedIn={!!session} next={`/projects/${p.slug}`} />
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="hidden lg:block">
              <FundingCard p={p} pct={pct} left={left} accepting={accepting} completed={completed} shareText={shareText} isDemo={p.ngo_is_demo} />
            </div>
            {ngo && (
              <Card className="!p-5">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-muted">Run by</p>
                <Link href={`/ngos/${ngo.slug}`} className="mt-3 flex items-center gap-3 group">
                  {ngo.logo_path ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={publicUrl("ngo-logos", ngo.logo_path) ?? ""} alt="" className="h-14 w-14 rounded-2xl object-cover" />
                  ) : (
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-xl font-semibold text-white">{ngo.name.charAt(0)}</span>
                  )}
                  <div>
                    <p className="font-semibold group-hover:text-primary">{ngo.name}</p>
                    <p className="flex items-center gap-1 text-xs font-semibold text-success"><BadgeCheck className="h-4 w-4" /> Verified NGO</p>
                  </div>
                </Link>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {ngo.has_80g && <Badge tone="info">80G</Badge>}
                  {ngo.has_12a && <Badge tone="info">12A</Badge>}
                  {ngo.has_fcra && <Badge tone="info">FCRA</Badge>}
                  {ngo.has_darpan && <Badge tone="neutral">NGO Darpan</Badge>}
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div><dt className="text-xs text-muted">Raised on KindBharat</dt><dd className="font-semibold">{formatINR(ngo.total_raised)}</dd></div>
                  <div><dt className="text-xs text-muted">Completed projects</dt><dd className="font-semibold">{ngo.completed_projects}</dd></div>
                </dl>
                <div className="mt-4">
                  <ReportButton targetType="ngo" targetId={ngo.id} signedIn={!!session} next={`/projects/${p.slug}`} />
                </div>
              </Card>
            )}
          </aside>
        </div>
      </Container>
    </>
  );
}

function FundingCard({
  p,
  pct,
  left,
  accepting,
  completed,
  shareText,
  isDemo,
}: {
  p: { slug: string; raised: number; goal_amount: number; donor_count: number; status: string };
  pct: number;
  left: number | null;
  accepting: boolean;
  completed: boolean;
  isDemo?: boolean;
  shareText: string;
}) {
  return (
    <Card className="relative overflow-hidden !p-6">
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-accent/20 blur-2xl" />
      <p className="relative font-serif text-4xl font-semibold text-primary">
        <CountUp value={p.raised} currency />
      </p>
      <p className="relative text-sm text-muted">confirmed of {formatINR(p.goal_amount)} goal</p>
      <Progress value={pct} done={completed} className="relative mt-4 h-3" />
      <dl className="relative mt-4 grid grid-cols-3 text-center">
        <div><dt className="text-xs text-muted">Funded</dt><dd className="text-lg font-semibold">{pct}%</dd></div>
        <div><dt className="text-xs text-muted">Donors</dt><dd className="text-lg font-semibold">{formatNumber(p.donor_count)}</dd></div>
        <div>
          <dt className="text-xs text-muted">Days left</dt>
          <dd className="text-lg font-semibold">{completed || left === null ? "—" : Math.max(0, left)}</dd>
        </div>
      </dl>
      <div className="relative mt-5 space-y-2">
        {accepting ? (
          <>
            <ButtonLink href={`/projects/${p.slug}/donate`} size="lg" className="w-full">
              <HandHeart className="h-5 w-5" /> {p.status === "funded" ? "Donate — help even more" : "Donate now"}
            </ButtonLink>
            {p.status === "funded" && (
              <p className="text-center text-xs text-muted">Goal reached — extra funds help more people. The NGO confirms every donation.</p>
            )}
          </>
        ) : (
          <p className="rounded-2xl bg-stone-100 p-3 text-center text-sm text-muted">
            {isDemo
              ? "Sample project — donations are disabled. Browse real projects to donate."
              : completed
                ? "This project is complete."
                : "This project isn't accepting donations right now."}
          </p>
        )}
        <a
          href={`https://wa.me/?text=${shareText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm font-semibold text-[#128C7E] transition hover:bg-emerald-50"
        >
          <MessageCircle className="h-4 w-4" /> Share on WhatsApp
        </a>
      </div>
      <p className="relative mt-4 flex items-start gap-1.5 text-xs text-muted">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        You pay the NGO directly. KindBharat never collects money and charges no fees.
      </p>
    </Card>
  );
}
