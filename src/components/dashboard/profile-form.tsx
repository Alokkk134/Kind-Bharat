"use client";

import { ActionForm } from "@/components/ui/action-form";
import { useActionState } from "react";
import { initialState } from "@/lib/action-state";
import { FormMessage } from "@/components/ui/alert";
import { Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { updateProfileAction } from "./profile-actions";

export function ProfileForm({ fullName, phone, email }: { fullName: string; phone: string; email: string }) {
  const [state, action] = useActionState(updateProfileAction, initialState);
  return (
    <ActionForm action={action} className="space-y-4">
      <FormMessage state={state} />
      <Input label="Email" name="email_display" value={email} disabled hint="Email can't be changed here." />
      <Input label="Full name" name="full_name" defaultValue={fullName} required error={state.fieldErrors?.full_name} />
      <Input
        label="Phone (optional)"
        name="phone"
        type="tel"
        inputMode="tel"
        defaultValue={phone}
        hint="Private. Never shown publicly."
        error={state.fieldErrors?.phone}
      />
      <SubmitButton>Save profile</SubmitButton>
    </ActionForm>
  );
}
