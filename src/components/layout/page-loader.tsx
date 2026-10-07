import { LogoMark } from "./logo";

/** Branded buffering screen shown while the next page loads (used by loading.tsx files). */
export function PageLoader({ label = "Loading", compact }: { label?: string; compact?: boolean }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-5 ${compact ? "min-h-[45vh]" : "min-h-[65vh]"}`}
    >
      <div className="relative h-20 w-20">
        {/* spinning rings */}
        <span className="absolute inset-0 animate-spin rounded-full border-[3px] border-primary-soft border-t-primary [animation-duration:900ms]" />
        <span className="absolute inset-2 animate-spin rounded-full border-[3px] border-transparent border-b-accent [animation-direction:reverse] [animation-duration:1300ms]" />
        {/* breathing logo */}
        <span className="absolute inset-0 flex items-center justify-center">
          <LogoMark className="h-9 w-9 animate-[kb-breathe_1.4s_ease-in-out_infinite]" />
        </span>
      </div>
      <p className="flex items-center gap-1 text-sm font-medium text-muted">
        {label}
        <span className="inline-flex gap-0.5" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1 w-1 rounded-full bg-accent animate-[kb-dot_1s_ease-in-out_infinite]"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </span>
      </p>
    </div>
  );
}
