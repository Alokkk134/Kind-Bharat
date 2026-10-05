"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { zodErrors, type ActionState } from "@/lib/action-state";
import { requireNgo } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { friendlyError } from "@/lib/utils";
import { getAll, ownedPath, requiredText, uuid, wholeNumber } from "@/lib/validation";

const schema = z.object({
  project_id: uuid,
  description: requiredText(30, 5000, "Description"),
  beneficiaries_reached: wholeNumber("People reached"),
});

export async function submitProofAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const ngo = await requireNgo();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return zodErrors(parsed.error);
  const files = getAll(formData, "files");
  if (!files.length) return { error: "Add at least one photo or bill.", fieldErrors: { files: "Required" } };
  if (files.length > 10 || files.some((f) => !ownedPath(ngo.id).safeParse(f).success)) return { error: "Invalid files (max 10)." };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("completion_proofs")
    .select("id, status")
    .eq("project_id", parsed.data.project_id)
    .maybeSingle();

  const values = { description: parsed.data.description, beneficiaries_reached: parsed.data.beneficiaries_reached, files };
  const { error } = existing
    ? await supabase.from("completion_proofs").update(values).eq("id", existing.id)
    : await supabase.from("completion_proofs").insert({ ...values, project_id: parsed.data.project_id });
  if (error) return { error: friendlyError(error) };

  revalidatePath("/ngo", "layout");
  return { ok: true, message: "Proof submitted! Our team will review it. Once approved, your project shows “Completed with proof”." };
}
