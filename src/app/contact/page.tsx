import type { Metadata } from "next";
import Link from "next/link";
import { Flag, Mail, ShieldAlert } from "lucide-react";
import { ContentPage } from "@/components/layout/content-page";
import { CONTACT_EMAIL } from "@/lib/config";

export const metadata: Metadata = { title: "Contact", description: "Contact the KindBharat team." };

export default function ContactPage() {
  return (
    <ContentPage eyebrow="Contact" title="We'd love to hear from you" intro="We're a small team. We usually reply within 2 working days.">
      <div className="not-prose grid gap-4 sm:grid-cols-2">
        <a href={`mailto:${CONTACT_EMAIL}`} className="flex gap-3 rounded-3xl border border-border bg-surface p-5 no-underline transition hover:-translate-y-1 hover:shadow-xl">
          <Mail className="h-6 w-6 shrink-0 text-primary" />
          <span>
            <span className="block font-semibold text-ink">Email us</span>
            <span className="block text-sm text-primary">{CONTACT_EMAIL}</span>
          </span>
        </a>
        <div className="flex gap-3 rounded-3xl border border-border bg-surface p-5">
          <Flag className="h-6 w-6 shrink-0 text-danger" />
          <span>
            <span className="block font-semibold">Report a project or NGO</span>
            <span className="block text-sm text-muted">Use the “Report” link on the project or NGO page — it reaches our review queue directly.</span>
          </span>
        </div>
      </div>
      <h2>Safety first</h2>
      <p className="flex gap-2">
        <ShieldAlert className="mt-1 h-5 w-5 shrink-0 text-warning" />
        <span>
          KindBharat will <strong>never</strong> call or message you asking for money, OTPs or passwords. Pay only to the
          details shown on a project&apos;s donate page. If someone contacts you claiming to be from KindBharat, please email us.
        </span>
      </p>
      <h2>Data requests</h2>
      <p>
        To access, correct or delete your personal data, email us from the address on your account. See our{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </ContentPage>
  );
}
