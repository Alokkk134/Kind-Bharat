"use client";

import { useState } from "react";
import { RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";

/** 3D flip card: hover (desktop) or tap (phone) to see the back. */
export function FlipStep({
  n,
  icon,
  title,
  front,
  back,
}: {
  n: number;
  icon: React.ReactNode;
  title: string;
  front: string;
  back: string[];
}) {
  const [flipped, setFlipped] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setFlipped((f) => !f)}
      aria-pressed={flipped}
      aria-label={`${title}. ${flipped ? back.join(" ") : front} Tap to flip.`}
      className="group perspective block h-72 w-full text-left"
    >
      <span
        className={cn(
          "preserve-3d relative block h-full w-full transition-transform duration-700 [transition-timing-function:cubic-bezier(.2,.8,.2,1)]",
          flipped ? "[transform:rotateY(180deg)]" : "[@media(hover:hover)]:group-hover:[transform:rotateY(180deg)]",
        )}
      >
        <span className="backface-hidden absolute inset-0 flex flex-col rounded-[2rem] border border-border bg-surface p-6 shadow-[0_30px_60px_-35px_rgba(15,94,89,0.55)]">
          <span className="flex items-center justify-between">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[#138a7f] text-white shadow-lg shadow-primary/30 [&>svg]:h-7 [&>svg]:w-7">
              {icon}
            </span>
            <span className="font-serif text-6xl font-semibold text-primary/10">0{n}</span>
          </span>
          <span className="mt-6 block font-serif text-2xl font-semibold">{title}</span>
          <span className="mt-2 block text-muted">{front}</span>
          <span className="mt-auto flex items-center gap-1 text-xs font-semibold text-accent-ink">
            <RotateCw className="h-3.5 w-3.5" /> Flip for details
          </span>
        </span>
        <span className="backface-hidden absolute inset-0 flex flex-col rounded-[2rem] bg-gradient-to-br from-primary to-primary-deep p-6 text-white shadow-2xl [transform:rotateY(180deg)]">
          <span className="font-serif text-xl font-semibold">{title}</span>
          <ul className="mt-4 space-y-2.5 text-sm text-white/90">
            {back.map((b) => (
              <li key={b} className="flex gap-2"><span className="text-accent">●</span> {b}</li>
            ))}
          </ul>
        </span>
      </span>
    </button>
  );
}
