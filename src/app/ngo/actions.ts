"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { zodErrors, type ActionState } from "@/lib/action-state";
import { getMyNgo, requireNgo, requireRole } from "@/lib/auth";
import { CATEGORY_VALUES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { friendlyError, randomSuffix, slugify } from "@/lib/utils";
import {
  dateString,
  getAll,
  optionalText,
  ownedPath,
  phoneSchema,
  requiredText,
  uuid,
  wholeNumber,
} from "@/lib/validation";


// ---------------- Organisation profile ----------------

const thisYear = new Date().getFullYear();

const profileSchema = z.object({
  name: requiredText(3, 150, "Organisation name"),
  type: z.enum(["trust", "society", "section8", "other"], { message: "Choose a type" }),
  year_founded: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? Number(v) : null))
    .pipe(z.number().int().min(1800, "Enter a valid year").max(thisYear, "Enter a valid year").nullable()),
  registration_number: requiredText(2, 80, "Registration number"),
  darpan_id: optionalText(40),
  pan: z
    .string()
    .trim()
    .toUpperCase()
    .optional()
    .transform((v) => (v ? v : null))
    .pipe(z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, "PAN looks like ABCDE1234F").nullable()),
  address: optionalText(300),
  city: requiredText(2, 80, "City"),
  state: requiredText(2, 80, "State"),
  contact_person: requiredText(2, 100, "Contact person"),
  contact_phone: phoneSchema,
  contact_email: z
    .string()
    .trim()
    .toLowerCase()
    .optional()
    .transform((v) => (v ? v : null))
    .pipe(z.string().email("Enter a valid email").nullable()),
  website: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? (/^https?:\/\//i.test(v) ? v : `https://${v}`) : null))
    .pipe(z.string().url("Enter a valid website").max(300).nullable()),
  social_links: optionalText(600),
  about: requiredText(50, 4000, "About"),
});

export async function saveNgoProfileAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireRole("ngo");
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return zodErrors(parsed.error);

  const focus = getAll(formData, "focus_areas");
  const focusParsed = z.array(z.enum(CATEGORY_VALUES)).min(1, "Pick at least one focus area").safeParse(focus);
  if (!focusParsed.success) return { error: "Please fix the highlighted fields.", fieldErrors: { focus_areas: "Pick at least one focus area" } };

  const supabase = await createClient();
  const existing = await getMyNgo();

  let logo_path: string | null = existing?.logo_path ?? null;
  const logoField = formData.get("logo_path");
  if (existing) {
    const logo = typeof logoField === "string" && logoField ? logoField : null;
    if (logo && !ownedPath(existing.id).safeParse(logo).success) return { error: "Invalid logo file." };
    logo_path = logo;
  }

  const values = { ...parsed.data, focus_areas: focusParsed.data, logo_path };

  if (existing) {
    const { error } = await supabase.from("ngos").update(values).eq("id", existing.id);
    if (error) return { error: friendlyError(error) };
  } else {
    const { error } = await supabase.from("ngos").insert({
      ...values,
      logo_path: null,
      owner_id: session.userId,
      slug: `${slugify(parsed.data.name) || "ngo"}-${randomSuffix(4)}`,
    });
    if (error) return { error: friendlyError(error) };
  }
  revalidatePath("/ngo", "layout");
  return {
    ok: true,
    message: existing
      ? "Profile saved."
      : "Profile created! Next: add your logo below, then upload your registration certificate.",
  };
}

export async function submitForVerificationAction(): Promise<ActionState> {
  const ngo = await requireNgo();
  const supabase = await createClient();
  const { error } = await supabase.from("ngos").update({ status: "pending" }).eq("id", ngo.id);
  if (error) return { error: friendlyError(error) };
  revalidatePath("/ngo", "layout");
  return { ok: true, message: "Submitted! Our team will review your documents, usually within 2–3 working days." };
}

// ---------------- Documents (private) ----------------

const docSchema = z.object({
  doc_type: z.enum(["registration", "pan", "12a", "80g", "fcra", "darpan", "other"]),
  bucket: z.enum(["ngo-docs-images", "ngo-docs-pdf"]),
  path: z.string(),
});

export async function addDocumentAction(input: { doc_type: string; bucket: string; path: string }): Promise<ActionState> {
  const ngo = await requireNgo();
  const parsed = docSchema.safeParse(input);
  if (!parsed.success || !ownedPath(ngo.id).safeParse(parsed.data.path).success) return { error: "Invalid document." };
  const supabase = await createClient();
  const { error } = await supabase.from("ngo_documents").insert({
    ngo_id: ngo.id,
    doc_type: parsed.data.doc_type,
    bucket: parsed.data.bucket,
    file_path: parsed.data.path,
  });
  if (error) {
    await supabase.storage.from(parsed.data.bucket).remove([parsed.data.path]);
    return { error: friendlyError(error) };
  }
  revalidatePath("/ngo", "layout");
  return { ok: true, message: "Document uploaded." };
}

