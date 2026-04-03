const h = { Accept: "application/json" };

// Helper para pegar o token armazenado no localStorage
function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("jwt_token");
  if (token) return { ...h, Authorization: `Bearer ${token}` };
  return { ...h };
}

// Interceptor global para 401 - limpa token e redireciona
async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const res = await fetch(url, {
    ...options,
    headers: { ...authHeaders(), ...options.headers },
  });
  if (res.status === 401) {
    localStorage.removeItem("jwt_token");
    window.location.href = "/login";
  }
  return res;
}

// ── Auth ──────────────────────────────────────────────────────────────────
export async function apiLogin(login: string, password: string): Promise<Response> {
  return fetch("/api/auth/login", {
    method: "POST",
    headers: { ...h, "Content-Type": "application/json" },
    body: JSON.stringify({ login, senha: password }),
  });
}

// Resposta do /api/auth/me - inclui fornecedorId (empresa vinculada)
export type MeResponse = {
  id: string;
  nome?: string;
  login: string;
  email: string;
  roles: UserRole[];
  fornecedorId?: string | null;
};

export type UserRole = "USER" | "GERENTE";

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
}

// ── Usuário ───────────────────────────────────────────────────────────────
export type Usuario = {
  id: string;
  login: string;
  email: string;
  nome?: string;
  roles: UserRole[];
  fornecedorId?: string | null;
  dataCadastro: string;
  dataAtualizacao: string;
};

export type CadastroPayload = { nome?: string; login: string; senha: string; email: string; fornecedorId?: string };
export type UpdateUsuarioPayload = { nome?: string; login?: string; email?: string; senha?: string };
export type ErroCampo = { message: string; campo: string };
export type ErroResposta = { status: number; message: string; erros: ErroCampo[] };

// Payload para cadastro combinado (empresa + usuário)
export type CadastroCompletoPayload = {
  empresa: {
    cnpj: string;
    razaoSocial: string;
    nomeFantasia?: string;
    email: string;
    telefone?: string;
  };
  usuario: {
    nome?: string;
    login: string;
    email: string;
    senha: string;
  };
};

// Resposta do cadastro completo
export type CadastroCompletoResponse = {
  empresa: Fornecedor;
  usuario: Usuario;
  token: string;
};

