import Link from "next/link";

/** Logo: a small 3D-flipping lotus-heart mark + "Kind" (teal) "Bharat" (marigold). */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" aria-label="KindBharat home" className={`group inline-flex items-center gap-2 ${className}`}>
      <span className="perspective inline-block h-8 w-8">
        <span className="preserve-3d relative block h-full w-full transition-transform duration-700 group-hover:[transform:rotateY(180deg)]">
          <LogoMark className="backface-hidden absolute inset-0 h-8 w-8" />
          <LogoMark className="backface-hidden absolute inset-0 h-8 w-8 [transform:rotateY(180deg)]" alt />
        </span>
      </span>
      <span className="font-serif text-2xl font-semibold tracking-tight">
        <span className="text-primary">Kind</span>
        <span className="text-accent-ink">Bharat</span>
      </span>
    </Link>
  );
}

export function LogoMark({ className, alt }: { className?: string; alt?: boolean }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={className}>
      <rect width="32" height="32" rx="10" fill={alt ? "var(--kb-accent)" : "var(--kb-primary)"} />
      {/* lotus petals forming a heart-like bloom */}
      <path d="M16 24c-4-3-7-6-7-9.5a3.5 3.5 0 0 1 7-1 3.5 3.5 0 0 1 7 1C23 18 20 21 16 24z" fill="#fff" />
      <path d="M16 23.5c-1.6-2.3-2.2-4.6-1.6-7.2.5.9 1 1.6 1.6 2.1.6-.5 1.1-1.2 1.6-2.1.6 2.6 0 4.9-1.6 7.2z" fill={alt ? "var(--kb-primary)" : "var(--kb-accent)"} />
    </svg>
  );
}
