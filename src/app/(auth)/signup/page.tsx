import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "../auth-card";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create a free KindBharat account as a donor or as an NGO.",
};

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const sp = await searchParams;
  return (
    <AuthCard
      title="Join KindBharat"
      subtitle="Free for donors and NGOs. No fees, ever."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <SignupForm defaultRole={sp.role === "ngo" ? "ngo" : "donor"} />
    </AuthCard>
  );
}
