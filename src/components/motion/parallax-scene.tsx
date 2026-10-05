"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * 3D scene that tilts toward the pointer (desktop) or gently with scroll (phones).
 * Children use `translateZ` for depth layers.
 */
export function ParallaxScene({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const set = (rx: number, ry: number) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty("--prx", `${rx}deg`);
        el.style.setProperty("--pry", `${ry}deg`);
      });
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      set(10 - y * 14, -14 + x * 22);
    };
    const onScroll = () => {
      if (window.matchMedia("(hover: hover)").matches) return;
      const t = Math.min(1, window.scrollY / 600);
      set(10 - t * 8, -14 + t * 18);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className={cn("perspective", className)}>
      <div
        ref={ref}
        className="preserve-3d relative h-full w-full transition-transform duration-500 ease-out"
        style={{ transform: "rotateX(var(--prx, 10deg)) rotateY(var(--pry, -14deg))" }}
      >
        {children}
      </div>
    </div>
  );
}
