import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { apiLogin, apiLogout, apiMe, type MeResponse } from "../api/client";

export type UserRole = "GERENTE" | "FUNCIONARIO" | "ESTAGIARIO";

type AuthState = {
  user: MeResponse | null;
  loading: boolean;
  isAuthenticated: boolean;
  isManager: boolean;
  isEmployee: boolean;
  role: UserRole | null;
  refresh: () => Promise<void>;
  login: (login: string, password: string) => Promise<{ ok: true } | { ok: false; message: string }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const me = await apiMe();
      setUser(me);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(async (loginValue: string, password: string) => {
    const res = await apiLogin(loginValue, password);
    if (res.ok) {
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("jwt_token", data.token);
      }
      setUser({
        nome: data.nome,
        login: data.login,
        email: data.email,
        roles: data.roles ?? [],
      });
      return { ok: true as const };
    }
    let message = "Usuário ou senha incorretos";
    try {
      const j = (await res.json()) as { message?: string };
      if (j.message) message = j.message;
    } catch {
      /* ignore */
    }
    return { ok: false as const, message };
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  const role = (user?.roles?.[0] as UserRole) || null;
  const isAuthenticated = !!user;
  const isManager = role === "GERENTE";
  const isEmployee = role === "FUNCIONARIO" || role === "ESTAGIARIO";

  const value = useMemo(
    () => ({ 
      user, 
      loading, 
      isAuthenticated, 
      isManager, 
      isEmployee, 
      role,
      refresh, 
      login, 
      logout 
    }),
    [user, loading, isAuthenticated, isManager, isEmployee, role, refresh, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve estar dentro de AuthProvider");
  return ctx;
}
