// ══════════════════════════════════════════════════════════════════════════════
// API BASE URL - URL do Gateway
// ══════════════════════════════════════════════════════════════════════════════
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

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
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  const res = await fetch(fullUrl, {
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
  return fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { ...h, "Content-Type": "application/json" },
    body: JSON.stringify({ login, senha: password }),
  });
}

// GET /api/auth/me
export async function apiMe(): Promise<MeResponse | null> {
  const token = localStorage.getItem("jwt_token");
  if (!token) return null;
  const res = await fetch(`${API_BASE_URL}/api/auth/me`, { method: "GET", headers: authHeaders() });
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
  return fetch(`${API_BASE_URL}/cadastro/solicitar`, {
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
  preco?: number;
  marca?: string;
  fornecedor?: Fornecedor;
  usuarioCadastro?: ProdutoUsuarioCadastro;
  dataDeCadastro?: string;
};

export type ProdutoUsuarioCadastro = {
  id?: string;
  nome?: string;
  login?: string;
};

export type ProdutoPayload = {
  descricao: string;
  sabor?: string;
  medida?: number;
  preco: number;
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

function toOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function toOptionalNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return undefined;

  const normalized = value.replace(",", ".").trim();
  if (!normalized) return undefined;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizeProdutoUsuarioCadastro(raw: unknown): ProdutoUsuarioCadastro | undefined {
  if (!raw) return undefined;

  if (typeof raw === "string") {
    return { login: raw };
  }

  if (typeof raw !== "object") return undefined;

  const data = raw as Record<string, unknown>;
  const usuario = {
    id: toOptionalString(data.id ?? data.userId),
    nome: toOptionalString(data.nome ?? data.name),
    login: toOptionalString(data.login ?? data.username ?? data.usuario),
  };

  if (!usuario.id && !usuario.nome && !usuario.login) return undefined;
  return usuario;
}

// ResultadoPesquisaProduto retorna "Descricao" (D maiúsculo) — normalizamos.
function normalizeProduto(raw: Record<string, unknown>): Produto {
  const usuarioCadastro = normalizeProdutoUsuarioCadastro(
    raw.usuarioCadastro ?? raw.cadastradoPor ?? raw.usuarioCriacao ?? raw.createdBy,
  );

  return {
    id: raw.id as string,
    descricao: (raw.Descricao ?? raw.descricao) as string,
    sabor: raw.sabor as string | undefined,
    medida: raw.medida as number | undefined,
    preco: toOptionalNumber(raw.preco ?? raw.precoUnitario ?? raw.valor),
    marca: raw.marca as string | undefined,
    fornecedor: raw.fornecedor ? normalizeFornecedor(raw.fornecedor as Record<string, unknown>) : undefined,
    usuarioCadastro,
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

// ── Usuários da Empresa ────────────────────────────────────────────────
export type FornecedorUsuario = {
  id: string;
  usuarioId: string;
  role: string;
  nomeUsuario?: string;
  loginUsuario?: string;
  dataCadastro?: string;
};

export type CriarUsuarioEmpresaPayload = {
  nome: string;
  login: string;
  senha: string;
  email: string;
  role: string;
};

// GET /fornecedor/{id}/usuarios - listar usuários da empresa
export async function apiListUsuariosEmpresa(fornecedorId: string): Promise<FornecedorUsuario[]> {
  const res = await fetchWithAuth(`/fornecedor/${fornecedorId}/usuarios`);
  if (!res.ok) throw new Error(`Erro ${res.status} ao listar usuários`);
  return res.json();
}

// POST /cadastro/solicitar + POST /fornecedor/{id}/usuarios - criar usuário e associar
export async function apiCriarUsuarioNaEmpresa(fornecedorId: string, payload: CriarUsuarioEmpresaPayload): Promise<Response> {
  // 1. Criar o usuário no MS-3
  const regRes = await fetch(`${API_BASE_URL}/cadastro/solicitar`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: payload.nome,
      login: payload.login,
      senha: payload.senha,
      email: payload.email,
    }),
  });
  if (!regRes.ok) return regRes;
  const { usuarioId } = await regRes.json();

  // 2. Associar ao fornecedor com a role
  return fetchWithAuth(`/fornecedor/${fornecedorId}/usuarios`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuarioId, role: payload.role }),
  });
}

