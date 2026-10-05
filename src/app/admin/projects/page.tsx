import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, FolderKanban } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { Card, EmptyState, PageHeader } from "@/components/ui/card";
import { FilterTabs } from "@/components/ui/filter-tabs";
import type { ProjectStatus } from "@/lib/database.types";
import { categoryEmoji, PROJECT_STATUS } from "@/lib/constants";
import { formatDateIST, formatINR } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Project approval", robots: { index: false } };

const TABS: { value: ProjectStatus; label: string }[] = [
  { value: "under_review", label: "To review" },
  { value: "active", label: "Active" },
  { value: "funded", label: "Funded" },
  { value: "paused", label: "Paused" },
  { value: "proof_submitted", label: "Proof submitted" },
  { value: "completed", label: "Completed" },
  { value: "rejected", label: "Rejected" },
  { value: "removed", label: "Removed" },
];

export default async function AdminProjects({ searchParams }: PageProps<"/admin/projects">) {
  const sp = await searchParams;
  const status = (TABS.some((t) => t.value === sp.status) ? sp.status : "under_review") as ProjectStatus;
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, category, goal_amount, city, state, status, submitted_at, deadline, ngo_id")
    .eq("status", status)
    .order("submitted_at", { ascending: true, nullsFirst: false })
    .limit(200);
  const ngoIds = [...new Set((projects ?? []).map((p) => p.ngo_id))];
  const { data: ngos } = ngoIds.length ? await supabase.from("ngos").select("id, name").in("id", ngoIds) : { data: [] };
  const ngoName = new Map((ngos ?? []).map((n) => [n.id, n.name]));

  return (
    <>
      <PageHeader eyebrow="Queue" title="Projects" description="Every project is approved by hand before it goes live with payment details." />
      <FilterTabs base="/admin/projects" current={status} tabs={TABS} />
      {!projects?.length ? (
        <EmptyState icon={<FolderKanban className="h-7 w-7" />} title="Nothing here" />
      ) : (
        <ul className="space-y-3">
          {projects.map((p) => (
            <li key={p.id}>
              <Link href={`/admin/projects/${p.id}`}>
                <Card className="flex items-center gap-4 !p-4 transition hover:-translate-y-0.5 hover:shadow-xl">
                  <span className="text-3xl" aria-hidden>{categoryEmoji(p.category)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{p.title}</p>
                    <p className="text-sm text-muted">
                      {ngoName.get(p.ngo_id)} · {formatINR(p.goal_amount)} · {p.city}, {p.state}
                      {p.submitted_at && ` · submitted ${formatDateIST(p.submitted_at)}`}
                    </p>
                  </div>
                  <StatusBadge status={PROJECT_STATUS[p.status]} />
                  <ChevronRight className="h-5 w-5 text-muted" />
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
