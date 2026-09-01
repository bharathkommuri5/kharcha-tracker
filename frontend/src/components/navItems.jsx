const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const NAV_ITEMS = [
  {
    key: "overview",
    label: "Overview",
    icon: (
      <svg viewBox="0 0 24 24" {...stroke}>
        <path d="M3 13h8V3H3zM13 21h8V11h-8zM13 3v6h8V3zM3 17v4h8v-4z" />
      </svg>
    ),
  },
  {
    key: "transactions",
    label: "Transactions",
    icon: (
      <svg viewBox="0 0 24 24" {...stroke}>
        <path d="M4 7h13l-3-3M20 17H7l3 3" />
      </svg>
    ),
  },
  {
    key: "teams",
    label: "Teams",
    icon: (
      <svg viewBox="0 0 24 24" {...stroke}>
        <circle cx="9" cy="8" r="3" />
        <path d="M4 20c0-3 2.5-5 5-5s5 2 5 5M17 11a3 3 0 100-6M20 20c0-2.5-1.5-4.5-4-5" />
      </svg>
    ),
  },
  {
    key: "reports",
    label: "Reports",
    icon: (
      <svg viewBox="0 0 24 24" {...stroke}>
        <path d="M4 4h16v14H4zM4 9h16M9 18v3M15 18v3M7 21h10" />
      </svg>
    ),
  },
];
