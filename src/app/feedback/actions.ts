"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { zodErrors, type ActionState } from "@/lib/action-state";
import { createClient } from "@/lib/supabase/server";
import { friendlyError } from "@/lib/utils";

const schema = z.object({
  kind: z.enum(["feature", "bug", "other"], { message: "Choose what this is about" }),
  message: z
    .string()
    .transform((v) => v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim())
    .pipe(z.string().min(10, "Please write at least 10 characters").max(2000, "Max 2000 characters")),
  name: z.string().trim().max(100).optional().transform((v) => (v ? v : null)),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .optional()
    .transform((v) => (v ? v : null))
    .pipe(z.string().email("Enter a valid email, or leave it empty").nullable()),
  page: z.string().trim().max(200).optional().transform((v) => (v ? v : null)),
  // Hidden "trap" field: real people never fill it, simple bots do.
  website: z.string().optional(),
});

export async function sendFeedbackAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return zodErrors(parsed.error);
  const { website, ...values } = parsed.data;
  if (website) return { ok: true, message: "Thank you! Your feedback has been sent." }; // silently drop bots

  const supabase = await createClient();
  const { error } = await supabase.from("feedback").insert(values);
  if (error) return { error: friendlyError(error) };
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Thank you! Your feedback has been sent to the KindBharat team." };
}