// PUT /fornecedor/{id}/usuarios/{usuarioId} - atualizar role
export async function apiUpdateUsuarioEmpresa(fornecedorId: string, usuarioId: string, role: string): Promise<Response> {
  return fetchWithAuth(`/fornecedor/${fornecedorId}/usuarios/${usuarioId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuarioId, role }),
  });
}

// DELETE /fornecedor/{id}/usuarios/{usuarioId} - remover da empresa
export async function apiRemoveUsuarioEmpresa(fornecedorId: string, usuarioId: string): Promise<Response> {
  return fetchWithAuth(`/fornecedor/${fornecedorId}/usuarios/${usuarioId}`, {
    method: "DELETE",
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// MS-4 — CARRINHO + CARTÃO
// ══════════════════════════════════════════════════════════════════════════════

// ── Carrinho ──────────────────────────────────────────────────────────────
export type CupomCode =
  | "EMPORIOJJ"
  | "NAMORACOMIGO"
  | "BLACKFRIDAY"
  | "PRIMEIRACOMPRA"
  | "FRETEGRATIS";

export type CarrinhoItemRemote = {
  id: string;
  produto: string;
  usuario: string;
  cupom?: CupomCode | null;
  fornecedorId: string;
  dataCadastro?: string;
  dataAtualizacao?: string;
};

export type CarrinhoCreatePayload = {
  produto: string;
  usuario: string;
  fornecedorId: string;
  cupom?: CupomCode | null;
};

export type CarrinhoUpdatePayload = {
  cupom?: CupomCode | null;
};

export type CarrinhoResumo = {
  usuario: string;
  totalItens: number;
  itensComCupom: number;
  totalFornecedores: number;
  ultimaAtualizacao?: string;
};

// POST /carrinho — adicionar item
export async function apiCarrinhoAdicionar(payload: CarrinhoCreatePayload): Promise<CarrinhoItemRemote> {
  const res = await fetchWithAuth("/carrinho", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Erro ${res.status} ao adicionar item ao carrinho`);
  return res.json();
}

// GET /carrinho/usuario/{usuarioId} — itens do usuário
export async function apiCarrinhoListarUsuario(usuarioId: string): Promise<CarrinhoItemRemote[]> {
  const res = await fetchWithAuth(`/carrinho/usuario/${usuarioId}`);
  if (!res.ok) throw new Error(`Erro ${res.status} ao buscar carrinho`);
  return res.json();
}

// GET /carrinho/usuario/{usuarioId}/resumo
export async function apiCarrinhoResumo(usuarioId: string): Promise<CarrinhoResumo> {
  const res = await fetchWithAuth(`/carrinho/usuario/${usuarioId}/resumo`);
  if (!res.ok) throw new Error(`Erro ${res.status} ao buscar resumo`);
  return res.json();
}

// PUT /carrinho/{id} — atualizar cupom
export async function apiCarrinhoAtualizar(id: string, payload: CarrinhoUpdatePayload): Promise<CarrinhoItemRemote> {
  const res = await fetchWithAuth(`/carrinho/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Erro ${res.status} ao atualizar item do carrinho`);
  return res.json();
}

// DELETE /carrinho/{id} — remover item
export async function apiCarrinhoRemover(id: string): Promise<void> {
  const res = await fetchWithAuth(`/carrinho/${id}`, { method: "DELETE" });
  if (!res.ok && res.status !== 204) {
    throw new Error(`Erro ${res.status} ao remover item do carrinho`);
  }
}

// DELETE /carrinho/usuario/{usuarioId} — limpar carrinho
export async function apiCarrinhoLimpar(usuarioId: string): Promise<void> {
  const res = await fetchWithAuth(`/carrinho/usuario/${usuarioId}`, { method: "DELETE" });
  if (!res.ok && res.status !== 204) {
    throw new Error(`Erro ${res.status} ao limpar carrinho`);
  }
}

// POST /carrinho/validar — validar adição sem persistir
export async function apiCarrinhoValidar(payload: CarrinhoCreatePayload): Promise<{ valido: boolean; mensagem?: string }> {
  const res = await fetchWithAuth("/carrinho/validar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Erro ${res.status} ao validar item`);
  return res.json();
}

// ── Cartão ────────────────────────────────────────────────────────────────
export type Bandeira = "VISA" | "MASTERCARD" | "ELO" | "AMEX" | "HIPERCARD";

export type Cartao = {
  id: string;
  nomeTitular: string;
  numeroCartao: string;
  validade: string;
  bandeira: Bandeira;
  dataCadastro?: string;
  dataAtualizacao?: string;
};

export type CartaoListItem = {
  id: string;
  nomeTitular: string;
  numeroCartaoMascarado: string;
  validade: string;
  bandeira: Bandeira;
  dataCadastro?: string;
};

export type CartaoCreatePayload = {
  nomeTitular: string;
  numeroCartao: string;
  validade: string; // MM/AA
  bandeira: Bandeira;
};

// POST /cartao — criar cartão fictício
export async function apiCartaoCriar(payload: CartaoCreatePayload): Promise<Cartao> {
  const res = await fetchWithAuth("/cartao", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Erro ${res.status} ao criar cartão`);
  return res.json();
}

// GET /cartao — listar todos
export async function apiCartaoListar(): Promise<CartaoListItem[]> {
  const res = await fetchWithAuth("/cartao");
  if (!res.ok) throw new Error(`Erro ${res.status} ao listar cartões`);
  return res.json();
}

// POST /cartao/validar — validar antes de salvar
export async function apiCartaoValidar(payload: CartaoCreatePayload): Promise<{ valido: boolean; mensagem?: string }> {
  const res = await fetchWithAuth("/cartao/validar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Erro ${res.status} ao validar cartão`);
  return res.json();
}

// DELETE /cartao/{id}
export async function apiCartaoRemover(id: string): Promise<void> {
  const res = await fetchWithAuth(`/cartao/${id}`, { method: "DELETE" });
  if (!res.ok && res.status !== 204) throw new Error(`Erro ${res.status} ao remover cartão`);
}
