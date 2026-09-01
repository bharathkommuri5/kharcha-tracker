import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatINR, formatINRCompact } from "../../lib/format.js";
import ChartCard from "./ChartCard.jsx";
import { tooltipStyle, useChartTheme } from "./useChartTheme.js";

const PALETTE = ["#6366f1", "#8b5cf6", "#ec4899", "#f97316", "#14b8a6", "#0ea5e9", "#64748b", "#ef4444"];

export default function PaymentBar({ summary }) {
  const t = useChartTheme();
  const data = (summary?.by_payment_mode || []).map((row, i) => ({
    name: row.label,
    value: Number(row.total),
    color: PALETTE[i % PALETTE.length],
  }));

  return (
    <ChartCard title="Spend by payment mode" isEmpty={data.length === 0}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.grid} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: t.axis }} tickLine={false} axisLine={false} />
          <YAxis
            tickFormatter={formatINRCompact}
            tick={{ fontSize: 11, fill: t.axis }}
            tickLine={false}
            axisLine={false}
            width={56}
          />
          <Tooltip formatter={(v) => formatINR(v)} cursor={{ fill: t.grid }} {...tooltipStyle(t)} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={48}>
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
