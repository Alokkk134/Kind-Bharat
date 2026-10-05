import type { Metadata } from "next";
import Link from "next/link";
import { Wallet } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { Card, EmptyState, PageHeader } from "@/components/ui/card";
import { FilterTabs } from "@/components/ui/filter-tabs";
import type { ReviewStatus } from "@/lib/database.types";
import { NGO_STATUS, REVIEW_STATUS } from "@/lib/constants";
import { formatDateTimeIST } from "@/lib/format";
import { publicUrl } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";
import { reviewPaymentAction } from "../actions";
import { ReviewForm } from "@/components/forms/review-form";

export const metadata: Metadata = { title: "Payment details review", robots: { index: false } };

export default async function AdminPayments({ searchParams }: PageProps<"/admin/payments">) {
  const sp = await searchParams;
  const status = (["pending", "approved", "rejected"].includes(sp.status as string) ? sp.status : "pending") as ReviewStatus;
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("ngo_payment_details")
    .select("*")
    .eq("review_status", status)
    .order("updated_at", { ascending: true })
    .limit(100);
  const ngoIds = (rows ?? []).map((r) => r.ngo_id);
  const { data: ngos } = ngoIds.length
    ? await supabase.from("ngos").select("id, name, status").in("id", ngoIds)
    : { data: [] };
  const ngoById = new Map((ngos ?? []).map((n) => [n.id, n]));

  return (
    <>
      <PageHeader
        eyebrow="Anti-fraud"
        title="Payment details"
        description="New or changed UPI/bank details stay hidden from donors until you approve them. Check the account name matches the NGO."
      />
      <FilterTabs
        base="/admin/payments"
        current={status}
        tabs={[
          { value: "pending", label: "To review" },
          { value: "approved", label: "Approved" },
          { value: "rejected", label: "Rejected" },
        ]}
      />
      {!rows?.length ? (
        <EmptyState icon={<Wallet className="h-7 w-7" />} title="Nothing to review" />
      ) : (
        <ul className="space-y-4">
          {rows.map((p) => {
            const ngo = ngoById.get(p.ngo_id);
            return (
              <li key={p.id}>
                <Card>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Link href={`/admin/ngos/${p.ngo_id}`} className="font-semibold text-primary hover:underline">
                      {ngo?.name ?? "NGO"}
                    </Link>
                    <div className="flex gap-2">
                      {ngo && <StatusBadge status={NGO_STATUS[ngo.status]} />}
                      <StatusBadge status={REVIEW_STATUS[p.review_status]} />
                    </div>
                  </div>
                  <p className="text-xs text-muted">Last changed {formatDateTimeIST(p.updated_at)}</p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]">
                    <dl className="grid gap-2 text-sm sm:grid-cols-2">
                      <div><dt className="text-xs text-muted">UPI ID</dt><dd className="font-mono">{p.upi_id ?? "—"}</dd></div>
                      <div><dt className="text-xs text-muted">Account name</dt><dd>{p.bank_account_name ?? "—"}</dd></div>
                      <div><dt className="text-xs text-muted">Account number</dt><dd className="font-mono">{p.account_number ?? "—"}</dd></div>
                      <div><dt className="text-xs text-muted">IFSC · Bank</dt><dd className="font-mono">{p.ifsc ?? "—"} · {p.bank_name ?? "—"}</dd></div>
                    </dl>
                    {p.qr_path && (
                      <a href={publicUrl("upi-qr", p.qr_path) ?? "#"} target="_blank" rel="noopener noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={publicUrl("upi-qr", p.qr_path) ?? ""} alt="UPI QR" className="h-32 w-32 rounded-2xl border border-border object-contain" />
                      </a>
                    )}
                  </div>
                  {p.review_status === "pending" && (
                    <ReviewForm
                      className="mt-4 border-t border-border pt-4"
                      action={reviewPaymentAction}
                      id={p.id}
                      reasonName="note"
                      reasonLabel="Note to NGO (required if rejecting)"
                      decisions={[
                        { value: "approve", label: "Approve", variant: "success" },
                        { value: "reject", label: "Reject", variant: "danger", needsReason: true },
                      ]}
                    />
                  )}
                  {p.review_note && <p className="mt-3 text-sm text-muted">Note: {p.review_note}</p>}
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
