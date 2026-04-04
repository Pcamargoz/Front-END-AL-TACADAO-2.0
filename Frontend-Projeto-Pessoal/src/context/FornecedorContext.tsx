import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { FornecedorRole } from "../api/client";

type FornecedorData = {
  fornecedorToken: string;
  fornecedorId: string;
  role: FornecedorRole;
  nome: string;
};

type FornecedorState = {
  fornecedorToken: string | null;
  fornecedorId: string | null;
  role: FornecedorRole | null;
  nome: string | null;
  isInsideFornecedor: boolean;
  isGerente: boolean;
  entrarFornecedor: (data: FornecedorData) => void;
  sairFornecedor: () => void;
};

const STORAGE_TOKEN_KEY = "fornecedor_token";
const STORAGE_DATA_KEY = "fornecedor_data";

function loadFromSession(): FornecedorData | null {
  try {
    const token = sessionStorage.getItem(STORAGE_TOKEN_KEY);
    const raw = sessionStorage.getItem(STORAGE_DATA_KEY);
    if (!token || !raw) return null;
    const data = JSON.parse(raw) as Omit<FornecedorData, "fornecedorToken">;
    return { fornecedorToken: token, ...data };
  } catch {
    return null;
  }
}

function saveToSession(data: FornecedorData) {
  sessionStorage.setItem(STORAGE_TOKEN_KEY, data.fornecedorToken);
  sessionStorage.setItem(STORAGE_DATA_KEY, JSON.stringify({
    fornecedorId: data.fornecedorId,
    role: data.role,
    nome: data.nome,
  }));
}

function clearSession() {
  sessionStorage.removeItem(STORAGE_TOKEN_KEY);
  sessionStorage.removeItem(STORAGE_DATA_KEY);
}

const FornecedorContext = createContext<FornecedorState | null>(null);

export function FornecedorProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<FornecedorData | null>(loadFromSession);

  const entrarFornecedor = useCallback((d: FornecedorData) => {
    saveToSession(d);
    setData(d);
  }, []);

  const sairFornecedor = useCallback(() => {
    clearSession();
    setData(null);
  }, []);

  const value = useMemo(
    () => ({
      fornecedorToken: data?.fornecedorToken ?? null,
      fornecedorId: data?.fornecedorId ?? null,
      role: data?.role ?? null,
      nome: data?.nome ?? null,
      isInsideFornecedor: !!data,
      isGerente: data?.role === "GERENTE",
      entrarFornecedor,
      sairFornecedor,
    }),
    [data, entrarFornecedor, sairFornecedor],
  );

  return (
    <FornecedorContext.Provider value={value}>
      {children}
    </FornecedorContext.Provider>
  );
}

export function useFornecedor(): FornecedorState {
  const ctx = useContext(FornecedorContext);
  if (!ctx) throw new Error("useFornecedor deve estar dentro de FornecedorProvider");
  return ctx;
}
