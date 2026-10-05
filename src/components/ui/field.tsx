import { cn } from "@/lib/utils";

type FieldProps = {
  label: string;
  name: string;
  error?: string;
  hint?: React.ReactNode;
  required?: boolean;
  className?: string;
};

export function FieldShell({
  label,
  name,
  error,
  hint,
  required,
  className,
  children,
}: FieldProps & { children: React.ReactNode }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={name} className="block text-sm font-semibold text-ink">
        {label}
        {required && <span className="ml-0.5 text-danger" aria-hidden>*</span>}
      </label>
      {children}
      {hint && !error && <p id={`${name}-hint`} className="text-xs text-muted">{hint}</p>}
      {error && (
        <p id={`${name}-error`} role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function Input({
  label,
  name,
  error,
  hint,
  required,
  className,
  ...props
}: FieldProps & Omit<React.InputHTMLAttributes<HTMLInputElement>, "name">) {
  return (
    <FieldShell label={label} name={name} error={error} hint={hint} required={required} className={className}>
      <input
        id={name}
        name={name}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
        className="kb-input"
        {...props}
      />
    </FieldShell>
  );
}

export function Textarea({
  label,
  name,
  error,
  hint,
  required,
  className,
  rows = 4,
  ...props
}: FieldProps & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "name">) {
  return (
    <FieldShell label={label} name={name} error={error} hint={hint} required={required} className={className}>
      <textarea
        id={name}
        name={name}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
        className="kb-input resize-y"
        {...props}
      />
    </FieldShell>
  );
}

export function Select({
  label,
  name,
  error,
  hint,
  required,
  className,
  options,
  placeholder,
  ...props
}: FieldProps &
  Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "name"> & {
    options: readonly { value: string; label: string }[] | readonly string[];
    placeholder?: string;
  }) {
  return (
    <FieldShell label={label} name={name} error={error} hint={hint} required={required} className={className}>
      <select
        id={name}
        name={name}
        required={required}
        aria-invalid={error ? true : undefined}
        className="kb-input appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2356656a%22 stroke-width=%222%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:1.1rem] bg-[right_0.75rem_center] bg-no-repeat pr-9"
        {...props}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) =>
          typeof o === "string" ? (
            <option key={o} value={o}>{o}</option>
          ) : (
            <option key={o.value} value={o.value}>{o.label}</option>
          ),
        )}
      </select>
    </FieldShell>
  );
}

export function Checkbox({
  label,
  name,
  className,
  ...props
}: { label: React.ReactNode; name: string; className?: string } & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "name" | "type"
>) {
  return (
    <label className={cn("flex cursor-pointer items-start gap-3 text-sm", className)}>
      <input
        type="checkbox"
        name={name}
        className="mt-0.5 h-5 w-5 shrink-0 rounded border-border accent-[var(--kb-primary)]"
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}
