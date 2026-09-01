// The Kharcha Tracker logomark — a ₹ whose leg rises like a growth line.
// Mirrors public/favicon.svg. `tone="onAccent"` = white mark for use on the accent colour.
export default function BrandMark({ size = 32, rounded = true, tone = "brand", className = "" }) {
  const onAccent = tone === "onAccent";
  const strokeColor = onAccent ? "#4f46e5" : "#ffffff";
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
          <stop offset="0" stopColor="#6366f1" />
          <stop offset="1" stopColor="#4338ca" />
        </linearGradient>
        <radialGradient id="kt-sheen" cx="0.28" cy="0.2" r="0.9">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.2" />
          <stop offset="0.55" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      {!onAccent && (
        <>
          <rect width="512" height="512" rx={rounded ? 128 : 0} fill="url(#kt-grad)" />
          <rect width="512" height="512" rx={rounded ? 128 : 0} fill="url(#kt-sheen)" />
        </>
      )}
      <g fill="none" stroke={strokeColor} strokeLinecap="round">
        <g strokeWidth="44">
          <line x1="168" y1="146" x2="344" y2="146" />
          <line x1="168" y1="212" x2="344" y2="212" />
          <line x1="169" y1="140" x2="169" y2="258" />
          <line x1="316" y1="140" x2="316" y2="216" />
        </g>
        <line x1="176" y1="244" x2="336" y2="392" strokeWidth="48" />
      </g>
    </svg>
  );
}
