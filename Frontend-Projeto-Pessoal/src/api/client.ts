const h = { Accept: "application/json" };

// Helper para pegar o token armazenado no localStorage
function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("jwt_token");
  if (token) return { ...h, Authorization: `Bearer ${token}` };
  return { ...h };
}

// Helper para pegar o fornecedor token do sessionStorage
function fornecedorHeaders(): Record<string, string> {
  const fToken = sessionStorage.getItem("fornecedor_token");
  if (fToken) return { "X-Fornecedor-Token": fToken };
  return {};
}

// Interceptor global para 401 - limpa token e redireciona
async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const res = await fetch(url, {
    ...options,
    headers: { ...authHeaders(), ...fornecedorHeaders(), ...options.headers },
  });
  if (res.status === 401) {
    localStorage.removeItem("jwt_token");
    sessionStorage.removeItem("fornecedor_token");
    sessionStorage.removeItem("fornecedor_data");
    window.location.href = "/login";
  }
  return res;
}

// ══════════════════════════════════════════════════════════════════════════════
// TYPES - AUTH
// ══════════════════════════════════════════════════════════════════════════════

export type UserRole = "USUARIO" | "ADMIN";
export type UserStatus = "ATIVO" | "PENDENTE" | "INATIVO";

// Resposta do /api/auth/me
export type MeResponse = {
  userId: string;
  nome?: string;
  login: string;
  email: string;
  roles: UserRole[];
  status?: UserStatus;
};

// Resposta do login
export type LoginResponse = {
  token: string;
  nome?: string;
  login: string;
  email: string;
  roles: UserRole[];
};

// ══════════════════════════════════════════════════════════════════════════════
// AUTH ENDPOINTS
// ══════════════════════════════════════════════════════════════════════════════

// POST /api/auth/login
export async function apiLogin(login: string, password: string): Promise<Response> {
  return fetch("/api/auth/login", {
    method: "POST",
    headers: { ...h, "Content-Type": "application/json" },
    body: JSON.stringify({ login, senha: password }),
  });
}

// GET /api/auth/me
export async function apiMe(): Promise<MeResponse | null> {
  const token = localStorage.getItem("jwt_token");
  if (!token) return null;
  const res = await fetch("/api/auth/me", { method: "GET", headers: authHeaders() });
  if (res.status === 401) {
    localStorage.removeItem("jwt_token");
    return null;
  }
  if (!res.ok) throw new Error("Falha ao obter sessão");
  return res.json() as Promise<MeResponse>;
}

export async function apiLogout(): Promise<void> {
  localStorage.removeItem("jwt_token");
  sessionStorage.removeItem("fornecedor_token");
  sessionStorage.removeItem("fornecedor_data");
}

// ══════════════════════════════════════════════════════════════════════════════
// USUÁRIO TYPES & ENDPOINTS
// ══════════════════════════════════════════════════════════════════════════════

// Payload para auto-registro (simples)
export type SolicitarCadastroPayload = {
  nome: string;
  login: string;
  senha: string;
  email: string;
};

// Resposta do registro
export type CadastroResponse = {
  id: string;
  nome: string;
  login: string;
  email: string;
  roles: UserRole[];
  status: UserStatus;
};

export type ErroCampo = { message: string; campo: string };
export type ErroResposta = { status: number; message: string; erros?: ErroCampo[] };

