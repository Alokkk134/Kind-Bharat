import type { Metadata } from "next";
import { Alert } from "@/components/ui/alert";
import { Card, PageHeader } from "@/components/ui/card";
import { getMyNgo, requireRole } from "@/lib/auth";
import { NgoProfileForm } from "./profile-form";

export const metadata: Metadata = { title: "Organisation profile", robots: { index: false } };

export default async function NgoProfilePage() {
  const session = await requireRole("ngo");
  const ngo = await getMyNgo();
  const locked = ngo?.status === "verified" || ngo?.status === "suspended";
  return (
    <>
      <PageHeader
        eyebrow="Organisation"
        title={ngo ? "Organisation profile" : "Create your NGO profile"}
        description="This is what donors see on your public page (except PAN, phone and address, which stay private)."
      />
      {locked && (
        <Alert kind="info" className="mb-6">
          Your NGO is verified, so name, type, registration number and PAN are locked. Contact us to change them.
        </Alert>
      )}
      <Card>
        <NgoProfileForm ngo={ngo} defaultContact={session.profile.full_name} locked={locked} />
      </Card>
    </>
  );
}
