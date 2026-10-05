import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Camera, ExternalLink, Trash2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { StatusBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, PageHeader } from "@/components/ui/card";
import { requireNgo } from "@/lib/auth";
import { PROJECT_STATUS } from "@/lib/constants";
import { formatINR } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { uuid } from "@/lib/validation";
import { deleteProjectAction, submitProjectAction, withdrawProjectAction } from "../actions";
import { ProjectForm } from "../project-form";
import { StatusAction } from "./status-action";

export const metadata: Metadata = { title: "Project", robots: { index: false } };

export default async function NgoProjectPage({ params, searchParams }: PageProps<"/ngo/projects/[id]">) {
  const ngo = await requireNgo();
  const { id } = await params;
  const sp = await searchParams;
  if (!uuid.safeParse(id).success) notFound();
  const supabase = await createClient();
  const { data: project } = await supabase.from("projects").select("*").eq("id", id).eq("ngo_id", ngo.id).single();
  if (!project) notFound();
  const [{ data: budget }, { data: images }, { data: proof }] = await Promise.all([
    supabase.from("project_budget_items").select("*").eq("project_id", id).order("sort_order"),
    supabase.from("project_images").select("*").eq("project_id", id).order("sort_order"),
    supabase.from("completion_proofs").select("status, admin_note").eq("project_id", id).maybeSingle(),
  ]);
  const editable = project.status === "draft" || project.status === "rejected";
  const isPublic = ["active", "funded", "proof_submitted", "completed"].includes(project.status);

  return (
    <>
      <Link href="/ngo/projects" className="mb-4 inline-flex items-center gap-1 text-sm text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" /> My projects
      </Link>
      <PageHeader
        eyebrow="Project"
        title={project.title}
        actions={
          <>
            <StatusBadge status={PROJECT_STATUS[project.status]} />
            {isPublic && (
              <ButtonLink href={`/projects/${project.slug}`} variant="outline" size="sm">
                <ExternalLink className="h-4 w-4" /> Public page
              </ButtonLink>
            )}
          </>
        }
      />
      {sp.saved && <Alert kind="success" className="mb-4">Draft created. Keep editing, then submit for review.</Alert>}
      {project.status === "rejected" && (
        <Alert kind="error" title="Changes requested" className="mb-4">{project.rejection_reason}</Alert>
      )}
      {(project.status === "removed" || project.status === "paused") && (
        <Alert kind="warning" title={project.status === "paused" ? "Paused by KindBharat" : "Removed by KindBharat"} className="mb-4">
          {project.rejection_reason ?? "Please contact us for details."}
        </Alert>
      )}
      {proof?.status === "rejected" && (
        <Alert kind="error" title="Proof needs changes" className="mb-4">{proof.admin_note}</Alert>
      )}

      <Card className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm">
          {editable && (ngo.status === "verified"
            ? "When everything is ready, submit for review. You can't edit while it's under review."
            : "Your NGO must be verified before you can submit projects.")}
          {project.status === "under_review" && "Under review by our team. Withdraw it if you need to make changes."}
          {["active", "funded"].includes(project.status) && `Live! Goal ${formatINR(project.goal_amount)}. When the work is done, submit completion proof.`}
          {project.status === "proof_submitted" && "Proof submitted — waiting for our review."}
          {project.status === "completed" && "Completed and verified. Thank you! 🎉"}
        </div>
        <div className="flex flex-wrap gap-2">
          {editable && (
            <StatusAction action={submitProjectAction} id={project.id} label="Submit for review" disabled={ngo.status !== "verified"} />
          )}
          {project.status === "under_review" && (
            <StatusAction action={withdrawProjectAction} id={project.id} label="Withdraw to edit" variant="outline" />
          )}
          {(["active", "funded"].includes(project.status) || proof?.status === "rejected") && (
            <ButtonLink href={`/ngo/projects/${project.id}/proof`} variant="accent">
              <Camera className="h-4 w-4" /> Submit proof
            </ButtonLink>
          )}
          {editable && (
            <form action={deleteProjectAction}>
              <input type="hidden" name="id" value={project.id} />
              <button className="inline-flex items-center gap-1 rounded-xl px-3 py-2.5 text-sm font-semibold text-danger hover:bg-red-50">
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </form>
          )}
        </div>
      </Card>

      {editable ? (
        <Card>
          <ProjectForm
            id={project.id}
            ngoId={ngo.id}
            project={project}
            budget={budget ?? []}
            images={(images ?? []).map((i) => i.file_path)}
            defaults={{ city: ngo.city ?? "", state: ngo.state ?? "" }}
          />
        </Card>
      ) : (
        <Card>
          <p className="text-sm text-muted">This project is locked while under review or live. Summary:</p>
          <p className="mt-2 font-semibold">{project.summary}</p>
          <ul className="mt-4 divide-y divide-border text-sm">
            {(budget ?? []).map((b) => (
              <li key={b.id} className="flex justify-between py-2">
                <span>{b.item} × {b.quantity}</span>
                <span className="tabular-nums">{formatINR(b.total ?? 0)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}
