import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, HandHeart, Mail } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Aurora } from "@/components/motion/decor";
import { Reveal } from "@/components/motion/reveal";
import { Tilt } from "@/components/motion/tilt";
import { CONTACT_EMAIL } from "@/lib/config";

export const metadata: Metadata = {
  title: "Help — how to use KindBharat",
  description: "Step-by-step guides with screenshots for donors and NGOs: sign up, donate, confirm donations, create projects and submit proof.",
};

const GUIDES = [
  {
    href: "/help/donors",
    icon: HandHeart,
    title: "I want to donate",
    text: "Sign up, find a project, pay the NGO, tell us you paid, and track your donation.",
    steps: "8 short steps",
  },
  {
    href: "/help/ngos",
    icon: Building2,
    title: "I run an NGO",
    text: "Sign up, get verified, add payment details, create projects, confirm donations and share proof.",
    steps: "11 short steps",
  },
];

export default function HelpPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-border">
        <Aurora />
        <Container className="py-12 sm:py-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-ink">Help</p>
          <h1 className="mt-2 max-w-2xl font-serif text-4xl font-semibold tracking-tight sm:text-5xl">How to use KindBharat</h1>
          <p className="mt-3 max-w-xl text-lg text-muted">Simple step-by-step guides with pictures. Pick the one for you.</p>
        </Container>
      </section>

      <Container className="py-12">
        <ul className="grid gap-6 md:grid-cols-2">
          {GUIDES.map(({ href, icon: Icon, title, text, steps }, i) => (
            <Reveal as="li" key={href} delay={i * 100}>
              <Tilt className="rounded-[2rem]" max={6}>
                <Link href={href} className="group flex h-full flex-col rounded-[2rem] border border-border bg-surface p-7 shadow-[0_24px_50px_-30px_rgba(15,94,89,0.6)]">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[#138a7f] text-white shadow-lg [transform:translateZ(30px)]">
                    <Icon className="h-7 w-7" />
                  </span>
                  <span className="mt-5 font-serif text-2xl font-semibold">{title}</span>
                  <span className="mt-2 text-muted">{text}</span>
                  <span className="mt-6 flex items-center justify-between text-sm font-semibold text-primary">
                    <span>{steps}</span>
                    <span className="flex items-center gap-1 transition group-hover:translate-x-1">Open guide <ArrowRight className="h-4 w-4" /></span>
                  </span>
                </Link>
              </Tilt>
            </Reveal>
          ))}
        </ul>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link href="/how-it-works" className="rounded-3xl border border-border bg-surface p-5 transition hover:border-primary">
            <p className="font-semibold">Questions? Read the FAQ</p>
            <p className="text-sm text-muted">Fees, UTR numbers, 80G receipts, privacy and more.</p>
          </Link>
          <a href={`mailto:${CONTACT_EMAIL}`} className="flex gap-3 rounded-3xl border border-border bg-surface p-5 transition hover:border-primary">
            <Mail className="h-6 w-6 shrink-0 text-primary" />
            <span>
              <span className="block font-semibold">Need more help? Contact admin</span>
              <span className="block text-sm text-muted">{CONTACT_EMAIL} — tell us what you were trying to do.</span>
            </span>
          </a>
          <Link href="/feedback" className="rounded-3xl border border-border bg-surface p-5 transition hover:border-primary sm:col-span-2">
            <p className="font-semibold">Suggest a feature or report a problem</p>
            <p className="text-sm text-muted">Use the feedback form.</p>
          </Link>
        </div>
      </Container>
    </>
  );
}
