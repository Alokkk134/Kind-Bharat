import { cn } from "@/lib/utils";

/** Slowly rotating rangoli-style mandala (pure SVG). Decorative only. */
export function Rangoli({ className }: { className?: string }) {
  const petals = Array.from({ length: 16 });
  const dots = Array.from({ length: 32 });
  return (
    <svg viewBox="-100 -100 200 200" aria-hidden className={cn("animate-spin-slow", className)}>
      <defs>
        <linearGradient id="rg-petal" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--kb-accent)" />
          <stop offset="1" stopColor="var(--kb-rose)" />
        </linearGradient>
      </defs>
      <circle r="96" fill="none" stroke="var(--kb-primary)" strokeOpacity=".18" strokeDasharray="2 5" />
      <circle r="78" fill="none" stroke="var(--kb-accent)" strokeOpacity=".35" />
      {petals.map((_, i) => (
        <path
          key={`p${i}`}
          d="M0-74 C 10-56 10-40 0-28 C -10-40 -10-56 0-74Z"
          fill="url(#rg-petal)"
          fillOpacity={i % 2 ? 0.55 : 0.8}
          transform={`rotate(${(360 / petals.length) * i})`}
        />
      ))}
      {petals.map((_, i) => (
        <path
          key={`l${i}`}
          d="M0-26 C 7-18 7-10 0-4 C -7-10 -7-18 0-26Z"
          fill="var(--kb-primary)"
          fillOpacity=".75"
          transform={`rotate(${(360 / petals.length) * i + 11.25})`}
        />
      ))}
      {dots.map((_, i) => (
        <circle
          key={`d${i}`}
          cx="0"
          cy="-88"
          r={i % 2 ? 1.6 : 2.6}
          fill={i % 2 ? "var(--kb-primary)" : "var(--kb-accent)"}
          transform={`rotate(${(360 / dots.length) * i})`}
        />
      ))}
      <circle r="6" fill="var(--kb-accent)" />
      <circle r="2.5" fill="#fff" />
    </svg>
  );
}

/** Marigold petals drifting down. Deterministic positions (no hydration mismatch). */
export function Petals({ count = 14 }: { count?: number }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => {
        const left = (i * 37) % 100;
        const dur = 11 + ((i * 7) % 9);
        const delay = -((i * 5) % 17);
        const size = 8 + ((i * 3) % 9);
        const drift = ((i % 2 ? 1 : -1) * (30 + ((i * 13) % 60))).toString() + "px";
        return (
          <span
            key={i}
            className="absolute top-0 block rounded-[60%_0_60%_0]"
            style={
              {
                left: `${left}%`,
                width: size,
                height: size * 1.4,
                background: i % 3 === 0 ? "var(--kb-rose)" : "var(--kb-accent)",
                opacity: 0.7,
                animation: `petal ${dur}s linear ${delay}s infinite`,
                "--drift": drift,
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}

/** Soft animated colour blobs for section backgrounds. */
export function Aurora({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div className="absolute -left-24 -top-24 h-[28rem] w-[28rem] animate-aurora rounded-full bg-primary/20 blur-3xl" />
      <div
        className="absolute -right-20 top-10 h-[24rem] w-[24rem] animate-aurora rounded-full bg-accent/25 blur-3xl"
        style={{ animationDelay: "-6s" }}
      />
      <div
        className="absolute bottom-[-8rem] left-1/3 h-[22rem] w-[22rem] animate-aurora rounded-full bg-rose/15 blur-3xl"
        style={{ animationDelay: "-12s" }}
      />
    </div>
  );
}

/** Infinite horizontal marquee (content is duplicated for a seamless loop). */
export function Marquee({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("group relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]", className)}>
      <div className="flex w-max animate-marquee gap-4 group-hover:[animation-play-state:paused]">
        <div className="flex gap-4">{children}</div>
        <div className="flex gap-4" aria-hidden>{children}</div>
      </div>
    </div>
  );
}
