import { useEffect, useState } from "react";
import api from "../lib/api.js";
import { Search } from "../lib/icons.js";
import { UserAvatar } from "./Avatar.jsx";
import { Spinner } from "./ui/index.jsx";

// Search the user directory (super-admin only) and pick someone to add.
export default function MemberPicker({ existingIds = [], onPick }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    const id = setTimeout(() => {
      api
        .get("/users", { params: { q: q || undefined, limit: 20 } })
        .then((r) => !cancel && setResults(r.data))
        .catch(() => !cancel && setResults([]))
        .finally(() => !cancel && setLoading(false));
    }, 250);
    return () => {
      cancel = true;
      clearTimeout(id);
    };
  }, [q]);

  const set = new Set(existingIds);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint"
        />
        <input
          placeholder="Search people by name or email…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoFocus
          className="block w-full rounded-xl border-0 bg-surface py-2.5 pl-9 pr-3 text-sm text-fg ring-1 ring-inset ring-line placeholder:text-faint focus:ring-2 focus:ring-inset focus:ring-accent"
        />
      </div>
      <div className="max-h-64 overflow-y-auto rounded-xl border border-line">
        {loading && (
          <div className="flex justify-center py-6 text-faint">
            <Spinner className="h-5 w-5" />
          </div>
        )}
        {!loading && results.length === 0 && (
          <p className="py-6 text-center text-sm text-faint">No matching users</p>
        )}
        {!loading &&
          results.map((u) => {
            const already = set.has(u.id);
            return (
              <button
                key={u.id}
                disabled={already}
                onClick={() => onPick(u)}
                className="flex w-full items-center gap-3 px-3 py-2 text-left transition hover:bg-surface-2 disabled:opacity-40"
              >
                <UserAvatar user={u} size={32} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-fg">{u.name}</span>
                  <span className="block truncate text-xs text-faint">{u.email}</span>
                </span>
                {already ? (
                  <span className="text-xs text-faint">Added</span>
                ) : (
                  <span className="text-xs font-semibold text-accent">Add</span>
                )}
              </button>
            );
          })}
      </div>
    </div>
  );
}
