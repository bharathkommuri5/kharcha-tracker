import { useNavigate } from "react-router-dom";
import BrandMark from "./BrandMark.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import { UserAvatar } from "./Avatar.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function MobileTopBar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-surface/90 px-4 backdrop-blur lg:hidden">
      <div className="flex items-center gap-2">
        <BrandMark size={26} className="rounded-md" />
        <span className="text-sm font-bold tracking-tight text-fg">Kharcha</span>
      </div>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <button onClick={() => navigate("/app/profile")} aria-label="Profile" className="ml-1">
          <UserAvatar user={user} size={32} />
        </button>
      </div>
    </header>
  );
}
