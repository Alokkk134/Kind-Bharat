import { Scale } from "lucide-react";
import { Aurora } from "@/components/motion/decor";
import { Container } from "./container";

export function ContentPage({
  eyebrow,
  title,
  intro,
  legal,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: React.ReactNode;
  legal?: boolean;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-border">
        <Aurora className="opacity-50" />
        <Container className="py-12 sm:py-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-ink">{eyebrow}</p>
          <h1 className="mt-2 max-w-3xl font-serif text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
          {intro && <div className="mt-3 max-w-2xl text-lg text-muted">{intro}</div>}
          {updated && <p className="mt-3 text-sm text-muted">Last updated: {updated}</p>}
        </Container>
      </section>
      <Container className="py-10 sm:py-14">
        <div className="mx-auto max-w-3xl">
          {legal && (
            <div className="mb-8 flex gap-3 rounded-3xl border-2 border-dashed border-warning/50 bg-amber-50 p-4 text-sm text-amber-950">
              <Scale className="h-5 w-5 shrink-0 text-warning" />
              <p><strong>To be reviewed by a legal professional before launch.</strong> This is placeholder text prepared in good faith and is not legal advice.</p>
            </div>
          )}
          <div className="prose-kb">{children}</div>
        </div>
      </Container>
    </>
  );
}
