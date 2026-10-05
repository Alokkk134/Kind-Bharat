import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Clock, FileCheck2, PartyPopper, ShieldCheck, Wallet } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { Card, PageHeader } from "@/components/ui/card";
import { CountUp } from "@/components/motion/count-up";
import { Reveal } from "@/components/motion/reveal";
import { getMyNgo, requireRole } from "@/lib/auth";
import { PROOF_GRACE_DAYS } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { SubmitVerificationButton } from "./submit-verification";

export const metadata: Metadata = { title: "NGO dashboard", robots: { index: false } };

export default async function NgoOverview({ searchParams }: PageProps<"/ngo">) {
  await requireRole("ngo");
  const sp = await searchParams;
  const ngo = await getMyNgo();
  const supabase = await createClient();

  if (!ngo) {
    return (
      <>
        <PageHeader eyebrow="Welcome" title="Let's set up your NGO" description="It takes about 10 minutes. Keep your registration certificate handy." />
        <Card className="relative overflow-hidden">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/20 blur-2xl" />
          <ol className="relative space-y-3 text-sm">
            <li>1. Fill in your organisation profile</li>
            <li>2. Upload your registration certificate (and 12A/80G/FCRA if you have them)</li>
            <li>3. Add your UPI / bank details</li>
            <li>4. Submit for verification — then create your first project</li>
          </ol>
          <ButtonLink href="/ngo/profile" className="relative mt-6">
            Start with your profile <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </Card>
      </>
    );
  }

  const [{ data: docs }, { data: pay }, { data: projects }, { data: blocked }] = await Promise.all([
    supabase.from("ngo_documents").select("doc_type").eq("ngo_id", ngo.id),
    supabase.from("ngo_payment_details").select("review_status").eq("ngo_id", ngo.id).maybeSingle(),
    supabase.from("projects").select("id, status").eq("ngo_id", ngo.id),
    supabase.rpc("my_ngo_blocked"),
  ]);

  const ids = (projects ?? []).map((p) => p.id);
  const { data: confirmed } = ids.length
    ? await supabase.from("donations").select("amount, status").in("project_id", ids)
    : { data: [] };
  const raised = (confirmed ?? []).filter((d) => d.status === "confirmed").reduce((s, d) => s + d.amount, 0);
  const pending = (confirmed ?? []).filter((d) => d.status === "pending").length;

  const hasReg = (docs ?? []).some((d) => d.doc_type === "registration");
  const steps = [
    { label: "Profile", done: true, href: "/ngo/profile", icon: Check },
    { label: "Documents", done: hasReg, href: "/ngo/documents", icon: FileCheck2 },
    { label: "Payment", done: !!pay, href: "/ngo/payment", icon: Wallet },
    { label: "Verified", done: ngo.status === "verified", href: "/ngo", icon: ShieldCheck },
  ];

  return (
    <>
      <PageHeader eyebrow="Overview" title={ngo.name} />

      {sp.password === "updated" && <Alert kind="success" className="mb-4">Your password was updated.</Alert>}

      {blocked && (
        <Alert kind="error" title="New projects are blocked" className="mb-6">
          A project ended or was fully funded more than {PROOF_GRACE_DAYS} days ago and still has no completion proof.
          Please <Link href="/ngo/projects" className="font-semibold underline">submit proof</Link> to unlock new projects.
        </Alert>
      )}

      {ngo.status === "rejected" && (
        <Alert kind="error" title="Verification was not approved" className="mb-6">
          {ngo.rejection_reason ?? "Please check your details."} Fix the issue and submit again.
        </Alert>
      )}
      {ngo.status === "suspended" && (
        <Alert kind="error" title="Your NGO is suspended" className="mb-6">
          Your projects are hidden from the public. {ngo.rejection_reason} Please contact us.
        </Alert>
      )}
      {pay?.review_status === "pending" && (
        <Alert kind="warning" title="Payment details are being checked" className="mb-6">
          Donors can&apos;t see your UPI/bank details until our team approves them.
        </Alert>
      )}
      {pay?.review_status === "rejected" && (
        <Alert kind="error" title="Payment details need attention" className="mb-6">
          Please <Link href="/ngo/payment" className="font-semibold underline">review your payment details</Link>.
        </Alert>
      )}

      {/* Verification journey */}
      <Card className="mb-6">
        <p className="mb-4 font-semibold">Verification journey</p>
        <ol className="grid grid-cols-4 gap-2">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <li key={s.label} className="relative flex flex-col items-center text-center">
                {i > 0 && (
                  <span
                    aria-hidden
                    className={cn(
                      "absolute right-1/2 top-5 h-0.5 w-full -translate-y-1/2",
                      s.done ? "bg-primary" : "bg-border",
                    )}
                  />
                )}
                <Link
                  href={s.href}
                  className={cn(
                    "relative z-10 flex h-10 w-10 items-center justify-center rounded-2xl ring-4 ring-surface transition hover:scale-110",
                    s.done ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-stone-100 text-muted",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </Link>
                <span className="mt-2 text-xs font-medium sm:text-sm">{s.label}</span>
              </li>
            );
          })}
        </ol>
        <div className="mt-6 border-t border-border pt-4">
          {ngo.status === "draft" || ngo.status === "rejected" ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted">
                {hasReg ? "Everything ready? Send your profile to our team." : "Upload your registration certificate first."}
              </p>
              <SubmitVerificationButton disabled={!hasReg} />
            </div>
          ) : ngo.status === "pending" ? (
            <p className="flex items-center gap-2 text-sm text-warning">
              <Clock className="h-4 w-4" /> Under review — we usually respond within 2–3 working days. You can prepare project drafts meanwhile.
            </p>
          ) : ngo.status === "verified" ? (
            <p className="flex items-center gap-2 text-sm text-success">
              <PartyPopper className="h-4 w-4" /> You&apos;re verified! Your “Verified NGO” badge is live.
            </p>
          ) : null}
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Confirmed funds raised", value: <CountUp value={raised} currency />, href: "/ngo/donations" },
          { label: "Donations to confirm", value: <CountUp value={pending} />, href: "/ngo/donations" },
          { label: "Projects", value: <CountUp value={projects?.length ?? 0} />, href: "/ngo/projects" },
        ].map((s, i) => (
          <Reveal key={s.label} delay={i * 80}>
            <Link href={s.href} className="block">
              <Card className="!p-5 transition hover:-translate-y-1 hover:shadow-xl">
                <p className="text-sm text-muted">{s.label}</p>
                <p className="mt-1 font-serif text-3xl font-semibold text-primary">{s.value}</p>
              </Card>
            </Link>
          </Reveal>
        ))}
      </div>
    </>
  );
}
