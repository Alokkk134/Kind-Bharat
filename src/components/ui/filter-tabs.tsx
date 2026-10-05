import Link from "next/link";
import { cn } from "@/lib/utils";

/** Link-based tabs (work without JavaScript, shareable URLs). */
export function FilterTabs({
  base,
  param = "status",
  current,
  tabs,
}: {
  base: string;
  param?: string;
  current: string;
  tabs: { value: string; label: string }[];
}) {
  return (
    <div className="-mx-4 mb-6 overflow-x-auto px-4 [scrollbar-width:none]">
      <div className="inline-flex gap-1 rounded-2xl bg-stone-100 p-1">
        {tabs.map((t) => (
          <Link
            key={t.value}
            href={`${base}?${param}=${t.value}`}
            className={cn(
              "whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-medium transition",
              current === t.value ? "bg-surface text-primary shadow" : "text-muted hover:text-ink",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
