import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDashboard } from "../../context/DashboardContext.jsx";
import { formatFullDate, formatINR, formatINRCompact } from "../../lib/format.js";
import ChartCard from "./ChartCard.jsx";
import { tooltipStyle, useChartTheme } from "./useChartTheme.js";

export default function DailyTrend() {
  const { summary } = useDashboard();
  const t = useChartTheme();
  const daily = summary?.daily || [];
  const data = daily.map((d) => ({
    date: d.date,
    day: Number(d.date.slice(8, 10)),
    total: Number(d.total),
  }));
  const hasSpend = data.some((d) => d.total > 0);

  return (
    <ChartCard title="Daily spend trend" isEmpty={!hasSpend} height={220}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={t.accent} stopOpacity={0.35} />
              <stop offset="100%" stopColor={t.accent} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.grid} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: t.axis }}
            tickLine={false}
            axisLine={false}
            interval={4}
          />
          <YAxis
            tickFormatter={formatINRCompact}
            tick={{ fontSize: 11, fill: t.axis }}
            tickLine={false}
            axisLine={false}
            width={56}
          />
          <Tooltip
            formatter={(v) => [formatINR(v), "Spent"]}
            labelFormatter={(_, p) => (p?.[0] ? formatFullDate(p[0].payload.date) : "")}
            {...tooltipStyle(t)}
          />
          <Area type="monotone" dataKey="total" stroke={t.accent} strokeWidth={2} fill="url(#trendFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
