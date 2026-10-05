import type { Metadata } from "next";
import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { AuthCard } from "../auth-card";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Log in", robots: { index: false } };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : undefined;
  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to track your donations or manage your NGO."
      footer={
        <>
          New here?{" "}
          <Link href="/signup" className="font-semibold text-primary hover:underline">
            Create a free account
          </Link>
        </>
      }
    >
      {sp.error === "link" && (
        <Alert kind="error" className="mb-4">
          That link is invalid or has expired. Please try again.
        </Alert>
      )}
      <LoginForm next={next} />
    </AuthCard>
  );
}
