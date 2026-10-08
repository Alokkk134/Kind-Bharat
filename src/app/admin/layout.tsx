import {
  Building2,
  Camera,
  Flag,
  FolderKanban,
  Gauge,
  IndianRupee,
  Lightbulb,
  MessagesSquare,
  Wallet,
} from "lucide-react";
import { DashShell } from "@/components/dashboard/dash-shell";
import { requireRole } from "@/lib/auth";
import { adminCounts } from "./data";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireRole("admin", "/admin");
  const n = await adminCounts();
  return (
    <DashShell
      heading="Admin panel"
      sub="Keep KindBharat trustworthy"
      links={[
        { href: "/admin", label: "Overview", icon: <Gauge />, exact: true },
        { href: "/admin/ngos", label: "NGO verification", icon: <Building2 />, badge: n.ngos },
        { href: "/admin/payments", label: "Payment details", icon: <Wallet />, badge: n.payments },
        { href: "/admin/projects", label: "Project approval", icon: <FolderKanban />, badge: n.projects },
        { href: "/admin/donations", label: "Donations", icon: <IndianRupee />, badge: n.rejectedToReview + n.stalePending },
        { href: "/admin/proofs", label: "Completion proofs", icon: <Camera />, badge: n.proofs },
        { href: "/admin/reports", label: "Reports", icon: <Flag />, badge: n.reports },
        { href: "/admin/comments", label: "Comments", icon: <MessagesSquare /> },
        { href: "/admin/feedback", label: "Feedback", icon: <Lightbulb />, badge: n.feedbackNew },
      ]}
    >
      {children}
    </DashShell>
  );
}