// Cadastro público - cria usuário (pode ter fornecedorId para vincular a empresa existente)
export async function apiCadastro(payload: CadastroPayload): Promise<Response> {
  return fetch("/cadastro", {
    method: "POST",
    headers: { ...h, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

// Cadastro combinado: cria empresa + usuário (usuário será GERENTE da empresa)
export async function apiCadastroComEmpresa(payload: CadastroCompletoPayload): Promise<Response> {
  return fetch("/cadastro/empresa-usuario", {
    method: "POST",
    headers: { ...h, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

// Buscar empresa por CNPJ (para verificar se existe)
export async function apiBuscarEmpresaPorCNPJ(cnpj: string): Promise<Fornecedor | null> {
  const cnpjLimpo = cnpj.replace(/\D/g, "");
  const res = await fetch(`/fornecedor/buscar?cnpj=${cnpjLimpo}`, {
    method: "GET",
    headers: h,
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Erro ao buscar empresa");
  return normalizeFornecedor(await res.json());
}

function normalizeUsuario(raw: Record<string, unknown>): Usuario {
  return {
    id: String(raw.id ?? ""),
    login: String(raw.login ?? ""),
    email: String(raw.email ?? ""),
    nome: raw.nome ? String(raw.nome) : undefined,
    roles: Array.isArray(raw.roles) ? raw.roles.map(String) as UserRole[] : [],
    fornecedorId: raw.fornecedorId ? String(raw.fornecedorId) : null,
    dataCadastro: String(raw.dataCadastro ?? raw.dataDeCadastro ?? ""),
    dataAtualizacao: String(raw.dataAtualizacao ?? raw.dataDeAtualizacao ?? ""),
  };
}

// [GERENTE] Lista usuários da empresa paginado
export async function apiListUsuarios(params?: { pagina?: number; tamanhaPagina?: number }): Promise<{ content: Usuario[]; totalElements: number; totalPages: number }> {
  const p = params ?? {};
  const query = new URLSearchParams({
    pagina: String(p.pagina ?? 0),
    "tamanha-pagina": String(p.tamanhaPagina ?? 1000),
  });
  const res = await fetchWithAuth(`/cadastro?${query}`);
  if (!res.ok) throw new Error("Erro ao listar usuários");
  const data = await res.json();
  const items: Record<string, unknown>[] = Array.isArray(data) ? data : (data.content ?? []);
  return {
    content: items.map(normalizeUsuario),
    totalElements: data.totalElements ?? items.length,
    totalPages: data.totalPages ?? 1,
  };
}

// Busca usuário por ID
export async function apiGetUsuario(id: string): Promise<Usuario> {
  const res = await fetchWithAuth(`/cadastro/${id}`);
  if (!res.ok) throw new Error("Erro ao buscar usuário");
  return normalizeUsuario(await res.json());
}

// Atualiza perfil do usuário
export async function apiUpdateUsuario(id: string, payload: UpdateUsuarioPayload): Promise<Response> {
  return fetchWithAuth(`/cadastro/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

// [GERENTE] Remove usuário
export async function apiDeleteUsuario(id: string): Promise<Response> {
  return fetchWithAuth(`/cadastro/${id}`, { method: "DELETE" });
}

// [GERENTE] Altera roles do usuário
export async function apiUpdateUsuarioRoles(id: string, roles: UserRole[]): Promise<Response> {
  return fetchWithAuth(`/cadastro/${id}/roles`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roles }),
  });
}

// [GERENTE] Vincula usuário à empresa (fornecedor)
export async function apiVincularUsuarioEmpresa(usuarioId: string, fornecedorId: string): Promise<Response> {
  return fetchWithAuth(`/cadastro/${usuarioId}/vincular-empresa`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fornecedorId }),
  });
}

// [GERENTE] Aprova usuário pendente na empresa
export async function apiAprovarUsuario(usuarioId: string): Promise<Response> {
  return fetchWithAuth(`/cadastro/${usuarioId}/aprovar`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
  });
}

// [GERENTE] Rejeita usuário pendente
export async function apiRejeitarUsuario(usuarioId: string): Promise<Response> {
  return fetchWithAuth(`/cadastro/${usuarioId}/rejeitar`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
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

// Qualquer usuário autenticado pode criar fornecedor (empresa)
export async function apiCreateFornecedor(payload: FornecedorPayload): Promise<Response> {
  return fetchWithAuth("/fornecedor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

// [GERENTE] Atualiza fornecedor
export async function apiUpdateFornecedor(id: string, payload: FornecedorPayload): Promise<Response> {
  return fetchWithAuth(`/fornecedor/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

// [GERENTE] Vincula fornecedor existente por CNPJ
export async function apiVincularFornecedorCNPJ(id: string, cnpj: string): Promise<Response> {
  return fetchWithAuth(`/fornecedor/${id}/vincular`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cnpj }),
  });
}

// [GERENTE] Remove fornecedor
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
  fornecedorId: string;
};

// Enum de marcas válidas (ajuste conforme API)
export const MARCAS_VALIDAS = ["MARCA_1", "MARCA_2"] as const;
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

// Lista produtos da empresa (usuário deve ter fornecedorId)
export async function apiListEstoque(params?: { pagina?: number; tamanhaPagina?: number; descricao?: string; marca?: string }): Promise<{ content: Produto[]; totalElements: number; totalPages: number }> {
  const p = params ?? {};
  const query = new URLSearchParams({
    pagina: String(p.pagina ?? 0),
    "tamanha-pagina": String(p.tamanhaPagina ?? 1000),
  });
  if (p.descricao) query.set("descricao", p.descricao);
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

// Cria produto (usuário deve ter fornecedorId no token)
export async function apiCreateProduto(payload: ProdutoPayload): Promise<Response> {
  return fetchWithAuth("/api/estoque", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

// Atualiza produto (criador ou GERENTE)
export async function apiUpdateProduto(id: string, payload: ProdutoPayload): Promise<Response> {
  return fetchWithAuth(`/api/estoque/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

// Remove produto (criador ou GERENTE)
export async function apiDeleteProduto(id: string): Promise<Response> {
  return fetchWithAuth(`/api/estoque/${id}`, { method: "DELETE" });
}
