import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { Card, PageHeader } from "@/components/ui/card";
import { Gallery } from "@/components/project/gallery";
import { categoryEmoji, categoryLabel, NGO_STATUS, PROJECT_STATUS } from "@/lib/constants";
import { formatDateIST, formatINR, formatNumber } from "@/lib/format";
import { publicUrl } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";
import { uuid } from "@/lib/validation";
import { reviewProjectAction } from "../../actions";
import { ReviewForm } from "@/components/forms/review-form";

export const metadata: Metadata = { title: "Review project", robots: { index: false } };

export default async function AdminProjectDetail({ params }: PageProps<"/admin/projects/[id]">) {
  const { id } = await params;
  if (!uuid.safeParse(id).success) notFound();
  const supabase = await createClient();
  const { data: p } = await supabase.from("projects").select("*").eq("id", id).single();
  if (!p) notFound();
  const [{ data: ngo }, { data: budget }, { data: images }, { data: dons }] = await Promise.all([
    supabase.from("ngos").select("id, name, status").eq("id", p.ngo_id).single(),
    supabase.from("project_budget_items").select("*").eq("project_id", id).order("sort_order"),
    supabase.from("project_images").select("file_path").eq("project_id", id).order("sort_order"),
    supabase.from("donations").select("amount, status").eq("project_id", id),
  ]);
  const raised = (dons ?? []).filter((d) => d.status === "confirmed").reduce((s, d) => s + d.amount, 0);
  const budgetTotal = (budget ?? []).reduce((s, b) => s + (b.total ?? 0), 0);

  const decisions =
    p.status === "under_review"
      ? [
          { value: "approve", label: "Approve & publish", variant: "success" as const },
          { value: "reject", label: "Reject", variant: "danger" as const, needsReason: true },
        ]
      : p.status === "paused"
        ? [
            { value: "resume", label: "Resume", variant: "success" as const },
            { value: "remove", label: "Remove", variant: "danger" as const, needsReason: true, confirm: "Remove this project permanently from public view?" },
          ]
        : ["active", "funded"].includes(p.status)
          ? [
              { value: "pause", label: "Pause", variant: "outline" as const },
              { value: "remove", label: "Remove", variant: "danger" as const, needsReason: true, confirm: "Remove this project from public view?" },
            ]
          : p.status === "proof_submitted" || p.status === "rejected"
            ? [{ value: "remove", label: "Remove", variant: "danger" as const, needsReason: true }]
            : [];

  return (
    <>
      <Link href="/admin/projects" className="mb-4 inline-flex items-center gap-1 text-sm text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" /> All projects
      </Link>
      <PageHeader
        eyebrow="Project review"
        title={p.title}
        actions={<StatusBadge status={PROJECT_STATUS[p.status]} />}
        description={
          ["active", "funded", "proof_submitted", "completed"].includes(p.status) ? (
            <Link href={`/projects/${p.slug}`} className="inline-flex items-center gap-1 text-primary underline">
              Public page <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          ) : undefined
        }
      />
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Gallery images={(images ?? []).map((i) => publicUrl("media", i.file_path) ?? "")} alt={p.title} fallback={categoryEmoji(p.category)} />
          <Card>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-xs text-muted">NGO</dt><dd><Link className="text-primary underline" href={`/admin/ngos/${ngo?.id}`}>{ngo?.name}</Link> {ngo && <StatusBadge status={NGO_STATUS[ngo.status]} />}</dd></div>
              <div><dt className="text-xs text-muted">Cause</dt><dd>{categoryLabel(p.category)}</dd></div>
              <div><dt className="text-xs text-muted">Location</dt><dd>{p.city}, {p.state}</dd></div>
              <div><dt className="text-xs text-muted">Beneficiaries</dt><dd>{formatNumber(p.beneficiaries_count ?? 0)} — {p.beneficiaries_desc}</dd></div>
              <div><dt className="text-xs text-muted">Dates</dt><dd>{p.start_date ? formatDateIST(p.start_date) : "—"} → {p.deadline ? formatDateIST(p.deadline) : "—"}</dd></div>
              <div><dt className="text-xs text-muted">Confirmed raised</dt><dd>{formatINR(raised)} of {formatINR(p.goal_amount)}</dd></div>
            </dl>
            <p className="mt-4 font-semibold">{p.summary}</p>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">{p.description}</p>
          </Card>
          <Card>
            <h2 className="mb-3 font-serif text-lg font-semibold">Budget</h2>
            <ul className="divide-y divide-border text-sm">
              {(budget ?? []).map((b) => (
                <li key={b.id} className="flex justify-between gap-3 py-2">
                  <span>{b.item} — {formatNumber(b.quantity)} × {formatINR(b.unit_cost)}</span>
                  <span className="tabular-nums">{formatINR(b.total ?? 0)}</span>
                </li>
              ))}
            </ul>
            <p className={`mt-3 text-sm font-semibold ${budgetTotal === p.goal_amount ? "text-success" : "text-danger"}`}>
              Budget total {formatINR(budgetTotal)} {budgetTotal === p.goal_amount ? "= goal ✓" : `≠ goal ${formatINR(p.goal_amount)}`}
            </p>
          </Card>
        </div>
        <div>
          <Card className="xl:sticky xl:top-24">
            <h2 className="mb-1 font-serif text-lg font-semibold">Decision</h2>
            <p className="mb-4 text-sm text-muted">
              Check: realistic budget, real photos, matches the NGO&apos;s focus, nothing political or harmful.
            </p>
            {p.rejection_reason && <p className="mb-3 text-sm text-danger">Last reason: {p.rejection_reason}</p>}
            {decisions.length ? (
              <ReviewForm action={reviewProjectAction} id={p.id} decisions={decisions} />
            ) : (
              <p className="text-sm text-muted">No actions available in this status.</p>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
