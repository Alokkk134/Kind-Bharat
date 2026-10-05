"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { zodErrors, type ActionState } from "@/lib/action-state";
import { getSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { friendlyError } from "@/lib/utils";
import { uuid } from "@/lib/validation";

const commentSchema = z.object({
  project_id: uuid,
  parent_id: uuid.optional().or(z.literal("")).transform((v) => (v ? v : null)),
  slug: z.string().regex(/^[a-z0-9-]{3,120}$/),
  // Plain text only: React escapes it when rendering, and we strip control characters here.
  body: z
    .string()
    .transform((v) => v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim())
    .pipe(z.string().min(2, "Write at least 2 characters").max(1000, "Max 1000 characters")),
});

export async function postCommentAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { error: "Please log in to comment." };
  const parsed = commentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return zodErrors(parsed.error);
  const supabase = await createClient();
  const { error } = await supabase.from("comments").insert({
    project_id: parsed.data.project_id,
    parent_id: parsed.data.parent_id,
    body: parsed.data.body,
    user_id: session.userId,
  });
  if (error) return { error: friendlyError(error) };
  revalidatePath(`/projects/${parsed.data.slug}`);
  revalidatePath("/ngo/comments");
  return { ok: true, message: parsed.data.parent_id ? "Reply posted." : "Posted! The NGO will be able to reply." };
}

const reportSchema = z.object({
  target_type: z.enum(["project", "ngo"]),
  target_id: uuid,
  reason: z.enum(["fake_scam", "wrong_info", "misuse_of_funds", "inappropriate", "other"], { message: "Choose a reason" }),
  description: z.string().trim().min(10, "Please describe the problem (10+ characters)").max(2000),
});

export async function reportAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { error: "Please log in to report." };
  const parsed = reportSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return zodErrors(parsed.error);
  const supabase = await createClient();
  const { error } = await supabase.from("reports").insert({ ...parsed.data, reporter_id: session.userId });
  if (error) {
    if (error.code === "23505") return { error: "You have already reported this. Our team is looking into it." };
    return { error: friendlyError(error) };
  }
  revalidatePath("/admin/reports");
  return { ok: true, message: "Thank you. Our team will review this report. We may contact you by email." };
}
