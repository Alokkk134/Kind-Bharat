import type { Metadata } from "next";
import { ImageIcon, IndianRupee } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { Card, EmptyState, PageHeader } from "@/components/ui/card";
import { FilterTabs } from "@/components/ui/filter-tabs";
import type { DonationStatus } from "@/lib/database.types";
import { requireNgo } from "@/lib/auth";
import { DONATION_STATUS } from "@/lib/constants";
import { formatDateTimeIST, formatINR } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { ReviewForm } from "@/components/forms/review-form";
import { reviewDonationAction } from "./actions";

export const metadata: Metadata = { title: "Donations", robots: { index: false } };

export default async function NgoDonationsPage({ searchParams }: PageProps<"/ngo/donations">) {
  const ngo = await requireNgo();
  const sp = await searchParams;
  const status = (["pending", "confirmed", "rejected"].includes(sp.status as string) ? sp.status : "pending") as DonationStatus;
  const supabase = await createClient();
  const { data: projects } = await supabase.from("projects").select("id, title").eq("ngo_id", ngo.id);
  const titles = new Map((projects ?? []).map((p) => [p.id, p.title]));
  const ids = [...titles.keys()];
  const { data: donations } = ids.length
    ? await supabase
        .from("donations")
        .select("*")
        .in("project_id", ids)
        .eq("status", status)
        .order("created_at", { ascending: status !== "pending" ? false : true })
        .limit(200)
    : { data: [] };

  const withShots = await Promise.all(
    (donations ?? []).map(async (d) => ({
      ...d,
      shot: d.screenshot_path
        ? (await supabase.storage.from("payment-screenshots").createSignedUrl(d.screenshot_path, 600)).data?.signedUrl
        : null,
    })),
  );

  return (
    <>
      <PageHeader
        eyebrow="Money in"
        title="Donations"
        description="Check your bank/UPI statement for each UTR, then confirm. Only confirmed donations count toward your goal."
      />
      <FilterTabs
        base="/ngo/donations"
        current={status}
        tabs={[
          { value: "pending", label: "To confirm" },
          { value: "confirmed", label: "Confirmed" },
          { value: "rejected", label: "Not received" },
        ]}
      />
      {!withShots.length ? (
        <EmptyState icon={<IndianRupee className="h-7 w-7" />} title={status === "pending" ? "Nothing to confirm" : "Nothing here yet"} />
      ) : (
        <ul className="space-y-4">
          {withShots.map((d) => (
            <li key={d.id}>
              <Card className="!p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-serif text-3xl font-semibold text-primary">{formatINR(d.amount)}</p>
                    <p className="text-sm text-muted">for {titles.get(d.project_id)}</p>
                  </div>
                  <StatusBadge status={DONATION_STATUS[d.status]} />
                </div>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  <div><dt className="text-xs text-muted">UTR / Txn ID</dt><dd className="break-all font-mono font-semibold">{d.utr}</dd></div>
                  <div><dt className="text-xs text-muted">Donor</dt><dd>{d.donor_name}{d.is_anonymous && " (wants Anonymous)"}</dd></div>
                  <div><dt className="text-xs text-muted">Contact</dt><dd className="break-all">{[d.donor_email, d.donor_phone].filter(Boolean).join(" · ")}</dd></div>
                  <div><dt className="text-xs text-muted">Submitted</dt><dd>{formatDateTimeIST(d.created_at)}</dd></div>
                </dl>
                {d.message && <p className="mt-3 rounded-2xl bg-bg p-3 text-sm italic">“{d.message}”</p>}
                {d.shot && (
                  <a href={d.shot} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline">
                    <ImageIcon className="h-4 w-4" /> View payment screenshot
                  </a>
                )}
                {d.status === "rejected" && d.rejection_reason && <p className="mt-2 text-sm text-danger">Reason: {d.rejection_reason}</p>}
                {d.admin_reviewed_at && (
                  <p className="mt-2 rounded-2xl bg-sky-50 p-3 text-sm text-sky-900">
                    <strong>Reviewed by KindBharat:</strong> {d.admin_note}
                    {d.status === "confirmed" && d.rejection_reason && " — your earlier rejection was overturned."}
                  </p>
                )}
                {d.status === "pending" && (
                  <ReviewForm
                    className="mt-4 border-t border-border pt-4"
                    action={reviewDonationAction}
                    id={d.id}
                    reasonLabel="Reason if not received (shown to the donor)"
                    decisions={[
                      { value: "confirm", label: "✓ Confirm received", variant: "success" },
                      { value: "reject", label: "Not received", variant: "danger", needsReason: true, confirm: "Mark this donation as NOT received?" },
                    ]}
                  />
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
