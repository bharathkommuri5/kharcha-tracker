import { ArrowLeftRight, LayoutGrid, Receipt, Users } from "../lib/icons.js";

export const NAV_ITEMS = [
  { key: "overview", label: "Overview", to: "/app/overview", Icon: LayoutGrid },
  { key: "transactions", label: "Transactions", to: "/app/transactions", Icon: ArrowLeftRight },
  { key: "teams", label: "Teams", to: "/app/teams", Icon: Users },
  { key: "reports", label: "Reports", to: "/app/reports", Icon: Receipt },
];
