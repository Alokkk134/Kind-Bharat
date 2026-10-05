import type { Metadata } from "next";
import { History, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, EmptyState, PageHeader } from "@/components/ui/card";
import { requireNgo } from "@/lib/auth";
import { formatDateIST, formatNumber } from "@/lib/format";
import { publicUrl } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";
import { deletePastProjectAction } from "../actions";
import { PastProjectForm } from "./past-form";

export const metadata: Metadata = { title: "Past projects", robots: { index: false } };

export default async function PastProjectsPage() {
  const ngo = await requireNgo();
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("past_projects")
    .select("*")
    .eq("ngo_id", ngo.id)
    .order("date", { ascending: false, nullsFirst: false });

  return (
    <>
      <PageHeader
        eyebrow="Track record"
        title="Past projects"
        description="Work you did before joining KindBharat. These are shown as “Self-reported (before joining)” so donors can tell them apart from verified projects."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-serif text-lg font-semibold">Add a past project</h2>
          <PastProjectForm ngoId={ngo.id} />
        </Card>
        <div>
          {!items?.length ? (
            <EmptyState icon={<History className="h-7 w-7" />} title="Nothing here yet">
              Add 2–3 of your best past projects with photos to build donor trust.
            </EmptyState>
          ) : (
            <ul className="space-y-4">
              {items.map((p) => (
                <li key={p.id}>
                  <Card className="!p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Badge tone="neutral">Self-reported (before joining)</Badge>
                        <p className="mt-2 font-semibold">{p.title}</p>
                        <p className="text-xs text-muted">
                          {p.date ? formatDateIST(p.date) : "Date not given"}
                          {p.beneficiaries ? ` · ${formatNumber(p.beneficiaries)} people helped` : ""}
                        </p>
                      </div>
                      <form action={deletePastProjectAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <button className="rounded-xl p-2 text-danger hover:bg-red-50" aria-label="Delete past project">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                    <p className="mt-2 line-clamp-3 text-sm text-muted">{p.description}</p>
                    {p.images.length > 0 && (
                      <div className="mt-3 flex gap-2 overflow-x-auto">
                        {p.images.map((img) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img key={img} src={publicUrl("media", img) ?? ""} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" loading="lazy" />
                        ))}
                      </div>
                    )}
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
