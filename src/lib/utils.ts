/** Join class names, skipping falsy values. */
export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

/** "Stationery Kits for 100 Students!" → "stationery-kits-for-100-students" */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

export function randomSuffix(len = 5): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let s = "";
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  for (const b of bytes) s += chars[b % chars.length];
  return s;
}

/** Turn a Postgres/Supabase error into a friendly message (our triggers prefix codes like "BUDGET:"). */
export function friendlyError(err: { message?: string; code?: string } | null | undefined): string {
  if (!err) return "Something went wrong. Please try again.";
  const msg = err.message ?? "";
  const coded = msg.match(/^[A-Z_]+: (.+)$/);
  if (coded) return coded[1];
  if (err.code === "23505") return "This already exists (duplicate).";
  if (err.code === "23514") return "Some values are not valid. Please check the form.";
  if (err.code === "42501" || /row-level security/i.test(msg)) return "You don't have permission to do that.";
  if (/payload too large|exceeded the maximum allowed size/i.test(msg)) return "File is too large.";
  if (/mime type/i.test(msg)) return "This file type is not allowed.";
  return msg && msg.length < 160 ? msg : "Something went wrong. Please try again.";
}
