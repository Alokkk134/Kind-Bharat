import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/layout/container";
import { GuideContents, GuideStep, HelpLink, Screenshot, type GuideStepData } from "@/components/help/guide";
import {
  MockBudget,
  MockConfirmDonation,
  MockDocuments,
  MockJourney,
  MockNgoMenu,
  MockNgoProfile,
  MockPayment,
  MockProof,
  MockQA,
} from "@/components/help/mocks";
import { ButtonLink } from "@/components/ui/button";
import { CONTACT_EMAIL, PROOF_GRACE_DAYS } from "@/lib/config";

export const metadata: Metadata = {
  title: "Help for NGOs — how to raise funds",
  description: "Step-by-step guide for NGOs: sign up, get verified, add UPI/bank details, create a project, confirm donations, answer questions and submit proof.",
};

const STEPS: GuideStepData[] = [
  {
    id: "sign-up",
    title: "Create your NGO account",
    body: (
      <>
        <ol>
          <li>Tap <b>Sign up</b> and choose <b>“I represent an NGO”</b>.</li>
          <li>Enter your name (the contact person), email and a password.</li>
          <li>Tick the box to agree to the Terms, then tap <b>Create NGO account</b>.</li>
          <li>Open the email we send you and tap the link to activate the account.</li>
        </ol>
        <p>One account = one organisation. Use an email your team can always access.</p>
      </>
    ),
    tip: <>Keep your registration certificate ready (photo or PDF). You will need it in step 3.</>,
    figure: <Screenshot src="/help/signup-ngo.webp" alt="Sign up page with 'I represent an NGO' selected" />,
  },
  {
    id: "dashboard",
    title: "Get to know your dashboard",
    body: (
      <>
        <p>After logging in you land on your <b>NGO dashboard</b>. The menu has:</p>
        <ul>
          <li><b>Overview</b> — your verification progress and key numbers.</li>
          <li><b>Organisation</b> — your public profile.</li>
          <li><b>Documents</b> — certificates for verification (private).</li>
          <li><b>Payment details</b> — where donors send money.</li>
          <li><b>Projects</b> — create and manage projects.</li>
          <li><b>Donations</b> — confirm the donations you received. A number shows how many are waiting.</li>
          <li><b>Questions</b> — reply to donors.</li>
          <li><b>Past projects</b> — work you did before joining.</li>
        </ul>
      </>
    ),
    figure: <MockNgoMenu />,
  },
  {
    id: "profile",
    title: "Fill your organisation profile",
    body: (
      <>
        <p>Open <b>Organisation</b> and fill in your legal details, city and state, contact person, phone, and a short <b>About</b> section. Pick your focus areas (Education, Food, Health…). Tap <b>Create profile</b>.</p>
        <p>After the first save you can add your <b>logo</b>.</p>
      </>
    ),
    tip: <>PAN, phone and address stay private. Donors only see your public details.</>,
    warn: <>After you are verified, the name, type, registration number and PAN are locked. Email us if they need to change.</>,
    figure: <MockNgoProfile />,
  },
  {
    id: "documents",
    title: "Upload your documents",
    body: (
      <>
        <p>Open <b>Documents</b>. Choose the document type, then pick a photo or PDF.</p>
        <ul>
          <li><b>Registration certificate</b> is required.</li>
          <li>Add 12A, 80G, FCRA, PAN or NGO Darpan if you have them — they earn badges on your page.</li>
          <li>Photos are shrunk automatically but stay readable. PDFs must be under 1 MB.</li>
          <li>Up to 5 documents.</li>
        </ul>
      </>
    ),
    tip: <>Documents are private. Only you and the KindBharat team can open them.</>,
    figure: <MockDocuments />,
  },
  {
    id: "payment",
    title: "Add your UPI or bank details",
    body: (
      <>
        <p>Open <b>Payment details</b>. Add your UPI ID (and QR code if you have one) and/or your bank account. Tap <b>Save payment details</b>.</p>
        <p>Donors pay straight into this account. KindBharat never receives the money.</p>
      </>
    ),
    warn: <>To stop scams, <b>every time</b> you change these details they are hidden from donors until our team checks them (usually within 1 working day).</>,
    figure: <MockPayment />,
  },
  {
    id: "verify",
    title: "Submit for verification",
    body: (
      <>
        <p>Go to <b>Overview</b>. When Profile, Documents and Payment are ticked, tap <b>Submit for verification</b>.</p>
        <ul>
          <li>We usually reply within <b>2–3 working days</b>.</li>
          <li>Once verified, your <b>Verified NGO</b> badge goes live.</li>
          <li>If something is missing, you will see the reason. Fix it and submit again.</li>
        </ul>
        <p>You can prepare project drafts while you wait.</p>
      </>
    ),
    figure: <MockJourney />,
  },
  {
    id: "project",
    title: "Create a project",
    body: (
      <>
        <p>Open <b>Projects → New project</b>. Keep it small and specific, like <i>“Stationery kits for 100 students — ₹25,000”</i>.</p>
        <ol>
          <li>Title, cause, number of people helped, a short summary and a full description.</li>
          <li>City, state, start date and deadline.</li>
          <li><b>Budget:</b> list every item with quantity and price. The total must equal your goal — tap <b>Use budget total</b> to fill it.</li>
          <li>Add at least one real photo (up to 8).</li>
        </ol>
        <p>Tap <b>Save draft</b> any time. When ready, tap <b>Submit for review</b>. We approve every project before it goes live.</p>
      </>
    ),
    tip: (
      <>
        Project status meanings: <b>Draft</b> (only you see it) → <b>Under review</b> → <b>Active</b> (live) → <b>Goal reached</b> →{" "}
        <b>Proof submitted</b> → <b>Completed</b>. If it is <b>Rejected</b>, read the reason, edit and submit again.
      </>
    ),
    figure: <MockBudget />,
  },
  {
    id: "donations",
    title: "Confirm every donation",
    body: (
      <>
        <p>When a donor pays, it appears in <b>Donations → To confirm</b> with the amount, UTR number and often a screenshot.</p>
        <ol>
          <li>Check your bank or UPI statement for that UTR and amount.</li>
          <li>Found it? Tap <b>Confirm received</b>. It now counts toward your goal and shows on your project.</li>
          <li>Not there? Tap <b>Not received</b> and write a short reason.</li>
        </ol>
      </>
    ),
    warn: (
      <>
        Be honest. KindBharat checks rejected donations. If a donor proves they paid, we overturn the rejection — and NGOs that reject genuine
        donations can be suspended.
      </>
    ),
    figure: <MockConfirmDonation />,
  },
  {
    id: "questions",
    title: "Answer donor questions",
    body: (
      <>
        <p>Open <b>Questions</b>. Unanswered ones are at the top with a <b>Needs reply</b> tag. Type your answer and tap <b>Reply as NGO</b>.</p>
        <p>Quick, honest answers build trust and bring more donations.</p>
      </>
    ),
    figure: <MockQA />,
  },
  {
    id: "proof",
    title: "Submit proof when the work is done",
    body: (
      <>
        <p>Open the project and tap <b>Submit proof</b>. Add what you did, how many people you reached, and photos or bills (up to 10). Our team reviews it and marks the project <b>Completed with proof</b>.</p>
      </>
    ),
    warn: (
      <>
        If you don&apos;t submit proof within <b>{PROOF_GRACE_DAYS} days</b> after the deadline (or after reaching the goal), you can&apos;t create new
        projects until you do.
      </>
    ),
    tip: <>Photos of children: get permission and avoid showing faces where possible.</>,
    figure: <MockProof />,
  },
  {
    id: "past",
    title: "Add past projects (optional)",
    body: (
      <>
        <p>Open <b>Past projects</b> to add work you did before joining — title, date, what you did, people helped and up to 5 photos.</p>
        <p>These show on your public page as <b>“Self-reported (before joining)”</b>, so donors can tell them apart from verified projects.</p>
      </>
    ),
  },
];

export default function NgoGuidePage() {
  return (
    <Container className="py-10 sm:py-14">
      <Link href="/help" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" /> All help guides
      </Link>
      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_280px]">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-ink">Guide for NGOs</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">How to raise funds on KindBharat</h1>
          <p className="mt-3 max-w-xl text-lg text-muted">
            Free for NGOs — no listing fee, no commission. Donations go straight into your own account.
          </p>
        </header>
        <GuideContents steps={STEPS} />
      </div>

      <div className="mt-6">
        {STEPS.map((s, i) => <GuideStep key={s.id} n={i + 1} step={s} />)}
      </div>

      <div className="mt-6 flex flex-col items-start gap-3 rounded-3xl bg-primary-soft p-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-semibold">Registration is free for all NGOs.</p>
        <ButtonLink href="/signup?role=ngo">Register your NGO</ButtonLink>
      </div>
      <p className="mt-6 text-sm text-muted">
        More questions? See the <HelpLink href="/how-it-works#ngos">FAQ for NGOs</HelpLink> or email {CONTACT_EMAIL}.
      </p>
    </Container>
  );
}
