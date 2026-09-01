import { Card, EmptyState } from "../ui/index.jsx";

export default function ChartCard({ title, subtitle, isEmpty, emptyText, children, height = 240 }) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-fg">{title}</h3>
        {subtitle && <span className="text-xs text-faint">{subtitle}</span>}
      </div>
      {isEmpty ? (
        <EmptyState icon="📊" title={emptyText || "No data for this month"} className="py-10" />
      ) : (
        <div style={{ height }} className="mt-4">
          {children}
        </div>
      )}
    </Card>
  );
}
