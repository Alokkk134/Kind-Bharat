import type { Metadata } from "next";
import { Card, PageHeader } from "@/components/ui/card";
import { requireSession } from "@/lib/auth";
import { ProfileForm } from "@/components/dashboard/profile-form";

export const metadata: Metadata = { title: "My profile", robots: { index: false } };

export default async function DonorProfilePage() {
  const session = await requireSession();
  return (
    <>
      <PageHeader title="My profile" description="Your name is shown as “First name + last initial” on comments." />
      <Card className="max-w-xl">
        <ProfileForm fullName={session.profile.full_name} phone={session.profile.phone ?? ""} email={session.email ?? ""} />
      </Card>
    </>
  );
}
