import { useState } from "react";
import { Outlet } from "react-router-dom";
import AddExpenseModal from "../components/AddExpenseModal.jsx";
import BottomNav from "../components/BottomNav.jsx";
import MobileTopBar from "../components/MobileTopBar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import UsernamePrompt from "../components/UsernamePrompt.jsx";
import { DashboardProvider } from "../context/DashboardContext.jsx";
import { TeamsProvider } from "../context/TeamsContext.jsx";

function Shell() {
  const [add, setAdd] = useState(null); // null = closed | {} = open | {category} = prefilled

  const openAdd = (preset) => setAdd(preset && preset.category ? preset : {});

  return (
    <div className="flex h-full bg-bg">
      <Sidebar onAdd={() => openAdd()} />

      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopBar />
        <div className="hidden h-14 shrink-0 items-center justify-end border-b border-line bg-surface/60 px-6 backdrop-blur lg:flex">
          <ThemeToggle />
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:px-8">
            <Outlet context={{ openAdd }} />
          </div>
        </main>

        <BottomNav onAdd={() => openAdd()} />
      </div>

      <AddExpenseModal open={add !== null} onClose={() => setAdd(null)} preset={add || undefined} />
      <UsernamePrompt />
    </div>
  );
}

export default function AppLayout() {
  return (
    <DashboardProvider>
      <TeamsProvider>
        <Shell />
      </TeamsProvider>
    </DashboardProvider>
  );
}
