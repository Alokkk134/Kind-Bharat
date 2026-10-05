"use client";

import { ActionForm } from "@/components/ui/action-form";
import { useActionState } from "react";
import { Landmark, QrCode } from "lucide-react";
import { initialState } from "@/lib/action-state";
import type { PaymentDetails } from "@/lib/database.types";
import { PRESETS } from "@/lib/images";
import { FormMessage } from "@/components/ui/alert";
import { Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { ImageUploader } from "@/components/upload/image-uploader";
import { savePaymentAction } from "../actions";

export function PaymentForm({ ngoId, pay }: { ngoId: string; pay: PaymentDetails | null }) {
  const [state, action] = useActionState(savePaymentAction, initialState);
  const e = state.fieldErrors ?? {};
  return (
    <ActionForm action={action} className="space-y-8" noValidate>
      <FormMessage state={state} />
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 font-serif text-lg font-semibold">
          <QrCode className="h-5 w-5 text-primary" /> UPI
        </h2>
        <Input label="UPI ID" name="upi_id" defaultValue={pay?.upi_id ?? ""} placeholder="yourngo@okaxis" autoCapitalize="none" error={e.upi_id} />
        <ImageUploader
          bucket="upi-qr"
          folder={ngoId}
          name="qr_path"
          max={1}
          preset={PRESETS.qr}
          initial={pay?.qr_path ? [pay.qr_path] : []}
          label="UPI QR code (optional)"
          hint="A clear screenshot of your organisation's UPI QR. Shown only on approved, active projects."
        />
      </section>
      <section className="grid gap-4 sm:grid-cols-2">
        <h2 className="flex items-center gap-2 font-serif text-lg font-semibold sm:col-span-2">
          <Landmark className="h-5 w-5 text-primary" /> Bank account (optional)
        </h2>
        <Input label="Account holder name" name="bank_account_name" defaultValue={pay?.bank_account_name ?? ""} hint="Must be the organisation's name." error={e.bank_account_name} className="sm:col-span-2" />
        <Input label="Account number" name="account_number" inputMode="numeric" defaultValue={pay?.account_number ?? ""} error={e.account_number} />
        <Input label="Confirm account number" name="account_number_confirm" inputMode="numeric" defaultValue={pay?.account_number ?? ""} error={e.account_number_confirm} />
        <Input label="IFSC" name="ifsc" defaultValue={pay?.ifsc ?? ""} className="[&_input]:uppercase" error={e.ifsc} />
        <Input label="Bank name" name="bank_name" defaultValue={pay?.bank_name ?? ""} error={e.bank_name} />
      </section>
      <SubmitButton size="lg">Save payment details</SubmitButton>
    </ActionForm>
  );
}
