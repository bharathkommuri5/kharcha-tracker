import { siGooglepay, siPhonepe } from "simple-icons";
import { Banknote, CreditCard, MoreHorizontal } from "../lib/icons.js";

// Payment-mode badges. Real provider marks (PhonePe, Google Pay) come from the
// open-source Simple Icons set and are shown nominatively to identify the method.
// Providers not in that set use a brand-coloured monogram; card/cash/other use
// generic icons.

function Square({ size, bg, ring, children }) {
  return (
    <span
      style={{ width: size, height: size, background: bg, boxShadow: ring ? `inset 0 0 0 1px ${ring}` : undefined }}
      className="grid shrink-0 place-items-center rounded-md text-white"
    >
      {children}
    </span>
  );
}

function BrandGlyph({ icon, size, color }) {
  const g = Math.round(size * 0.62);
  return (
    <svg width={g} height={g} viewBox="0 0 24 24" fill={color || "#fff"} aria-hidden="true">
      <path d={icon.path} />
    </svg>
  );
}

function Monogram({ text, size }) {
  return (
    <span style={{ fontSize: Math.round(size * 0.44) }} className="font-bold leading-none">
      {text}
    </span>
  );
}

export default function PaymentIcon({ mode, size = 22 }) {
  switch (mode) {
    case "phonepe":
      return (
        <Square size={size} bg="#5F259F">
          <BrandGlyph icon={siPhonepe} size={size} />
        </Square>
      );
    case "gpay":
      return (
        <Square size={size} bg="#ffffff" ring="#e2e8f0">
          <BrandGlyph icon={siGooglepay} size={size} color="#4285F4" />
        </Square>
      );
    case "supermoney":
      return (
        <Square size={size} bg="#00b8a3">
          <Monogram text="s" size={size} />
        </Square>
      );
    case "cred":
      return (
        <Square size={size} bg="#0a0a0a">
          <Monogram text="C" size={size} />
        </Square>
      );
    case "credit_card":
      return (
        <Square size={size} bg="#4f46e5">
          <CreditCard size={Math.round(size * 0.58)} strokeWidth={2} />
        </Square>
      );
    case "debit_card":
      return (
        <Square size={size} bg="#0d9488">
          <CreditCard size={Math.round(size * 0.58)} strokeWidth={2} />
        </Square>
      );
    case "cash":
      return (
        <Square size={size} bg="#16a34a">
          <Banknote size={Math.round(size * 0.6)} strokeWidth={2} />
        </Square>
      );
    default:
      return (
        <Square size={size} bg="#64748b">
          <MoreHorizontal size={Math.round(size * 0.6)} strokeWidth={2.5} />
        </Square>
      );
  }
}
