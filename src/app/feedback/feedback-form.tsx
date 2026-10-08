"use client";

import { useActionState, useState } from "react";
import { Bug, Lightbulb, MessageSquareHeart, Send } from "lucide-react";
import { ActionForm } from "@/components/ui/action-form";
import { FormMessage } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { initialState } from "@/lib/action-state";
import { cn } from "@/lib/utils";
import { sendFeedbackAction } from "./actions";

const KINDS = [
  { value: "feature", label: "Suggest a feature", icon: Lightbulb, hint: "What would make KindBharat better for you?" },
  { value: "bug", label: "Report a problem", icon: Bug, hint: "What went wrong? On which page? What did you expect to happen?" },
  { value: "other", label: "Something else", icon: MessageSquareHeart, hint: "Any other thought, idea or compliment." },
] as const;

export function FeedbackForm({
  defaultName,
  defaultEmail,
  fromPage,
}: {
  defaultName: string;
  defaultEmail: string;
  fromPage: string;
}) {
  const [state, action] = useActionState(sendFeedbackAction, initialState);
  const [kind, setKind] = useState<(typeof KINDS)[number]["value"]>("feature");
  const e = state.fieldErrors ?? {};
  const current = KINDS.find((k) => k.value === kind)!;

  if (state.ok) {
    return (
      <div className="space-y-4 py-6 text-center animate-pop">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary-soft text-primary">
          <Send className="h-8 w-8" />
        </span>
        <p className="font-serif text-2xl font-semibold">Thank you for your feedback</p>
        <p className="text-muted">{state.message} Our team reviews every submission.</p>
        <ButtonLink href="/" variant="outline">Back to home</ButtonLink>
      </div>
    );
  }

  return (
    <ActionForm action={action} className="space-y-5" noValidate>
      <FormMessage state={state} />
      <fieldset>
        <legend className="mb-2 text-sm font-semibold">What is this about?</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {KINDS.map((k) => {
            const Icon = k.icon;
            const active = kind === k.value;
            return (
              <label
                key={k.value}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-2xl border-2 p-3 text-sm font-semibold transition",
                  active ? "border-primary bg-primary-soft text-primary" : "border-border bg-surface hover:border-primary/40",
                )}
              >
                <input type="radio" name="kind" value={k.value} checked={active} onChange={() => setKind(k.value)} className="sr-only" />
                <Icon className="h-5 w-5 shrink-0" aria-hidden />
                {k.label}
              </label>
            );
          })}
        </div>
      </fieldset>

      <Textarea label="Your message" name="message" rows={6} maxLength={2000} required hint={current.hint} error={e.message} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Your name (optional)" name="name" defaultValue={defaultName} autoComplete="name" error={e.name} />
        <Input
          label="Email (optional)"
          name="email"
          type="email"
          defaultValue={defaultEmail}
          autoComplete="email"
          hint="Only if you would like a reply. Never shown publicly."
          error={e.email}
        />
      </div>

      <input type="hidden" name="page" value={fromPage} />
      {/* Trap for bots — hidden from people and screen readers */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <SubmitButton size="lg" pendingText="Sending…">
        <Send className="h-4 w-4" /> Send feedback
      </SubmitButton>
    </ActionForm>
  );
}
