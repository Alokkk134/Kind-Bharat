import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/layout/content-page";

export const metadata: Metadata = { title: "Disclaimer", description: "KindBharat is a listing service only and does not handle money." };

export default function DisclaimerPage() {
  return (
    <ContentPage eyebrow="Legal" title="Disclaimer" legal updated="October 2026">
      <h2>A listing service only</h2>
      <p>
        KindBharat is an information and listing platform. It lets non-profit organisations (“NGOs”) describe specific
        projects and lets visitors find them. <strong>KindBharat does not collect, receive, hold, transfer or handle any
        money.</strong> All donations are made directly by donors to the NGO&apos;s own bank account or UPI ID.
      </p>
      <h2>No guarantee about use of funds</h2>
      <p>
        We check NGO registration documents, approve projects and review proof of completion as described on our{" "}
        <Link href="/how-it-works">How it works</Link> page. These checks reduce risk but cannot remove it.
        KindBharat is not responsible for how an NGO uses donated funds, for the accuracy of information supplied by NGOs, or for the outcome of any project.
      </p>
      <h2>Do your own checks</h2>
      <p>
        Donors should use their own judgement and, where appropriate, verify an NGO independently (for example on the
        NGO Darpan portal) before donating. Donations are made at the donor&apos;s own risk and are generally not refundable by KindBharat.
      </p>
      <h2>Indian donors only</h2>
      <p>
        KindBharat is currently intended for donors resident in India making payments in Indian Rupees. NGOs need FCRA registration to accept foreign contributions, and foreign donations are not supported on this platform at this time.
      </p>
      <h2>Tax receipts</h2>
      <p>
        Tax-exemption receipts (for example under Section 80G of the Income Tax Act) are issued by the NGO, not by KindBharat. Badges such as “80G” indicate a certificate was shown to us; please confirm eligibility with the NGO.
      </p>
      <h2>Third-party links</h2>
      <p>NGO websites and social media links are outside our control. We are not responsible for their content.</p>
    </ContentPage>
  );
}
