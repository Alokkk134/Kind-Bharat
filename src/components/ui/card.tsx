import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
  as: Tag = "div",
}: {
  className?: string;
  children: React.ReactNode;
  as?: "div" | "section" | "article" | "li";
}) {
  return (
    <Tag
      className={cn(
        "rounded-3xl border border-border bg-surface p-5 shadow-[0_1px_0_rgba(0,0,0,0.02),0_10px_30px_-18px_rgba(31,42,46,0.25)] sm:p-6",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-ink">{eyebrow}</p>
        )}
        <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {title}
        </h1>
        {description && <div className="mt-2 text-muted">{description}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  children,
}: {
  icon?: React.ReactNode;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-surface/60 px-6 py-12 text-center">
      {icon && <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary animate-float">{icon}</div>}
      <p className="font-serif text-lg font-semibold">{title}</p>
      {children && <div className="mx-auto mt-1 max-w-md text-sm text-muted">{children}</div>}
    </div>
  );
}
