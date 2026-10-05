"use client";

import { ActionForm } from "@/components/ui/action-form";
import { useActionState } from "react";
import { initialState, type ActionState } from "@/lib/action-state";
import { Alert } from "@/components/ui/alert";
import { SubmitButton } from "@/components/ui/submit-button";

export function StatusAction({
  action,
  id,
  label,
  variant = "primary",
  disabled,
}: {
  action: (s: ActionState, f: FormData) => Promise<ActionState>;
  id: string;
  label: string;
  variant?: "primary" | "outline";
  disabled?: boolean;
}) {
  const [state, formAction] = useActionState(action, initialState);
  return (
    <ActionForm action={formAction} className="space-y-2">
      <input type="hidden" name="id" value={id} />
      <SubmitButton variant={variant} disabled={disabled} pendingText="Working…">
        {label}
      </SubmitButton>
      {state.error && <Alert kind="error">{state.error}</Alert>}
      {state.message && <Alert kind="success">{state.message}</Alert>}
    </ActionForm>
  );
}
