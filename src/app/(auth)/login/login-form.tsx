"use client";

import { ActionForm } from "@/components/ui/action-form";
import Link from "next/link";
import { useActionState } from "react";
import { initialState } from "@/lib/action-state";
import { FormMessage } from "@/components/ui/alert";
import { Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { signInAction } from "../actions";

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(signInAction, initialState);
  return (
    <ActionForm action={action} className="space-y-4" noValidate>
      <FormMessage state={state} />
      {next && <input type="hidden" name="next" value={next} />}
      <Input label="Email" name="email" type="email" autoComplete="email" required error={state.fieldErrors?.email} />
      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        error={state.fieldErrors?.password}
      />
      <div className="flex justify-end">
        <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
          Forgot password?
        </Link>
      </div>
      <SubmitButton className="w-full" size="lg" pendingText="Logging in…">
        Log in
      </SubmitButton>
    </ActionForm>
  );
}
