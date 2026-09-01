export default function CategoryChips({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((c) => {
        const active = value === c.value;
        return (
          <button
            key={c.value}
            type="button"
            onClick={() => onChange(c.value)}
            className={
              "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition " +
              (active
                ? "border-transparent text-white shadow-sm"
                : "border-line bg-surface text-muted hover:border-faint hover:text-fg")
            }
            style={active ? { backgroundColor: c.color } : undefined}
          >
            <span>{c.icon}</span>
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
