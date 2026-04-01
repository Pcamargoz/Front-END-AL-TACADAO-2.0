import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { apiLogin, apiLogout, apiMe, type MeResponse } from "../api/client";

type AuthState = {
  user: MeResponse | null;
  loading: boolean;
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
      // Salva o token JWT no localStorage
      if (data.token) {
        localStorage.setItem("jwt_token", data.token);
      }
      // Atualiza o estado do usuário com os dados retornados
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

  const value = useMemo(
    () => ({ user, loading, refresh, login, logout }),
    [user, loading, refresh, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve estar dentro de AuthProvider");
  return ctx;
}
