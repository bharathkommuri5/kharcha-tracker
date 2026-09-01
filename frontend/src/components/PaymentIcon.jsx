// Compact brand-style badges for payment modes. Simplified marks (colour + glyph),
// drawn as an SVG set so they read as one family at 20–28px.

function Frame({ size, bg, children, ring }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="0.5" y="0.5" width="23" height="23" rx="6" fill={bg} stroke={ring || "none"} />
      {children}
    </svg>
  );
}

const T = (props) => (
  <text
    x="12"
    y="12"
    textAnchor="middle"
    dominantBaseline="central"
    fontFamily="Inter, system-ui, sans-serif"
    fontWeight="700"
    {...props}
  />
);

function CardGlyph({ color }) {
  return (
    <>
      <rect x="4.5" y="7" width="15" height="10.5" rx="2" fill="none" stroke="#fff" strokeWidth="1.6" />
      <rect x="4.5" y="9.6" width="15" height="2.3" fill="#fff" />
      <rect x="6.7" y="14" width="4.5" height="1.5" rx="0.75" fill={color || "#fff"} opacity="0.9" />
    </>
  );
}

export default function PaymentIcon({ mode, size = 22 }) {
  switch (mode) {
    case "phonepe":
      return (
        <Frame size={size} bg="#5f259f">
          <T fontSize="9" fill="#ffffff">Pe</T>
        </Frame>
      );
    case "gpay":
      return (
        <Frame size={size} bg="#ffffff" ring="#e2e8f0">
          <circle cx="8.4" cy="6" r="1.7" fill="#EA4335" />
          <circle cx="15.6" cy="6" r="1.7" fill="#FBBC04" />
          <circle cx="8.4" cy="18" r="1.7" fill="#34A853" />
          <T fontSize="10" fill="#4285F4">G</T>
        </Frame>
      );
    case "supermoney":
      return (
        <Frame size={size} bg="#00b8a3">
          <T fontSize="11" fill="#ffffff">S</T>
        </Frame>
      );
    case "cred":
      return (
        <Frame size={size} bg="#0a0a0a">
          <T fontSize="10" fill="#ffffff" letterSpacing="-0.5">C</T>
        </Frame>
      );
    case "credit_card":
      return (
        <Frame size={size} bg="#4f46e5">
          <CardGlyph color="#c7d2fe" />
        </Frame>
      );
    case "debit_card":
      return (
        <Frame size={size} bg="#0d9488">
          <CardGlyph color="#99f6e4" />
        </Frame>
      );
    case "cash":
      return (
        <Frame size={size} bg="#16a34a">
          <T fontSize="11" fill="#ffffff">₹</T>
        </Frame>
      );
    default:
      return (
        <Frame size={size} bg="#64748b">
          <circle cx="8" cy="12" r="1.5" fill="#fff" />
          <circle cx="12" cy="12" r="1.5" fill="#fff" />
          <circle cx="16" cy="12" r="1.5" fill="#fff" />
        </Frame>
      );
  }
}
