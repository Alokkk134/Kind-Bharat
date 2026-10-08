"use client";

import { ActionForm } from "@/components/ui/action-form";
import Link from "next/link";
import { useActionState, useState } from "react";
import { Building2, HeartHandshake, MailCheck } from "lucide-react";
import { initialState } from "@/lib/action-state";
import { cn } from "@/lib/utils";
import { FormMessage } from "@/components/ui/alert";
import { Checkbox, Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { GoogleButton, AuthDivider } from "@/components/auth/google-button";
import { signUpAction } from "../actions";

const ROLES = [
  { value: "donor", title: "I want to donate", text: "Donate to verified projects", icon: HeartHandshake },
  { value: "ngo", title: "I represent an NGO", text: "Post projects, receive help", icon: Building2 },
] as const;

export function SignupForm({ defaultRole }: { defaultRole: "donor" | "ngo" }) {
  const [state, action] = useActionState(signUpAction, initialState);
  const [role, setRole] = useState<"donor" | "ngo">(defaultRole);

  if (state.ok) {
    return (
      <div className="space-y-4 text-center animate-pop">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary-soft text-primary animate-float">
          <MailCheck className="h-8 w-8" />
        </span>
        <p className="text-lg font-semibold">Check your inbox</p>
        <p className="text-muted">{state.message}</p>
        <p className="text-xs text-muted">Didn&apos;t get it? Check spam, or wait a few minutes and try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Google creates donor accounts only; NGOs pick their account type on the form below. */}
      {role === "donor" && (
        <>
          <GoogleButton next="/dashboard" label="Sign up with Google" />
          <AuthDivider />
        </>
      )}
      <ActionForm action={action} className="space-y-4" noValidate>
      <FormMessage state={state} />
      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Choose your account type</legend>
        <div className="grid grid-cols-2 gap-3">
          {ROLES.map((r) => {
            const Icon = r.icon;
            const active = role === r.value;
            return (
              <label
                key={r.value}
                className={cn(
                  "relative cursor-pointer rounded-2xl border-2 p-3 transition-all duration-300 [transform-style:preserve-3d]",
                  active
                    ? "border-primary bg-primary-soft shadow-lg shadow-primary/15 [transform:translateY(-2px)_rotateX(6deg)]"
                    : "border-border bg-surface hover:border-primary/40",
                )}
              >
                <input
                  type="radio"
                  name="role"
                  value={r.value}
                  checked={active}
                  onChange={() => setRole(r.value)}
                  className="sr-only"
                />
                <Icon className={cn("h-6 w-6", active ? "text-primary" : "text-muted")} aria-hidden />
                <span className="mt-2 block text-sm font-semibold leading-tight">{r.title}</span>
                <span className="block text-xs text-muted">{r.text}</span>
              </label>
            );
          })}
        </div>
        {state.fieldErrors?.role && <p className="mt-1 text-xs text-danger">{state.fieldErrors.role}</p>}
      </fieldset>

      <Input
        label={role === "ngo" ? "Your name (contact person)" : "Your name"}
        name="full_name"
        autoComplete="name"
        required
        error={state.fieldErrors?.full_name}
      />
      <Input label="Email" name="email" type="email" autoComplete="email" required error={state.fieldErrors?.email} />
      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        hint="At least 8 characters, with a letter and a number."
        error={state.fieldErrors?.password}
      />
      <Checkbox
        name="agree"
        label={
          <>
            I agree to the{" "}
            <Link href="/terms" className="font-medium text-primary underline" target="_blank">Terms of Use</Link> and{" "}
            <Link href="/privacy" className="font-medium text-primary underline" target="_blank">Privacy Policy</Link>.
          </>
        }
      />
      {state.fieldErrors?.agree && <p className="text-xs text-danger">{state.fieldErrors.agree}</p>}
      <SubmitButton className="w-full" size="lg" pendingText="Creating account…">
        Create {role === "ngo" ? "NGO" : "donor"} account
      </SubmitButton>
      </ActionForm>
    </div>
  );
}
