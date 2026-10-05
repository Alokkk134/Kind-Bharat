"use client";

import { ActionForm } from "@/components/ui/action-form";
import { useActionState, useState } from "react";
import { initialState, type ActionState } from "@/lib/action-state";
import { FormMessage } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { cn } from "@/lib/utils";

type Decision = {
  value: string;
  label: string;
  variant?: "primary" | "danger" | "outline" | "success" | "accent";
  needsReason?: boolean;
  confirm?: string;
};

/** Generic admin decision form: optional extra fields, a reason box, and one button per decision. */
export function ReviewForm({
  action,
  id,
  decisions,
  field = "decision",
  reasonName = "reason",
  reasonLabel = "Reason (shown to the NGO)",
  children,
  className,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  id: string;
  decisions: Decision[];
  field?: string;
  reasonName?: string;
  reasonLabel?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [chosen, setChosen] = useState<string | null>(null);
  const showReason = decisions.some((d) => d.needsReason);

  return (
    <ActionForm
      action={formAction}
      className={cn("space-y-4", className)}
      onBeforeSubmit={(submitter) => {
        const value = submitter?.getAttribute("value") ?? chosen;
        const d = decisions.find((x) => x.value === value);
        return !d?.confirm || window.confirm(d.confirm);
      }}
    >
      <input type="hidden" name="id" value={id} />
      <FormMessage state={state} />
      {children}
      {showReason && (
        <Textarea
          label={reasonLabel}
          name={reasonName}
          rows={2}
          error={state.fieldErrors?.[reasonName]}
          hint="Required for reject / suspend / remove."
        />
      )}
      <div className="flex flex-wrap gap-2">
        {decisions.map((d) => (
          <Button
            key={d.value}
            type="submit"
            name={field}
            value={d.value}
            variant={d.variant ?? "outline"}
            disabled={pending}
            onClick={() => setChosen(d.value)}
          >
            {pending && chosen === d.value ? "Working…" : d.label}
          </Button>
        ))}
      </div>
    </ActionForm>
  );
}
