import type { Metadata } from "next";
import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { Card, PageHeader } from "@/components/ui/card";
import { requireNgo } from "@/lib/auth";
import { PROOF_GRACE_DAYS } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";
import { ProjectForm } from "../project-form";

export const metadata: Metadata = { title: "New project", robots: { index: false } };

export default async function NewProjectPage() {
  const ngo = await requireNgo();
  const supabase = await createClient();
  const { data: blocked } = await supabase.rpc("my_ngo_blocked");

  if (blocked) {
    return (
      <>
        <PageHeader title="New project" />
        <Alert kind="error" title="Submit proof first">
          A project ended or was fully funded more than {PROOF_GRACE_DAYS} days ago without completion proof. Please{" "}
          <Link href="/ngo/projects" className="font-semibold underline">submit proof</Link> before starting a new project.
        </Alert>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Create"
        title="New project"
        description="Save as a draft any time. Submit it for review when it's ready."
      />
      {ngo.status !== "verified" && (
        <Alert kind="info" className="mb-6">
          Your NGO isn&apos;t verified yet. You can prepare drafts now and submit them after verification.
        </Alert>
      )}
      <Card>
        <ProjectForm
          id={crypto.randomUUID()}
          ngoId={ngo.id}
          project={null}
          budget={[]}
          images={[]}
          defaults={{ city: ngo.city ?? "", state: ngo.state ?? "" }}
        />
      </Card>
    </>
  );
}
