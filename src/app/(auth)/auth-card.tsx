export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="animate-pop rounded-[2rem] border border-border bg-surface/90 p-6 shadow-[0_30px_80px_-30px_rgba(15,94,89,0.45)] backdrop-blur sm:p-8">
      <h1 className="font-serif text-3xl font-semibold tracking-tight">{title}</h1>
      {subtitle && <p className="mt-1.5 text-muted">{subtitle}</p>}
      <div className="mt-6">{children}</div>
      {footer && <div className="mt-6 border-t border-border pt-5 text-center text-sm text-muted">{footer}</div>}
    </div>
  );
}
