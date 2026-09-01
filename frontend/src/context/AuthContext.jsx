import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api, { apiErrorMessage, setUnauthorizedHandler, tokenStore } from "../lib/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => tokenStore.get());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(tokenStore.get()));

  const logout = useCallback(() => {
    tokenStore.clear();
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => logout());
  }, [logout]);

  // Hydrate the profile whenever we hold a token but no user yet.
  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .get("/auth/me")
      .then((res) => !cancelled && setUser(res.data))
      .catch(() => !cancelled && logout())
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [token, logout]);

  const completeLogin = useCallback((accessToken, profile) => {
    tokenStore.set(accessToken);
    setToken(accessToken);
    setUser(profile);
  }, []);

  const loginWithGoogle = useCallback(
    async (idToken) => {
      const res = await api.post("/auth/google", { id_token: idToken });
      completeLogin(res.data.access_token, res.data.user);
    },
    [completeLogin]
  );

  const loginDev = useCallback(
    async (email, name) => {
      const res = await api.post("/auth/dev-login", { email, name });
      completeLogin(res.data.access_token, res.data.user);
    },
    [completeLogin]
  );

  const updateUsername = useCallback(async (username) => {
    const res = await api.patch("/auth/me", { username });
    setUser(res.data);
    return res.data;
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token && user),
      loginWithGoogle,
      loginDev,
      updateUsername,
      logout,
      apiErrorMessage,
    }),
    [token, user, loading, loginWithGoogle, loginDev, updateUsername, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
