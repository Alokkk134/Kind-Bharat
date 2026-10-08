"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { zodErrors, type ActionState } from "@/lib/action-state";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { friendlyError } from "@/lib/utils";
import { rupees, uuid } from "@/lib/validation";

const schema = z
  .object({
    project_id: uuid,
    slug: z.string().regex(/^[a-z0-9-]{3,120}$/),
    donor_name: z.string().trim().min(2, "Enter your name").max(100),
    donor_email: z
      .string()
      .trim()
      .toLowerCase()
      .optional()
      .transform((v) => (v ? v : null))
      .pipe(z.string().email("Enter a valid email").max(200).nullable()),
    donor_phone: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v ? v.replace(/[\s-]/g, "") : null))
      .pipe(z.string().regex(/^(\+91)?[0-9]{10,12}$/, "Enter a valid phone number").nullable()),
    amount: rupees("Amount", 1),
    utr: z
      .string()
      .trim()
      .toUpperCase()
      .transform((v) => v.replace(/\s/g, ""))
      .pipe(z.string().regex(/^[A-Z0-9]{6,40}$/, "UTR / transaction ID is 6–40 letters or numbers (usually 12 digits for UPI)")),
    message: z
      .string()
      .trim()
      .max(500, "Max 500 characters")
      .optional()
      .transform((v) => (v ? v : null)),
    is_anonymous: z.literal("on").optional().transform(Boolean),
  })
  .refine((v) => v.donor_email || v.donor_phone, {
    message: "Enter an email or a phone number so the NGO can contact you",
    path: ["donor_email"],
  });

const MAX_SCREENSHOT = 150 * 1024;
const IMAGE_TYPES = ["image/webp", "image/jpeg", "image/png"];

export async function submitDonationAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = schema.safeParse(Object.fromEntries([...formData.entries()].filter(([, v]) => typeof v === "string")));
  if (!parsed.success) return zodErrors(parsed.error);
  const d = parsed.data;

  const shot = formData.get("screenshot");
  const file = shot instanceof File && shot.size > 0 ? shot : null;
  if (file && (file.size > MAX_SCREENSHOT || !IMAGE_TYPES.includes(file.type))) {
    return { error: "Screenshot must be an image under 150 KB.", fieldErrors: { screenshot: "Image under 150 KB" } };
  }

  if (!process.env.SUPABASE_SECRET_KEY) {
    return { error: "Donations can't be recorded right now (server not configured). Please try again later." };
  }

  const h = await headers();
  const ip = (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "unknown").trim();
  const ip_hash = createHash("sha256")
    .update(`${ip}|${process.env.RATE_LIMIT_SALT ?? "kindbharat"}`)
    .digest("hex")
    .slice(0, 32);

  const session = await getSession();
  const admin = createAdminClient();

  let screenshot_path: string | null = null;
  if (file) {
    screenshot_path = `${d.project_id}/${crypto.randomUUID()}.${file.type === "image/png" ? "png" : file.type === "image/jpeg" ? "jpg" : "webp"}`;
    const { error: upErr } = await admin.storage.from("payment-screenshots").upload(screenshot_path, file, {
      contentType: file.type,
    });
    if (upErr) return { error: "Could not upload the screenshot. Try without it, or a smaller image." };
  }

  const { error } = await admin.from("donations").insert({
    project_id: d.project_id,
    donor_user_id: session?.userId ?? null,
    donor_name: d.donor_name,
    donor_email: d.donor_email,
    donor_phone: d.donor_phone,
    amount: d.amount,
    utr: d.utr,
    screenshot_path,
    message: d.message,
    is_anonymous: d.is_anonymous,
    ip_hash,
  });

  if (error) {
    if (screenshot_path) await admin.storage.from("payment-screenshots").remove([screenshot_path]);
    if (error.code === "23505") return { error: "This UTR / transaction ID was already submitted for this project.", fieldErrors: { utr: "Already submitted" } };
    return { error: friendlyError(error) };
  }

  revalidatePath(`/ngo/donations`);
  return {
    ok: true,
    message: session
      ? "Thank you! The NGO will confirm your donation after checking their account. Track it in “My donations”."
      : "Thank you! The NGO will confirm your donation after checking their account. Once confirmed, it appears on the project page.",
  };
}
