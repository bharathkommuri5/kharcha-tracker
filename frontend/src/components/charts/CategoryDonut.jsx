import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatINR } from "../../lib/format.js";
import ChartCard from "./ChartCard.jsx";
import { tooltipStyle, useChartTheme } from "./useChartTheme.js";

export default function CategoryDonut({ summary, options }) {
  const t = useChartTheme();
  const colorFor = {};
  (options?.categories || []).forEach((c) => (colorFor[c.value] = c.color));

  const data = (summary?.by_category || []).map((row) => ({
    name: row.label,
    value: Number(row.total),
    color: colorFor[row.value] || "#94a3b8",
  }));

  return (
    <ChartCard title="Spend by category" isEmpty={data.length === 0}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="55%"
            outerRadius="82%"
            paddingAngle={2}
            stroke="none"
          >
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => formatINR(v)} {...tooltipStyle(t)} />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, color: t.axis }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
