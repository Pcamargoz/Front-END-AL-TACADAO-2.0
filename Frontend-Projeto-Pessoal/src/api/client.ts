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

// ══════════════════════════════════════════════════════════════════════════════
// TYPES - EMPRESA
// ══════════════════════════════════════════════════════════════════════════════

export type Empresa = {
  id: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string;
  email: string;
  telefone?: string;
  dataCadastro?: string;
};

export type EmpresaPayload = Omit<Empresa, "id" | "dataCadastro">;

export type UserRole = "USER" | "GERENTE";
export type UserStatus = "ATIVO" | "PENDENTE" | "INATIVO";

// ══════════════════════════════════════════════════════════════════════════════
// TYPES - AUTH
// ══════════════════════════════════════════════════════════════════════════════

// Resposta do /api/auth/me - inclui empresaId
export type MeResponse = {
  id: string;
  nome?: string;
  login: string;
  email: string;
  roles: UserRole[];
  empresaId?: string | null;
  empresaNome?: string;
  status?: UserStatus;
};

// Resposta do login
export type LoginResponse = {
  token: string;
  nome?: string;
  login: string;
  email: string;
  roles: UserRole[];
  empresaId?: string | null;
  empresaNome?: string;
  status?: UserStatus;
};

// ══════════════════════════════════════════════════════════════════════════════
// AUTH ENDPOINTS
// ══════════════════════════════════════════════════════════════════════════════

export async function apiLogin(login: string, password: string): Promise<Response> {
  return fetch("/api/auth/login", {
    method: "POST",
    headers: { ...h, "Content-Type": "application/json" },
    body: JSON.stringify({ login, senha: password }),
  });
}

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

// ══════════════════════════════════════════════════════════════════════════════
// EMPRESA ENDPOINTS
// ══════════════════════════════════════════════════════════════════════════════

// Payload para registrar empresa + gerente
export type RegistrarEmpresaPayload = {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string;
  email: string;
  telefone?: string;
  nomeUsuario?: string;
  loginUsuario: string;
  senhaUsuario: string;
  emailUsuario: string;
};

// Resposta do registro de empresa
export type RegistrarEmpresaResponse = {
  empresa: Empresa;
  usuario: Usuario;
  token: string;
};

// POST /api/empresa/registrar - Cria empresa + primeiro gerente (público)
export async function apiRegistrarEmpresa(payload: RegistrarEmpresaPayload): Promise<Response> {
  return fetch("/api/empresa/registrar", {
    method: "POST",
    headers: { ...h, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

// GET /api/empresa/buscar?cnpj={cnpj} - Busca empresa por CNPJ (público)
export async function apiBuscarEmpresaPorCNPJ(cnpj: string): Promise<Empresa | null> {
  const cnpjLimpo = cnpj.replace(/\D/g, "");
  const res = await fetch(`/api/empresa/buscar?cnpj=${cnpjLimpo}`, {
    method: "GET",
    headers: h,
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Erro ao buscar empresa");
  return normalizeEmpresa(await res.json());
}

// GET /api/empresa/minha - Dados da empresa do usuário logado
export async function apiMinhaEmpresa(): Promise<Empresa | null> {
  const res = await fetchWithAuth("/api/empresa/minha");
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Erro ao buscar empresa");
  return normalizeEmpresa(await res.json());
}

// PUT /api/empresa/{id} - Atualiza dados da empresa (GERENTE)
export async function apiUpdateEmpresa(id: string, payload: EmpresaPayload): Promise<Response> {
  return fetchWithAuth(`/api/empresa/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

function normalizeEmpresa(raw: Record<string, unknown>): Empresa {
  return {
    id: String(raw.id ?? ""),
    cnpj: String(raw.cnpj ?? ""),
    razaoSocial: String(raw.razaosocial ?? raw.razaoSocial ?? ""),
    nomeFantasia: raw.nomeFantasia ? String(raw.nomeFantasia) : undefined,
    email: String(raw.email ?? ""),
    telefone: raw.telefone ? String(raw.telefone) : undefined,
    dataCadastro: raw.dataCadastro ? String(raw.dataCadastro) : undefined,
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// USUÁRIO TYPES & ENDPOINTS
// ══════════════════════════════════════════════════════════════════════════════

export type Usuario = {
  id: string;
  login: string;
  email: string;
  nome?: string;
  roles: UserRole[];
  empresaId?: string | null;
  status: UserStatus;
  dataCadastro: string;
  dataAtualizacao?: string;
};

// Payload para solicitar entrada em empresa (público)
export type SolicitarEntradaPayload = {
  nome?: string;
  login: string;
  senha: string;
  email: string;
  empresaId: string;
};

// Payload para criar usuário diretamente (GERENTE)
export type CriarUsuarioPayload = {
  nome?: string;
  login: string;
  senha: string;
  email: string;
};

export type UpdateUsuarioPayload = { nome?: string; login?: string; email?: string; senha?: string };
export type ErroCampo = { message: string; campo: string };
export type ErroResposta = { status: number; message: string; erros: ErroCampo[] };

function normalizeUsuario(raw: Record<string, unknown>): Usuario {
  return {
    id: String(raw.id ?? ""),
    login: String(raw.login ?? ""),
    email: String(raw.email ?? ""),
    nome: raw.nome ? String(raw.nome) : undefined,
    roles: Array.isArray(raw.roles) ? raw.roles.map(String) as UserRole[] : [],
    empresaId: raw.empresaId ? String(raw.empresaId) : (raw.fornecedorId ? String(raw.fornecedorId) : null),
    status: (raw.status as UserStatus) || "ATIVO",
    dataCadastro: String(raw.dataCadastro ?? raw.dataDeCadastro ?? ""),
    dataAtualizacao: raw.dataAtualizacao ? String(raw.dataAtualizacao) : undefined,
  };
}

// POST /cadastro/solicitar - Solicita entrada em empresa existente (público)
export async function apiSolicitarEntrada(payload: SolicitarEntradaPayload): Promise<Response> {
  return fetch("/cadastro/solicitar", {
    method: "POST",
    headers: { ...h, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

// POST /cadastro - Cria usuário diretamente na empresa (GERENTE only)
export async function apiCriarUsuario(payload: CriarUsuarioPayload): Promise<Response> {
  return fetchWithAuth("/cadastro", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
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

// [GERENTE] Vincula usuário à empresa
export async function apiVincularUsuarioEmpresa(usuarioId: string, empresaId: string): Promise<Response> {
  return fetchWithAuth(`/cadastro/${usuarioId}/vincular-empresa`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ empresaId }),
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
