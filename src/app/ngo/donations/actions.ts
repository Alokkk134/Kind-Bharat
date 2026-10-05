"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ActionState } from "@/lib/action-state";
import { requireNgo } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { friendlyError } from "@/lib/utils";
import { uuid } from "@/lib/validation";

const schema = z.object({
  id: uuid,
  decision: z.enum(["confirm", "reject"]),
  reason: z.string().trim().max(300).optional(),
});

export async function reviewDonationAction(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireNgo();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid request." };
  const { id, decision, reason } = parsed.data;
  if (decision === "reject" && (!reason || reason.length < 3)) {
    return { error: "Add a short reason, e.g. “Payment not received”.", fieldErrors: { reason: "Required" } };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("donations")
    .update(decision === "confirm" ? { status: "confirmed" } : { status: "rejected", rejection_reason: reason })
    .eq("id", id);
  if (error) return { error: friendlyError(error) };
  revalidatePath("/ngo", "layout");
  revalidatePath("/projects", "layout");
  return { ok: true, message: decision === "confirm" ? "Confirmed ✓ It now counts toward the goal." : "Marked as not received." };
}
