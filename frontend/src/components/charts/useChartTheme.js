import { useTheme } from "../../context/ThemeContext.jsx";

// Recharts needs concrete colours, not CSS vars — derive them from the theme.
export function useChartTheme() {
  const { isDark } = useTheme();
  return isDark
    ? {
        grid: "#27324a",
        axis: "#96a0b9",
        tooltipBg: "#121624",
        tooltipBorder: "#27324a",
        tooltipText: "#e9edf7",
        accent: "#818cf8",
        accentFade: "#818cf8",
      }
    : {
        grid: "#eef2f7",
        axis: "#5a6478",
        tooltipBg: "#ffffff",
        tooltipBorder: "#e2e8f0",
        tooltipText: "#111827",
        accent: "#4f46e5",
        accentFade: "#6366f1",
      };
}

export function tooltipStyle(t) {
  return {
    contentStyle: {
      background: t.tooltipBg,
      border: `1px solid ${t.tooltipBorder}`,
      borderRadius: 12,
      fontSize: 12,
      color: t.tooltipText,
      boxShadow: "0 8px 24px -8px rgba(0,0,0,0.25)",
    },
    labelStyle: { color: t.tooltipText, fontWeight: 600 },
    itemStyle: { color: t.tooltipText },
  };
}
