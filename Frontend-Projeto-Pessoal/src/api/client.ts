const h = { Accept: "application/json" };

// ── Auth ──────────────────────────────────────────────────────────────────
export async function apiLogin(login: string, password: string): Promise<Response> {
  const body = new URLSearchParams();
  body.set("login", login);
  body.set("password", password);
  return fetch("/api/login", {
    method: "POST",
    headers: { ...h, "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
    body: body.toString(),
    credentials: "include",
  });
}

export type MeResponse = { nome?: string; login: string; email: string; roles: string[] };

export async function apiMe(): Promise<MeResponse | null> {
  const res = await fetch("/api/auth/me", { method: "GET", headers: h, credentials: "include" });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error("Falha ao obter sessão");
  return res.json() as Promise<MeResponse>;
}

export async function apiLogout(): Promise<void> {
  await fetch("/api/logout", { method: "POST", headers: h, credentials: "include" });
}

// ── Usuário ───────────────────────────────────────────────────────────────
export type Usuario = {
  id: string;
  login: string;
  email: string;
  nome?: string;
  roles: string[];
  dataCadastro: string;
  dataAtualizacao: string;
};

export type CadastroPayload = { nome?: string; login: string; senha: string; email: string; roles: string[] };
export type UpdateUsuarioPayload = { nome?: string; login: string; email: string; roles: string[] };
export type ErroCampo = { message: string; campo: string };
export type ErroResposta = { status: number; message: string; erros: ErroCampo[] };

export async function apiCadastro(payload: CadastroPayload): Promise<Response> {
  return fetch("/cadastro", {
    method: "POST",
    headers: { ...h, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
}

function normalizeUsuario(raw: Record<string, unknown>): Usuario {
  return {
    id: String(raw.id ?? ""),
    login: String(raw.login ?? ""),
    email: String(raw.email ?? ""),
    nome: raw.nome ? String(raw.nome) : undefined,
    roles: Array.isArray(raw.roles) ? raw.roles.map(String) : [],
    dataCadastro: String(raw.dataCadastro ?? raw.dataDeCadastro ?? ""),
    dataAtualizacao: String(raw.dataAtualizacao ?? raw.dataDeAtualizacao ?? ""),
  };
}

export async function apiListUsuarios(): Promise<Usuario[]> {
  const res = await fetch("/cadastro?tamanha-pagina=1000", { headers: h, credentials: "include" });
  if (!res.ok) throw new Error("Erro ao listar usuários");
  const data = await res.json();
  const items: Record<string, unknown>[] = Array.isArray(data) ? data : (data.content ?? []);
  return items.map(normalizeUsuario);
}

export async function apiUpdateUsuario(id: string, payload: UpdateUsuarioPayload): Promise<Response> {
  return fetch(`/cadastro/${id}`, {
    method: "PUT",
    headers: { ...h, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
}

export async function apiDeleteUsuario(id: string): Promise<Response> {
  return fetch(`/cadastro/${id}`, { method: "DELETE", headers: h, credentials: "include" });
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
export type FornecedorPayload = Omit<Fornecedor, "id" | "dataDeCadastro">;

// A API retorna Page<ResultadoPesquisaFornecedor> com campo "razaosocial" (minúsculo).
// Normalizamos para razaoSocial para manter consistência no frontend.
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

export async function apiListFornecedores(): Promise<Fornecedor[]> {
  const res = await fetch("/fornecedor?tamanha-pagina=1000", { headers: h, credentials: "include" });
  if (!res.ok) throw new Error(`Erro ${res.status} ao listar fornecedores`);
  const data = await res.json();
  // A API pode retornar array direto ou Page<T> do Spring { content: [...] }
  const items: Record<string, unknown>[] = Array.isArray(data) ? data : (data.content ?? []);
  return items.map(normalizeFornecedor);
}

export async function apiCreateFornecedor(payload: FornecedorPayload): Promise<Response> {
  return fetch("/fornecedor", {
    method: "POST",
    headers: { ...h, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
}

export async function apiUpdateFornecedor(id: string, payload: FornecedorPayload): Promise<Response> {
  return fetch(`/fornecedor/${id}`, {
    method: "PUT",
    headers: { ...h, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
}

export async function apiDeleteFornecedor(id: string): Promise<Response> {
  return fetch(`/fornecedor/${id}`, { method: "DELETE", headers: h, credentials: "include" });
}

// ── Estoque (Produto) ─────────────────────────────────────────────────────
export type Produto = {
  id: string;
  descricao: string;
  medida?: number;
  marca?: string;
  fornecedor?: Fornecedor;
  dataDeCadastro?: string;
};

export type ProdutoPayload = {
  descricao: string;
  medida?: number;
  marca: string;
  fornecedorId: string;
};

// ResultadoPesquisaProduto retorna "Descricao" (D maiúsculo) — normalizamos.
function normalizeProduto(raw: Record<string, unknown>): Produto {
  return {
    id: raw.id as string,
    descricao: (raw.Descricao ?? raw.descricao) as string,
    medida: raw.medida as number | undefined,
    marca: raw.marca as string | undefined,
    fornecedor: raw.fornecedor ? normalizeFornecedor(raw.fornecedor as Record<string, unknown>) : undefined,
    dataDeCadastro: raw.dataDeCadastro as string | undefined,
  };
}

export async function apiListEstoque(): Promise<Produto[]> {
  const res = await fetch("/estoque?tamanha-pagina=1000", { headers: h, credentials: "include" });
  if (!res.ok) throw new Error(`Erro ${res.status} ao listar produtos`);
  const data = await res.json();
  // A API pode retornar array direto ou Page<T> do Spring { content: [...] }
  const items: Record<string, unknown>[] = Array.isArray(data) ? data : (data.content ?? []);
  return items.map(normalizeProduto);
}

export async function apiCreateProduto(payload: ProdutoPayload): Promise<Response> {
  return fetch("/estoque", {
    method: "POST",
    headers: { ...h, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
}

export async function apiUpdateProduto(id: string, payload: ProdutoPayload): Promise<Response> {
  return fetch(`/estoque/${id}`, {
    method: "PUT",
    headers: { ...h, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
}

export async function apiDeleteProduto(id: string): Promise<Response> {
  return fetch(`/estoque/${id}`, { method: "DELETE", headers: h, credentials: "include" });
}
