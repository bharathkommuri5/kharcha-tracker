import PaymentIcon from "./PaymentIcon.jsx";
import { cn } from "./ui/index.jsx";

export default function PaymentModePicker({ options, value, onChange, error }) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {options.map((p) => {
          const active = value === p.value;
          return (
            <button
              key={p.value}
              type="button"
              onClick={() => onChange(p.value)}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-2.5 py-2 text-left text-xs font-semibold transition",
                active
                  ? "border-accent bg-accent-soft text-fg ring-1 ring-accent"
                  : "border-line bg-surface text-muted hover:border-faint hover:text-fg"
              )}
            >
              <PaymentIcon mode={p.value} size={22} />
              <span className="truncate">{p.label}</span>
            </button>
          );
        })}
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-negative">{error}</p>}
    </div>
  );
}
