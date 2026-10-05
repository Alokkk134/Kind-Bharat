"use client";

import { ActionForm } from "@/components/ui/action-form";
import { useActionState } from "react";
import { initialState } from "@/lib/action-state";
import type { Ngo } from "@/lib/database.types";
import { CATEGORIES, INDIAN_STATES, NGO_TYPES } from "@/lib/constants";
import { PRESETS } from "@/lib/images";
import { FormMessage } from "@/components/ui/alert";
import { Input, Select, Textarea } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { ImageUploader } from "@/components/upload/image-uploader";
import { saveNgoProfileAction } from "../actions";

export function NgoProfileForm({ ngo, defaultContact, locked }: { ngo: Ngo | null; defaultContact: string; locked: boolean }) {
  const [state, action] = useActionState(saveNgoProfileAction, initialState);
  const e = state.fieldErrors ?? {};

  return (
    <ActionForm action={action} className="space-y-8" noValidate>
      <FormMessage state={state} />

      {ngo ? (
        <ImageUploader
          bucket="ngo-logos"
          folder={ngo.id}
          name="logo_path"
          max={1}
          preset={PRESETS.logo}
          initial={ngo.logo_path ? [ngo.logo_path] : []}
          label="Logo"
          hint="Square works best. Shrunk to under 50 KB automatically."
          round
        />
      ) : (
        <p className="rounded-2xl bg-primary-soft p-3 text-sm text-primary">You can add your logo after saving the profile once.</p>
      )}

      <section className="grid gap-4 sm:grid-cols-2">
        <h2 className="font-serif text-lg font-semibold sm:col-span-2">Legal details</h2>
        <Input label="Organisation name" name="name" defaultValue={ngo?.name} required readOnly={locked} error={e.name} className="sm:col-span-2" />
        <Select label="Type" name="type" options={NGO_TYPES} defaultValue={ngo?.type ?? "trust"} required disabled={locked} error={e.type} />
        {locked && <input type="hidden" name="type" value={ngo?.type} />}
        <Input label="Year founded" name="year_founded" type="number" inputMode="numeric" defaultValue={ngo?.year_founded ?? ""} error={e.year_founded} />
        <Input label="Registration number" name="registration_number" defaultValue={ngo?.registration_number ?? ""} required readOnly={locked} error={e.registration_number} />
        <Input
          label="PAN of organisation"
          name="pan"
          defaultValue={ngo?.pan ?? ""}
          readOnly={locked}
          hint="Private — never shown publicly."
          className="[&_input]:uppercase"
          error={e.pan}
        />
        <Input
          label="NGO Darpan ID (recommended)"
          name="darpan_id"
          defaultValue={ngo?.darpan_id ?? ""}
          hint="Having a Darpan ID builds donor trust."
          error={e.darpan_id}
          className="sm:col-span-2"
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <h2 className="font-serif text-lg font-semibold sm:col-span-2">Location & contact</h2>
        <Input label="Address" name="address" defaultValue={ngo?.address ?? ""} hint="Private." error={e.address} className="sm:col-span-2" />
        <Input label="City" name="city" defaultValue={ngo?.city ?? ""} required error={e.city} />
        <Select label="State" name="state" options={INDIAN_STATES} placeholder="Choose state" defaultValue={ngo?.state ?? ""} required error={e.state} />
        <Input label="Contact person" name="contact_person" defaultValue={ngo?.contact_person ?? defaultContact} required error={e.contact_person} />
        <Input label="Contact phone" name="contact_phone" type="tel" inputMode="tel" defaultValue={ngo?.contact_phone ?? ""} required hint="Private — only our team sees it." error={e.contact_phone} />
        <Input label="Public email (optional)" name="contact_email" type="email" defaultValue={ngo?.contact_email ?? ""} hint="Shown on your public page." error={e.contact_email} />
        <Input label="Website (optional)" name="website" defaultValue={ngo?.website ?? ""} placeholder="https://" error={e.website} />
        <Textarea label="Social links (optional)" name="social_links" rows={2} defaultValue={ngo?.social_links ?? ""} hint="One per line: Instagram, Facebook, YouTube…" error={e.social_links} className="sm:col-span-2" />
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-lg font-semibold">About your work</h2>
        <Textarea label="About the organisation" name="about" rows={6} defaultValue={ngo?.about ?? ""} required hint="What you do, who you help, and your impact so far (50+ characters)." error={e.about} />
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Focus areas<span className="text-danger">*</span></legend>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <label key={c.value} className="cursor-pointer">
                <input
                  type="checkbox"
                  name="focus_areas"
                  value={c.value}
                  defaultChecked={ngo?.focus_areas.includes(c.value)}
                  className="peer sr-only"
                />
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-sm transition peer-checked:border-primary peer-checked:bg-primary peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-primary">
                  <span aria-hidden>{c.emoji}</span> {c.label}
                </span>
              </label>
            ))}
          </div>
          {e.focus_areas && <p className="mt-1 text-xs text-danger">{e.focus_areas}</p>}
        </fieldset>
      </section>

      <SubmitButton size="lg">{ngo ? "Save profile" : "Create profile"}</SubmitButton>
    </ActionForm>
  );
}
