"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ActionState } from "@/lib/action-state";
import { requireRole } from "@/lib/auth";
import type { Ngo, Project } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";
import { friendlyError } from "@/lib/utils";
import { uuid } from "@/lib/validation";

const reason = z.string().trim().min(5, "Please give a short reason (5+ characters)").max(1000);
const note = z.string().trim().max(1000).optional().transform((v) => (v ? v : null));

async function admin() {
  await requireRole("admin");
  return createClient();
}

function done(paths: string[], message: string): ActionState {
  for (const p of paths) revalidatePath(p);
  revalidatePath("/admin", "layout");
  return { ok: true, message };
}

// ---------------- NGOs ----------------

export async function reviewNgoAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await admin();
  const parsed = z
    .object({
      id: uuid,
      decision: z.enum(["verify", "reject", "suspend", "unsuspend"]),
      reason: z.string().optional(),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid request." };
  const { id, decision } = parsed.data;

  let update: Partial<Ngo>;
  if (decision === "verify") {
    update = {
      status: "verified",
      has_12a: formData.get("has_12a") === "on",
      has_80g: formData.get("has_80g") === "on",
      has_fcra: formData.get("has_fcra") === "on",
      rejection_reason: null,
    };
  } else if (decision === "unsuspend") {
    update = { status: "verified", rejection_reason: null };
  } else {
    const r = reason.safeParse(parsed.data.reason ?? "");
    if (!r.success) return { error: r.error.issues[0].message, fieldErrors: { reason: r.error.issues[0].message } };
    update = { status: decision === "reject" ? "rejected" : "suspended", rejection_reason: r.data };
  }

  const { error } = await supabase.from("ngos").update(update).eq("id", id);
  if (error) return { error: friendlyError(error) };
  return done(["/admin/ngos", `/admin/ngos/${id}`, "/ngos", "/projects"], `NGO ${decision === "verify" ? "verified" : decision === "unsuspend" ? "restored" : decision === "reject" ? "rejected" : "suspended"}.`);
}

// ---------------- Payment details ----------------

export async function reviewPaymentAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await admin();
  const parsed = z
    .object({ id: uuid, decision: z.enum(["approve", "reject"]), note })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid request." };
  if (parsed.data.decision === "reject" && !parsed.data.note) {
    return { error: "Add a note so the NGO knows what to fix.", fieldErrors: { note: "Required when rejecting" } };
  }
  const { error } = await supabase
    .from("ngo_payment_details")
    .update({
      review_status: parsed.data.decision === "approve" ? "approved" : "rejected",
      review_note: parsed.data.note,
    })
    .eq("id", parsed.data.id);
  if (error) return { error: friendlyError(error) };
  return done(["/admin/payments"], parsed.data.decision === "approve" ? "Payment details approved." : "Payment details rejected.");
}

// ---------------- Projects ----------------

export async function reviewProjectAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await admin();
  const parsed = z
    .object({
      id: uuid,
      decision: z.enum(["approve", "reject", "pause", "resume", "remove"]),
      reason: z.string().optional(),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid request." };
  const { id, decision } = parsed.data;

  const { data: project } = await supabase.from("projects").select("status, funded_at, slug").eq("id", id).single();
  if (!project) return { error: "Project not found." };

  const allowed: Record<string, string[]> = {
    approve: ["under_review"],
    reject: ["under_review"],
    pause: ["active", "funded"],
    resume: ["paused"],
    remove: ["under_review", "active", "funded", "paused", "proof_submitted", "rejected"],
  };
  if (!allowed[decision].includes(project.status)) return { error: `Can't ${decision} a project that is ${project.status}.` };

  let update: Partial<Project>;
  if (decision === "approve") update = { status: "active", rejection_reason: null };
  else if (decision === "resume") update = { status: project.funded_at ? "funded" : "active" };
  else if (decision === "pause") update = { status: "paused" };
  else {
    const r = reason.safeParse(parsed.data.reason ?? "");
    if (!r.success) return { error: r.error.issues[0].message, fieldErrors: { reason: r.error.issues[0].message } };
    update = { status: decision === "reject" ? "rejected" : "removed", rejection_reason: r.data };
  }

  const { error } = await supabase.from("projects").update(update).eq("id", id);
  if (error) return { error: friendlyError(error) };
  return done(["/admin/projects", `/admin/projects/${id}`, "/projects", `/projects/${project.slug}`], "Project updated.");
}

// ---------------- Completion proofs ----------------

export async function reviewProofAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await admin();
  const parsed = z
    .object({ id: uuid, decision: z.enum(["approve", "reject"]), note })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid request." };
  if (parsed.data.decision === "reject" && !parsed.data.note) {
    return { error: "Add a note so the NGO knows what to fix.", fieldErrors: { note: "Required when rejecting" } };
  }
  const { error } = await supabase
    .from("completion_proofs")
    .update({ status: parsed.data.decision === "approve" ? "approved" : "rejected", admin_note: parsed.data.note })
    .eq("id", parsed.data.id);
  if (error) return { error: friendlyError(error) };
  return done(["/admin/proofs", "/projects", "/ngos"], parsed.data.decision === "approve" ? "Proof approved — project completed." : "Proof sent back to the NGO.");
}

