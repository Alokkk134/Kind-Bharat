import type { Metadata } from "next";
import Link from "next/link";
import { Building2, ChevronRight } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { Card, EmptyState, PageHeader } from "@/components/ui/card";
import { FilterTabs } from "@/components/ui/filter-tabs";
import type { NgoStatus } from "@/lib/database.types";
import { NGO_STATUS } from "@/lib/constants";
import { formatDateIST } from "@/lib/format";
import { publicUrl } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "NGO verification", robots: { index: false } };

const TABS: { value: NgoStatus | "all"; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
  { value: "suspended", label: "Suspended" },
  { value: "draft", label: "Not submitted" },
  { value: "all", label: "All" },
];

export default async function AdminNgos({ searchParams }: PageProps<"/admin/ngos">) {
  const sp = await searchParams;
  const status = TABS.some((t) => t.value === sp.status) ? (sp.status as string) : "pending";
  const supabase = await createClient();
  let q = supabase.from("ngos").select("id, name, city, state, status, logo_path, submitted_at, created_at").order("submitted_at", { ascending: true, nullsFirst: false });
  if (status !== "all") q = q.eq("status", status as NgoStatus);
  const { data: ngos } = await q.limit(200);

  return (
    <>
      <PageHeader eyebrow="Queue" title="NGO verification" description="Open an NGO to view its documents and approve or reject it." />
      <FilterTabs base="/admin/ngos" current={status} tabs={TABS} />
      {!ngos?.length ? (
        <EmptyState icon={<Building2 className="h-7 w-7" />} title="No NGOs in this list" />
      ) : (
        <ul className="space-y-3">
          {ngos.map((n) => (
            <li key={n.id}>
              <Link href={`/admin/ngos/${n.id}`}>
                <Card className="flex items-center gap-4 !p-4 transition hover:-translate-y-0.5 hover:shadow-xl">
                  {n.logo_path ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={publicUrl("ngo-logos", n.logo_path) ?? ""} alt="" className="h-12 w-12 rounded-2xl object-cover" />
                  ) : (
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft font-serif text-lg font-semibold text-primary">
                      {n.name.charAt(0)}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{n.name}</p>
                    <p className="text-sm text-muted">
                      {[n.city, n.state].filter(Boolean).join(", ")} ·{" "}
                      {n.submitted_at ? `submitted ${formatDateIST(n.submitted_at)}` : `joined ${formatDateIST(n.created_at)}`}
                    </p>
                  </div>
                  <StatusBadge status={NGO_STATUS[n.status]} />
                  <ChevronRight className="h-5 w-5 text-muted" />
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
