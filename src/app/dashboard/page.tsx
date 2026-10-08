import type { Metadata } from "next";
import Link from "next/link";
import { HandHeart } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, EmptyState, PageHeader } from "@/components/ui/card";
import { CountUp } from "@/components/motion/count-up";
import { requireRole } from "@/lib/auth";
import { CONTACT_EMAIL } from "@/lib/config";
import { DONATION_STATUS } from "@/lib/constants";
import { formatDateIST, formatINR } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "My donations", robots: { index: false } };

export default async function DonorDashboard({ searchParams }: PageProps<"/dashboard">) {
  const session = await requireRole("donor");
  const sp = await searchParams;
  const supabase = await createClient();

  const { data: donations } = await supabase
    .from("donations")
    .select("id, project_id, amount, utr, status, rejection_reason, is_anonymous, created_at, confirmed_at, admin_note, admin_reviewed_at")
    .eq("donor_user_id", session.userId)
    .order("created_at", { ascending: false });

  const ids = [...new Set((donations ?? []).map((d) => d.project_id))];
  const { data: projects } = ids.length
    ? await supabase.from("public_projects").select("id, title, slug, ngo_name").in("id", ids)
    : { data: [] };
  const byId = new Map((projects ?? []).map((p) => [p.id, p]));

  const confirmed = (donations ?? []).filter((d) => d.status === "confirmed");
  const total = confirmed.reduce((s, d) => s + d.amount, 0);

  return (
    <>
      <PageHeader
        eyebrow="Your giving"
        title="My donations"
        description="Donations you submitted while logged in. The NGO confirms each one after checking their account."
        actions={<ButtonLink href="/projects">Find a project</ButtonLink>}
      />
      {sp.password === "updated" && <Alert kind="success" className="mb-6">Your password was updated.</Alert>}

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Confirmed total", value: <CountUp value={total} currency /> },
          { label: "Confirmed donations", value: <CountUp value={confirmed.length} /> },
          { label: "Projects supported", value: <CountUp value={new Set(confirmed.map((d) => d.project_id)).size} /> },
        ].map((s) => (
          <Card key={s.label} className="!p-5">
            <p className="text-sm text-muted">{s.label}</p>
            <p className="mt-1 font-serif text-3xl font-semibold text-primary">{s.value}</p>
          </Card>
        ))}
      </div>

      {!donations?.length ? (
        <EmptyState icon={<HandHeart className="h-7 w-7" />} title="No donations yet">
          When you donate to a project while logged in, it will show here with its status.
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {donations.map((d) => {
            const p = byId.get(d.project_id);
            return (
              <li key={d.id}>
                <Card className="flex flex-col gap-3 !p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    {p ? (
                      <Link href={`/projects/${p.slug}`} className="font-semibold hover:text-primary">
                        {p.title}
                      </Link>
                    ) : (
                      <span className="font-semibold">Project no longer public</span>
                    )}
                    <p className="text-sm text-muted">
                      {p?.ngo_name} · {formatDateIST(d.created_at)} · UTR {d.utr}
                      {d.is_anonymous && " · shown as Anonymous"}
                    </p>
                    {d.admin_reviewed_at && (
                      <p className="mt-1 text-sm text-info">Reviewed by KindBharat: {d.admin_note}</p>
                    )}
                    {d.status === "rejected" && !d.admin_reviewed_at && (
                      <p className="mt-1 text-xs text-muted">
                        Did you really pay? Email {CONTACT_EMAIL} with your UTR and payment screenshot — our team will check
                        with the NGO and can overturn a wrong rejection.
                      </p>
                    )}
                    {d.status === "rejected" && d.rejection_reason && (
                      <p className="mt-1 text-sm text-danger">NGO note: {d.rejection_reason}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-serif text-xl font-semibold">{formatINR(d.amount)}</span>
                    <StatusBadge status={DONATION_STATUS[d.status]} />
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-8 text-xs text-muted">
        <Badge tone="accent">Tip</Badge> Tax receipts (80G) are issued by the NGO, not by KindBharat. Contact the NGO
        with your UTR number.
      </p>
    </>
  );
}
