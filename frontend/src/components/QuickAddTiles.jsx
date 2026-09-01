import { useDashboard } from "../context/DashboardContext.jsx";
import { Card } from "./ui/index.jsx";

export default function QuickAddTiles({ onPick }) {
  const { options } = useDashboard();
  const cats = options?.categories || [];

  return (
    <Card className="p-4 sm:p-5">
      <h3 className="text-sm font-semibold text-fg">Quick add</h3>
      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {cats.map((c) => (
          <button
            key={c.value}
            onClick={() => onPick({ category: c.value })}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-line bg-surface px-2 py-3 text-center transition hover:border-accent hover:bg-accent-soft"
          >
            <span
              className="grid h-9 w-9 place-items-center rounded-lg text-lg"
              style={{ backgroundColor: `${c.color}22` }}
            >
              {c.icon}
            </span>
            <span className="text-[11px] font-medium leading-tight text-muted">{c.label}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}
