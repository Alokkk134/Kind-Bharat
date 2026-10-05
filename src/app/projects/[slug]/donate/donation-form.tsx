"use client";

import { ActionForm } from "@/components/ui/action-form";
import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import { HeartHandshake, ImagePlus, Loader2 } from "lucide-react";
import { initialState } from "@/lib/action-state";
import { compressImage, PRESETS } from "@/lib/images";
import { Confetti } from "@/components/motion/confetti";
import { FormMessage } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { Checkbox, Input, Textarea } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { submitDonationAction } from "./actions";

export function DonationForm({
  projectId,
  slug,
  defaultName,
  defaultEmail,
  signedIn,
}: {
  projectId: string;
  slug: string;
  defaultName: string;
  defaultEmail: string;
  signedIn: boolean;
}) {
  const [state, action] = useActionState(submitDonationAction, initialState);
  const fileRef = useRef<HTMLInputElement>(null);
  const [shot, setShot] = useState<{ name: string; kb: number; preview: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [shotErr, setShotErr] = useState<string | null>(null);
  const e = state.fieldErrors ?? {};

  async function onShot(file: File | undefined) {
    setShotErr(null);
    if (!file || !fileRef.current) return;
    setBusy(true);
    try {
      const small = await compressImage(file, PRESETS.screenshot);
      const dt = new DataTransfer();
      dt.items.add(small);
      fileRef.current.files = dt.files;
      setShot({ name: file.name, kb: Math.round(small.size / 1024), preview: URL.createObjectURL(small) });
    } catch (err) {
      fileRef.current.value = "";
      setShot(null);
      setShotErr(err instanceof Error ? err.message : "Could not use this image.");
    } finally {
      setBusy(false);
    }
  }

  if (state.ok) {
    return (
      <div className="relative py-6 text-center">
        <Confetti />
        <span className="mx-auto flex h-20 w-20 animate-pop items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-primary to-[#138a7f] text-white shadow-2xl shadow-primary/40">
          <HeartHandshake className="h-10 w-10" />
        </span>
        <h2 className="mt-5 font-serif text-2xl font-semibold">Thank you for your kindness!</h2>
        <p className="mx-auto mt-2 max-w-sm text-muted">{state.message}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <ButtonLink href={`/projects/${slug}`} variant="outline">Back to project</ButtonLink>
          {signedIn ? (
            <ButtonLink href="/dashboard">My donations</ButtonLink>
          ) : (
            <ButtonLink href="/signup">Create account to track gifts</ButtonLink>
          )}
        </div>
      </div>
    );
  }

  return (
    <ActionForm action={action} className="space-y-4" noValidate>
      <input type="hidden" name="project_id" value={projectId} />
      <input type="hidden" name="slug" value={slug} />
      <FormMessage state={state} />
      <Input label="Your name" name="donor_name" defaultValue={defaultName} autoComplete="name" required error={e.donor_name} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Email" name="donor_email" type="email" defaultValue={defaultEmail} autoComplete="email" error={e.donor_email} />
        <Input label="Phone" name="donor_phone" type="tel" inputMode="tel" autoComplete="tel" error={e.donor_phone} />
      </div>
      <p className="-mt-2 text-xs text-muted">At least one of email or phone. Private — only the NGO and our team see it.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Amount paid (₹)" name="amount" inputMode="numeric" required error={e.amount} />
        <Input
          label="UTR / Transaction ID"
          name="utr"
          required
          autoCapitalize="characters"
          hint="12-digit number in your UPI app's payment details."
          error={e.utr}
        />
      </div>

      <div className="space-y-1.5">
        <p className="text-sm font-semibold">Payment screenshot <span className="font-normal text-muted">(optional, helps the NGO confirm faster)</span></p>
        <label className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-bg p-3 transition hover:border-primary">
          {shot ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shot.preview} alt="" className="h-14 w-14 rounded-xl object-cover" />
          ) : (
            <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-soft text-primary">
              {busy ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6" />}
            </span>
          )}
          <span className="text-sm">
            {shot ? <>Added ({shot.kb} KB) · <span className="text-primary underline">change</span></> : busy ? "Compressing…" : "Add screenshot"}
          </span>
          <input
            ref={fileRef}
            type="file"
            name="screenshot"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(ev) => onShot(ev.target.files?.[0])}
          />
        </label>
        {(shotErr || e.screenshot) && <p className="text-xs text-danger">{shotErr ?? e.screenshot}</p>}
        <p className="text-xs text-muted">Private. Never shown publicly.</p>
      </div>

      <Textarea label="Message to the NGO (optional)" name="message" rows={2} maxLength={500} error={e.message} />
      <Checkbox name="is_anonymous" label="Show my name as “Anonymous” on the project page" />

      <SubmitButton size="lg" className="w-full" disabled={busy} pendingText="Submitting…">
        I have paid — submit details
      </SubmitButton>
      <p className="text-center text-xs text-muted">
        Your donation appears publicly as “First name + last initial” only after the NGO confirms it.{" "}
        {!signedIn && (
          <>
            <Link href={`/login?next=/projects/${slug}/donate`} className="text-primary underline">Log in</Link> to track it.
          </>
        )}
      </p>
    </ActionForm>
  );
}
