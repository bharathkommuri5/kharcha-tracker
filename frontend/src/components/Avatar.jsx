import { cn } from "./ui/index.jsx";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

function resolve(url) {
  if (!url) return null;
  return url.startsWith("http") ? url : API + url;
}

function initials(name) {
  const parts = (name || "?").trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || parts[0]?.[1] || "")).toUpperCase() || "?";
}

// Round avatar for a user (image or initials).
export function UserAvatar({ user, size = 32, className }) {
  const src = resolve(user?.avatar_url);
  const s = { width: size, height: size };
  if (src) {
    return (
      <img
        src={src}
        alt={user?.name || "avatar"}
        style={s}
        className={cn("shrink-0 rounded-full object-cover", className)}
      />
    );
  }
  return (
    <span
      style={{ ...s, fontSize: Math.max(10, size * 0.38) }}
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-accent-soft font-bold text-accent",
        className
      )}
    >
      {initials(user?.username || user?.name)}
    </span>
  );
}

// Rounded-square avatar for a team.
export function TeamAvatar({ team, size = 32, className }) {
  const src = resolve(team?.avatar_url);
  const s = { width: size, height: size };
  if (src) {
    return (
      <img
        src={src}
        alt={team?.name || "team"}
        style={s}
        className={cn("shrink-0 rounded-xl object-cover", className)}
      />
    );
  }
  return (
    <span
      style={{ ...s, fontSize: Math.max(10, size * 0.4) }}
      className={cn(
        "grid shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 font-bold text-white",
        className
      )}
    >
      {initials(team?.name)}
    </span>
  );
}
