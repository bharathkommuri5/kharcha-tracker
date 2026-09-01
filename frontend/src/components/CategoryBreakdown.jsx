import { useDashboard } from "../context/DashboardContext.jsx";
import { formatINR } from "../lib/format.js";
import { Card, EmptyState } from "./ui/index.jsx";

export default function CategoryBreakdown() {
  const { summary, options } = useDashboard();
  const meta = {};
  (options?.categories || []).forEach((c) => (meta[c.value] = c));
  const rows = summary?.by_category || [];
  const total = Number(summary?.total || 0) || 1;

  return (
    <Card className="p-4 sm:p-5">
      <h3 className="text-sm font-semibold text-fg">Where it went</h3>
      {rows.length === 0 ? (
        <EmptyState icon="🗂️" title="Nothing logged yet" className="py-8" />
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((r) => {
            const m = meta[r.value] || { icon: "•", color: "#94a3b8", label: r.label };
            const pct = Math.round((Number(r.total) / total) * 100);
            return (
              <li key={r.value}>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-medium text-fg">
                    <span>{m.icon}</span> {m.label}
                  </span>
                  <span className="tabular-nums text-muted">
                    {formatINR(r.total)} <span className="text-faint">· {pct}%</span>
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${Math.max(pct, 3)}%`, backgroundColor: m.color }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
