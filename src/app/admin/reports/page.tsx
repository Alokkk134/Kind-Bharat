import type { Metadata } from "next";
import Link from "next/link";
import { Flag } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { Card, EmptyState, PageHeader } from "@/components/ui/card";
import { FilterTabs } from "@/components/ui/filter-tabs";
import { ReviewForm } from "@/components/forms/review-form";
import type { ReportStatus } from "@/lib/database.types";
import { REPORT_REASONS, REPORT_STATUS } from "@/lib/constants";
import { formatDateTimeIST } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { reviewReportAction } from "../actions";

export const metadata: Metadata = { title: "Reports", robots: { index: false } };

export default async function AdminReports({ searchParams }: PageProps<"/admin/reports">) {
  const sp = await searchParams;
  const status = (Object.keys(REPORT_STATUS).includes(sp.status as string) ? sp.status : "open") as ReportStatus;
  const supabase = await createClient();
  const { data: reports } = await supabase.from("reports").select("*").eq("status", status).order("created_at", { ascending: true }).limit(200);

  const projectIds = (reports ?? []).filter((r) => r.target_type === "project").map((r) => r.target_id);
  const ngoIds = (reports ?? []).filter((r) => r.target_type === "ngo").map((r) => r.target_id);
  const reporterIds = [...new Set((reports ?? []).map((r) => r.reporter_id))];
  const [{ data: projects }, { data: ngos }, { data: reporters }] = await Promise.all([
    projectIds.length ? supabase.from("projects").select("id, title").in("id", projectIds) : Promise.resolve({ data: [] as { id: string; title: string }[] }),
    ngoIds.length ? supabase.from("ngos").select("id, name").in("id", ngoIds) : Promise.resolve({ data: [] as { id: string; name: string }[] }),
    reporterIds.length ? supabase.from("profiles").select("id, full_name").in("id", reporterIds) : Promise.resolve({ data: [] as { id: string; full_name: string }[] }),
  ]);
  const names = new Map<string, string>([
    ...(projects ?? []).map((p) => [p.id, p.title] as [string, string]),
    ...(ngos ?? []).map((n) => [n.id, n.name] as [string, string]),
  ]);
  const reporterName = new Map((reporters ?? []).map((r) => [r.id, r.full_name]));

  return (
    <>
      <PageHeader eyebrow="Trust & safety" title="Reports" description="Investigate, then pause/remove the project or suspend the NGO if needed." />
      <FilterTabs base="/admin/reports" current={status} tabs={Object.entries(REPORT_STATUS).map(([value, s]) => ({ value, label: s.label }))} />
      {!reports?.length ? (
        <EmptyState icon={<Flag className="h-7 w-7" />} title="No reports here" />
      ) : (
        <ul className="space-y-4">
          {reports.map((r) => (
            <li key={r.id}>
              <Card>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">
                      {REPORT_REASONS.find((x) => x.value === r.reason)?.label} ·{" "}
                      <Link
                        href={r.target_type === "project" ? `/admin/projects/${r.target_id}` : `/admin/ngos/${r.target_id}`}
                        className="text-primary hover:underline"
                      >
                        {r.target_type === "project" ? "Project" : "NGO"}: {names.get(r.target_id) ?? "deleted"}
                      </Link>
                    </p>
                    <p className="text-xs text-muted">By {reporterName.get(r.reporter_id) ?? "user"} · {formatDateTimeIST(r.created_at)}</p>
                  </div>
                  <StatusBadge status={REPORT_STATUS[r.status]} />
                </div>
                <p className="mt-3 whitespace-pre-line rounded-2xl bg-bg p-3 text-sm">{r.description}</p>
                {r.admin_note && <p className="mt-2 text-sm text-muted">Admin note: {r.admin_note}</p>}
                <ReviewForm
                  className="mt-4 border-t border-border pt-4"
                  action={reviewReportAction}
                  id={r.id}
                  field="status"
                  reasonName="note"
                  reasonLabel="Internal note (optional)"
                  decisions={[
                    { value: "reviewed", label: "Reviewed", variant: "outline" },
                    { value: "action_taken", label: "Action taken", variant: "success" },
                    { value: "dismissed", label: "Dismiss", variant: "outline" },
                  ]}
                />
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
