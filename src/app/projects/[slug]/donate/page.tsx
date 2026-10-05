import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Landmark, ShieldAlert, Smartphone } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { getSession } from "@/lib/auth";
import { formatINR } from "@/lib/format";
import { getPublicProject } from "@/lib/queries";
import { publicUrl } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";
import { DonationForm } from "./donation-form";

export async function generateMetadata({ params }: PageProps<"/projects/[slug]/donate">): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPublicProject(slug);
  return { title: p ? `Donate to: ${p.title}` : "Donate", robots: { index: false } };
}

export default async function DonatePage({ params }: PageProps<"/projects/[slug]/donate">) {
  const { slug } = await params;
  const p = await getPublicProject(slug);
  if (!p) notFound();
  const supabase = await createClient();
  const [{ data: payRows }, session] = await Promise.all([
    supabase.rpc("get_payment_details", { p_project_id: p.id }),
    getSession(),
  ]);
  const pay = payRows?.[0];

  if (!pay) {
    return (
      <Container className="py-12">
        <Alert kind="warning" title="Donations are closed for this project">
          This project isn&apos;t accepting donations right now.{" "}
          <Link href={`/projects/${p.slug}`} className="font-semibold underline">Back to the project</Link>
        </Alert>
      </Container>
    );
  }

  const remaining = Math.max(0, p.goal_amount - p.raised);
  const upiLink = pay.upi_id
    ? `upi://pay?pa=${encodeURIComponent(pay.upi_id)}&pn=${encodeURIComponent(p.ngo_name)}&tn=${encodeURIComponent(`KindBharat: ${p.title}`.slice(0, 60))}&cu=INR`
    : null;

  return (
    <Container className="py-8 sm:py-12">
      <Link href={`/projects/${p.slug}`} className="mb-4 inline-flex items-center gap-1 text-sm text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to project
      </Link>
      <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">Donate to {p.ngo_name}</h1>
      <p className="mt-1 text-muted">
        For: <strong className="text-ink">{p.title}</strong>
        {remaining > 0 && <> · {formatINR(remaining)} still needed</>}
      </p>

      <div className="mt-5 flex items-start gap-3 rounded-3xl border-2 border-amber-300 bg-amber-50 p-4 text-amber-950">
        <ShieldAlert className="mt-0.5 h-6 w-6 shrink-0 text-warning" />
        <p className="text-sm font-medium">
          Pay only to the details shown on this page. This platform never asks you to pay anyone else.
          KindBharat does not collect money and charges no fees.
        </p>
      </div>

      <ol className="mt-8 grid gap-8 lg:grid-cols-2">
        <li>
          <StepTitle n={1} title="Pay the NGO directly" />
          <div className="space-y-4">
            {pay.upi_id && (
              <Card className="relative overflow-hidden">
                <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-2xl" />
                <p className="flex items-center gap-2 font-semibold"><Smartphone className="h-5 w-5 text-primary" /> UPI</p>
                <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                  {pay.qr_path && (
                    <div className="perspective">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={publicUrl("upi-qr", pay.qr_path) ?? ""}
                        alt={`UPI QR code for ${p.ngo_name}`}
                        className="h-48 w-48 rounded-2xl border border-border bg-white object-contain p-2 shadow-xl transition-transform duration-500 hover:[transform:rotateY(-12deg)_rotateX(6deg)_scale(1.04)]"
                      />
                    </div>
                  )}
                  <div className="w-full space-y-3">
                    <div>
                      <p className="text-xs text-muted">UPI ID</p>
                      <div className="flex items-center justify-between gap-2 rounded-xl bg-bg px-3 py-2">
                        <span className="break-all font-mono text-sm font-semibold">{pay.upi_id}</span>
                        <CopyButton value={pay.upi_id} />
                      </div>
                    </div>
                    {upiLink && (
                      <a href={upiLink} className="btn-shine flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-white sm:hidden">
                        Open UPI app
                      </a>
                    )}
                    <p className="text-xs text-muted">Scan the QR or copy the UPI ID in GPay, PhonePe, Paytm or your bank app. Check the name shown is <strong>{p.ngo_name}</strong> or its trust/society name.</p>
                  </div>
                </div>
              </Card>
            )}
            {pay.account_number && (
              <Card>
                <p className="flex items-center gap-2 font-semibold"><Landmark className="h-5 w-5 text-primary" /> Bank transfer (NEFT / IMPS)</p>
                <dl className="mt-3 space-y-2 text-sm">
                  {[
                    ["Account name", pay.bank_account_name],
                    ["Account number", pay.account_number],
                    ["IFSC", pay.ifsc],
                    ["Bank", pay.bank_name],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between gap-2 rounded-xl bg-bg px-3 py-2">
                      <div>
                        <dt className="text-xs text-muted">{k}</dt>
                        <dd className="font-mono font-semibold">{v}</dd>
                      </div>
                      {v && k !== "Bank" && <CopyButton value={v} />}
                    </div>
                  ))}
                </dl>
              </Card>
            )}
          </div>
        </li>
        <li>
          <StepTitle n={2} title="Tell us you paid" />
          <Card>
            <DonationForm
              projectId={p.id}
              slug={p.slug}
              defaultName={session?.profile.full_name ?? ""}
              defaultEmail={session?.email ?? ""}
              signedIn={!!session}
            />
          </Card>
        </li>
      </ol>
    </Container>
  );
}

function StepTitle({ n, title }: { n: number; title: string }) {
  return (
    <p className="mb-3 flex items-center gap-3 font-serif text-xl font-semibold">
      <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-accent font-sans text-base font-bold text-white shadow-lg shadow-accent/30">
        {n}
      </span>
      {title}
    </p>
  );
}
