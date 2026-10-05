import { getPublicEnv } from "./env";

export type PublicBucket = "media" | "ngo-logos" | "upi-qr";
export type PrivateBucket = "ngo-docs-images" | "ngo-docs-pdf" | "payment-screenshots";

/** Public URL for a file in a public bucket. */
export function publicUrl(bucket: PublicBucket, path: string | null | undefined): string | null {
  if (!path) return null;
  const env = getPublicEnv();
  if (!env) return null;
  return `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}
