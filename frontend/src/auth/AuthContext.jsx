import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import * as authApi from "../api/authApi";
import { getToken, registerUnauthorizedHandler, setToken as persistToken } from "../api/axiosClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => getToken());
  const [user, setUser] = useState(null);
  // "booting" = we still need to check whether an existing token is valid.
  const [booting, setBooting] = useState(true);

  const logout = useCallback(() => {
    persistToken(null);
    setTokenState(null);
    setUser(null);
  }, []);

  // If the API ever responds 401, drop the session everywhere.
  useEffect(() => {
    registerUnauthorizedHandler(() => {
      setTokenState(null);
      setUser(null);
    });
  }, []);

  // On first load, if a token is already in storage, validate it by
  // fetching the current user. Keeps the session alive across refreshes.
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const existingToken = getToken();
      if (!existingToken) {
        setBooting(false);
        return;
      }
      try {
        const currentUser = await authApi.fetchCurrentUser();
        if (!cancelled) {
          setUser(currentUser);
        }
      } catch {
        if (!cancelled) {
          persistToken(null);
          setTokenState(null);
        }
      } finally {
        if (!cancelled) setBooting(false);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const { access_token } = await authApi.login({ email, password });
    persistToken(access_token);
    setTokenState(access_token);
    const currentUser = await authApi.fetchCurrentUser();
    setUser(currentUser);
    return currentUser;
  }, []);

  const signup = useCallback(async ({ email, password, fullName }) => {
    await authApi.register({ email, password, fullName });
    // Auto-login right after registering for a smoother onboarding flow.
    return login(email, password);
  }, [login]);

  const value = useMemo(
    () => ({
      token,
      user,
      booting,
      isAuthenticated: Boolean(token),
      login,
      signup,
      logout,
    }),
    [token, user, booting, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
