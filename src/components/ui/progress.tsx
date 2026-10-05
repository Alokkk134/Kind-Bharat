import { cn } from "@/lib/utils";

/** Animated progress bar: fills on load, with a shimmer while the project is still raising. */
export function Progress({
  value,
  className,
  done,
  label,
}: {
  value: number;
  className?: string;
  done?: boolean;
  label?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-label={label ?? "Funding progress"}
      className={cn("relative h-2.5 overflow-hidden rounded-full bg-primary-soft", className)}
    >
      <div
        className={cn(
          "kb-progress-fill relative h-full overflow-hidden rounded-full",
          done ? "bg-success" : "bg-gradient-to-r from-accent via-[#f0a53a] to-accent",
        )}
        style={{ width: `${pct}%` }}
      >
        {!done && pct > 0 && (
          <span className="absolute inset-y-0 left-0 w-1/3 animate-shimmer bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        )}
      </div>
    </div>
  );
}
