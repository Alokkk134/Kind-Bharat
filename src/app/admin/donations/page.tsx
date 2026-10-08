import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ImageIcon, IndianRupee, ShieldCheck } from "lucide-react";
import { ReviewForm } from "@/components/forms/review-form";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Card, EmptyState, PageHeader } from "@/components/ui/card";
import { FilterTabs } from "@/components/ui/filter-tabs";
import type { Donation } from "@/lib/database.types";
import { DONATION_STATUS } from "@/lib/constants";
import { formatDateTimeIST, formatINR } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { uuid } from "@/lib/validation";
import { reviewDonationAdminAction } from "../actions";

export const metadata: Metadata = { title: "Donations oversight", robots: { index: false } };

const TABS = [
  { value: "to_review", label: "Rejections to check" },
  { value: "stale", label: "Pending > 7 days" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "rejected", label: "All rejected" },
  { value: "all", label: "All" },
];

const STALE_DAYS = 7;
const daysSince = (iso: string) => Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
const staleCutoff = () => new Date(Date.now() - STALE_DAYS * 86_400_000).toISOString();

export default async function AdminDonations({ searchParams }: PageProps<"/admin/donations">) {
  const sp = await searchParams;
  const status = TABS.some((t) => t.value === sp.status) ? (sp.status as string) : "to_review";
  const ngoFilter = typeof sp.ngo === "string" && uuid.safeParse(sp.ngo).success ? sp.ngo : "";
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 60) : "";
  const supabase = await createClient();

  // Map projects → NGOs (for names, filters and the per-NGO summary)
  const [{ data: projects }, { data: ngos }, { data: allDons }] = await Promise.all([
    supabase.from("projects").select("id, title, slug, ngo_id, status"),
    supabase.from("ngos").select("id, name, status, is_demo").order("name"),
    supabase.from("donations").select("project_id, status, amount, created_at, admin_reviewed_at, screenshot_path").limit(10000),
  ]);
  const projectById = new Map((projects ?? []).map((p) => [p.id, p]));
  const ngoById = new Map((ngos ?? []).map((n) => [n.id, n]));

  // Per-NGO summary
  type Row = { confirmed: number; pending: number; stale: number; rejected: number; rejectedUnchecked: number; raised: number };
  const summary = new Map<string, Row>();
  for (const d of allDons ?? []) {
    const ngoId = projectById.get(d.project_id)?.ngo_id;
    if (!ngoId) continue;
    const r = summary.get(ngoId) ?? { confirmed: 0, pending: 0, stale: 0, rejected: 0, rejectedUnchecked: 0, raised: 0 };
    if (d.status === "confirmed") { r.confirmed++; r.raised += d.amount; }
    if (d.status === "pending") { r.pending++; if (daysSince(d.created_at) >= STALE_DAYS) r.stale++; }
    if (d.status === "rejected") { r.rejected++; if (!d.admin_reviewed_at) r.rejectedUnchecked++; }
    summary.set(ngoId, r);
  }
  const summaryRows = [...summary.entries()]
    .map(([id, r]) => ({ id, name: ngoById.get(id)?.name ?? "—", ...r, rate: r.rejected / Math.max(1, r.confirmed + r.rejected) }))
    .sort((a, b) => b.rejectedUnchecked - a.rejectedUnchecked || b.rate - a.rate || b.stale - a.stale);

  // The list
  let query = supabase.from("donations").select("*").order("created_at", { ascending: false }).limit(150);
  if (status === "to_review") query = query.eq("status", "rejected").is("admin_reviewed_at", null);
  else if (status === "stale") query = query.eq("status", "pending").lt("created_at", staleCutoff());
  else if (status !== "all") query = query.eq("status", status as Donation["status"]);
  if (ngoFilter) {
    const ids = (projects ?? []).filter((p) => p.ngo_id === ngoFilter).map((p) => p.id);
    query = query.in("project_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
  }
  if (q) {
    const safe = q.replace(/[%_,()]/g, " ");
    query = query.or(`utr.ilike.%${safe}%,donor_name.ilike.%${safe}%,donor_email.ilike.%${safe}%,donor_phone.ilike.%${safe}%`);
  }
  const { data: donations } = await query;

  const rows = await Promise.all(
    (donations ?? []).map(async (d) => ({
      ...d,
      shot: d.screenshot_path
        ? (await supabase.storage.from("payment-screenshots").createSignedUrl(d.screenshot_path, 900)).data?.signedUrl ?? null
        : null,
    })),
  );

  const base = (patch: Record<string, string>) => {
    const u = new URLSearchParams({ status, ngo: ngoFilter, q, ...patch });
    for (const [k, v] of [...u.entries()]) if (!v) u.delete(k);
    return `/admin/donations?${u}`;
  };

  return (
    <>
      <PageHeader
        eyebrow="Oversight"
        title="Donations"
        description="Every donation on KindBharat. Check that NGOs aren't rejecting genuine donations — and overturn a rejection when the donor's proof is real."
      />

      {/* Per-NGO health */}
      {summaryRows.length > 0 && (
        <Card className="mb-8 overflow-x-auto !p-0">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-bg text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">NGO</th>
                <th className="px-3 py-3 text-right">Confirmed</th>
                <th className="px-3 py-3 text-right">Pending</th>
                <th className="px-3 py-3 text-right">Rejected</th>
                <th className="px-3 py-3 text-right">Rejection rate</th>
                <th className="px-4 py-3 text-right">Raised</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {summaryRows.map((r) => {
                const risky = r.rejectedUnchecked > 0 || (r.rejected >= 2 && r.rate >= 0.3) || r.stale > 0;
                return (
                  <tr key={r.id} className={cn(risky && "bg-amber-50/60")}>
                    <td className="px-4 py-3">
                      <Link href={base({ ngo: r.id, status: "all" })} className="font-semibold text-primary hover:underline">
                        {r.name}
                      </Link>
                      {ngoById.get(r.id)?.is_demo && <Badge className="ml-2">Sample</Badge>}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">{r.confirmed}</td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      {r.pending}
                      {r.stale > 0 && <span className="ml-1 text-xs font-semibold text-warning">({r.stale} late)</span>}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      {r.rejected}
                      {r.rejectedUnchecked > 0 && <span className="ml-1 text-xs font-semibold text-danger">({r.rejectedUnchecked} to check)</span>}
                    </td>
                    <td className={cn("px-3 py-3 text-right font-semibold tabular-nums", r.rate >= 0.3 && r.rejected >= 2 ? "text-danger" : "text-muted")}>
                      {Math.round(r.rate * 100)}%
                    </td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums">{formatINR(r.raised)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      <FilterTabs base={base({ status: "" }).replace(/status=[^&]*&?/, "")} current={status} tabs={TABS} />

      <form className="mb-6 grid gap-3 sm:grid-cols-[1fr_1fr_auto]" role="search">
        <input type="hidden" name="status" value={status} />
        <select name="ngo" defaultValue={ngoFilter} aria-label="Filter by NGO" className="kb-input">
          <option value="">All NGOs</option>
          {(ngos ?? []).map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
        </select>
        <input name="q" defaultValue={q} placeholder="Search UTR, donor name, email or phone" aria-label="Search donations" className="kb-input" />
        <button className="rounded-xl bg-primary px-5 py-2.5 font-semibold text-white hover:bg-primary-hover">Filter</button>
      </form>

      {!rows.length ? (
        <EmptyState icon={<IndianRupee className="h-7 w-7" />} title="Nothing here">
          {status === "to_review" ? "No rejected donations are waiting for review." : "No donations match."}
        </EmptyState>
      ) : (
        <ul className="space-y-4">
          {rows.map((d) => {
            const p = projectById.get(d.project_id);
            const ngo = p ? ngoById.get(p.ngo_id) : undefined;
            const age = daysSince(d.created_at);
            const flagShot = d.status === "rejected" && !!d.screenshot_path && !d.admin_reviewed_at;
            const flagStale = d.status === "pending" && age >= STALE_DAYS;
            const decisions =
              d.status === "pending"
                ? [
                    { value: "confirm", label: "Confirm on NGO's behalf", variant: "success" as const, needsReason: true },
                    { value: "reject", label: "Reject (fake/invalid)", variant: "danger" as const, needsReason: true, confirm: "Reject this donation as KindBharat?" },
                  ]
                : d.status === "rejected"
                  ? [
                      { value: "confirm", label: "Overturn — mark confirmed", variant: "success" as const, needsReason: true, confirm: "Overturn the NGO's rejection? This donation will count toward the goal and show as verified by KindBharat." },
                      { value: "uphold", label: "Uphold rejection", variant: "outline" as const, needsReason: true },
                    ]
                  : [{ value: "reject", label: "Mark as not genuine", variant: "danger" as const, needsReason: true, confirm: "Reject this confirmed donation? It will stop counting toward the goal." }];

            return (
              <li key={d.id}>
                <Card className={cn("!p-5", (flagShot || flagStale) && "ring-2 ring-amber-300")}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-serif text-3xl font-semibold text-primary">{formatINR(d.amount)}</p>
                      <p className="text-sm text-muted">
                        {ngo ? <Link href={`/admin/ngos/${p!.ngo_id}`} className="font-medium text-ink hover:text-primary">{ngo.name}</Link> : "—"}
                        {" · "}
                        {p ? <Link href={`/admin/projects/${p.id}`} className="hover:text-primary">{p.title}</Link> : "deleted project"}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {d.admin_reviewed_at && (
                        <Badge tone="info"><ShieldCheck className="h-3.5 w-3.5" /> Reviewed by KindBharat</Badge>
                      )}
                      <StatusBadge status={DONATION_STATUS[d.status]} />
                    </div>
                  </div>

                  {(flagShot || flagStale) && (
                    <p className="mt-3 flex items-center gap-2 rounded-2xl bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      {flagShot ? "Rejected by the NGO, but the donor uploaded a payment screenshot — please check." : `Waiting for the NGO for ${age} days.`}
                    </p>
                  )}

                  <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                    <div><dt className="text-xs text-muted">UTR / Txn ID</dt><dd className="break-all font-mono font-semibold">{d.utr}</dd></div>
                    <div><dt className="text-xs text-muted">Donor</dt><dd>{d.donor_name}{d.is_anonymous && " (Anonymous publicly)"}{d.donor_user_id && " · has account"}</dd></div>
                    <div><dt className="text-xs text-muted">Contact</dt><dd className="break-all">{[d.donor_email, d.donor_phone].filter(Boolean).join(" · ")}</dd></div>
                    <div><dt className="text-xs text-muted">Submitted</dt><dd>{formatDateTimeIST(d.created_at)}</dd></div>
                  </dl>

                  {d.message && <p className="mt-3 rounded-2xl bg-bg p-3 text-sm italic">“{d.message}”</p>}
                  {d.shot && (
                    <a href={d.shot} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline">
                      <ImageIcon className="h-4 w-4" /> View payment screenshot
                    </a>
                  )}
                  {d.rejection_reason && (
                    <p className="mt-3 text-sm"><span className="font-semibold text-danger">NGO&apos;s reason:</span> {d.rejection_reason}</p>
                  )}
                  {d.reviewed_at && d.status !== "pending" && (
                    <p className="text-xs text-muted">Decided {formatDateTimeIST(d.reviewed_at)}</p>
                  )}
                  {d.admin_note && (
                    <p className="mt-2 text-sm"><span className="font-semibold text-info">KindBharat note:</span> {d.admin_note}</p>
                  )}

                  <ReviewForm
                    className="mt-4 border-t border-border pt-4"
                    action={reviewDonationAdminAction}
                    id={d.id}
                    reasonName="note"
                    reasonLabel="Note (required — the NGO and donor will see it)"
                    reasonHint="E.g. “UTR matches the bank statement shared by the donor.”"
                    decisions={decisions}
                  />
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
