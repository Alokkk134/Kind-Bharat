"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Thin progress bar at the top of the screen. Starts the instant an internal link is
 * clicked and completes when the new page has rendered, so taps never feel ignored.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qs = searchParams.toString();
  const routeKey = qs ? `${pathname}?${qs}` : pathname;

  // The route we were on when a navigation started (null = idle).
  const [startedFrom, setStartedFrom] = useState<string | null>(null);
  const safety = useRef<number | undefined>(undefined);

  const phase = startedFrom === null ? "idle" : startedFrom === routeKey ? "loading" : "done";

  // Route changed → let the bar finish, then hide it
  useEffect(() => {
    document.documentElement.removeAttribute("data-navigating");
    const t = window.setTimeout(() => setStartedFrom(null), 450);
    return () => window.clearTimeout(t);
  }, [routeKey]);

  // Any internal link click → start the bar
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || !a.href || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      // Same page (or just a #hash jump) → nothing to wait for
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      setStartedFrom(window.location.pathname + window.location.search);
      document.documentElement.setAttribute("data-navigating", "");
      // Safety net: never leave the bar stuck (e.g. navigation cancelled)
      window.clearTimeout(safety.current);
      safety.current = window.setTimeout(() => {
        setStartedFrom(null);
        document.documentElement.removeAttribute("data-navigating");
      }, 15000);
    }
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.clearTimeout(safety.current);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px]"
      style={{ opacity: phase === "idle" ? 0 : 1, transition: "opacity .3s ease .15s" }}
    >
      <div
        className="h-full bg-gradient-to-r from-primary via-[#138a7f] to-accent shadow-[0_0_10px_rgba(224,138,30,0.7)]"
        style={{
          width: phase === "idle" ? "0%" : phase === "loading" ? "85%" : "100%",
          transition:
            phase === "loading" ? "width 8s cubic-bezier(0.1, 0.9, 0.2, 1)" : phase === "done" ? "width .25s ease-out" : "none",
        }}
      />
    </div>
  );
}
