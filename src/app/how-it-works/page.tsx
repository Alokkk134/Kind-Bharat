import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Aurora } from "@/components/motion/decor";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { PROOF_GRACE_DAYS } from "@/lib/config";

export const metadata: Metadata = {
  title: "How it works & FAQ",
  description: "How KindBharat verifies NGOs and projects, how direct donations work, and answers to common questions for donors and NGOs.",
};

const DONOR_FAQ: [string, React.ReactNode][] = [
  ["Does KindBharat take any fee or commission?", "No. KindBharat never receives your money and charges nothing to donors or NGOs. You pay the NGO directly."],
  [
    "How do I know an NGO is genuine?",
    "Before an NGO can publish anything, our team checks its registration certificate and other documents (like PAN, 12A, 80G, FCRA, NGO Darpan). Our team also approves every project. Still, please do your own checks too — see our Disclaimer.",
  ],
  [
    "How do I donate?",
    "Open a project, tap Donate, and pay using the NGO's UPI ID, QR code or bank details shown on that page. Then fill the short form with your name, amount and UTR/transaction ID so the NGO can confirm it.",
  ],
  [
    "What is a UTR number and where do I find it?",
    "UTR (or UPI reference / transaction ID) is the unique number for your payment. In GPay, PhonePe, Paytm or your bank app, open the payment in your history — it's usually a 12-digit number.",
  ],
  [
    "Why doesn't my donation show on the project yet?",
    "Only donations the NGO has confirmed receiving are shown and counted. This stops fake numbers. Most NGOs confirm within a few days. If you made an account, you can track the status under “My donations”.",
  ],
  [
    "What if the NGO says it didn't receive my donation?",
    "Our team watches every rejected donation. If you really paid, email us your UTR and payment screenshot. We check it and can overturn a wrong rejection — the donation then counts toward the goal and shows “Verified by KindBharat”. NGOs that reject genuine donations can be suspended.",
  ],
  ["Will I get an 80G tax receipt?", "80G receipts are issued by the NGO, not by KindBharat. Look for the 80G badge, and contact the NGO with your UTR number and PAN."],
  ["Is my information public?", "No. Only your first name and last initial (e.g. “Rahul S.”) or “Anonymous” is shown, with the amount. Your email, phone, UTR and screenshot are visible only to that NGO and our team."],
  ["Can donors outside India donate?", "Not for now. KindBharat is for donors in India. NGOs need FCRA registration to accept foreign money."],
  ["What if a project looks wrong?", "Use “Report this project” on the project page. Our team reviews every report and can pause or remove projects and suspend NGOs."],
  ["Do I need an account?", "No — you can donate as a guest. An account lets you ask questions, report problems and see your donation history."],
];

const NGO_FAQ: [string, React.ReactNode][] = [
  ["Who can join?", "Registered Trusts, Societies, Section 8 Companies and other registered social organisations in India. You'll need your registration certificate."],
  ["How long does verification take?", "Usually 2–3 working days after you submit your profile and documents. You can prepare project drafts while you wait."],
  ["Why do you re-check payment details?", "To protect donors from scams (for example, if someone gains access to an account). Any change to UPI or bank details hides them from your projects until our team approves the change — usually within 1 working day."],
  ["What makes a good project?", "Small, specific and measurable: “Stationery kits for 100 students — ₹25,000” with a clear item-by-item budget and real photos."],
  ["Do I have to confirm every donation?", "Yes. Check your bank/UPI statement for each UTR and press Confirm or “Not received”. Only confirmed donations count toward your goal."],
  ["What happens after the project?", `Submit proof — photos, a description, number of people reached, and bills if you have them. Our team reviews it and marks the project “Completed with proof”. If proof isn't submitted within ${PROOF_GRACE_DAYS} days after the deadline or reaching the goal, you can't create new projects until you submit it.`],
  ["Can people still donate after the goal is reached?", "Yes, until the deadline. The page shows “Goal reached — extra funds help more people”."],
  ["Can I add work we did before joining?", "Yes, under “Past projects”. These are clearly labelled “Self-reported (before joining)” so donors can tell them apart from verified ones."],
];

function Faq({ items }: { items: [string, React.ReactNode][] }) {
  return (
    <div className="space-y-3">
      {items.map(([q, a], i) => (
        <Reveal key={q} delay={Math.min(i, 5) * 40}>
          <details className="faq group rounded-3xl border border-border bg-surface shadow-sm transition open:shadow-lg">
            <summary className="flex items-center justify-between gap-4 p-5 font-semibold">
              {q}
              <span className="faq-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary transition-transform duration-300">
                <Plus className="h-4 w-4" />
              </span>
            </summary>
            <div className="px-5 pb-5 text-muted">{a}</div>
          </details>
        </Reveal>
      ))}
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-border">
        <Aurora />
        <Container className="py-12 sm:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-ink">How it works</p>
          <h1 className="mt-2 max-w-3xl font-serif text-4xl font-semibold tracking-tight sm:text-6xl">
            A listing platform built on <span className="text-gradient">proof</span>, not promises.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            KindBharat connects donors with verified NGO projects. We check, we list, we follow up — but the money always
            goes straight from you to the NGO.
          </p>
        </Container>
      </section>

      <Container className="py-14">
        <ol className="relative mx-auto max-w-3xl space-y-8 before:absolute before:left-6 before:top-2 before:h-[calc(100%-1rem)] before:w-0.5 before:bg-gradient-to-b before:from-primary before:via-accent before:to-success">
          {[
            ["NGO applies", "The NGO fills its profile and uploads its registration documents. Our team checks them."],
            ["Project approved", "The NGO posts a specific project with an item-by-item budget. We approve every one before it goes live."],
            ["You donate directly", "You pay to the NGO's own UPI or bank account and share your UTR number. No fees."],
            ["NGO confirms", "The NGO checks its bank statement and confirms. Only confirmed donations count toward the goal."],
            ["Proof is posted", "When the work is done, the NGO uploads photos, bills and results. We review them before marking it complete."],
          ].map(([t, d], i) => (
            <Reveal as="li" key={t} delay={i * 80} className="relative pl-16">
              <span className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface font-serif text-xl font-semibold text-primary shadow-lg ring-4 ring-bg">
                {i + 1}
              </span>
              <h2 className="font-serif text-2xl font-semibold">{t}</h2>
              <p className="mt-1 text-muted">{d}</p>
            </Reveal>
          ))}
        </ol>
      </Container>

      <Container className="grid gap-12 pb-20 lg:grid-cols-2">
        <section id="donors">
          <h2 className="mb-5 font-serif text-3xl font-semibold">For donors</h2>
          <Faq items={DONOR_FAQ} />
        </section>
        <section id="ngos">
          <h2 className="mb-5 font-serif text-3xl font-semibold">For NGOs</h2>
          <Faq items={NGO_FAQ} />
          <div className="mt-8 rounded-3xl bg-primary-soft p-6">
            <p className="font-semibold">Ready to join?</p>
            <p className="mt-1 text-sm text-muted">Registration is free. Read our <Link href="/terms" className="text-primary underline">Terms</Link> first.</p>
            <ButtonLink href="/signup?role=ngo" className="mt-4">Register your NGO</ButtonLink>
          </div>
        </section>
      </Container>
    </>
  );
}
