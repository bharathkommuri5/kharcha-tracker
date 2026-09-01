import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../lib/api.js";
import { useAuth } from "./AuthContext.jsx";

const TeamsContext = createContext(null);

export function TeamsProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await api.get("/teams");
      setTeams(res.data);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createTeam = useCallback(
    async (name) => {
      const res = await api.post("/teams", { name });
      await refresh();
      return res.data;
    },
    [refresh]
  );

  const value = useMemo(
    () => ({ teams, loading, refresh, createTeam }),
    [teams, loading, refresh, createTeam]
  );

  return <TeamsContext.Provider value={value}>{children}</TeamsContext.Provider>;
}

export function useTeams() {
  const ctx = useContext(TeamsContext);
  if (!ctx) throw new Error("useTeams must be used within TeamsProvider");
  return ctx;
}
