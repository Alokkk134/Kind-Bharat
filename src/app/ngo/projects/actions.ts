"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { zodErrors, type ActionState } from "@/lib/action-state";
import { requireNgo } from "@/lib/auth";
import { CATEGORY_VALUES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { friendlyError, randomSuffix, slugify } from "@/lib/utils";
import { dateString, getAll, ownedPath, requiredText, rupees, uuid, wholeNumber } from "@/lib/validation";

const projectSchema = z
  .object({
    id: uuid,
    title: requiredText(5, 120, "Title"),
    category: z.enum(CATEGORY_VALUES, { message: "Choose a cause" }),
    summary: requiredText(20, 300, "Short summary"),
    description: requiredText(50, 8000, "Full description"),
    beneficiaries_desc: requiredText(3, 300, "Who benefits"),
    beneficiaries_count: wholeNumber("Number of beneficiaries"),
    city: requiredText(2, 80, "City"),
    state: requiredText(2, 80, "State"),
    goal_amount: rupees("Goal amount", 100),
    start_date: dateString,
    deadline: dateString,
  })
  .refine((v) => v.deadline >= v.start_date, { message: "Deadline must be after the start date", path: ["deadline"] });

const budgetRow = z.object({
  item: z.string().trim().min(1, "Item name required").max(150),
  quantity: wholeNumber("Quantity", 1, 1_000_000),
  unit_cost: rupees("Unit cost", 1),
});

export async function saveProjectAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const ngo = await requireNgo();
  const parsed = projectSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return zodErrors(parsed.error);
  const p = parsed.data;

  // Budget rows come as parallel arrays
  const items = getAll(formData, "budget_item");
  const qtys = formData.getAll("budget_qty").map(String);
  const units = formData.getAll("budget_unit").map(String);
  const rows: { item: string; quantity: number; unit_cost: number }[] = [];
  for (let i = 0; i < Math.max(items.length, qtys.length, units.length); i++) {
    if (!items[i] && !qtys[i] && !units[i]) continue;
    const r = budgetRow.safeParse({ item: items[i] ?? "", quantity: qtys[i] ?? "", unit_cost: units[i] ?? "" });
    if (!r.success) return { error: `Budget line ${i + 1}: ${r.error.issues[0].message}`, fieldErrors: { budget: r.error.issues[0].message } };
    rows.push(r.data);
  }
  if (rows.length > 50) return { error: "Maximum 50 budget lines." };
  const total = rows.reduce((s, r) => s + r.quantity * r.unit_cost, 0);
  if (rows.length && total !== p.goal_amount) {
    return {
      error: "Budget lines must add up exactly to the goal amount.",
      fieldErrors: { goal_amount: "Must equal the budget total", budget: "Total doesn't match the goal" },
    };
  }

  const images = getAll(formData, "images");
  if (images.length > 8) return { error: "Maximum 8 photos." };
  if (images.some((img) => !ownedPath(ngo.id).safeParse(img).success)) return { error: "Invalid photo." };

  const supabase = await createClient();
  const { data: existing } = await supabase.from("projects").select("id, status, approved_at, slug").eq("id", p.id).maybeSingle();
  if (existing && existing.status !== "draft" && existing.status !== "rejected") {
    return { error: "This project can't be edited in its current status." };
  }

  const values = {
    title: p.title,
    category: p.category,
    summary: p.summary,
    description: p.description,
    beneficiaries_desc: p.beneficiaries_desc,
    beneficiaries_count: p.beneficiaries_count,
    city: p.city,
    state: p.state,
    goal_amount: p.goal_amount,
    start_date: p.start_date,
    deadline: p.deadline,
  };
  const slug = `${slugify(p.title) || "project"}-${randomSuffix(5)}`;

  const { error } = existing
    ? await supabase
        .from("projects")
        .update({ ...values, slug: existing.approved_at ? existing.slug : slug })
        .eq("id", p.id)
    : await supabase.from("projects").insert({ ...values, id: p.id, ngo_id: ngo.id, slug });
  if (error) return { error: friendlyError(error) };

  // Replace budget lines and photos
  const del1 = await supabase.from("project_budget_items").delete().eq("project_id", p.id);
  if (del1.error) return { error: friendlyError(del1.error) };
  if (rows.length) {
    const { error: bErr } = await supabase
      .from("project_budget_items")
      .insert(rows.map((r, i) => ({ ...r, project_id: p.id, sort_order: i })));
    if (bErr) return { error: friendlyError(bErr) };
  }
  const del2 = await supabase.from("project_images").delete().eq("project_id", p.id);
  if (del2.error) return { error: friendlyError(del2.error) };
  if (images.length) {
    const { error: iErr } = await supabase
      .from("project_images")
      .insert(images.map((file_path, i) => ({ project_id: p.id, file_path, sort_order: i })));
    if (iErr) return { error: friendlyError(iErr) };
  }

  revalidatePath("/ngo/projects");
  if (!existing) redirect(`/ngo/projects/${p.id}?saved=1`);
  revalidatePath(`/ngo/projects/${p.id}`);
  return { ok: true, message: "Draft saved." };
}

async function setStatus(formData: FormData, status: "under_review" | "draft"): Promise<ActionState> {
  await requireNgo();
  const id = uuid.safeParse(formData.get("id"));
  if (!id.success) return { error: "Invalid project." };
  const supabase = await createClient();
  const { error } = await supabase.from("projects").update({ status }).eq("id", id.data);
  if (error) return { error: friendlyError(error) };
  revalidatePath("/ngo/projects");
  revalidatePath(`/ngo/projects/${id.data}`);
  return {
    ok: true,
    message:
      status === "under_review"
        ? "Submitted for review! We usually approve within 1–2 working days."
        : "Withdrawn. You can edit the project again.",
  };
}

export async function submitProjectAction(_: ActionState, formData: FormData) {
  return setStatus(formData, "under_review");
}
export async function withdrawProjectAction(_: ActionState, formData: FormData) {
  return setStatus(formData, "draft");
}

export async function deleteProjectAction(formData: FormData) {
  const ngo = await requireNgo();
  const id = uuid.parse(formData.get("id"));
  const supabase = await createClient();
  const { data: imgs } = await supabase.from("project_images").select("file_path").eq("project_id", id);
  const { error } = await supabase.from("projects").delete().eq("id", id).eq("ngo_id", ngo.id);
  if (!error && imgs?.length) await supabase.storage.from("media").remove(imgs.map((i) => i.file_path));
  revalidatePath("/ngo/projects");
  redirect("/ngo/projects");
}
