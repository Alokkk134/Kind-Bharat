import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/layout/content-page";

export const metadata: Metadata = {
  title: "About",
  description: "Why KindBharat exists: verified, direct, transparent giving to Indian NGOs — with no fees.",
};

export default function AboutPage() {
  return (
    <ContentPage
      eyebrow="About KindBharat"
      title="Small help, real change — with proof."
      intro="KindBharat is a non-profit listing platform. We help people give directly to verified NGOs, and help good NGOs earn trust."
    >
      <h2>Why we built this</h2>
      <p>
        Many people want to help but hold back because they can&apos;t tell which appeals are genuine, or where their money
        really goes. Many honest grassroots NGOs, meanwhile, struggle to be seen. KindBharat sits in between — not as a
        middleman for money, but as a <strong>trust layer</strong>.
      </p>
      <h2>What we do</h2>
      <ul>
        <li>Check every NGO&apos;s registration documents before they can post.</li>
        <li>Approve every project, with an item-by-item budget.</li>
        <li>Show only donations the NGO has confirmed receiving.</li>
        <li>Require proof of completion, reviewed by our team.</li>
        <li>Act on reports — pausing projects or suspending NGOs when needed.</li>
      </ul>
      <h2>What we don&apos;t do</h2>
      <ul>
        <li>We never collect, hold or transfer money. There is no wallet and no payment gateway.</li>
        <li>We charge no fees or commissions, to anyone.</li>
        <li>We don&apos;t sell or share your data for advertising.</li>
      </ul>
      <h2>For everyone</h2>
      <p>
        “Bharat” here means all of us. KindBharat is non-political and welcomes donors and NGOs of every faith, region,
        language and background. Projects that promote hatred or are political will not be approved.
      </p>
      <p>
        Questions? <Link href="/contact">Get in touch</Link> or read <Link href="/how-it-works">How it works</Link>.
      </p>
    </ContentPage>
  );
}
