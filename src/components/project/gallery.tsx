"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Photo gallery with a 3D card-flip transition between images, swipe-friendly thumbnails. */
export function Gallery({ images, alt, fallback }: { images: string[]; alt: string; fallback: React.ReactNode }) {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  if (!images.length) {
    return <div className="flex aspect-[16/10] items-center justify-center rounded-[2rem] bg-primary-soft text-7xl">{fallback}</div>;
  }
  const go = (n: number) => {
    setDir(n > i ? 1 : -1);
    setI((n + images.length) % images.length);
  };

  return (
    <div className="space-y-3">
      <div className="perspective relative aspect-[16/10] overflow-hidden rounded-[2rem] bg-primary-soft shadow-2xl shadow-primary/20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={i}
          src={images[i]}
          alt={`${alt} — photo ${i + 1} of ${images.length}`}
          className="h-full w-full object-cover"
          style={{ animation: `${dir > 0 ? "kb-swap-r" : "kb-swap-l"} .6s cubic-bezier(.2,.8,.2,1) both` }}
        />
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(i - 1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-2 shadow-lg backdrop-blur transition hover:scale-110"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(i + 1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-2 shadow-lg backdrop-blur transition hover:scale-110"
              aria-label="Next photo"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white">
              {i + 1} / {images.length}
            </span>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex snap-x gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {images.map((src, n) => (
            <button
              key={src}
              type="button"
              onClick={() => go(n)}
              aria-label={`Show photo ${n + 1}`}
              aria-current={n === i}
              className={cn(
                "h-16 w-20 shrink-0 snap-start overflow-hidden rounded-xl ring-2 transition",
                n === i ? "ring-accent" : "opacity-70 ring-transparent hover:opacity-100",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
