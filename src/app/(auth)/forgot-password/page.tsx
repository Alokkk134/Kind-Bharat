"use client";

import { ActionForm } from "@/components/ui/action-form";
import Link from "next/link";
import { useActionState } from "react";
import { initialState } from "@/lib/action-state";
import { FormMessage } from "@/components/ui/alert";
import { Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { forgotPasswordAction } from "../actions";
import { AuthCard } from "../auth-card";

export default function ForgotPasswordPage() {
  const [state, action] = useActionState(forgotPasswordAction, initialState);
  return (
    <AuthCard
      title="Forgot password?"
      subtitle="Enter your email and we'll send you a link to set a new one."
      footer={
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Back to log in
        </Link>
      }
    >
      <ActionForm action={action} className="space-y-4" noValidate>
        <FormMessage state={state} />
        {!state.ok && (
          <>
            <Input label="Email" name="email" type="email" autoComplete="email" required error={state.fieldErrors?.email} />
            <SubmitButton className="w-full" size="lg" pendingText="Sending…">
              Send reset link
            </SubmitButton>
          </>
        )}
      </ActionForm>
    </AuthCard>
  );
}
