import { useOutletContext } from "react-router-dom";
import CategoryBreakdown from "../components/CategoryBreakdown.jsx";
import HeroBalance from "../components/HeroBalance.jsx";
import MonthNav from "../components/MonthNav.jsx";
import QuickAddTiles from "../components/QuickAddTiles.jsx";
import CategoryDonut from "../components/charts/CategoryDonut.jsx";
import DailyTrend from "../components/charts/DailyTrend.jsx";
import PaymentBar from "../components/charts/PaymentBar.jsx";
import { useDashboard } from "../context/DashboardContext.jsx";
import { Card, EmptyState } from "../components/ui/index.jsx";

export default function OverviewView() {
  const { openAdd } = useOutletContext();
  const { summary, options, range, loading } = useDashboard();
  const empty = summary && summary.transaction_count === 0 && !loading;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-fg">Overview</h1>
        <MonthNav />
      </div>

      <HeroBalance summary={summary} range={range} />

      <QuickAddTiles onPick={openAdd} />

      {empty ? (
        <Card>
          <EmptyState icon="🌱" title="No expenses yet this month">
            <span className="block">Tap a category above or “Add Expense” to get started.</span>
          </EmptyState>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <CategoryDonut summary={summary} options={options} />
            <CategoryBreakdown summary={summary} options={options} />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <PaymentBar summary={summary} />
            <DailyTrend summary={summary} />
          </div>
        </>
      )}
    </div>
  );
}
