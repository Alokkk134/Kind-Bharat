import type { Metadata } from "next";
import Link from "next/link";
import { Camera } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { Card, EmptyState, PageHeader } from "@/components/ui/card";
import { FilterTabs } from "@/components/ui/filter-tabs";
import { ReviewForm } from "@/components/forms/review-form";
import type { ReviewStatus } from "@/lib/database.types";
import { REVIEW_STATUS } from "@/lib/constants";
import { formatDateIST, formatINR, formatNumber } from "@/lib/format";
import { publicUrl } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";
import { reviewProofAction } from "../actions";

export const metadata: Metadata = { title: "Completion proofs", robots: { index: false } };

export default async function AdminProofs({ searchParams }: PageProps<"/admin/proofs">) {
  const sp = await searchParams;
  const status = (["pending", "approved", "rejected"].includes(sp.status as string) ? sp.status : "pending") as ReviewStatus;
  const supabase = await createClient();
  const { data: proofs } = await supabase
    .from("completion_proofs")
    .select("*")
    .eq("status", status)
    .order("submitted_at", { ascending: true })
    .limit(100);
  const ids = (proofs ?? []).map((p) => p.project_id);
  const [{ data: projects }, { data: dons }] = ids.length
    ? await Promise.all([
        supabase.from("projects").select("id, title, goal_amount, beneficiaries_count, ngo_id").in("id", ids),
        supabase.from("donations").select("project_id, amount").in("project_id", ids).eq("status", "confirmed"),
      ])
    : [{ data: [] }, { data: [] }];
  const pById = new Map((projects ?? []).map((p) => [p.id, p]));
  const raised = new Map<string, number>();
  for (const d of dons ?? []) raised.set(d.project_id, (raised.get(d.project_id) ?? 0) + d.amount);

  return (
    <>
      <PageHeader eyebrow="Queue" title="Completion proofs" description="Approve when photos and bills reasonably match the budget and beneficiaries." />
      <FilterTabs
        base="/admin/proofs"
        current={status}
        tabs={[
          { value: "pending", label: "To review" },
          { value: "approved", label: "Approved" },
          { value: "rejected", label: "Sent back" },
        ]}
      />
      {!proofs?.length ? (
        <EmptyState icon={<Camera className="h-7 w-7" />} title="Nothing to review" />
      ) : (
        <ul className="space-y-5">
          {proofs.map((pr) => {
            const p = pById.get(pr.project_id);
            return (
              <li key={pr.id}>
                <Card>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <Link href={`/admin/projects/${pr.project_id}`} className="font-serif text-lg font-semibold text-primary hover:underline">
                        {p?.title}
                      </Link>
                      <p className="text-sm text-muted">
                        Submitted {formatDateIST(pr.submitted_at)} · Raised {formatINR(raised.get(pr.project_id) ?? 0)} of {formatINR(p?.goal_amount ?? 0)} ·
                        Reached {formatNumber(pr.beneficiaries_reached)} (planned {formatNumber(p?.beneficiaries_count ?? 0)})
                      </p>
                    </div>
                    <StatusBadge status={REVIEW_STATUS[pr.status]} />
                  </div>
                  <p className="mt-3 whitespace-pre-line text-sm">{pr.description}</p>
                  <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {pr.files.map((f) => (
                      <li key={f}>
                        <a href={publicUrl("media", f) ?? "#"} target="_blank" rel="noopener noreferrer">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={publicUrl("media", f) ?? ""} alt="" className="aspect-square w-full rounded-xl object-cover transition hover:scale-105" loading="lazy" />
                        </a>
                      </li>
                    ))}
                  </ul>
                  {pr.admin_note && <p className="mt-3 text-sm text-muted">Note: {pr.admin_note}</p>}
                  {pr.status === "pending" && (
                    <ReviewForm
                      className="mt-4 border-t border-border pt-4"
                      action={reviewProofAction}
                      id={pr.id}
                      reasonName="note"
                      reasonLabel="Note to NGO (required if sending back)"
                      decisions={[
                        { value: "approve", label: "Approve — mark completed", variant: "success" },
                        { value: "reject", label: "Send back", variant: "danger", needsReason: true },
                      ]}
                    />
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
