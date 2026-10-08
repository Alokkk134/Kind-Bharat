"use client";

import { ActionForm } from "@/components/ui/action-form";
import { useActionState, useEffect, useRef } from "react";
import { initialState } from "@/lib/action-state";
import { postCommentAction } from "@/app/projects/actions";
import { FormMessage } from "@/components/ui/alert";
import { SubmitButton } from "@/components/ui/submit-button";

export function CommentForm({
  projectId,
  slug,
  parentId,
  placeholder = "Ask the NGO a question…",
  compact,
}: {
  projectId: string;
  slug: string;
  parentId?: string;
  placeholder?: string;
  compact?: boolean;
}) {
  const [state, action] = useActionState(postCommentAction, initialState);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);

  return (
    <ActionForm ref={ref} action={action} className="space-y-2">
      <input type="hidden" name="project_id" value={projectId} />
      <input type="hidden" name="slug" value={slug} />
      {parentId && <input type="hidden" name="parent_id" value={parentId} />}
      <label htmlFor={`c-${parentId ?? "new"}`} className="sr-only">{placeholder}</label>
      <textarea
        id={`c-${parentId ?? "new"}`}
        name="body"
        rows={compact ? 2 : 3}
        maxLength={1000}
        required
        placeholder={placeholder}
        className="kb-input resize-y"
        aria-invalid={state.fieldErrors?.body ? true : undefined}
      />
      {state.fieldErrors?.body && <p className="text-xs text-danger">{state.fieldErrors.body}</p>}
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted">Please keep questions respectful. Limit: 5 per hour.</p>
        <SubmitButton size="sm" pendingText="Posting…">{parentId ? "Reply as NGO" : "Post question"}</SubmitButton>
      </div>
      {(state.error || state.message) && <FormMessage state={state} />}
    </ActionForm>
  );
}
