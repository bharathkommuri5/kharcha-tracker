import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import BrandMark from "./BrandMark.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import { NAV_ITEMS } from "./navItems.jsx";
import { Button, cn } from "./ui/index.jsx";

function UserRow() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const initials = (user?.username || user?.name || "?").slice(0, 2).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2.5 rounded-xl p-2 text-left transition hover:bg-surface-2"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent-soft text-xs font-bold text-accent">
          {initials}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-fg">{user?.username}</span>
          <span className="block truncate text-xs text-faint">{user?.email}</span>
        </span>
      </button>
      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-full animate-scale-in rounded-xl bg-surface p-1 shadow-pop ring-1 ring-line">
          <button
            onClick={logout}
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-muted transition hover:bg-surface-2 hover:text-fg"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ view, onView, onAdd }) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-surface lg:flex">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <BrandMark size={30} className="rounded-[7px]" />
        <span className="text-[15px] font-bold tracking-tight text-fg">Kharcha</span>
      </div>

      <div className="px-3">
        <Button className="w-full" onClick={onAdd}>
          <span className="text-base leading-none">＋</span> Add Expense
        </Button>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            onClick={() => onView(item.key)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              view === item.key
                ? "bg-accent-soft text-accent"
                : "text-muted hover:bg-surface-2 hover:text-fg"
            )}
          >
            <span className="h-[18px] w-[18px]">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="space-y-1 border-t border-line p-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-medium text-faint">Appearance</span>
          <ThemeToggle />
        </div>
        <UserRow />
      </div>
    </aside>
  );
}
