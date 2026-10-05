"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { useActionFormPending } from "./action-form";
import { Button } from "./button";

export function SubmitButton({
  children,
  pendingText = "Saving…",
  ...props
}: React.ComponentProps<typeof Button> & { pendingText?: string }) {
  const status = useFormStatus();
  const ctx = useActionFormPending();
  const pending = ctx ?? status.pending;
  return (
    <Button type="submit" {...props} disabled={pending || props.disabled} aria-busy={pending}>
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          {pendingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
