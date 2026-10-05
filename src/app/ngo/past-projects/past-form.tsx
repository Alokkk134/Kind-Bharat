"use client";

import { ActionForm } from "@/components/ui/action-form";
import { useActionState } from "react";
import { initialState, type ActionState } from "@/lib/action-state";
import { PRESETS } from "@/lib/images";
import { FormMessage } from "@/components/ui/alert";
import { Input, Textarea } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { ImageUploader } from "@/components/upload/image-uploader";
import { addPastProjectAction } from "../actions";

export function PastProjectForm({ ngoId }: { ngoId: string }) {
  // A fresh form (new key) after each successful save
  const [state, action] = useActionState(
    async (prev: ActionState & { n?: number }, fd: FormData) => ({
      ...(await addPastProjectAction(prev, fd)),
      n: (prev.n ?? 0) + 1,
    }),
    initialState as ActionState & { n?: number },
  );
  const formKey = state.ok ? state.n : "form";
  const e = state.fieldErrors ?? {};

  return (
    <ActionForm key={formKey} action={action} className="space-y-4" noValidate>
      <FormMessage state={state} />
      <Input label="Title" name="title" required error={e.title} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="When (approx.)" name="date" type="date" error={e.date} />
        <Input label="People helped" name="beneficiaries" inputMode="numeric" error={e.beneficiaries} />
      </div>
      <Textarea label="What did you do?" name="description" rows={4} required error={e.description} />
      <ImageUploader
        bucket="media"
        folder={`${ngoId}/past`}
        name="images"
        max={5}
        preset={PRESETS.photo}
        label="Photos (up to 5)"
      />
      <SubmitButton>Add past project</SubmitButton>
    </ActionForm>
  );
}
