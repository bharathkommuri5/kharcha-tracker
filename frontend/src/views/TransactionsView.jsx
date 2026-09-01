import { useOutletContext } from "react-router-dom";
import MonthNav from "../components/MonthNav.jsx";
import TransactionList from "../components/TransactionList.jsx";
import { useDashboard } from "../context/DashboardContext.jsx";
import { formatINR } from "../lib/format.js";
import { Card } from "../components/ui/index.jsx";

export default function TransactionsView() {
  const { openAdd } = useOutletContext();
  const { summary, transactions } = useDashboard();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-fg">Transactions</h1>
        <MonthNav />
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-faint">This month</p>
            <p className="text-lg font-bold tabular-nums text-fg">{formatINR(summary?.total ?? 0)}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-faint">Entries</p>
            <p className="text-lg font-bold tabular-nums text-fg">{transactions.length}</p>
          </div>
        </div>
        <TransactionList onAddExpense={() => openAdd()} />
      </Card>
    </div>
  );
}
