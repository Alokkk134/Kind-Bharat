"use client";

import { useEffect, useRef, useState } from "react";

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const num = new Intl.NumberFormat("en-IN");

/** Counts up from 0 to `value` when visible. Server-rendered with the final value for SEO/no-JS. */
export function CountUp({
  value,
  currency = false,
  duration = 1600,
  suffix = "",
}: {
  value: number;
  currency?: boolean;
  duration?: number;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || value === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started.current) return;
      started.current = true;
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 4);
        setDisplay(Math.round(value * eased));
        if (t < 1) requestAnimationFrame(tick);
      };
      setDisplay(0);
      requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {currency ? inr.format(display) : num.format(display)}
      {suffix}
    </span>
  );
}
