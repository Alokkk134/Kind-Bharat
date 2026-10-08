import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Building2, Camera, Flag, FolderKanban, IndianRupee, Lightbulb, MessagesSquare, Wallet } from "lucide-react";
import { PageHeader } from "@/components/ui/card";
import { CountUp } from "@/components/motion/count-up";
import { Reveal } from "@/components/motion/reveal";
import { Tilt } from "@/components/motion/tilt";
import { cn } from "@/lib/utils";
import { adminCounts } from "./data";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

export default async function AdminOverview() {
  const n = await adminCounts();
  const tiles = [
    { label: "NGOs waiting for verification", value: n.ngos, href: "/admin/ngos", icon: Building2, color: "from-primary to-[#138a7f]" },
    { label: "Payment details to check", value: n.payments, href: "/admin/payments", icon: Wallet, color: "from-[#9a520b] to-accent" },
    { label: "Projects waiting for approval", value: n.projects, href: "/admin/projects", icon: FolderKanban, color: "from-[#1d5fa8] to-[#3b82c4]" },
    { label: "Rejected donations to check", value: n.rejectedToReview, href: "/admin/donations?status=to_review", icon: IndianRupee, color: "from-[#7c2d12] to-accent-ink" },
    { label: "Donations pending over 7 days", value: n.stalePending, href: "/admin/donations?status=stale", icon: IndianRupee, color: "from-warning to-accent" },
    { label: "Completion proofs to review", value: n.proofs, href: "/admin/proofs", icon: Camera, color: "from-[#2e7d4f] to-[#4caf7a]" },
    { label: "Open reports", value: n.reports, href: "/admin/reports", icon: Flag, color: "from-danger to-rose" },
    { label: "New feedback & ideas", value: n.feedbackNew, href: "/admin/feedback", icon: Lightbulb, color: "from-[#5b4bb7] to-[#8b7be0]" },
    { label: "Comments in the last 7 days", value: n.comments, href: "/admin/comments", icon: MessagesSquare, color: "from-stone-700 to-stone-500" },
  ];
  return (
    <>
      <PageHeader eyebrow="Today" title="Overview" description="Everything that needs your attention, in one place." />
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tiles.map((t, i) => {
          const Icon = t.icon;
          return (
            <Reveal as="li" key={t.label} delay={i * 70}>
              <Link href={t.href} className="block h-full">
                <Tilt className="rounded-3xl">
                  <div className={cn("relative h-full overflow-hidden rounded-3xl bg-gradient-to-br p-5 text-white shadow-xl", t.color)}>
                    <Icon className="absolute -right-4 -top-4 h-28 w-28 opacity-15" aria-hidden />
                    <div className="flex items-center justify-between [transform:translateZ(30px)]">
                      <span className="rounded-2xl bg-white/20 p-2.5"><Icon className="h-5 w-5" /></span>
                      <ArrowUpRight className="h-5 w-5 opacity-70" />
                    </div>
                    <p className="mt-6 font-serif text-5xl font-semibold [transform:translateZ(50px)]">
                      <CountUp value={t.value} />
                    </p>
                    <p className="mt-1 text-sm text-white/85">{t.label}</p>
                  </div>
                </Tilt>
              </Link>
            </Reveal>
          );
        })}
      </ul>
    </>
  );
}
