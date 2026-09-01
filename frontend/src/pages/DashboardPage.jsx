import { useState } from "react";
import AddExpenseModal from "../components/AddExpenseModal.jsx";
import BottomNav from "../components/BottomNav.jsx";
import MobileTopBar from "../components/MobileTopBar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import UsernamePrompt from "../components/UsernamePrompt.jsx";
import { DashboardProvider } from "../context/DashboardContext.jsx";
import { TeamsProvider } from "../context/TeamsContext.jsx";
import OverviewView from "../views/OverviewView.jsx";
import ProfileView from "../views/ProfileView.jsx";
import ReportsView from "../views/ReportsView.jsx";
import TeamsListView from "../views/TeamsListView.jsx";
import TeamView from "../views/TeamView.jsx";
import TransactionsView from "../views/TransactionsView.jsx";

function Dashboard() {
  const [view, setView] = useState("overview");
  const [activeTeamId, setActiveTeamId] = useState(null);
  const [add, setAdd] = useState(null); // null | {} | {category}

  const openAdd = (preset) => setAdd(preset && preset.category ? preset : {});
  const openTeam = (id) => {
    setActiveTeamId(id);
    setView("team");
  };
  const goView = (v) => {
    setActiveTeamId(null);
    setView(v);
  };

  return (
    <div className="flex h-full bg-bg">
      <Sidebar
        view={view}
        activeTeamId={activeTeamId}
        onView={goView}
        onOpenTeam={openTeam}
        onAdd={() => openAdd()}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopBar onProfile={() => goView("profile")} />
        {/* desktop top bar: theme toggle lives top-right */}
        <div className="hidden h-14 shrink-0 items-center justify-end border-b border-line bg-surface/60 px-6 backdrop-blur lg:flex">
          <ThemeToggle />
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:px-8">
            {view === "overview" && <OverviewView onAdd={openAdd} />}
            {view === "transactions" && <TransactionsView onAdd={openAdd} />}
            {view === "teams" && <TeamsListView onOpenTeam={openTeam} />}
            {view === "reports" && <ReportsView />}
            {view === "profile" && <ProfileView />}
            {view === "team" && activeTeamId != null && (
              <TeamView teamId={activeTeamId} onLeave={() => goView("teams")} />
            )}
          </div>
        </main>

        <BottomNav view={view} onView={goView} onAdd={() => openAdd()} />
      </div>

      <AddExpenseModal open={add !== null} onClose={() => setAdd(null)} preset={add || undefined} />
      <UsernamePrompt />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <DashboardProvider>
      <TeamsProvider>
        <Dashboard />
      </TeamsProvider>
    </DashboardProvider>
  );
}
