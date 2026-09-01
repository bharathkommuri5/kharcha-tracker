import { NavLink } from "react-router-dom";
import { Plus } from "../lib/icons.js";
import { UserAvatar, TeamAvatar } from "./Avatar.jsx";
import BrandMark from "./BrandMark.jsx";
import { NAV_ITEMS } from "./navItems.jsx";
import { Button, cn } from "./ui/index.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useTeams } from "../context/TeamsContext.jsx";

const linkClass = ({ isActive }) =>
  cn(
    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
    isActive ? "bg-accent-soft text-accent" : "text-muted hover:bg-surface-2 hover:text-fg"
  );

export default function Sidebar({ onAdd }) {
  const { user } = useAuth();
  const { teams } = useTeams();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-surface lg:flex">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <BrandMark size={30} className="rounded-[7px]" />
        <span className="text-[15px] font-bold tracking-tight text-fg">Kharcha</span>
      </div>

      <div className="px-3">
        <Button className="w-full" onClick={onAdd}>
          <Plus size={16} strokeWidth={2.5} /> Add Expense
        </Button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.key} to={item.to} end={item.to === "/app/teams"} className={linkClass}>
            <item.Icon size={18} strokeWidth={2} />
            {item.label}
          </NavLink>
        ))}

        {teams.length > 0 && (
          <div className="pt-3">
            <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-faint">
              Your teams
            </p>
            {teams.map((t) => (
              <NavLink
                key={t.id}
                to={`/app/teams/${t.id}`}
                className={({ isActive }) =>
                  cn(
                    "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition",
                    isActive
                      ? "bg-accent-soft text-accent"
                      : "text-muted hover:bg-surface-2 hover:text-fg"
                  )
                }
              >
                <TeamAvatar team={t} size={22} />
                <span className="truncate">{t.name}</span>
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      <div className="border-t border-line p-3">
        <NavLink
          to="/app/profile"
          className={({ isActive }) =>
            cn(
              "flex w-full items-center gap-2.5 rounded-xl p-2 text-left transition",
              isActive ? "bg-accent-soft" : "hover:bg-surface-2"
            )
          }
        >
          <UserAvatar user={user} size={36} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-fg">{user?.username}</span>
            <span className="block truncate text-xs text-faint">View profile</span>
          </span>
        </NavLink>
      </div>
    </aside>
  );
}
