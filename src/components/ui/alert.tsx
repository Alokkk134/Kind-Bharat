import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Kind = "info" | "success" | "warning" | "error";

const styles: Record<Kind, string> = {
  info: "border-sky-200 bg-sky-50 text-sky-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  warning: "border-amber-300 bg-amber-50 text-amber-900",
  error: "border-red-200 bg-red-50 text-red-900",
};
const icons = { info: Info, success: CheckCircle2, warning: AlertTriangle, error: XCircle };

export function Alert({
  kind = "info",
  title,
  children,
  className,
}: {
  kind?: Kind;
  title?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const Icon = icons[kind];
  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      className={cn("flex gap-3 rounded-2xl border p-4 text-sm animate-pop", styles[kind], className)}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
      <div className="space-y-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="leading-relaxed">{children}</div>}
      </div>
    </div>
  );
}

/** Shows error/success from an ActionState. */
export function FormMessage({ state }: { state: { error?: string; message?: string } }) {
  if (state.error) return <Alert kind="error">{state.error}</Alert>;
  if (state.message) return <Alert kind="success">{state.message}</Alert>;
  return null;
}
