import { formatINR } from "../lib/format.js";

const SLIDER_MAX = 5000;
const SLIDER_STEP = 50;
const QUICK = [100, 250, 500, 1000, 2000];

// Slider + number field bound to one value. Dragging updates the number;
// typing updates the slider (which clamps its thumb at SLIDER_MAX while the
// number keeps the exact/larger value).
export default function AmountInput({ value, onChange, id = "amount" }) {
  const num = value === "" ? "" : Number(value);
  const sliderValue = Math.min(Number(num) || 0, SLIDER_MAX);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-medium text-faint">
            ₹
          </span>
          <input
            id={id}
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="0.00"
            className="block w-full rounded-xl border-0 bg-surface py-2.5 pl-8 pr-3 text-lg font-semibold text-fg ring-1 ring-inset ring-line focus:ring-2 focus:ring-inset focus:ring-accent"
          />
        </div>
        <span className="w-24 shrink-0 text-right text-sm font-medium text-faint">
          {num === "" || Number.isNaN(Number(num)) ? "—" : formatINR(num)}
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={SLIDER_MAX}
        step={SLIDER_STEP}
        value={sliderValue}
        onChange={(e) => onChange(String(Number(e.target.value)))}
        className="w-full"
        aria-label="Amount slider"
      />

      <div className="flex flex-wrap gap-1.5">
        {QUICK.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onChange(String(q))}
            className="rounded-lg bg-surface-2 px-2.5 py-1 text-xs font-medium text-muted transition hover:bg-accent-soft hover:text-fg"
          >
            ₹{q.toLocaleString("en-IN")}
          </button>
        ))}
      </div>
    </div>
  );
}
