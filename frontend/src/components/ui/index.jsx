import { useEffect } from "react";

export function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  disabled,
  loading,
  children,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all " +
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 " +
    "focus-visible:ring-offset-bg disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";
  const variants = {
    primary: "bg-accent text-accent-fg shadow-sm hover:brightness-110 hover:shadow-md",
    secondary:
      "bg-surface text-fg ring-1 ring-inset ring-line hover:bg-surface-2",
    ghost: "text-muted hover:bg-surface-2 hover:text-fg",
    danger: "bg-negative text-white shadow-sm hover:brightness-110",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-sm",
  };
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  );
}

export function Card({ className, interactive, children, ...props }) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-surface shadow-card ring-1 ring-line/70",
        interactive && "transition-shadow hover:shadow-card-hover",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function Spinner({ className }) {
  return (
    <svg className={cn("animate-spin", className || "h-5 w-5")} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

export function Field({ label, htmlFor, error, hint, children }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={htmlFor} className="block text-xs font-semibold text-muted">
          {label}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-faint">{hint}</p>}
      {error && <p className="text-xs font-medium text-negative">{error}</p>}
    </div>
  );
}

const inputBase =
  "block w-full rounded-xl border-0 py-2.5 px-3 text-sm text-fg ring-1 ring-inset ring-line " +
  "bg-surface placeholder:text-faint transition focus:ring-2 focus:ring-inset focus:ring-accent";

export function TextInput({ className, ...props }) {
  return <input className={cn(inputBase, className)} {...props} />;
}

export function Select({ className, children, ...props }) {
  return (
    <select className={cn(inputBase, "cursor-pointer appearance-none pr-9", className)} {...props}>
      {children}
    </select>
  );
}

export function SegmentedControl({ value, onChange, options }) {
  return (
    <div className="flex gap-1 rounded-xl bg-surface-2 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition",
            value === o.value
              ? "bg-surface text-fg shadow-sm"
              : "text-muted hover:text-fg"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Modal({ open, onClose, title, children, footer, size = "md" }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  const width = size === "lg" ? "sm:max-w-lg" : size === "sm" ? "sm:max-w-sm" : "sm:max-w-md";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 animate-fade-in bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          "relative flex max-h-[92vh] w-full flex-col overflow-hidden bg-surface shadow-pop ring-1 ring-line",
          "animate-scale-in rounded-t-3xl sm:rounded-2xl",
          width
        )}
      >
        {title && (
          <div className="flex shrink-0 items-center justify-between border-b border-line px-5 py-4">
            <h2 className="text-base font-semibold text-fg">{title}</h2>
            <button
              onClick={onClose}
              className="-mr-1.5 rounded-lg p-1.5 text-faint transition hover:bg-surface-2 hover:text-fg"
              aria-label="Close"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="flex shrink-0 justify-end gap-2 border-t border-line px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function EmptyState({ icon = "📭", title, children, className }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-1.5 px-6 py-14 text-center", className)}>
      <div className="mb-1 text-4xl">{icon}</div>
      <p className="text-sm font-semibold text-muted">{title}</p>
      {children && <p className="max-w-xs text-xs leading-relaxed text-faint">{children}</p>}
    </div>
  );
}
