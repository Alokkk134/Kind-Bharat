import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { StatusBadge } from "@/components/ui/badge";
import { Card, PageHeader } from "@/components/ui/card";
import { requireNgo } from "@/lib/auth";
import { REVIEW_STATUS } from "@/lib/constants";
import { formatINR } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { uuid } from "@/lib/validation";
import { ProofForm } from "./proof-form";

export const metadata: Metadata = { title: "Completion proof", robots: { index: false } };

export default async function ProofPage({ params }: PageProps<"/ngo/projects/[id]/proof">) {
  const ngo = await requireNgo();
  const { id } = await params;
  if (!uuid.safeParse(id).success) notFound();
  const supabase = await createClient();
  const { data: project } = await supabase.from("projects").select("*").eq("id", id).eq("ngo_id", ngo.id).single();
  if (!project) notFound();
  const { data: proof } = await supabase.from("completion_proofs").select("*").eq("project_id", id).maybeSingle();
  const { data: dons } = await supabase.from("donations").select("amount").eq("project_id", id).eq("status", "confirmed");
  const raised = (dons ?? []).reduce((s, d) => s + d.amount, 0);

  const canSubmit = (!proof && ["active", "funded"].includes(project.status)) || proof?.status === "rejected";

  return (
    <>
      <Link href={`/ngo/projects/${id}`} className="mb-4 inline-flex items-center gap-1 text-sm text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to project
      </Link>
      <PageHeader
        eyebrow="Proof of completion"
        title={project.title}
        description={`Confirmed funds received: ${formatINR(raised)}. Show donors what their money did.`}
        actions={proof ? <StatusBadge status={REVIEW_STATUS[proof.status]} /> : undefined}
      />
      {proof?.status === "rejected" && <Alert kind="error" title="Changes requested" className="mb-6">{proof.admin_note}</Alert>}
      {proof?.status === "pending" && <Alert kind="info" className="mb-6">Your proof is under review. We&apos;ll update the project when it&apos;s approved.</Alert>}
      {proof?.status === "approved" && <Alert kind="success" className="mb-6">Approved. Your project is marked “Completed with proof”.</Alert>}

      {canSubmit ? (
        <Card>
          <ProofForm ngoId={ngo.id} projectId={id} initial={proof} />
        </Card>
      ) : (
        !proof && (
          <Alert kind="info">Proof can be submitted once the project is live (active or goal reached).</Alert>
        )
      )}
    </>
  );
}
