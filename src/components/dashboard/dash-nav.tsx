"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type DashLink = { href: string; label: string; icon: React.ReactNode; badge?: number; exact?: boolean };

/** Sidebar on desktop, swipeable pill bar on phones. */
export function DashNav({ links }: { links: DashLink[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Dashboard">
      <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0">
        {links.map((l) => {
          const active = l.exact ? pathname === l.href : pathname === l.href || pathname.startsWith(`${l.href}/`);
          return (
            <li key={l.href} className="shrink-0">
              <Link
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 whitespace-nowrap rounded-2xl px-3.5 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-primary text-white shadow-lg shadow-primary/25 lg:translate-x-1"
                    : "bg-surface text-ink ring-1 ring-border hover:bg-primary-soft lg:bg-transparent lg:ring-0",
                )}
              >
                <span className="[&>svg]:h-4 [&>svg]:w-4">{l.icon}</span>
                {l.label}
                {!!l.badge && (
                  <span
                    className={cn(
                      "ml-auto rounded-full px-2 py-0.5 text-xs font-bold",
                      active ? "bg-white/20 text-white" : "bg-accent text-white",
                    )}
                  >
                    {l.badge}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
