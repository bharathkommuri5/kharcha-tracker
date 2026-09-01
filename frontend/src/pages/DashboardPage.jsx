import { useState } from "react";
import AddExpenseModal from "../components/AddExpenseModal.jsx";
import BottomNav from "../components/BottomNav.jsx";
import MobileTopBar from "../components/MobileTopBar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import UsernamePrompt from "../components/UsernamePrompt.jsx";
import { DashboardProvider } from "../context/DashboardContext.jsx";
import OverviewView from "../views/OverviewView.jsx";
import ReportsView from "../views/ReportsView.jsx";
import TransactionsView from "../views/TransactionsView.jsx";

function Dashboard() {
  const [view, setView] = useState("overview");
  const [add, setAdd] = useState(null); // null | {} | {category}

  const openAdd = (preset) => setAdd(preset && preset.category ? preset : {});

  return (
    <div className="flex h-full bg-bg">
      <Sidebar view={view} onView={setView} onAdd={() => openAdd()} />

      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopBar />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:px-8">
            {view === "overview" && <OverviewView onAdd={openAdd} />}
            {view === "transactions" && <TransactionsView onAdd={openAdd} />}
            {view === "reports" && <ReportsView />}
          </div>
        </main>
        <BottomNav view={view} onView={setView} onAdd={() => openAdd()} />
      </div>

      <AddExpenseModal open={add !== null} onClose={() => setAdd(null)} preset={add || undefined} />
      <UsernamePrompt />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <DashboardProvider>
      <Dashboard />
    </DashboardProvider>
  );
}
