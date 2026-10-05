"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * 3D tilt with a moving light glare. Works with mouse and pen;
 * on touch it gives a gentle press-tilt. Disabled for reduced-motion users via CSS.
 */
export function Tilt({
  children,
  className,
  max = 10,
  glare = true,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
  glare?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);

  function update(clientX: number, clientY: number) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (clientX - r.left) / r.width;
    const py = (clientY - r.top) / r.height;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.style.setProperty("--tx", `${(0.5 - py) * max * 2}deg`);
      el.style.setProperty("--ty", `${(px - 0.5) * max * 2}deg`);
      el.style.setProperty("--gx", `${px * 100}%`);
      el.style.setProperty("--gy", `${py * 100}%`);
      el.style.setProperty("--go", "1");
    });
  }

  function reset() {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(frame.current);
    el.style.setProperty("--tx", "0deg");
    el.style.setProperty("--ty", "0deg");
    el.style.setProperty("--go", "0");
  }

  return (
    <div className="perspective h-full">
      <div
        ref={ref}
        onPointerMove={(e) => update(e.clientX, e.clientY)}
        onPointerLeave={reset}
        onPointerCancel={reset}
        onPointerUp={(e) => e.pointerType === "touch" && reset()}
        className={cn(
          "kb-tilt preserve-3d relative h-full transition-transform duration-300 ease-out will-change-transform",
          className,
        )}
      >
        {children}
        {glare && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
            style={{
              opacity: "var(--go, 0)",
              background:
                "radial-gradient(circle at var(--gx,50%) var(--gy,50%), rgba(255,255,255,0.45), transparent 55%)",
              mixBlendMode: "soft-light",
            }}
          />
        )}
      </div>
    </div>
  );
}
