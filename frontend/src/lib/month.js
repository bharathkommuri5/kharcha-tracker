import { isoDate } from "./format.js";

// A "month range" the dashboard operates on. For the current month the end is
// today (month-to-date); for past months it's the last day of that month.
export function monthRange(year, month /* 1-12 */, today = new Date()) {
  const start = new Date(year, month - 1, 1);
  const isCurrent = today.getFullYear() === year && today.getMonth() === month - 1;
  const end = isCurrent ? today : new Date(year, month, 0);
  return { start: isoDate(start), end: isoDate(end), year, month, isCurrent };
}

export function currentMonthRange(today = new Date()) {
  return monthRange(today.getFullYear(), today.getMonth() + 1, today);
}

export function shiftMonth(year, month, delta) {
  const d = new Date(year, month - 1 + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

export function daysInRange(startIso, endIso) {
  const out = [];
  const [sy, sm, sd] = startIso.split("-").map(Number);
  const [ey, em, ed] = endIso.split("-").map(Number);
  const cur = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);
  while (cur <= end) {
    out.push(isoDate(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}
