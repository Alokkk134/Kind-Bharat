import type { Metadata } from "next";
import Link from "next/link";
import { MessagesSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, EmptyState, PageHeader } from "@/components/ui/card";
import { CommentForm } from "@/components/project/comment-form";
import { requireNgo } from "@/lib/auth";
import { timeAgo } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Questions", robots: { index: false } };

export default async function NgoCommentsPage() {
  const ngo = await requireNgo();
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, slug, status")
    .eq("ngo_id", ngo.id)
    .in("status", ["active", "funded", "proof_submitted", "completed"]);
  const byId = new Map((projects ?? []).map((p) => [p.id, p]));
  const ids = [...byId.keys()];
  const { data: comments } = ids.length
    ? await supabase.from("public_comments").select("*").in("project_id", ids).order("created_at", { ascending: false }).limit(300)
    : { data: [] };

  const all = comments ?? [];
  const answered = new Set(all.filter((c) => c.parent_id && c.is_ngo_reply).map((c) => c.parent_id));
  const questions = all.filter((c) => !c.parent_id);
  const unanswered = questions.filter((q) => !answered.has(q.id));
  const rest = questions.filter((q) => answered.has(q.id));

  return (
    <>
      <PageHeader
        eyebrow="Q&A"
        title="Questions from donors"
        description="Quick, honest answers build trust. Your replies show an “NGO” badge."
      />
      {!questions.length ? (
        <EmptyState icon={<MessagesSquare className="h-7 w-7" />} title="No questions yet" />
      ) : (
        <ul className="space-y-4">
          {[...unanswered, ...rest].map((q) => {
            const p = byId.get(q.project_id);
            const replies = all.filter((c) => c.parent_id === q.id).reverse();
            return (
              <li key={q.id}>
                <Card className="!p-5">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    {answered.has(q.id) ? <Badge tone="success">Answered</Badge> : <Badge tone="warning">Needs reply</Badge>}
                    {p && <Link href={`/projects/${p.slug}#qa`} className="text-primary hover:underline">{p.title}</Link>}
                  </div>
                  <p className="mt-2 text-sm"><strong>{q.author_name}</strong> <span className="text-muted">· {timeAgo(q.created_at)}</span></p>
                  <p className="mt-1 whitespace-pre-line">{q.body}</p>
                  {replies.map((r) => (
                    <p key={r.id} className="mt-2 border-l-2 border-primary/40 pl-3 text-sm">
                      <strong>{r.author_name}:</strong> {r.body}
                    </p>
                  ))}
                  {p && (
                    <div className="mt-3">
                      <CommentForm projectId={q.project_id} slug={p.slug} parentId={q.id} placeholder="Write your answer…" compact />
                    </div>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
