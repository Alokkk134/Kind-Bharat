import { z } from "zod";

/** Indian mobile/landline, digits with optional +91 / spaces / dashes. */
export const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ""))
  .pipe(z.string().regex(/^(\+91)?[0-9]{10,12}$/, "Enter a valid phone number"));

/** Optional text: "" → null */
export const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Max ${max} characters`)
    .optional()
    .transform((v) => (v ? v : null));

export const requiredText = (min: number, max: number, label = "This field") =>
  z
    .string()
    .trim()
    .min(min, min <= 1 ? `${label} is required` : `${label} needs at least ${min} characters`)
    .max(max, `Max ${max} characters`);

/** Positive whole rupees from a form field ("1,25,000" allowed). */
export const rupees = (label = "Amount", min = 1, max = 100_000_000) =>
  z
    .string()
    .trim()
    .transform((v) => v.replace(/[,₹\s]/g, ""))
    .pipe(
      z
        .string()
        .regex(/^\d+$/, `${label} must be a whole number of rupees`)
        .transform(Number)
        .pipe(z.number().int().min(min, `${label} must be at least ₹${min}`).max(max, `${label} is too large`)),
    );

export const wholeNumber = (label: string, min = 1, max = 10_000_000) =>
  z
    .string()
    .trim()
    .transform((v) => v.replace(/[,\s]/g, ""))
    .pipe(
      z
        .string()
        .regex(/^\d+$/, `${label} must be a number`)
        .transform(Number)
        .pipe(z.number().int().min(min, `${label} must be at least ${min}`).max(max, `${label} is too large`)),
    );

export const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date");

/** Any 8-4-4-4-12 hex id (Postgres accepts all of these; zod's uuid() is stricter). */
export const uuid = z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, "Invalid id");

/** Storage path inside a given NGO folder, e.g. "<ngo>/projects/<uuid>.webp". */
export const ownedPath = (ngoId: string) =>
  z
    .string()
    .regex(/^[0-9a-f-]{36}\/[A-Za-z0-9/_.-]{1,200}$/, "Invalid file")
    .refine((p) => p.startsWith(`${ngoId}/`) && !p.includes(".."), "Invalid file");

/** Collect repeated form fields (e.g. many hidden inputs named "images"). */
export function getAll(formData: FormData, key: string): string[] {
  return formData.getAll(key).filter((v): v is string => typeof v === "string" && v.length > 0);
}
