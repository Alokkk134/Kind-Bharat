import type { Metadata } from "next";
import { ExternalLink, FileText, Lock, Trash2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Card, EmptyState, PageHeader } from "@/components/ui/card";
import { requireNgo } from "@/lib/auth";
import { docTypeLabel } from "@/lib/constants";
import { formatDateIST } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { deleteDocumentAction } from "../actions";
import { DocUploader } from "./doc-uploader";

export const metadata: Metadata = { title: "Documents", robots: { index: false } };

export default async function DocumentsPage() {
  const ngo = await requireNgo();
  const supabase = await createClient();
  const { data: docs } = await supabase
    .from("ngo_documents")
    .select("*")
    .eq("ngo_id", ngo.id)
    .order("uploaded_at", { ascending: false });

  const withUrls = await Promise.all(
    (docs ?? []).map(async (d) => {
      const { data } = await supabase.storage.from(d.bucket).createSignedUrl(d.file_path, 300);
      return { ...d, url: data?.signedUrl ?? null };
    }),
  );
  const canDelete = ["draft", "rejected", "pending"].includes(ngo.status);

  return (
    <>
      <PageHeader
        eyebrow="Verification"
        title="Documents"
        description={
          <span className="inline-flex items-center gap-1.5">
            <Lock className="h-4 w-4" /> Private. Only you and the KindBharat team can open these files.
          </span>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card>
          <h2 className="mb-4 font-serif text-lg font-semibold">Upload a document</h2>
          {(docs?.length ?? 0) >= 5 ? (
            <Alert kind="info">You have reached the limit of 5 documents. Delete one to upload another.</Alert>
          ) : (
            <DocUploader ngoId={ngo.id} />
          )}
        </Card>

        <div>
          <h2 className="mb-3 font-serif text-lg font-semibold">Uploaded ({docs?.length ?? 0}/5)</h2>
          {!withUrls.length ? (
            <EmptyState icon={<FileText className="h-7 w-7" />} title="No documents yet">
              Start with your registration certificate — it&apos;s required for verification.
            </EmptyState>
          ) : (
            <ul className="space-y-3">
              {withUrls.map((d) => (
                <li key={d.id}>
                  <Card className="flex items-center gap-3 !p-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                      <FileText className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{docTypeLabel(d.doc_type)}</p>
                      <p className="text-xs text-muted">
                        {d.bucket === "ngo-docs-pdf" ? "PDF" : "Image"} · {formatDateIST(d.uploaded_at)}
                      </p>
                    </div>
                    {d.url && (
                      <a href={d.url} target="_blank" rel="noopener noreferrer" className="rounded-xl p-2 text-primary hover:bg-primary-soft" aria-label="Open document">
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    )}
                    {canDelete && (
                      <form action={deleteDocumentAction}>
                        <input type="hidden" name="id" value={d.id} />
                        <button className="rounded-xl p-2 text-danger hover:bg-red-50" aria-label="Delete document">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </form>
                    )}
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
