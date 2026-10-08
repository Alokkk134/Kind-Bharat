import Link from "next/link";
import { Lightbulb, TriangleAlert } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

export type GuideStepData = {
  id: string;
  title: string;
  body: React.ReactNode;
  figure?: React.ReactNode;
  tip?: React.ReactNode;
  warn?: React.ReactNode;
};

/** Numbered list of steps at the top of a guide (jump links). */
export function GuideContents({ steps }: { steps: GuideStepData[] }) {
  return (
    <nav aria-label="Steps in this guide" className="rounded-3xl border border-border bg-surface p-5">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-muted">In this guide</p>
      <ol className="mt-3 space-y-1.5 text-sm">
        {steps.map((s, i) => (
          <li key={s.id}>
            <a href={`#${s.id}`} className="flex gap-2 rounded-lg px-2 py-1 hover:bg-primary-soft hover:text-primary">
              <span className="w-5 shrink-0 font-semibold text-accent-ink">{i + 1}.</span>
              {s.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** One step: number + title + plain-language text, with a screenshot or drawing beside it. */
export function GuideStep({ n, step }: { n: number; step: GuideStepData }) {
  return (
    <Reveal as="section">
      <div id={step.id} className="scroll-mt-24 grid items-start gap-6 border-t border-border py-10 lg:grid-cols-[1fr_340px] lg:gap-12">
        <div>
          <p className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary font-serif text-lg font-semibold text-white shadow-lg shadow-primary/25">
              {n}
            </span>
            <span className="font-serif text-2xl font-semibold leading-tight">{step.title}</span>
          </p>
          <div className="guide-body mt-4 space-y-3 text-[1.02rem] leading-relaxed text-ink">{step.body}</div>
          {step.tip && (
            <div className="mt-5 flex gap-3 rounded-2xl bg-primary-soft p-4 text-sm text-primary-deep">
              <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
              <div>{step.tip}</div>
            </div>
          )}
          {step.warn && (
            <div className="mt-4 flex gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-950">
              <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden />
              <div>{step.warn}</div>
            </div>
          )}
        </div>
        {step.figure && <div className="mx-auto w-full max-w-[340px]">{step.figure}</div>}
      </div>
    </Reveal>
  );
}

/** A real screenshot inside a phone frame. */
export function Screenshot({ src, alt, crop }: { src: string; alt: string; crop?: number }) {
  return (
    <figure>
      <PhoneFrame>
        <div className="overflow-hidden" style={crop ? { maxHeight: crop } : undefined}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} loading="lazy" className="block w-full" />
        </div>
      </PhoneFrame>
      <figcaption className="mt-2 text-center text-xs text-muted">Screenshot</figcaption>
    </figure>
  );
}

/** A simple drawing of a logged-in screen (dashboards can't be screenshotted without a real account). */
export function MockScreen({ url, children, className }: { url: string; children: React.ReactNode; className?: string }) {
  return (
    <figure aria-hidden="true">
      <PhoneFrame url={url}>
        <div className={cn("space-y-3 bg-bg p-4 text-[13px] leading-snug", className)}>{children}</div>
      </PhoneFrame>
      <figcaption className="mt-2 text-center text-xs text-muted">How this screen looks</figcaption>
    </figure>
  );
}

function PhoneFrame({ children, url }: { children: React.ReactNode; url?: string }) {
  return (
    <div className="overflow-hidden rounded-[2rem] border-[6px] border-ink/85 bg-surface shadow-[0_30px_60px_-30px_rgba(15,94,89,0.55)]">
      <div className="flex items-center gap-2 bg-ink/85 px-4 pb-2 pt-1 text-[10px] text-white/80">
        <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
        <span className="truncate">{url ?? "kindbharat.org"}</span>
      </div>
      {children}
    </div>
  );
}

export function HelpLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="font-semibold text-primary underline underline-offset-2">
      {children}
    </Link>
  );
}
