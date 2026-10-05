import Link from "next/link";
import { BadgeCheck, MessagesSquare } from "lucide-react";
import type { PublicComment } from "@/lib/database.types";
import { timeAgo } from "@/lib/format";
import { CommentForm } from "./comment-form";

export function Comments({
  projectId,
  slug,
  comments,
  signedIn,
  isOwnerNgo,
  canComment,
}: {
  projectId: string;
  slug: string;
  comments: PublicComment[];
  signedIn: boolean;
  isOwnerNgo: boolean;
  canComment: boolean;
}) {
  const top = comments.filter((c) => !c.parent_id);
  const replies = new Map<string, PublicComment[]>();
  for (const c of comments) {
    if (c.parent_id) replies.set(c.parent_id, [...(replies.get(c.parent_id) ?? []), c]);
  }

  return (
    <section aria-labelledby="qa" className="space-y-5">
      <h2 id="qa" className="flex items-center gap-2 font-serif text-2xl font-semibold">
        <MessagesSquare className="h-6 w-6 text-primary" /> Questions & answers
        <span className="text-base font-normal text-muted">({top.length})</span>
      </h2>

      {canComment &&
        (signedIn ? (
          !isOwnerNgo && <CommentForm projectId={projectId} slug={slug} />
        ) : (
          <p className="rounded-2xl bg-primary-soft p-4 text-sm">
            <Link href={`/login?next=/projects/${slug}`} className="font-semibold text-primary underline">Log in</Link> or{" "}
            <Link href="/signup" className="font-semibold text-primary underline">sign up</Link> to ask the NGO a question.
          </p>
        ))}

      {!top.length ? (
        <p className="text-sm text-muted">No questions yet. Curious about something? Ask!</p>
      ) : (
        <ul className="space-y-4">
          {top.map((c) => (
            <li key={c.id} className="rounded-3xl border border-border bg-surface p-4">
              <p className="text-sm">
                <span className="font-semibold">{c.author_name}</span>{" "}
                <span className="text-muted">· {timeAgo(c.created_at)}</span>
              </p>
              <p className="mt-1 whitespace-pre-line break-words">{c.body}</p>
              {(replies.get(c.id) ?? []).map((r) => (
                <div key={r.id} className="mt-3 ml-3 border-l-2 border-primary/40 pl-4">
                  <p className="text-sm">
                    <span className="font-semibold">{r.author_name}</span>{" "}
                    {r.is_ngo_reply && (
                      <span className="ml-1 inline-flex items-center gap-0.5 rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-white">
                        <BadgeCheck className="h-3 w-3" /> NGO
                      </span>
                    )}{" "}
                    <span className="text-muted">· {timeAgo(r.created_at)}</span>
                  </p>
                  <p className="mt-1 whitespace-pre-line break-words">{r.body}</p>
                </div>
              ))}
              {isOwnerNgo && canComment && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-semibold text-primary">Reply</summary>
                  <div className="mt-2">
                    <CommentForm projectId={projectId} slug={slug} parentId={c.id} placeholder="Write your answer…" compact />
                  </div>
                </details>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
