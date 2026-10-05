"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileUp, Loader2 } from "lucide-react";
import { DOC_TYPES } from "@/lib/constants";
import { compressImage, IMAGE_TYPES, PRESETS } from "@/lib/images";
import { createClient } from "@/lib/supabase/client";
import { Alert } from "@/components/ui/alert";
import { Select } from "@/components/ui/field";
import { addDocumentAction } from "../actions";

const MAX_PDF = 1024 * 1024;

export function DocUploader({ ngoId }: { ngoId: string }) {
  const router = useRouter();
  const [docType, setDocType] = useState("registration");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setDone(null);
    setBusy(true);
    try {
      let upload: File;
      let bucket: "ngo-docs-images" | "ngo-docs-pdf";
      let ext: string;
      if (file.type === "application/pdf") {
        if (file.size > MAX_PDF) throw new Error("PDF max 1 MB, or upload a clear photo instead.");
        upload = file;
        bucket = "ngo-docs-pdf";
        ext = "pdf";
      } else if (IMAGE_TYPES.includes(file.type)) {
        upload = await compressImage(file, PRESETS.certificate);
        bucket = "ngo-docs-images";
        ext = "webp";
      } else {
        throw new Error("Please upload a JPG, PNG, WebP image or a PDF.");
      }
      const path = `${ngoId}/${crypto.randomUUID()}.${ext}`;
      const supabase = createClient();
      const { error: upErr } = await supabase.storage.from(bucket).upload(path, upload, { contentType: upload.type });
      if (upErr) throw new Error(upErr.message);
      const res = await addDocumentAction({ doc_type: docType, bucket, path });
      if (res.error) throw new Error(res.error);
      setDone("Uploaded! ✓");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-4">
      <Select label="Document type" name="doc_type" options={DOC_TYPES} value={docType} onChange={(e) => setDocType(e.target.value)} />
      <label className="group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-border bg-bg px-4 py-10 text-center transition hover:border-primary hover:bg-primary-soft/50">
        {busy ? (
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        ) : (
          <FileUp className="h-8 w-8 text-primary transition group-hover:-translate-y-1" />
        )}
        <span className="font-semibold">{busy ? "Uploading…" : "Choose a photo or PDF"}</span>
        <span className="text-xs text-muted">
          Photos are compressed automatically but stay readable. PDF max 1 MB, or upload a clear photo instead.
        </span>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="sr-only"
          disabled={busy}
          onChange={(e) => onFile(e.target.files?.[0])}
        />
      </label>
      {error && <Alert kind="error">{error}</Alert>}
      {done && <Alert kind="success">{done}</Alert>}
    </div>
  );
}
