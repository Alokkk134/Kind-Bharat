import type { Tone } from "@/lib/constants";
import { cn } from "@/lib/utils";

const tones: Record<Tone, string> = {
  neutral: "bg-stone-100 text-stone-700 ring-stone-200",
  info: "bg-sky-50 text-info ring-sky-200",
  success: "bg-emerald-50 text-success ring-emerald-200",
  warning: "bg-amber-50 text-warning ring-amber-200",
  danger: "bg-red-50 text-danger ring-red-200",
  accent: "bg-accent-soft text-accent-ink ring-orange-200",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: { label: string; tone: Tone } }) {
  return <Badge tone={status.tone}>{status.label}</Badge>;
}
