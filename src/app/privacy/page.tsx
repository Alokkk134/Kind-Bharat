import type { Metadata } from "next";
import { ContentPage } from "@/components/layout/content-page";
import { CONTACT_EMAIL } from "@/lib/config";

export const metadata: Metadata = { title: "Privacy Policy", description: "What data KindBharat collects, why, who can see it, and how to request deletion." };

export default function PrivacyPage() {
  return (
    <ContentPage eyebrow="Legal" title="Privacy Policy" legal updated="October 2026">
      <p>
        This policy explains how KindBharat (“we”) handles personal data, in line with India&apos;s Digital Personal Data
        Protection Act, 2023 (DPDP Act). We collect only what we need to run a trustworthy listing service.
      </p>

      <h2>1. What we collect</h2>
      <h3>Donors</h3>
      <ul>
        <li>Account (optional): name, email, password (stored securely by our authentication provider), phone if you add it.</li>
        <li>Donation confirmation: name, email and/or phone, amount, UTR / transaction ID, optional payment screenshot, optional message, and your “show as Anonymous” choice.</li>
        <li>A one-way hashed form of your network address, used only to limit spam submissions.</li>
      </ul>
      <h3>NGOs</h3>
      <ul>
        <li>Organisation details, registration and tax documents, contact person details, and payment details (UPI ID, QR code, bank account).</li>
      </ul>
      <h3>Everyone</h3>
      <ul>
        <li>Comments, questions and reports you submit.</li>
        <li>Basic technical logs kept by our hosting providers for security.</li>
      </ul>

      <h2>2. Why we use it</h2>
      <ul>
        <li>To let NGOs confirm donations and contact donors about them.</li>
        <li>To verify NGOs and review projects and proof of completion.</li>
        <li>To prevent fraud, spam and abuse, and to act on reports.</li>
        <li>To send essential account emails (sign-up confirmation, password reset).</li>
      </ul>
      <p>We do not sell personal data and do not use it for advertising.</p>

      <h2>3. Who can see what</h2>
      <ul>
        <li><strong>Public:</strong> verified NGO profiles and approved projects; confirmed donations shown only as amount + first name and last initial (e.g. “Rahul S.”) or “Anonymous”; comments shown with first name and last initial.</li>
        <li><strong>The NGO you donate to:</strong> your name, email/phone, amount, UTR, screenshot and message — so they can confirm and, if you wish, issue a receipt.</li>
        <li><strong>KindBharat team:</strong> all of the above, for verification, moderation and fraud prevention.</li>
        <li><strong>Never public:</strong> your email, phone, UTR, payment screenshots, NGO documents, PAN, and NGO contact phone/address.</li>
      </ul>

      <h2>4. Where data is stored</h2>
      <p>
        Data is stored with our infrastructure providers (Supabase for database, authentication and file storage; Vercel for
        hosting). Private files are only accessible through short-lived secure links.
      </p>

      <h2>5. How long we keep it</h2>
      <p>
        We keep data while your account is active and as needed for the purposes above, for trust and audit records, or as
        required by law. Donation records may be retained to maintain accurate project history.
      </p>

      <h2>6. Your rights</h2>
      <p>
        You can ask to access, correct or erase your personal data, or withdraw consent, by emailing{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> from the email linked to your account (or the email/phone you
        used on a donation form). We will respond within a reasonable time. You may also raise a grievance with our
        Grievance Officer at the same address.
      </p>

      <h2>7. Children</h2>
      <p>KindBharat is not intended for users under 18. NGOs must have consent before uploading photos of children and should avoid showing faces where possible.</p>

      <h2>8. Changes</h2>
      <p>We will update this page if our practices change, and note the date at the top.</p>
    </ContentPage>
  );
}
