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
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01.02 1.06L9.06 10l3.75 3.71a.75.75 0 11-1.06 1.06l-4.25-4.25a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.04-.02z" clipRule="evenodd" />
        </svg>
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
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01-.02-1.06L10.94 10 7.19 6.29a.75.75 0 111.06-1.06l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.04.02z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}
