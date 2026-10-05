import {
  Building2,
  FileCheck2,
  FolderKanban,
  History,
  IndianRupee,
  LayoutDashboard,
  MessagesSquare,
  Wallet,
} from "lucide-react";
import { DashShell } from "@/components/dashboard/dash-shell";
import { StatusBadge } from "@/components/ui/badge";
import { getMyNgo, requireRole } from "@/lib/auth";
import { NGO_STATUS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

export default async function NgoLayout({ children }: LayoutProps<"/ngo">) {
  await requireRole("ngo", "/ngo");
  const ngo = await getMyNgo();

  let pendingDonations = 0;
  if (ngo) {
    const supabase = await createClient();
    const { data: projects } = await supabase.from("projects").select("id").eq("ngo_id", ngo.id);
    const ids = (projects ?? []).map((p) => p.id);
    if (ids.length) {
      const { count } = await supabase
        .from("donations")
        .select("id", { count: "exact", head: true })
        .in("project_id", ids)
        .eq("status", "pending");
      pendingDonations = count ?? 0;
    }
  }

  return (
    <DashShell
      heading={ngo?.name ?? "Your NGO"}
      sub={ngo ? <StatusBadge status={NGO_STATUS[ngo.status]} /> : "Set up your profile"}
      links={[
        { href: "/ngo", label: "Overview", icon: <LayoutDashboard />, exact: true },
        { href: "/ngo/profile", label: "Organisation", icon: <Building2 /> },
        { href: "/ngo/documents", label: "Documents", icon: <FileCheck2 /> },
        { href: "/ngo/payment", label: "Payment details", icon: <Wallet /> },
        { href: "/ngo/projects", label: "Projects", icon: <FolderKanban /> },
        { href: "/ngo/donations", label: "Donations", icon: <IndianRupee />, badge: pendingDonations },
        { href: "/ngo/comments", label: "Questions", icon: <MessagesSquare /> },
        { href: "/ngo/past-projects", label: "Past projects", icon: <History /> },
      ]}
    >
      {children}
    </DashShell>
  );
}
