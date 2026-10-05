"use client";

import { ActionForm } from "@/components/ui/action-form";
import Link from "next/link";
import { useActionState, useRef } from "react";
import { Flag, X } from "lucide-react";
import { initialState } from "@/lib/action-state";
import { REPORT_REASONS } from "@/lib/constants";
import { reportAction } from "@/app/projects/actions";
import { FormMessage } from "@/components/ui/alert";
import { Select, Textarea } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";

export function ReportButton({
  targetType,
  targetId,
  signedIn,
  next,
}: {
  targetType: "project" | "ngo";
  targetId: string;
  signedIn: boolean;
  next: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [state, action] = useActionState(reportAction, initialState);

  if (!signedIn) {
    return (
      <Link href={`/login?next=${encodeURIComponent(next)}`} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-danger">
        <Flag className="h-4 w-4" /> Report this {targetType}
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-danger"
      >
        <Flag className="h-4 w-4" /> Report this {targetType}
      </button>
      <dialog
        ref={dialog}
        className="m-auto w-[min(92vw,30rem)] rounded-[2rem] border border-border bg-surface p-0 shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-sm open:animate-pop"
      >
        <div className="p-6">
          <div className="flex items-start justify-between">
            <h2 className="font-serif text-xl font-semibold">Report this {targetType}</h2>
            <button type="button" onClick={() => dialog.current?.close()} aria-label="Close" className="rounded-xl p-1 hover:bg-stone-100">
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-1 text-sm text-muted">Reports are private and reviewed by our team.</p>
          {state.ok ? (
            <div className="mt-4"><FormMessage state={state} /></div>
          ) : (
            <ActionForm action={action} className="mt-4 space-y-4">
              <input type="hidden" name="target_type" value={targetType} />
              <input type="hidden" name="target_id" value={targetId} />
              <FormMessage state={{ error: state.error }} />
              <Select label="Reason" name="reason" options={REPORT_REASONS} placeholder="Choose a reason" required error={state.fieldErrors?.reason} />
              <Textarea label="What's wrong?" name="description" rows={4} required error={state.fieldErrors?.description} />
              <SubmitButton variant="danger" className="w-full" pendingText="Sending…">Send report</SubmitButton>
            </ActionForm>
          )}
        </div>
      </dialog>
    </>
  );
}
