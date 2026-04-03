import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { apiLogin, apiLogout, apiMe, type MeResponse, type UserRole } from "../api/client";

type AuthState = {
  user: MeResponse | null;
  loading: boolean;
  isAuthenticated: boolean;
  isManager: boolean;
  hasCompany: boolean;
  isPendingApproval: boolean;
  roles: UserRole[];
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
      // Busca dados completos do usuário via /me após login
      await refresh();
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
  }, [refresh]);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  const roles = user?.roles ?? [];
  const isAuthenticated = !!user;
  const isManager = roles.includes("GERENTE");
  const hasCompany = !!user?.fornecedorId;
  // Usuário está pendente se está autenticado mas não tem empresa aprovada
  const isPendingApproval = isAuthenticated && !hasCompany;

  const value = useMemo(
    () => ({ 
      user, 
      loading, 
      isAuthenticated, 
      isManager,
      hasCompany,
      isPendingApproval,
      roles,
      refresh, 
      login, 
      logout 
    }),
    [user, loading, isAuthenticated, isManager, hasCompany, isPendingApproval, roles, refresh, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve estar dentro de AuthProvider");
  return ctx;
}

// Re-export types
export type { UserRole } from "../api/client";
