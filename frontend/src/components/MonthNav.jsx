import { ChevronLeft, ChevronRight } from "../lib/icons.js";
import { useDashboard } from "../context/DashboardContext.jsx";
import { monthLabel } from "../lib/format.js";

export default function MonthNav({ className = "" }) {
  const { range, goToMonth, loading } = useDashboard();

  return (
    <div className={"flex items-center gap-1 rounded-xl bg-surface-2 p-1 " + className}>
      <button
        onClick={() => goToMonth(-1)}
        className="rounded-lg p-1.5 text-muted transition hover:bg-surface hover:text-fg"
        aria-label="Previous month"
      >
        <ChevronLeft size={16} strokeWidth={2.25} />
      </button>
      <div className="flex min-w-[8.5rem] items-center justify-center gap-2">
        <span className="text-sm font-semibold text-fg">{monthLabel(range.year, range.month)}</span>
        {loading && <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-accent" />}
      </div>
      <button
        onClick={() => goToMonth(1)}
        disabled={range.isCurrent}
        className="rounded-lg p-1.5 text-muted transition hover:bg-surface hover:text-fg disabled:opacity-30 disabled:hover:bg-transparent"
        aria-label="Next month"
      >
        <ChevronRight size={16} strokeWidth={2.25} />
      </button>
    </div>
  );
}
