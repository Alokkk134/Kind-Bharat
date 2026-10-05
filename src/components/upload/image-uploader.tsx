"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { compressImage, type CompressPreset } from "@/lib/images";
import { publicUrl, type PublicBucket } from "@/lib/storage";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

/**
 * Picks images, compresses them in the browser to WebP, uploads to a public bucket
 * under `folder`, and keeps the resulting paths in hidden inputs named `name`.
 */
export function ImageUploader({
  bucket,
  folder,
  name,
  max,
  preset,
  initial = [],
  label,
  hint,
  error,
  round,
}: {
  bucket: PublicBucket;
  folder: string;
  name: string;
  max: number;
  preset: CompressPreset;
  initial?: string[];
  label: string;
  hint?: string;
  error?: string;
  round?: boolean;
}) {
  const [paths, setPaths] = useState<string[]>(initial);
  const [busy, setBusy] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onFiles(list: FileList | null) {
    if (!list?.length) return;
    setErr(null);
    const room = max - paths.length;
    const files = Array.from(list).slice(0, room);
    if (list.length > room) setErr(`You can add up to ${max} image${max === 1 ? "" : "s"}.`);
    const supabase = createClient();
    setBusy(files.length);
    for (const file of files) {
      try {
        const small = await compressImage(file, preset);
        const path = `${folder}/${crypto.randomUUID()}.webp`;
        const { error: upErr } = await supabase.storage
          .from(bucket)
          .upload(path, small, { contentType: "image/webp", upsert: false });
        if (upErr) throw new Error(upErr.message.includes("size") ? "File is too large." : upErr.message);
        setPaths((p) => (max === 1 ? [path] : [...p, path]));
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Upload failed. Please try again.");
      } finally {
        setBusy((b) => b - 1);
      }
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  const canAdd = paths.length < max || max === 1;

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold">{label}</p>
      <ul className="flex flex-wrap gap-3">
        {paths.map((p) => (
          <li
            key={p}
            className={cn(
              "group relative h-24 w-24 overflow-hidden border border-border bg-primary-soft shadow-sm animate-pop",
              round ? "rounded-full" : "rounded-2xl",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={publicUrl(bucket, p) ?? ""} alt="" className="h-full w-full object-cover" />
            <input type="hidden" name={name} value={p} />
            <button
              type="button"
              onClick={() => setPaths((all) => all.filter((x) => x !== p))}
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-90 hover:bg-black/80"
              aria-label="Remove image"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
        {Array.from({ length: Math.max(0, busy) }).map((_, i) => (
          <li
            key={`busy-${i}`}
            className={cn(
              "flex h-24 w-24 items-center justify-center border border-dashed border-primary/40 bg-primary-soft/60",
              round ? "rounded-full" : "rounded-2xl",
            )}
          >
            <Loader2 className="h-6 w-6 animate-spin text-primary" aria-label="Uploading" />
          </li>
        ))}
        {canAdd && busy === 0 && (
          <li>
            <label
              className={cn(
                "flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 border-2 border-dashed border-border bg-surface text-xs font-medium text-muted transition hover:-translate-y-0.5 hover:border-primary hover:text-primary",
                round ? "rounded-full" : "rounded-2xl",
              )}
            >
              <ImagePlus className="h-6 w-6" aria-hidden />
              {paths.length && max === 1 ? "Replace" : "Add"}
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple={max > 1}
                className="sr-only"
                onChange={(e) => onFiles(e.target.files)}
              />
            </label>
          </li>
        )}
      </ul>
      <p className="text-xs text-muted">
        {hint ?? `Up to ${max}. Photos are shrunk automatically on your phone before upload.`} ({paths.length}/{max})
      </p>
      {(err || error) && (
        <p role="alert" className="text-xs font-medium text-danger">
          {err ?? error}
        </p>
      )}
    </div>
  );
}
