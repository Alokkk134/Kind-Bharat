import { Info } from "lucide-react";

/** Banner for sample/demo NGOs and projects. */
export function SampleNotice({ what }: { what: "project" | "NGO" }) {
  return (
    <div role="note" className="mb-6 flex items-start gap-3 rounded-3xl border-2 border-dashed border-accent/60 bg-accent-soft p-4 text-sm text-accent-ink">
      <Info className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
      <p>
        <strong>Sample {what} — for reference only.</strong> This is demo data to show how KindBharat works. It is not
        real, has no payment details, and does not accept donations.
      </p>
    </div>
  );
}
