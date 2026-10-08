import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { Aurora } from "@/components/motion/decor";
import { Card } from "@/components/ui/card";
import { getSession } from "@/lib/auth";
import { FeedbackForm } from "./feedback-form";

export const metadata: Metadata = {
  title: "Send feedback",
  description: "Suggest a new feature, report a problem, or share an idea to make KindBharat better.",
};

export default async function FeedbackPage({ searchParams }: PageProps<"/feedback">) {
  const sp = await searchParams;
  const session = await getSession();
  const from = typeof sp.from === "string" && sp.from.startsWith("/") ? sp.from.slice(0, 200) : "";
  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-border">
        <Aurora className="opacity-60" />
        <Container className="py-12 sm:py-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-ink">Help improve KindBharat</p>
          <h1 className="mt-2 max-w-2xl font-serif text-4xl font-semibold tracking-tight sm:text-5xl">Feedback</h1>
          <p className="mt-3 max-w-xl text-lg text-muted">
            Suggest a new feature, report a problem, or share any other feedback. All submissions are reviewed by our team.
          </p>
        </Container>
      </section>
      <Container className="py-10">
        <Card className="relative mx-auto max-w-2xl">
          <FeedbackForm defaultName={session?.profile.full_name ?? ""} defaultEmail={session?.email ?? ""} fromPage={from} />
        </Card>
        <p className="mx-auto mt-4 max-w-2xl text-center text-xs text-muted">
          To report a specific project or NGO, use the “Report” link on its page instead.
        </p>
      </Container>
    </>
  );
}