export async function deleteDocumentAction(formData: FormData) {
  const ngo = await requireNgo();
  const id = uuid.parse(formData.get("id"));
  const supabase = await createClient();
  const { data: doc } = await supabase.from("ngo_documents").select("*").eq("id", id).eq("ngo_id", ngo.id).single();
  if (!doc) return;
  const { error } = await supabase.from("ngo_documents").delete().eq("id", id);
  if (!error) await supabase.storage.from(doc.bucket).remove([doc.file_path]);
  revalidatePath("/ngo", "layout");
}

// ---------------- Payment details ----------------

const paymentSchema = z
  .object({
    upi_id: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v ? v : null))
      .pipe(z.string().regex(/^[a-zA-Z0-9._-]{2,200}@[a-zA-Z]{2,64}$/, "UPI ID looks like name@bank").nullable()),
    bank_account_name: optionalText(150),
    account_number: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v ? v.replace(/\s/g, "") : null))
      .pipe(z.string().regex(/^[0-9]{6,20}$/, "Account number should be 6–20 digits").nullable()),
    account_number_confirm: z.string().optional().transform((v) => (v ? v.replace(/\s/g, "") : null)),
    ifsc: z
      .string()
      .trim()
      .toUpperCase()
      .optional()
      .transform((v) => (v ? v : null))
      .pipe(z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "IFSC looks like SBIN0001234").nullable()),
    bank_name: optionalText(100),
    qr_path: z.string().optional().transform((v) => (v ? v : null)),
  })
  .superRefine((v, ctx) => {
    const bankFields = [v.bank_account_name, v.account_number, v.ifsc, v.bank_name];
    const anyBank = bankFields.some(Boolean);
    if (anyBank && !bankFields.every(Boolean)) {
      ctx.addIssue({ code: "custom", path: ["bank_account_name"], message: "Fill all bank fields, or leave all empty" });
    }
    if (v.account_number && v.account_number !== v.account_number_confirm) {
      ctx.addIssue({ code: "custom", path: ["account_number_confirm"], message: "Account numbers don't match" });
    }
    if (!v.upi_id && !anyBank) {
      ctx.addIssue({ code: "custom", path: ["upi_id"], message: "Add a UPI ID or bank account" });
    }
  });

export async function savePaymentAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const ngo = await requireNgo();
  const parsed = paymentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return zodErrors(parsed.error);
  const { account_number_confirm: _confirm, ...values } = parsed.data;
  void _confirm;
  if (values.qr_path && !ownedPath(ngo.id).safeParse(values.qr_path).success) return { error: "Invalid QR image." };

  const supabase = await createClient();
  const { data: existing } = await supabase.from("ngo_payment_details").select("*").eq("ngo_id", ngo.id).maybeSingle();
  const unchanged =
    existing &&
    existing.upi_id === values.upi_id &&
    existing.qr_path === values.qr_path &&
    existing.bank_account_name === values.bank_account_name &&
    existing.account_number === values.account_number &&
    existing.ifsc === values.ifsc &&
    existing.bank_name === values.bank_name;
  if (unchanged) return { ok: true, message: "No changes to save." };

  const { error } = existing
    ? await supabase.from("ngo_payment_details").update(values).eq("id", existing.id)
    : await supabase.from("ngo_payment_details").insert({ ...values, ngo_id: ngo.id });
  if (error) return { error: friendlyError(error) };
  revalidatePath("/ngo", "layout");
  return {
    ok: true,
    message:
      "Saved. For your donors' safety, payment details are hidden from your projects until our team re-checks them (usually within 1 working day).",
  };
}

// ---------------- Past projects ----------------

const pastSchema = z.object({
  title: requiredText(3, 120, "Title"),
  date: dateString.optional().or(z.literal("")).transform((v) => (v ? v : null)),
  description: requiredText(20, 3000, "Description"),
  beneficiaries: z
    .string()
    .optional()
    .transform((v) => (v ? v : undefined))
    .pipe(wholeNumber("Beneficiaries").optional())
    .transform((v) => v ?? null),
});

export async function addPastProjectAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const ngo = await requireNgo();
  const parsed = pastSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return zodErrors(parsed.error);
  const images = getAll(formData, "images");
  if (images.length > 5 || images.some((p) => !ownedPath(ngo.id).safeParse(p).success)) {
    return { error: "Invalid photos (max 5)." };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("past_projects").insert({ ...parsed.data, images, ngo_id: ngo.id });
  if (error) return { error: friendlyError(error) };
  revalidatePath("/ngo/past-projects");
  return { ok: true, message: "Past project added." };
}

export async function deletePastProjectAction(formData: FormData) {
  const ngo = await requireNgo();
  const id = uuid.parse(formData.get("id"));
  const supabase = await createClient();
  const { data } = await supabase.from("past_projects").delete().eq("id", id).eq("ngo_id", ngo.id).select("images").single();
  if (data?.images.length) await supabase.storage.from("media").remove(data.images);
  revalidatePath("/ngo/past-projects");
}
