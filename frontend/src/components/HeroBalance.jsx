import { formatFullDate, formatINR } from "../lib/format.js";
import BrandMark from "./BrandMark.jsx";

export default function HeroBalance({ summary, range, label = "Spent" }) {
  const total = summary?.total ?? 0;
  const count = summary?.transaction_count ?? 0;
  const top = summary?.top_category;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-accent p-5 text-accent-fg shadow-glow sm:p-6">
      <div className="pointer-events-none absolute -right-8 -top-10 opacity-20">
        <BrandMark size={160} rounded={false} />
      </div>
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
          {label} {range ? `· ${formatFullDate(range.start)} – ${formatFullDate(range.end)}` : ""}
        </p>
        <p className="mt-1 text-3xl font-bold tabular-nums sm:text-4xl">{formatINR(total)}</p>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm">
          <span className="opacity-90">
            <span className="font-semibold">{count}</span> transaction{count === 1 ? "" : "s"}
          </span>
          {top && (
            <span className="opacity-90">
              Top: <span className="font-semibold">{top.label}</span> · {formatINR(top.total)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
