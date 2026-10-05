import { HandHeart, Search, UserRound } from "lucide-react";
import { DashShell } from "@/components/dashboard/dash-shell";
import { requireRole } from "@/lib/auth";

export default async function DonorLayout({ children }: LayoutProps<"/dashboard">) {
  const session = await requireRole("donor", "/dashboard");
  return (
    <DashShell
      heading={`Namaste, ${session.profile.full_name.split(" ")[0] || "friend"}`}
      sub="Donor account"
      links={[
        { href: "/dashboard", label: "My donations", icon: <HandHeart />, exact: true },
        { href: "/dashboard/profile", label: "My profile", icon: <UserRound /> },
        { href: "/projects", label: "Find projects", icon: <Search /> },
      ]}
    >
      {children}
    </DashShell>
  );
}
