import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/layout/content-page";
import { PROOF_GRACE_DAYS } from "@/lib/config";

export const metadata: Metadata = { title: "Terms of Use", description: "Terms for donors and NGOs using KindBharat." };

export default function TermsPage() {
  return (
    <ContentPage eyebrow="Legal" title="Terms of Use" legal updated="October 2026">
      <p>
        By using KindBharat you agree to these Terms, our <Link href="/privacy">Privacy Policy</Link> and our{" "}
        <Link href="/disclaimer">Disclaimer</Link>. If you don&apos;t agree, please don&apos;t use the platform.
      </p>

      <h2>1. What KindBharat is</h2>
      <p>
        A free listing platform where verified NGOs post specific projects and donors pay NGOs directly. KindBharat is not
        a payment service, does not handle money and charges no fees.
      </p>

      <h2>2. Accounts</h2>
      <ul>
        <li>You must be 18 or older and give accurate information.</li>
        <li>Keep your password safe. You are responsible for activity on your account.</li>
        <li>One account represents one person or one organisation, with one role (donor or NGO).</li>
      </ul>

      <h2>3. Donors</h2>
      <ul>
        <li>Pay only to the payment details shown on a project&apos;s donate page.</li>
        <li>Submit honest donation details. Submitting fake UTRs or donation claims is not allowed.</li>
        <li>Donations are a matter between you and the NGO. Refunds, receipts (including 80G) and questions about funds are handled by the NGO.</li>
        <li>Be respectful in comments. No abuse, spam, personal data of others, or political or hateful content.</li>
      </ul>

      <h2>4. NGOs</h2>
      <ul>
        <li>You must be a legally registered non-profit organisation in India and authorised to act for it.</li>
        <li>All information, documents, budgets, photos and proof you provide must be true and your own (or used with permission).</li>
        <li>Use funds only for the project described, and confirm or reject each donation honestly and promptly.</li>
        <li>Submit proof of completion. If proof is not submitted within {PROOF_GRACE_DAYS} days after a project&apos;s deadline or full funding, you cannot create new projects until you do.</li>
        <li>Accept foreign donations only if you hold valid FCRA registration (foreign donations are not currently supported here).</li>
        <li>Get consent for photos of people, especially children.</li>
      </ul>

      <h2>5. Verification and moderation</h2>
      <p>
        We may approve, reject, pause or remove any project or content, and verify, reject or suspend any NGO, at our
        discretion — for example after a report. <strong>Providing false information leads to suspension</strong> and may be reported to authorities.
      </p>

      <h2>6. Content you post</h2>
      <p>
        You keep ownership of your content and give KindBharat permission to display it on the platform and when sharing
        project links. Don&apos;t post anything illegal, misleading, or that infringes others&apos; rights.
      </p>

      <h2>7. Liability</h2>
      <p>
        KindBharat is provided “as is”. To the extent allowed by law, we are not liable for donations, the conduct of NGOs
        or donors, the use of funds, or losses arising from use of the platform.
      </p>

      <h2>8. Changes and law</h2>
      <p>We may update these Terms; continued use means you accept them. These Terms are governed by the laws of India.</p>
    </ContentPage>
  );
}
