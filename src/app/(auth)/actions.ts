"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { zodErrors, type ActionState } from "@/lib/action-state";
import { dashboardPath } from "@/lib/auth";
import { siteUrl } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

/** Only allow redirects to paths on this site. */
function safeNext(next: unknown): string | null {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : null;
}

const email = z.string().trim().toLowerCase().email("Enter a valid email address").max(200);
const password = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(72, "Too long")
  .regex(/[A-Za-z]/, "Include at least one letter")
  .regex(/[0-9]/, "Include at least one number");

const signUpSchema = z.object({
  role: z.enum(["donor", "ngo"], { message: "Choose Donor or NGO" }),
  full_name: z.string().trim().min(2, "Enter your name").max(100),
  email,
  password,
  agree: z.literal("on", { message: "Please accept the Terms and Privacy Policy" }),
});

export async function signUpAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return zodErrors(parsed.error);
  const { role, full_name } = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { role, full_name },
      emailRedirectTo: `${siteUrl}/auth/callback?next=${role === "ngo" ? "/ngo" : "/dashboard"}`,
    },
  });
  if (error) {
    if (/already registered/i.test(error.message)) return { error: "An account with this email already exists. Try logging in." };
    if (/rate limit/i.test(error.message)) return { error: "Too many sign-ups right now. Please try again in a little while." };
    return { error: error.message };
  }
  // If email confirmation is turned off in Supabase, the user is signed in straight away.
  if (data.session) redirect(role === "ngo" ? "/ngo" : "/dashboard");
  return {
    ok: true,
    message: `Almost there! We've sent a confirmation link to ${parsed.data.email}. Open it on this device to activate your account.`,
  };
}

const signInSchema = z.object({ email, password: z.string().min(1, "Enter your password"), next: z.string().optional() });

export async function signInAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = signInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return zodErrors(parsed.error);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) {
    if (/not confirmed/i.test(error.message)) return { error: "Please confirm your email first. Check your inbox for the link." };
    return { error: "Wrong email or password." };
  }
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
  redirect(safeNext(parsed.data.next) ?? dashboardPath(profile?.role ?? "donor"));
}

export async function forgotPasswordAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = z.object({ email }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return zodErrors(parsed.error);
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
  });
  // Same answer whether or not the account exists (privacy).
  return { ok: true, message: "If an account exists for that email, a reset link is on its way." };
}

const resetSchema = z
  .object({ password, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { message: "Passwords don't match", path: ["confirm"] });

export async function resetPasswordAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = resetSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return zodErrors(parsed.error);
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: "Your reset link has expired. Please request a new one." };
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: error.message };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userData.user.id).single();
  redirect(`${dashboardPath(profile?.role ?? "donor")}?password=updated`);
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
