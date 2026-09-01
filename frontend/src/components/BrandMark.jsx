// The Kharcha Tracker logomark — a ₹ over a spend-trend line.
// Mirrors public/favicon.svg. `tone="light"` renders white strokes for dark backgrounds.
export default function BrandMark({ size = 32, rounded = true, tone = "brand", className = "" }) {
  const bg = tone === "light" ? "transparent" : "url(#kt-grad)";
  const stroke = "#ffffff";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      className={className}
      role="img"
      aria-label="Kharcha Tracker"
    >
      <defs>
        <linearGradient id="kt-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#818cf8" />
          <stop offset="1" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      {tone !== "light" && (
        <rect width="512" height="512" rx={rounded ? 118 : 0} fill={bg} />
      )}
      <path
        d="M96 372 L200 306 L290 344 L424 206"
        fill="none"
        stroke={tone === "light" ? "#a5b4fc" : "#ffffff"}
        strokeOpacity={tone === "light" ? 0.9 : 0.25}
        strokeWidth="20"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="424"
        cy="206"
        r="15"
        fill={tone === "light" ? "#a5b4fc" : "#ffffff"}
        fillOpacity={tone === "light" ? 1 : 0.4}
      />
      <g
        stroke={tone === "light" ? "#4f46e5" : stroke}
        strokeWidth="42"
        strokeLinecap="round"
        fill="none"
      >
        <line x1="170" y1="139" x2="342" y2="139" />
        <line x1="170" y1="205" x2="342" y2="205" />
        <line x1="171" y1="132" x2="171" y2="250" />
        <line x1="315" y1="132" x2="315" y2="210" />
        <line x1="177" y1="236" x2="330" y2="388" />
      </g>
    </svg>
  );
}
