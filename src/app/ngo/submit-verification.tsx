"use client";

import { useState, useTransition } from "react";
import { Send } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/action-state";
import { submitForVerificationAction } from "./actions";

export function SubmitVerificationButton({ disabled }: { disabled?: boolean }) {
  const [pending, start] = useTransition();
  const [state, setState] = useState<ActionState>({});
  return (
    <div className="space-y-2">
      <Button
        disabled={disabled || pending}
        onClick={() => start(async () => setState(await submitForVerificationAction()))}
      >
        <Send className="h-4 w-4" /> {pending ? "Submitting…" : "Submit for verification"}
      </Button>
      {state.error && <Alert kind="error">{state.error}</Alert>}
      {state.message && <Alert kind="success">{state.message}</Alert>}
    </div>
  );
}