// ---------------- Reports ----------------

export async function reviewReportAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await admin();
  const parsed = z
    .object({ id: uuid, status: z.enum(["open", "reviewed", "action_taken", "dismissed"]), note })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid request." };
  const { error } = await supabase
    .from("reports")
    .update({ status: parsed.data.status, admin_note: parsed.data.note })
    .eq("id", parsed.data.id);
  if (error) return { error: friendlyError(error) };
  return done(["/admin/reports"], "Report updated.");
}

// ---------------- Comments ----------------

export async function moderateCommentAction(formData: FormData) {
  const supabase = await admin();
  const parsed = z.object({ id: uuid, op: z.enum(["hide", "unhide", "delete"]) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  if (parsed.data.op === "delete") {
    await supabase.from("comments").delete().eq("id", parsed.data.id);
  } else {
    await supabase.from("comments").update({ is_hidden: parsed.data.op === "hide" }).eq("id", parsed.data.id);
  }
  revalidatePath("/admin/comments");
  revalidatePath("/projects", "layout");
}

// ---------------- Donations (oversight) ----------------

/**
 * Admin decision on any donation:
 * - "confirm": confirm a pending one, or overturn an NGO's rejection (counts toward the goal)
 * - "reject": reject a pending/confirmed one (e.g. fake UTR)
 * - "uphold": keep the NGO's rejection, mark as reviewed
 * A note is always required so there is an audit trail the NGO and donor can see.
 */
export async function reviewDonationAdminAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await admin();
  const parsed = z
    .object({ id: uuid, decision: z.enum(["confirm", "reject", "uphold"]), note: z.string().trim().max(500).optional() })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid request." };
  const { id, decision } = parsed.data;
  const note = parsed.data.note ?? "";
  if (note.length < 5) {
    return { error: "Add a short note explaining your decision (5+ characters).", fieldErrors: { note: "Required" } };
  }

  const { data: d } = await supabase.from("donations").select("status, project_id").eq("id", id).single();
  if (!d) return { error: "Donation not found." };

  const update: Partial<import("@/lib/database.types").Donation> = { admin_note: note, admin_reviewed_at: new Date().toISOString() };
  if (decision === "confirm") update.status = "confirmed";
  if (decision === "reject") {
    update.status = "rejected";
    update.rejection_reason = `Rejected by KindBharat: ${note}`.slice(0, 300);
  }
  if (decision === "uphold" && d.status !== "rejected") return { error: "Only rejected donations can be upheld." };

  const { error } = await supabase.from("donations").update(update).eq("id", id);
  if (error) return { error: friendlyError(error) };
  revalidatePath("/ngo", "layout");
  revalidatePath("/projects", "layout");
  revalidatePath("/dashboard");
  return done(
    ["/admin/donations"],
    decision === "confirm" ? "Donation confirmed by KindBharat — it now counts toward the goal." : decision === "reject" ? "Donation rejected." : "Rejection upheld and marked as reviewed.",
  );
}
