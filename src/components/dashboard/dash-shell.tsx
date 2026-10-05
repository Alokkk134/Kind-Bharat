import { Container } from "@/components/layout/container";
import { DashNav, type DashLink } from "./dash-nav";

export function DashShell({
  heading,
  sub,
  links,
  children,
}: {
  heading: string;
  sub?: React.ReactNode;
  links: DashLink[];
  children: React.ReactNode;
}) {
  return (
    <Container className="py-6 sm:py-10">
      <div className="grid gap-6 lg:grid-cols-[230px_1fr] lg:gap-10">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="mb-3 hidden lg:block">
            <p className="font-serif text-xl font-semibold">{heading}</p>
            {sub && <div className="text-sm text-muted">{sub}</div>}
          </div>
          <DashNav links={links} />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </Container>
  );
}
