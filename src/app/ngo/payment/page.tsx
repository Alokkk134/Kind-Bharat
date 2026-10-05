import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { StatusBadge } from "@/components/ui/badge";
import { Card, PageHeader } from "@/components/ui/card";
import { requireNgo } from "@/lib/auth";
import { REVIEW_STATUS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { PaymentForm } from "./payment-form";

export const metadata: Metadata = { title: "Payment details", robots: { index: false } };

export default async function PaymentPage() {
  const ngo = await requireNgo();
  const supabase = await createClient();
  const { data: pay } = await supabase.from("ngo_payment_details").select("*").eq("ngo_id", ngo.id).maybeSingle();

  return (
    <>
      <PageHeader
        eyebrow="Receiving donations"
        title="Payment details"
        description="Donors pay you directly using these details. KindBharat never receives or holds any money."
        actions={pay ? <StatusBadge status={REVIEW_STATUS[pay.review_status]} /> : undefined}
      />
      <Alert kind="warning" title="Any change is re-checked" className="mb-6">
        <span className="inline-flex items-start gap-1">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          To protect donors from scams, whenever these details change they are hidden from your projects until our
          team approves them.
        </span>
      </Alert>
      {pay?.review_status === "rejected" && pay.review_note && (
        <Alert kind="error" title="Not approved" className="mb-6">{pay.review_note}</Alert>
      )}
      <Card>
        <PaymentForm ngoId={ngo.id} pay={pay} />
      </Card>
    </>
  );
}
