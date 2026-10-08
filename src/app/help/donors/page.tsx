import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/layout/container";
import { GuideContents, GuideStep, HelpLink, Screenshot, type GuideStepData } from "@/components/help/guide";
import { MockMyDonations, MockPay, MockTellUs } from "@/components/help/mocks";
import { ButtonLink } from "@/components/ui/button";
import { CONTACT_EMAIL } from "@/lib/config";

export const metadata: Metadata = {
  title: "Help for donors — how to donate",
  description: "Step-by-step guide with screenshots: create an account, find a verified project, pay the NGO by UPI or bank, submit your UTR and track your donation.",
};

const STEPS: GuideStepData[] = [
  {
    id: "sign-up",
    title: "Create a free account (optional)",
    body: (
      <>
        <p>You can donate without an account. But with an account you can see all your donations in one place, ask NGOs questions and report problems.</p>
        <ol>
          <li>Tap <b>Sign up</b> at the top of any page.</li>
          <li>Choose <b>“I want to donate”</b>.</li>
          <li>Enter your name, email and a password (at least 8 characters, with a letter and a number). Or tap <b>Sign up with Google</b>.</li>
          <li>Tick the box to agree to the Terms, then tap <b>Create donor account</b>.</li>
          <li>Open the email we send you and tap the link to activate your account.</li>
        </ol>
      </>
    ),
    tip: <>No email? Check your Spam or Promotions folder. Open the link on the same phone or computer you signed up on.</>,
    figure: <Screenshot src="/help/signup-donor.webp" alt="Sign up page with 'I want to donate' selected" />,
  },
  {
    id: "log-in",
    title: "Log in (and if you forget your password)",
    body: (
      <>
        <p>Tap <b>Log in</b>, enter your email and password, and tap <b>Log in</b>. You will land on <b>My donations</b>.</p>
        <p>Forgot your password? Tap <b>Forgot password?</b>, enter your email, and we will send you a link to set a new one.</p>
      </>
    ),
    figure: <Screenshot src="/help/login.webp" alt="Log in page" />,
  },
  {
    id: "find",
    title: "Find a project",
    body: (
      <>
        <p>Tap <b>Projects</b> in the menu. You can:</p>
        <ul>
          <li>Search by project or NGO name.</li>
          <li>Choose a <b>state</b> or type a <b>city</b>.</li>
          <li>Tap a cause like <b>Education</b> or <b>Food</b>.</li>
          <li>Switch between <b>Raising now</b> and <b>Completed</b> projects.</li>
        </ul>
        <p>Each card shows the NGO, how much is raised, how many people donated and how many days are left.</p>
      </>
    ),
    figure: <Screenshot src="/help/projects.webp" alt="Projects page with search and a project card" crop={760} />,
  },
  {
    id: "check",
    title: "Check the project before you donate",
    body: (
      <>
        <p>Open a project to see:</p>
        <ul>
          <li><b>Verified Project</b> badge — our team approved it.</li>
          <li><b>Where every rupee goes</b> — the item-by-item budget.</li>
          <li><b>Run by</b> — the NGO, its badges (like 80G) and past results.</li>
          <li><b>Confirmed donations</b> and <b>Questions & answers</b>.</li>
        </ul>
        <p>When you are ready, tap <b>Donate now</b>.</p>
      </>
    ),
    warn: <>Projects marked <b>“Sample · for reference only”</b> are examples. They cannot receive donations.</>,
    figure: <Screenshot src="/help/project.webp" alt="Project page showing budget, progress and donate area" crop={760} />,
  },
  {
    id: "pay",
    title: "Pay the NGO directly",
    body: (
      <>
        <p>The donate page shows the NGO&apos;s own payment details:</p>
        <ul>
          <li><b>UPI:</b> scan the QR code, or tap <b>Copy</b> next to the UPI ID and paste it in GPay, PhonePe, Paytm or your bank app. On a phone, <b>Open UPI app</b> does this for you.</li>
          <li><b>Bank transfer:</b> copy the account name, number and IFSC.</li>
        </ul>
        <p>Before you pay, check that the name in your UPI app matches the NGO.</p>
      </>
    ),
    warn: <>Pay <b>only</b> to the details shown on this page. KindBharat never asks you to pay anyone else, and never calls you for money.</>,
    figure: <MockPay />,
  },
  {
    id: "tell-us",
    title: "Tell us you paid",
    body: (
      <>
        <p>After paying, fill the short form on the same page:</p>
        <ul>
          <li>Your name, and your email <b>or</b> phone.</li>
          <li>The amount you paid.</li>
          <li>The <b>UTR / Transaction ID</b> — in your UPI app, open the payment in your history. It is usually a 12-digit number.</li>
          <li>A payment screenshot (optional, but it helps the NGO confirm faster).</li>
        </ul>
        <p>Tick <b>“Show my name as Anonymous”</b> if you don&apos;t want your name shown. Then tap <b>I have paid — submit details</b>.</p>
      </>
    ),
    tip: <>Your email, phone, UTR and screenshot are private. Only that NGO and our team can see them.</>,
    figure: <MockTellUs />,
  },
  {
    id: "track",
    title: "Track your donation",
    body: (
      <>
        <p>If you were logged in, open <b>My donations</b> from the top menu. Each donation shows one of these:</p>
        <ul>
          <li><b>Waiting for NGO</b> — the NGO hasn&apos;t checked its account yet. Most do within a few days.</li>
          <li><b>Confirmed by NGO</b> — the money reached the NGO. It now counts on the project page as “Rahul S.” (or Anonymous).</li>
          <li><b>Not received</b> — the NGO couldn&apos;t find your payment. Their reason is shown.</li>
        </ul>
      </>
    ),
    warn: (
      <>
        Marked “Not received” but you really paid? Email <b>{CONTACT_EMAIL}</b> with your UTR and payment screenshot. Our team checks every
        rejection and can overturn it — it will then show as <b>“Verified by KindBharat”</b>.
      </>
    ),
    figure: <MockMyDonations />,
  },
  {
    id: "after",
    title: "See the proof, ask questions, report problems",
    body: (
      <>
        <p>When the work is done, the NGO uploads photos, bills and the number of people helped. After our team checks it, the project shows <b>“Completed with proof”</b>.</p>
        <ul>
          <li><b>Ask a question:</b> scroll to <b>Questions & answers</b> on the project page (you need to be logged in).</li>
          <li><b>Something looks wrong?</b> Tap <b>Report this project</b> at the bottom. Reports are private.</li>
          <li><b>80G tax receipt:</b> the NGO issues it, not KindBharat. Contact the NGO with your UTR and PAN.</li>
        </ul>
      </>
    ),
  },
];

export default function DonorGuidePage() {
  return (
    <Container className="py-10 sm:py-14">
      <Link href="/help" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" /> All help guides
      </Link>
      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_280px]">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-ink">Guide for donors</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">How to donate on KindBharat</h1>
          <p className="mt-3 max-w-xl text-lg text-muted">
            It takes about 3 minutes. You pay the NGO directly — KindBharat never touches your money and charges no fee.
          </p>
        </header>
        <GuideContents steps={STEPS} />
      </div>

      <div className="mt-6">
        {STEPS.map((s, i) => <GuideStep key={s.id} n={i + 1} step={s} />)}
      </div>

      <div className="mt-6 flex flex-col items-start gap-3 rounded-3xl bg-primary-soft p-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-semibold">Browse verified projects to make a donation.</p>
        <ButtonLink href="/projects">Browse projects</ButtonLink>
      </div>
      <p className="mt-6 text-sm text-muted">
        More questions? See the <HelpLink href="/how-it-works#donors">FAQ for donors</HelpLink> or email {CONTACT_EMAIL}.
      </p>
    </Container>
  );
}
