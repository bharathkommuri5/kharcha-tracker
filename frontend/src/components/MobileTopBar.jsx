import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import BrandMark from "./BrandMark.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

export default function MobileTopBar() {
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
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-surface/90 px-4 backdrop-blur lg:hidden">
      <div className="flex items-center gap-2">
        <BrandMark size={26} className="rounded-md" />
        <span className="text-sm font-bold tracking-tight text-fg">Kharcha</span>
      </div>
      <div className="flex items-center gap-1" ref={ref}>
        <ThemeToggle />
        <div className="relative">
          <button
            onClick={() => setOpen((o) => !o)}
            className="grid h-9 w-9 place-items-center rounded-full bg-accent-soft text-xs font-bold text-accent"
          >
            {initials}
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-52 animate-scale-in rounded-xl bg-surface p-1 shadow-pop ring-1 ring-line">
              <div className="px-3 py-2">
                <p className="truncate text-sm font-semibold text-fg">{user?.name}</p>
                <p className="truncate text-xs text-faint">{user?.email}</p>
              </div>
              <div className="my-1 h-px bg-line" />
              <button
                onClick={logout}
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-muted hover:bg-surface-2 hover:text-fg"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
