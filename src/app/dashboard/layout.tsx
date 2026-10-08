import { HandHeart, LifeBuoy, Search, UserRound } from "lucide-react";
import { DashShell } from "@/components/dashboard/dash-shell";
import { requireRole } from "@/lib/auth";

export default async function DonorLayout({ children }: LayoutProps<"/dashboard">) {
  const session = await requireRole("donor", "/dashboard");
  return (
    <DashShell
      heading={session.profile.full_name || "My account"}
      sub="Donor account"
      links={[
        { href: "/dashboard", label: "My donations", icon: <HandHeart />, exact: true },
        { href: "/dashboard/profile", label: "My profile", icon: <UserRound /> },
        { href: "/projects", label: "Find projects", icon: <Search /> },
        { href: "/help/donors", label: "Help guide", icon: <LifeBuoy /> },
      ]}
    >
      {children}
    </DashShell>
  );
}
