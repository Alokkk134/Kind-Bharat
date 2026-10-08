import { Compass } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Rangoli } from "@/components/motion/decor";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Container className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden py-16 text-center">
      <Rangoli className="pointer-events-none absolute h-[420px] w-[420px] opacity-25" />
      <span className="relative flex h-20 w-20 animate-float items-center justify-center rounded-[1.75rem] bg-primary text-white shadow-2xl shadow-primary/40">
        <Compass className="h-10 w-10" />
      </span>
      <h1 className="relative mt-6 font-serif text-4xl font-semibold">Page not found</h1>
      <p className="relative mt-2 max-w-md text-muted">
        The page may have moved, or the project is no longer public.
      </p>
      <div className="relative mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/">Home</ButtonLink>
        <ButtonLink href="/projects" variant="outline">Browse projects</ButtonLink>
      </div>
    </Container>
  );
}