// POST /cadastro/solicitar - Auto-registro de usuario (público)
export async function apiSolicitarCadastro(payload: SolicitarCadastroPayload): Promise<Response> {
  return fetch("/cadastro/solicitar", {
    method: "POST",
    headers: { ...h, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

// ── Fornecedor ────────────────────────────────────────────────────────────
export type Fornecedor = {
  id: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string;
  email: string;
  telefone?: string;
  dataDeCadastro?: string;
};

export type FornecedorPayload = Omit<Fornecedor, "id" | "dataDeCadastro"> & {
  senhaAcesso?: string;
};

export type FornecedorRole = "GERENTE" | "FUNCIONARIO";

export type ValidarAcessoResponse = {
  fornecedorToken: string;
  fornecedorNome: string;
  role: FornecedorRole;
};

// A API retorna Page<ResultadoPesquisaFornecedor> com campo "razaosocial" (minúsculo).
function normalizeFornecedor(raw: Record<string, unknown>): Fornecedor {
  return {
    id: raw.id as string,
    cnpj: raw.cnpj as string,
    razaoSocial: (raw.razaosocial ?? raw.razaoSocial) as string,
    nomeFantasia: raw.nomeFantasia as string | undefined,
    email: raw.email as string,
    telefone: raw.telefone as string | undefined,
    dataDeCadastro: raw.dataDeCadastro as string | undefined,
  };
}

// GET /fornecedor - qualquer usuario logado
export async function apiListFornecedores(): Promise<Fornecedor[]> {
  const res = await fetchWithAuth("/fornecedor?tamanha-pagina=1000");
  if (!res.ok) throw new Error(`Erro ${res.status} ao listar fornecedores`);
  const data = await res.json();
  const items: Record<string, unknown>[] = Array.isArray(data) ? data : (data.content ?? []);
  return items.map(normalizeFornecedor);
}

// Busca fornecedor por ID
export async function apiGetFornecedor(id: string): Promise<Fornecedor> {
  const res = await fetchWithAuth(`/fornecedor/${id}`);
  if (!res.ok) throw new Error("Erro ao buscar fornecedor");
  return normalizeFornecedor(await res.json());
}

// POST /fornecedor - cria fornecedor (inclui senhaAcesso)
export async function apiCreateFornecedor(payload: FornecedorPayload): Promise<Response> {
  return fetchWithAuth("/fornecedor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

// POST /fornecedor/{id}/validar-acesso - valida senha e retorna fornecedor token
export async function apiValidarAcessoFornecedor(id: string, senha: string): Promise<Response> {
  return fetchWithAuth(`/fornecedor/${id}/validar-acesso`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ senha }),
  });
}

// PUT /fornecedor/{id} - requer X-Fornecedor-Token com GERENTE
export async function apiUpdateFornecedor(id: string, payload: FornecedorPayload): Promise<Response> {
  return fetchWithAuth(`/fornecedor/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

// DELETE /fornecedor/{id} - requer X-Fornecedor-Token com GERENTE
export async function apiDeleteFornecedor(id: string): Promise<Response> {
  return fetchWithAuth(`/fornecedor/${id}`, { method: "DELETE" });
}

// ── Estoque (Produto) ─────────────────────────────────────────────────────
export type Produto = {
  id: string;
  descricao: string;
  sabor?: string;
  medida?: number;
  marca?: string;
  fornecedor?: Fornecedor;
  dataDeCadastro?: string;
};

export type ProdutoPayload = {
  descricao: string;
  sabor?: string;
  medida?: number;
  marca: string;
  fornecedorId?: string;
};

// Enum de marcas válidas conforme API backend
export const MARCAS_VALIDAS = [
  "GROWTH_SUPPLEMENTS",
  "MAX_TITANIUM",
  "INTEGRAL_MEDICA",
  "PROBIOTICA",
  "DUX_NUTRITION",
  "ATLHETICA_NUTRITION",
  "BLACK_SKULL",
  "VITAFOR",
  "OPTIMUM_NUTRITION",
  "MYPROTEIN",
  "UNIVERSAL_NUTRITION",
  "BSN",
] as const;
export type MarcaValida = typeof MARCAS_VALIDAS[number];

// ResultadoPesquisaProduto retorna "Descricao" (D maiúsculo) — normalizamos.
function normalizeProduto(raw: Record<string, unknown>): Produto {
  return {
    id: raw.id as string,
    descricao: (raw.Descricao ?? raw.descricao) as string,
    sabor: raw.sabor as string | undefined,
    medida: raw.medida as number | undefined,
    marca: raw.marca as string | undefined,
    fornecedor: raw.fornecedor ? normalizeFornecedor(raw.fornecedor as Record<string, unknown>) : undefined,
    dataDeCadastro: raw.dataDeCadastro as string | undefined,
  };
}

// Lista produtos (requer X-Fornecedor-Token)
export async function apiListEstoque(params?: { pagina?: number; tamanhaPagina?: number; descricao?: string; medida?: number; marca?: string }): Promise<{ content: Produto[]; totalElements: number; totalPages: number }> {
  const p = params ?? {};
  const query = new URLSearchParams({
    pagina: String(p.pagina ?? 0),
    "tamanha-pagina": String(p.tamanhaPagina ?? 1000),
  });
  if (p.descricao) query.set("descricao", p.descricao);
  if (p.medida != null) query.set("medida", String(p.medida));
  if (p.marca) query.set("marca", p.marca);

  const res = await fetchWithAuth(`/api/estoque?${query}`);
  if (!res.ok) throw new Error(`Erro ${res.status} ao listar produtos`);
  const data = await res.json();
  const items: Record<string, unknown>[] = Array.isArray(data) ? data : (data.content ?? []);
  return {
    content: items.map(normalizeProduto),
    totalElements: data.totalElements ?? items.length,
    totalPages: data.totalPages ?? 1,
  };
}

// Busca produto por ID
export async function apiGetProduto(id: string): Promise<Produto> {
  const res = await fetchWithAuth(`/api/estoque/${id}`);
  if (!res.ok) throw new Error("Erro ao buscar produto");
  return normalizeProduto(await res.json());
}

// Cria produto (requer X-Fornecedor-Token)
export async function apiCreateProduto(payload: ProdutoPayload): Promise<Response> {
  return fetchWithAuth("/api/estoque", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

// Atualiza produto (requer X-Fornecedor-Token + GERENTE)
export async function apiUpdateProduto(id: string, payload: ProdutoPayload): Promise<Response> {
  return fetchWithAuth(`/api/estoque/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

// Remove produto (requer X-Fornecedor-Token + GERENTE)
export async function apiDeleteProduto(id: string): Promise<Response> {
  return fetchWithAuth(`/api/estoque/${id}`, { method: "DELETE" });
}
