"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { zodErrors, type ActionState } from "@/lib/action-state";
import { requireSession } from "@/lib/auth";
import { phoneSchema } from "@/lib/validation";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  full_name: z.string().trim().min(2, "Enter your name").max(100),
  phone: phoneSchema.optional().or(z.literal("")),
});

export async function updateProfileAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireSession();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return zodErrors(parsed.error);
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.full_name, phone: parsed.data.phone || null })
    .eq("id", session.userId);
  if (error) return { error: "Could not save. Please try again." };
  revalidatePath("/", "layout");
  return { ok: true, message: "Profile saved." };
}
