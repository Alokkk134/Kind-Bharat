import type { Metadata } from "next";
import { Bug, Lightbulb, MessageSquareHeart, MessagesSquare } from "lucide-react";
import { ReviewForm } from "@/components/forms/review-form";
import { Badge } from "@/components/ui/badge";
import { Card, EmptyState, PageHeader } from "@/components/ui/card";
import { FilterTabs } from "@/components/ui/filter-tabs";
import type { FeedbackKind, FeedbackStatus } from "@/lib/database.types";
import type { Tone } from "@/lib/constants";
import { formatDateTimeIST } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { reviewFeedbackAction } from "../actions";

export const metadata: Metadata = { title: "Feedback", robots: { index: false } };

const KIND: Record<FeedbackKind, { label: string; tone: Tone; icon: typeof Bug }> = {
  feature: { label: "Feature idea", tone: "info", icon: Lightbulb },
  bug: { label: "Problem / bug", tone: "danger", icon: Bug },
  other: { label: "Other", tone: "neutral", icon: MessageSquareHeart },
};
const STATUS: Record<FeedbackStatus, { label: string; tone: Tone }> = {
  new: { label: "New", tone: "warning" },
  planned: { label: "Planned", tone: "info" },
  done: { label: "Done", tone: "success" },
  dismissed: { label: "Dismissed", tone: "neutral" },
};

export default async function AdminFeedback({ searchParams }: PageProps<"/admin/feedback">) {
  const sp = await searchParams;
  const status = (["new", "planned", "done", "dismissed", "all"].includes(sp.status as string) ? sp.status : "new") as FeedbackStatus | "all";
  const kind = (["feature", "bug", "other"].includes(sp.kind as string) ? sp.kind : "") as FeedbackKind | "";
  const supabase = await createClient();
  let q = supabase.from("feedback").select("*").order("created_at", { ascending: false }).limit(200);
  if (status !== "all") q = q.eq("status", status);
  if (kind) q = q.eq("kind", kind);
  const { data: items } = await q;

  const userIds = [...new Set((items ?? []).map((f) => f.user_id).filter(Boolean))] as string[];
  const { data: users } = userIds.length
    ? await supabase.from("profiles").select("id, full_name, role").in("id", userIds)
    : { data: [] as { id: string; full_name: string; role: string }[] };
  const userById = new Map((users ?? []).map((u) => [u.id, u]));

  return (
    <>
      <PageHeader
        eyebrow="Ideas & problems"
        title="Feedback"
        description="Feature ideas, bug reports and other messages sent through the feedback form."
      />
      <FilterTabs
        base="/admin/feedback"
        current={status}
        tabs={[
          { value: "new", label: "New" },
          { value: "planned", label: "Planned" },
          { value: "done", label: "Done" },
          { value: "dismissed", label: "Dismissed" },
          { value: "all", label: "All" },
        ]}
      />
      <div className="-mt-3 mb-6 flex flex-wrap gap-2 text-sm">
        {[{ v: "", l: "All types" }, { v: "feature", l: "Feature ideas" }, { v: "bug", l: "Problems" }, { v: "other", l: "Other" }].map((k) => (
          <a
            key={k.v}
            href={`/admin/feedback?status=${status}${k.v ? `&kind=${k.v}` : ""}`}
            className={kind === k.v ? "chip chip-on" : "chip"}
          >
            {k.l}
          </a>
        ))}
      </div>

      {!items?.length ? (
        <EmptyState icon={<MessagesSquare className="h-7 w-7" />} title="No feedback here" />
      ) : (
        <ul className="space-y-4">
          {items.map((f) => {
            const k = KIND[f.kind];
            const Icon = k.icon;
            const u = f.user_id ? userById.get(f.user_id) : undefined;
            return (
              <li key={f.id}>
                <Card className="!p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge tone={k.tone}><Icon className="h-3.5 w-3.5" /> {k.label}</Badge>
                    <Badge tone={STATUS[f.status].tone}>{STATUS[f.status].label}</Badge>
                  </div>
                  <p className="mt-3 whitespace-pre-line break-words">{f.message}</p>
                  <p className="mt-3 text-xs text-muted">
                    {f.name || u?.full_name || "Guest"}
                    {u && ` · ${u.role} account`}
                    {f.email && <> · <a href={`mailto:${f.email}`} className="text-primary underline">{f.email}</a></>}
                    {f.page && ` · from ${f.page}`} · {formatDateTimeIST(f.created_at)}
                  </p>
                  {f.admin_note && <p className="mt-2 text-sm"><span className="font-semibold text-info">Your note:</span> {f.admin_note}</p>}
                  <ReviewForm
                    className="mt-4 border-t border-border pt-4"
                    action={reviewFeedbackAction}
                    id={f.id}
                    field="status"
                    reasonName="note"
                    reasonLabel="Private note (optional)"
                    reasonHint="Only admins see this."
                    decisions={[
                      { value: "planned", label: "Planned", variant: "outline", needsReason: true },
                      { value: "done", label: "Done", variant: "success" },
                      { value: "dismissed", label: "Dismiss", variant: "outline" },
                      ...(f.status !== "new" ? [{ value: "new", label: "Back to new", variant: "outline" as const }] : []),
                    ]}
                  />
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
