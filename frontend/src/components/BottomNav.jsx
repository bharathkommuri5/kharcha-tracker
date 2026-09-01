import { Plus } from "../lib/icons.js";
import { NAV_ITEMS } from "./navItems.jsx";
import { cn } from "./ui/index.jsx";

export default function BottomNav({ view, onView, onAdd }) {
  return (
    <nav className="sticky bottom-0 z-30 flex items-stretch border-t border-line bg-surface/95 backdrop-blur lg:hidden">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.key}
          onClick={() => onView(item.key)}
          className={cn(
            "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition",
            view === item.key || (view === "team" && item.key === "teams")
              ? "text-accent"
              : "text-faint"
          )}
        >
          <item.Icon size={20} strokeWidth={2} />
          {item.label}
        </button>
      ))}
      <button
        onClick={onAdd}
        className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-semibold text-accent"
      >
        <span className="grid h-6 w-6 place-items-center rounded-full bg-accent text-accent-fg">
          <Plus size={16} strokeWidth={2.5} />
        </span>
        Add
      </button>
    </nav>
  );
}
