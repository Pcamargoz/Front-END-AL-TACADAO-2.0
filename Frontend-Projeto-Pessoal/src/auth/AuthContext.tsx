import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { apiLogin, apiLogout, apiMe, type MeResponse, type UserRole, type UserStatus } from "../api/client";

type AuthState = {
  user: MeResponse | null;
  loading: boolean;
  isAuthenticated: boolean;
  isManager: boolean;
  hasCompany: boolean;
  isPendingApproval: boolean;
  empresaId: string | null;
  empresaNome: string | null;
  roles: UserRole[];
  refresh: () => Promise<void>;
  login: (login: string, password: string) => Promise<{ ok: true; status?: UserStatus } | { ok: false; message: string }>;
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
      return { ok: true as const, status: data.status as UserStatus | undefined };
    }
    let message = "Usuário ou senha incorretos";
    try {
      const j = (await res.json()) as { message?: string };
      if (j.message) message = j.message;
      // Se status 403 com "Aguardando aprovação", retorna isso também
      if (res.status === 403 && message.toLowerCase().includes("aguardando")) {
        return { ok: false as const, message };
      }
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
  const empresaId = user?.empresaId ?? null;
  const empresaNome = user?.empresaNome ?? null;
  const hasCompany = !!empresaId;
  
  // Usuário está pendente se:
  // 1. Status é PENDENTE explicitamente
  // 2. OU está autenticado mas não tem empresa aprovada
  const isPendingApproval = isAuthenticated && (user?.status === "PENDENTE" || !hasCompany);

  const value = useMemo(
    () => ({ 
      user, 
      loading, 
      isAuthenticated, 
      isManager,
      hasCompany,
      isPendingApproval,
      empresaId,
      empresaNome,
      roles,
      refresh, 
      login, 
      logout 
    }),
    [user, loading, isAuthenticated, isManager, hasCompany, isPendingApproval, empresaId, empresaNome, roles, refresh, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve estar dentro de AuthProvider");
  return ctx;
}

// Re-export types
export type { UserRole, UserStatus } from "../api/client";
