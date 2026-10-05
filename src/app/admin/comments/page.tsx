import type { Metadata } from "next";
import { Eye, EyeOff, MessagesSquare, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, EmptyState, PageHeader } from "@/components/ui/card";
import { FilterTabs } from "@/components/ui/filter-tabs";
import { formatDateTimeIST } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { moderateCommentAction } from "../actions";

export const metadata: Metadata = { title: "Comment moderation", robots: { index: false } };

export default async function AdminComments({ searchParams }: PageProps<"/admin/comments">) {
  const sp = await searchParams;
  const view = sp.view === "hidden" ? "hidden" : "recent";
  const supabase = await createClient();
  const { data: comments } = await supabase
    .from("comments")
    .select("*")
    .eq("is_hidden", view === "hidden")
    .order("created_at", { ascending: false })
    .limit(100);
  const userIds = [...new Set((comments ?? []).map((c) => c.user_id))];
  const projectIds = [...new Set((comments ?? []).map((c) => c.project_id))];
  const [{ data: users }, { data: projects }] = await Promise.all([
    userIds.length ? supabase.from("profiles").select("id, full_name, role").in("id", userIds) : Promise.resolve({ data: [] as { id: string; full_name: string; role: string }[] }),
    projectIds.length ? supabase.from("projects").select("id, title, slug").in("id", projectIds) : Promise.resolve({ data: [] as { id: string; title: string; slug: string }[] }),
  ]);
  const uById = new Map((users ?? []).map((u) => [u.id, u]));
  const pById = new Map((projects ?? []).map((p) => [p.id, p]));

  return (
    <>
      <PageHeader eyebrow="Moderation" title="Comments" description="Hide anything abusive, spam, or sharing personal details. Hidden comments disappear from the public page." />
      <FilterTabs base="/admin/comments" param="view" current={view} tabs={[{ value: "recent", label: "Visible" }, { value: "hidden", label: "Hidden" }]} />
      {!comments?.length ? (
        <EmptyState icon={<MessagesSquare className="h-7 w-7" />} title="No comments" />
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => {
            const u = uById.get(c.user_id);
            const p = pById.get(c.project_id);
            return (
              <li key={c.id}>
                <Card className="!p-4">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <strong>{u?.full_name || "User"}</strong>
                    {c.is_ngo_reply && <Badge tone="info">NGO reply</Badge>}
                    {c.parent_id && !c.is_ngo_reply && <Badge>Reply</Badge>}
                    <span className="text-muted">on</span>
                    <a href={`/projects/${p?.slug}#qa`} className="text-primary hover:underline">{p?.title}</a>
                    <span className="text-xs text-muted">· {formatDateTimeIST(c.created_at)}</span>
                  </div>
                  <p className="mt-2 whitespace-pre-line text-sm">{c.body}</p>
                  <div className="mt-3 flex gap-2">
                    <form action={moderateCommentAction}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="op" value={c.is_hidden ? "unhide" : "hide"} />
                      <button className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-1.5 text-sm font-medium hover:bg-primary-soft">
                        {c.is_hidden ? <><Eye className="h-4 w-4" /> Unhide</> : <><EyeOff className="h-4 w-4" /> Hide</>}
                      </button>
                    </form>
                    <form action={moderateCommentAction}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="op" value="delete" />
                      <button className="inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm font-medium text-danger hover:bg-red-50">
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </form>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
