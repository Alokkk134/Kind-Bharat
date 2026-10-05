import type { Metadata } from "next";
import Link from "next/link";
import { Camera, FolderKanban, Plus } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { StatusBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, EmptyState, PageHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { requireNgo } from "@/lib/auth";
import { PROOF_GRACE_DAYS } from "@/lib/config";
import { categoryEmoji, PROJECT_STATUS } from "@/lib/constants";
import { daysLeft, formatDateIST, formatINR, percent } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "My projects", robots: { index: false } };

export default async function NgoProjectsPage() {
  const ngo = await requireNgo();
  const supabase = await createClient();
  const [{ data: projects }, { data: blocked }] = await Promise.all([
    supabase.from("projects").select("*").eq("ngo_id", ngo.id).order("created_at", { ascending: false }),
    supabase.rpc("my_ngo_blocked"),
  ]);
  const ids = (projects ?? []).map((p) => p.id);
  const { data: dons } = ids.length
    ? await supabase.from("donations").select("project_id, amount").in("project_id", ids).eq("status", "confirmed")
    : { data: [] };
  const raised = new Map<string, number>();
  for (const d of dons ?? []) raised.set(d.project_id, (raised.get(d.project_id) ?? 0) + d.amount);

  return (
    <>
      <PageHeader
        eyebrow="Projects"
        title="My projects"
        actions={!blocked && <ButtonLink href="/ngo/projects/new"><Plus className="h-4 w-4" /> New project</ButtonLink>}
      />
      {blocked && (
        <Alert kind="error" title="New projects are blocked" className="mb-6">
          Submit completion proof for projects marked “Proof overdue” (more than {PROOF_GRACE_DAYS} days after deadline or full funding).
        </Alert>
      )}
      {!projects?.length ? (
        <EmptyState icon={<FolderKanban className="h-7 w-7" />} title="No projects yet">
          Create a small, specific project with a clear budget — e.g. “Stationery kits for 100 students — ₹25,000”.
        </EmptyState>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {projects.map((p) => {
            const r = raised.get(p.id) ?? 0;
            const left = daysLeft(p.deadline);
            const needsProof = ["active", "funded"].includes(p.status) && (p.status === "funded" || (left !== null && left < 0));
            return (
              <li key={p.id}>
                <Card className="flex h-full flex-col !p-5 transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-2xl" aria-hidden>{categoryEmoji(p.category)}</span>
                    <StatusBadge status={PROJECT_STATUS[p.status]} />
                  </div>
                  <Link href={`/ngo/projects/${p.id}`} className="mt-2 font-serif text-lg font-semibold leading-snug hover:text-primary">
                    {p.title}
                  </Link>
                  <p className="text-xs text-muted">
                    Goal {formatINR(p.goal_amount)} · {p.deadline ? `deadline ${formatDateIST(p.deadline)}` : "no deadline yet"}
                  </p>
                  {["active", "funded", "proof_submitted", "completed", "paused"].includes(p.status) && (
                    <div className="mt-3">
                      <Progress value={percent(r, p.goal_amount)} done={p.status === "completed"} />
                      <p className="mt-1 text-xs text-muted">{formatINR(r)} confirmed ({percent(r, p.goal_amount)}%)</p>
                    </div>
                  )}
                  {p.status === "rejected" && p.rejection_reason && (
                    <p className="mt-2 text-sm text-danger">Reason: {p.rejection_reason}</p>
                  )}
                  <div className="mt-auto flex flex-wrap gap-2 pt-4">
                    <ButtonLink href={`/ngo/projects/${p.id}`} variant="outline" size="sm">
                      {["draft", "rejected"].includes(p.status) ? "Edit" : "Manage"}
                    </ButtonLink>
                    {needsProof && (
                      <ButtonLink href={`/ngo/projects/${p.id}/proof`} variant="accent" size="sm">
                        <Camera className="h-4 w-4" /> Submit proof
                      </ButtonLink>
                    )}
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
