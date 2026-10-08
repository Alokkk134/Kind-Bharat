import Link from "next/link";
import { Container } from "./container";
import { Logo } from "./logo";

const COLUMNS = [
  {
    title: "Donate",
    links: [
      { href: "/projects", label: "Browse projects" },
      { href: "/ngos", label: "Browse NGOs" },
      { href: "/how-it-works", label: "How it works / FAQ" },
    ],
  },
  {
    title: "KindBharat",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/signup", label: "Register your NGO" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/terms", label: "Terms of Use" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/disclaimer", label: "Disclaimer" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <Container className="grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted">
            A free listing platform. KindBharat never collects or handles money —
            donors pay verified NGOs directly.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="text-sm font-semibold text-ink">{col.title}</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-muted hover:text-primary">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>
      <div className="border-t border-border">
        <Container className="py-4 text-xs text-muted">
          © {new Date().getFullYear()} KindBharat · For donors in India
        </Container>
      </div>
    </footer>
  );
}
