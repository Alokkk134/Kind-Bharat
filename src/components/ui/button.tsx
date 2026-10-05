import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "accent" | "outline" | "ghost" | "danger" | "success";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 select-none";

const variants: Record<Variant, string> = {
  primary:
    "btn-shine bg-primary text-white shadow-[0_6px_20px_-6px_rgba(15,94,89,0.6)] hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-8px_rgba(15,94,89,0.6)]",
  accent:
    "btn-shine bg-accent text-white shadow-[0_6px_20px_-6px_rgba(224,138,30,0.7)] hover:bg-accent-ink hover:-translate-y-0.5",
  outline: "border border-border bg-surface text-primary hover:border-primary hover:bg-primary-soft",
  ghost: "text-primary hover:bg-primary-soft",
  danger: "bg-danger text-white hover:brightness-110",
  success: "bg-success text-white hover:brightness-110",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3.5 text-base",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  href,
  children,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; variant?: Variant; size?: Size }) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)} {...props}>
      {children}
    </Link>
  );
}
