import Link from "next/link";
import { LayoutDashboard, LogOut, Menu } from "lucide-react";
import { signOutAction } from "@/app/(auth)/actions";
import { dashboardPath, getSession } from "@/lib/auth";
import { buttonClass } from "@/components/ui/button";
import { Container } from "./container";
import { Logo } from "./logo";

const NAV_LINKS = [
  { href: "/projects", label: "Projects" },
  { href: "/ngos", label: "NGOs" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/help", label: "Help" },
  { href: "/about", label: "About" },
];

export async function SiteHeader() {
  const session = await getSession();
  const dash = session ? dashboardPath(session.profile.role) : null;
  const dashLabel =
    session?.profile.role === "admin" ? "Admin" : session?.profile.role === "ngo" ? "NGO dashboard" : "My donations";

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-surface/80 backdrop-blur-xl supports-[backdrop-filter]:bg-surface/65">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1 text-sm font-medium">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="relative rounded-lg px-3 py-2 text-ink transition hover:text-primary after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-accent after:transition-transform hover:after:scale-x-100"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {session && dash ? (
            <>
              <Link href={dash} className={buttonClass("outline", "sm")}>
                <LayoutDashboard className="h-4 w-4" aria-hidden />
                {dashLabel}
              </Link>
              <form action={signOutAction}>
                <button className={buttonClass("ghost", "sm")} aria-label="Log out">
                  <LogOut className="h-4 w-4" aria-hidden />
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className={buttonClass("ghost", "sm")}>
                Log in
              </Link>
              <Link href="/signup" className={buttonClass("primary", "sm")}>
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu: <details> works without JavaScript */}
        <details className="group relative md:hidden">
          <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-xl border border-border bg-surface transition group-open:bg-primary group-open:text-white [&::-webkit-details-marker]:hidden">
            <span className="sr-only">Open menu</span>
            <Menu className="h-5 w-5 transition-transform duration-300 group-open:rotate-90" aria-hidden />
          </summary>
          <nav
            aria-label="Mobile"
            className="absolute right-0 z-50 mt-3 w-64 origin-top-right animate-pop rounded-3xl border border-border bg-surface p-2 shadow-2xl shadow-primary/10"
          >
            <ul className="flex flex-col text-base font-medium">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="block rounded-2xl px-4 py-3 hover:bg-primary-soft">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li className="my-1 border-t border-border" />
              {session && dash ? (
                <>
                  <li>
                    <Link href={dash} className="block rounded-2xl px-4 py-3 font-semibold text-primary hover:bg-primary-soft">
                      {dashLabel}
                    </Link>
                  </li>
                  <li>
                    <form action={signOutAction}>
                      <button className="w-full rounded-2xl px-4 py-3 text-left text-muted hover:bg-primary-soft">
                        Log out
                      </button>
                    </form>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link href="/login" className="block rounded-2xl px-4 py-3 text-primary hover:bg-primary-soft">
                      Log in
                    </Link>
                  </li>
                  <li className="p-1">
                    <Link href="/signup" className={buttonClass("primary", "md", "w-full")}>
                      Sign up free
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </details>
      </Container>
    </header>
  );
}
