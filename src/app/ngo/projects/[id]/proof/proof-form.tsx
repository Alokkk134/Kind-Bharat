"use client";

import { useActionState } from "react";
import { ActionForm } from "@/components/ui/action-form";
import { FormMessage } from "@/components/ui/alert";
import { Input, Textarea } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { ImageUploader } from "@/components/upload/image-uploader";
import { initialState } from "@/lib/action-state";
import type { CompletionProof } from "@/lib/database.types";
import { PRESETS } from "@/lib/images";
import { submitProofAction } from "./actions";

export function ProofForm({ ngoId, projectId, initial }: { ngoId: string; projectId: string; initial: CompletionProof | null }) {
  const [state, action] = useActionState(submitProofAction, initialState);
  const e = state.fieldErrors ?? {};
  if (state.ok) return <FormMessage state={state} />;
  return (
    <ActionForm action={action} className="space-y-5" noValidate>
      <input type="hidden" name="project_id" value={projectId} />
      <FormMessage state={state} />
      <Textarea
        label="What was done?"
        name="description"
        rows={6}
        defaultValue={initial?.description}
        required
        hint="What you bought, when and where it was distributed, any challenges, and what changed for the people helped."
        error={e.description}
      />
      <Input
        label="Number of people reached"
        name="beneficiaries_reached"
        inputMode="numeric"
        defaultValue={initial?.beneficiaries_reached ?? ""}
        required
        error={e.beneficiaries_reached}
        className="max-w-xs"
      />
      <ImageUploader
        bucket="media"
        folder={`${ngoId}/proofs/${projectId}`}
        name="files"
        max={10}
        preset={PRESETS.photo}
        initial={initial?.files ?? []}
        label="Photos and bills / receipts"
        hint="Up to 10. Distribution photos, receipts or invoices. Photos of children: please get consent and avoid showing faces where possible."
        error={e.files}
      />
      <SubmitButton size="lg">Submit proof for review</SubmitButton>
    </ActionForm>
  );
}
