import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, FileText } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { Card, PageHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/field";
import { categoryLabel, docTypeLabel, NGO_STATUS, NGO_TYPES, REVIEW_STATUS } from "@/lib/constants";
import { formatDateIST } from "@/lib/format";
import { publicUrl } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";
import { uuid } from "@/lib/validation";
import { reviewNgoAction } from "../../actions";
import { ReviewForm } from "@/components/forms/review-form";

export const metadata: Metadata = { title: "Review NGO", robots: { index: false } };

export default async function AdminNgoDetail({ params }: PageProps<"/admin/ngos/[id]">) {
  const { id } = await params;
  if (!uuid.safeParse(id).success) notFound();
  const supabase = await createClient();
  const { data: ngo } = await supabase.from("ngos").select("*").eq("id", id).single();
  if (!ngo) notFound();

  const [{ data: docs }, { data: pay }, { data: owner }] = await Promise.all([
    supabase.from("ngo_documents").select("*").eq("ngo_id", id).order("uploaded_at"),
    supabase.from("ngo_payment_details").select("*").eq("ngo_id", id).maybeSingle(),
    supabase.from("profiles").select("full_name, phone, created_at").eq("id", ngo.owner_id).single(),
  ]);
  const { data: ngoProjects } = await supabase.from("projects").select("id").eq("ngo_id", id);
  const projectIds = (ngoProjects ?? []).map((p) => p.id);
  const { data: ngoDons } = projectIds.length
    ? await supabase.from("donations").select("status, amount, admin_reviewed_at").in("project_id", projectIds)
    : { data: [] };
  const dc = (s: string) => (ngoDons ?? []).filter((d) => d.status === s).length;
  const unchecked = (ngoDons ?? []).filter((d) => d.status === "rejected" && !d.admin_reviewed_at).length;
  const docsWithUrls = await Promise.all(
    (docs ?? []).map(async (d) => ({
      ...d,
      url: (await supabase.storage.from(d.bucket).createSignedUrl(d.file_path, 600)).data?.signedUrl,
    })),
  );

  const rows: [string, React.ReactNode][] = [
    ["Type", NGO_TYPES.find((t) => t.value === ngo.type)?.label],
    ["Year founded", ngo.year_founded],
    ["Registration no.", ngo.registration_number],
    ["NGO Darpan ID", ngo.darpan_id],
    ["PAN", ngo.pan],
    ["Address", ngo.address],
    ["City / State", [ngo.city, ngo.state].filter(Boolean).join(", ")],
    ["Contact person", ngo.contact_person],
    ["Contact phone", ngo.contact_phone],
    ["Public email", ngo.contact_email],
    ["Website", ngo.website],
    ["Social", ngo.social_links],
    ["Focus areas", ngo.focus_areas.map(categoryLabel).join(", ")],
    ["Account owner", `${owner?.full_name ?? ""} ${owner?.phone ? `· ${owner.phone}` : ""}`],
    ["Joined", formatDateIST(ngo.created_at)],
  ];

  return (
    <>
      <Link href="/admin/ngos" className="mb-4 inline-flex items-center gap-1 text-sm text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" /> All NGOs
      </Link>
      <PageHeader
        eyebrow="NGO review"
        title={ngo.name}
        actions={<StatusBadge status={NGO_STATUS[ngo.status]} />}
        description={ngo.status === "verified" ? <Link className="text-primary underline" href={`/ngos/${ngo.slug}`}>View public page</Link> : undefined}
      />
      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <Card>
            <div className="mb-4 flex items-center gap-4">
              {ngo.logo_path && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={publicUrl("ngo-logos", ngo.logo_path) ?? ""} alt="" className="h-16 w-16 rounded-2xl object-cover" />
              )}
              <p className="text-sm text-muted">Check these details against the documents.</p>
            </div>
            <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              {rows.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{k}</dt>
                  <dd className="break-words">{v || <span className="text-muted">—</span>}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 border-t border-border pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">About</p>
              <p className="mt-1 whitespace-pre-line text-sm">{ngo.about}</p>
            </div>
          </Card>

          <Card>
            <h2 className="mb-3 font-serif text-lg font-semibold">Documents ({docsWithUrls.length})</h2>
            {!docsWithUrls.length ? (
              <p className="text-sm text-muted">No documents uploaded.</p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {docsWithUrls.map((d) => (
                  <li key={d.id}>
                    <a
                      href={d.url ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-2xl border border-border p-3 transition hover:border-primary hover:bg-primary-soft"
                    >
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="flex-1 text-sm font-medium">{docTypeLabel(d.doc_type)}</span>
                      <ExternalLink className="h-4 w-4 text-muted" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-xs text-muted">Links expire after 10 minutes. Reload the page for fresh links.</p>
          </Card>

          <Card>
            <h2 className="mb-3 font-serif text-lg font-semibold">Donations</h2>
            <dl className="grid grid-cols-3 gap-3 text-center text-sm">
              <div className="rounded-2xl bg-emerald-50 p-3"><dt className="text-xs text-muted">Confirmed</dt><dd className="text-xl font-semibold">{dc("confirmed")}</dd></div>
              <div className="rounded-2xl bg-amber-50 p-3"><dt className="text-xs text-muted">Pending</dt><dd className="text-xl font-semibold">{dc("pending")}</dd></div>
              <div className="rounded-2xl bg-red-50 p-3"><dt className="text-xs text-muted">Rejected</dt><dd className="text-xl font-semibold">{dc("rejected")}</dd></div>
            </dl>
            {unchecked > 0 && <p className="mt-3 text-sm font-medium text-danger">{unchecked} rejected donation{unchecked === 1 ? "" : "s"} not yet checked by you.</p>}
            <Link href={`/admin/donations?ngo=${ngo.id}&status=all`} className="mt-3 inline-block text-sm font-semibold text-primary underline">
              View all donations of this NGO →
            </Link>
          </Card>

          <Card>
            <h2 className="mb-3 font-serif text-lg font-semibold">Payment details</h2>
            {pay ? (
              <div className="space-y-1 text-sm">
                <StatusBadge status={REVIEW_STATUS[pay.review_status]} />
                <p>UPI: {pay.upi_id ?? "—"}</p>
                <p>Bank: {pay.bank_account_name ?? "—"} {pay.account_number && `· ${pay.account_number} · ${pay.ifsc} · ${pay.bank_name}`}</p>
                <Link href="/admin/payments" className="text-primary underline">Review in payment queue</Link>
              </div>
            ) : (
              <p className="text-sm text-muted">Not added yet.</p>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="xl:sticky xl:top-24">
            <h2 className="mb-1 font-serif text-lg font-semibold">Decision</h2>
            {ngo.rejection_reason && <p className="mb-3 text-sm text-danger">Last reason: {ngo.rejection_reason}</p>}
            {ngo.status === "pending" || ngo.status === "rejected" || ngo.status === "draft" ? (
              <ReviewForm
                action={reviewNgoAction}
                id={ngo.id}
                decisions={[
                  { value: "verify", label: "Verify NGO", variant: "success" },
                  { value: "reject", label: "Reject", variant: "danger", needsReason: true },
                ]}
              >
                <fieldset className="space-y-2 rounded-2xl bg-bg p-3">
                  <legend className="text-sm font-semibold">Badges confirmed from documents</legend>
                  <Checkbox name="has_12a" label="12A certificate verified" defaultChecked={ngo.has_12a} />
                  <Checkbox name="has_80g" label="80G certificate verified" defaultChecked={ngo.has_80g} />
                  <Checkbox name="has_fcra" label="FCRA registration verified" defaultChecked={ngo.has_fcra} />
                </fieldset>
              </ReviewForm>
            ) : ngo.status === "verified" ? (
              <ReviewForm
                action={reviewNgoAction}
                id={ngo.id}
                decisions={[
                  { value: "suspend", label: "Suspend NGO", variant: "danger", needsReason: true, confirm: "Suspend this NGO? All its projects will be hidden." },
                ]}
              />
            ) : (
              <ReviewForm action={reviewNgoAction} id={ngo.id} decisions={[{ value: "unsuspend", label: "Restore (verified)", variant: "success" }]} />
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
