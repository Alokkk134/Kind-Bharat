"use client";

import { ActionForm } from "@/components/ui/action-form";
import { useActionState } from "react";
import { initialState } from "@/lib/action-state";
import { FormMessage } from "@/components/ui/alert";
import { Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { resetPasswordAction } from "../actions";
import { AuthCard } from "../auth-card";

export default function ResetPasswordPage() {
  const [state, action] = useActionState(resetPasswordAction, initialState);
  return (
    <AuthCard title="Set a new password" subtitle="Choose a strong password you don't use elsewhere.">
      <ActionForm action={action} className="space-y-4" noValidate>
        <FormMessage state={state} />
        <Input
          label="New password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          hint="At least 8 characters, with a letter and a number."
          error={state.fieldErrors?.password}
        />
        <Input
          label="Confirm new password"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          error={state.fieldErrors?.confirm}
        />
        <SubmitButton className="w-full" size="lg">Update password</SubmitButton>
      </ActionForm>
    </AuthCard>
  );
}
