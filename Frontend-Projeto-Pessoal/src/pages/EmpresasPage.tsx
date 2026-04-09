import { useState, useCallback, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import {
  Search,
  Plus,
  Building2,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  House,
  Trash2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  apiListFornecedores,
  apiValidarAcessoFornecedor,
  apiDeleteFornecedor,
  type Fornecedor,
  type ValidarAcessoResponse,
} from "../api/client";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { useFornecedor } from "../context/FornecedorContext";
import { useAuth } from "../auth/AuthContext";
import { formatCNPJ, formatPhone } from "../lib/utils";

// ── Paleta de gradientes para avatares (deterministica por id) ──────────────
const AVATAR_GRADIENTS = [
  "linear-gradient(135deg,#047857 0%,#10B981 50%,#34D399 100%)",
  "linear-gradient(135deg,#1D4ED8 0%,#3B82F6 50%,#60A5FA 100%)",
  "linear-gradient(135deg,#B45309 0%,#F59E0B 50%,#FBBF24 100%)",
  "linear-gradient(135deg,#BE185D 0%,#EC4899 50%,#F472B6 100%)",
  "linear-gradient(135deg,#6D28D9 0%,#8B5CF6 50%,#A78BFA 100%)",
  "linear-gradient(135deg,#0E7490 0%,#06B6D4 50%,#22D3EE 100%)",
];

function hashToIndex(str: string, max: number): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h % max;
}

// ── Skeleton card (shimmer) ────────────────────────────────────────────────
function EmpresaCardSkeleton({ delay }: { delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
      className="card"
      style={{
        padding: "28px",
        height: "220px",
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(110deg, var(--color-bg-card) 30%, var(--color-bg-secondary) 50%, var(--color-bg-card) 70%)",
        backgroundSize: "200% 100%",
        animation: "emp-shimmer 1.8s ease-in-out infinite",
      }}
    />
  );
}

export function EmpresasPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { entrarFornecedor } = useFornecedor();
  const queryClient = useQueryClient();
  const isAdmin = user?.roles?.includes("ADMIN") ?? false;

  const searchRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const [uiState, setUiState] = useState(() => ({
    search: "",
    selectedFornecedor: null as Fornecedor | null,
    senha: "",
    showSenha: false,
    validating: false,
    gateError: "",
    deleteTarget: null as Fornecedor | null,
  }));

  const deleteMut = useMutation({
    mutationFn: (id: string) =>
      apiDeleteFornecedor(id).then((res) => {
        if (!res.ok) throw new Error("Erro ao excluir empresa");
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fornecedores"] });
      toast.success("Empresa excluída com sucesso");
      setUiState((prev) => ({ ...prev, deleteTarget: null }));
    },
    onError: (err: Error) => toast.error(err.message || "Erro ao excluir empresa"),
  });

  const {
    data: fornecedores = [],
    isLoading,
    error,
  } = useQuery<Fornecedor[], Error>({
    queryKey: ["fornecedores"],
    queryFn: apiListFornecedores,
  });

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setUiState((prev) => ({ ...prev, search: e.target.value })),
    [],
  );
  const handleSenhaChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setUiState((prev) => ({ ...prev, senha: e.target.value })),
    [],
  );
  const toggleShowSenha = useCallback(
    () => setUiState((prev) => ({ ...prev, showSenha: !prev.showSenha })),
    [],
  );

  const openGate = useCallback((f: Fornecedor) => {
    setUiState((prev) => ({
      ...prev,
      selectedFornecedor: f,
      senha: "",
      gateError: "",
      showSenha: false,
    }));
    setTimeout(() => {
      if (passwordRef.current) passwordRef.current.focus();
    }, 150);
  }, []);

  const closeGate = useCallback(
    () => setUiState((prev) => ({ ...prev, selectedFornecedor: null, senha: "", gateError: "" })),
    [],
  );

  const handleValidar = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!uiState.selectedFornecedor || !uiState.senha.trim() || uiState.validating) return;

      setUiState((prev) => ({ ...prev, validating: true, gateError: "" }));
      try {
        const res = await apiValidarAcessoFornecedor(
          uiState.selectedFornecedor.id,
          uiState.senha,
        );
        if (res.ok) {
          const data = (await res.json()) as ValidarAcessoResponse;
          entrarFornecedor({
            fornecedorToken: data.fornecedorToken,
            fornecedorId: uiState.selectedFornecedor.id,
            role: data.role,
            nome: data.fornecedorNome,
          });
          toast.success(`Bem-vindo ao painel de ${data.fornecedorNome}!`);
          navigate(`/empresas/${uiState.selectedFornecedor.id}/painel`);
        } else {
          const body = await res.json().catch(() => null);
          setUiState((prev) => ({
            ...prev,
            gateError: body?.message || "Senha inválida",
            validating: false,
          }));
        }
      } catch {
        setUiState((prev) => ({
          ...prev,
          gateError: "Erro ao validar acesso. Tente novamente.",
          validating: false,
        }));
      }
    },
    [uiState.selectedFornecedor, uiState.senha, uiState.validating, entrarFornecedor, navigate],
  );

  const filtered = useMemo(() => {
    if (!uiState.search) return fornecedores;
    const q = uiState.search.toLowerCase();
    return fornecedores.filter(
      (f) =>
        f.razaoSocial.toLowerCase().includes(q) ||
        (f.nomeFantasia ?? "").toLowerCase().includes(q) ||
        f.email.toLowerCase().includes(q) ||
        f.cnpj.includes(q),
    );
  }, [fornecedores, uiState.search]);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg)",
        position: "relative",
      }}
    >
      {/* Backdrop gradient mesh */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(60% 45% at 85% -10%, var(--color-accent-subtle) 0%, transparent 55%),
            radial-gradient(50% 35% at 0% 5%, rgba(29,78,216,0.08) 0%, transparent 60%)
          `,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          maxWidth: "var(--container-wide)",
          margin: "0 auto",
          padding: "clamp(48px,7vw,96px) var(--container-padding) 96px",
        }}
      >
        {/* ─── Hero editorial ─────────────────────────────────────── */}
        <motion.header
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "32px",
            marginBottom: "clamp(40px,5vw,64px)",
          }}
        >
          <div style={{ maxWidth: "720px" }}>
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 14px",
                borderRadius: "var(--radius-pill)",
                background: "var(--color-accent-subtle)",
                border: "1px solid var(--color-accent-muted)",
                marginBottom: "20px",
              }}
            >
              <Sparkles size={12} style={{ color: "var(--color-accent)" }} />
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "var(--weight-medium)",
                  color: "var(--color-accent)",
                  letterSpacing: "var(--tracking-wide)",
                  textTransform: "uppercase",
                }}
              >
                Olá, {user?.nome || user?.login}
              </span>
            </motion.div>

            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-headline)",
                fontWeight: "var(--weight-semibold)",
                lineHeight: "var(--leading-tight)",
                letterSpacing: "var(--tracking-tighter)",
                color: "var(--color-text)",
                marginBottom: "16px",
              }}
            >
              Suas empresas.
              <br />
              <span style={{ color: "var(--color-text-tertiary)" }}>Um só lugar.</span>
            </h1>
            <p
              style={{
                fontSize: "var(--text-body-lg)",
                lineHeight: "var(--leading-relaxed)",
                color: "var(--color-text-secondary)",
                maxWidth: "560px",
              }}
            >
              Selecione uma empresa para entrar no painel de administração. Cada acesso
              é protegido por uma senha dedicada.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexShrink: 0,
            }}
          >
            <Link to="/" className="btn btn-ghost">
              <House size={16} /> Menu inicial
            </Link>
            <Link to="/empresas/cadastrar" className="btn btn-primary">
              <Plus size={16} /> Nova empresa
            </Link>
          </div>
        </motion.header>

        {/* ─── Toolbar: busca + contador ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ position: "relative", flex: "1 1 320px", maxWidth: "480px" }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: "18px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--color-text-tertiary)",
              }}
            />
            <input
              ref={searchRef}
              className="input-field"
              style={{
                paddingLeft: "46px",
                width: "100%",
                height: "46px",
                borderRadius: "var(--radius-pill)",
                background: "var(--color-bg-elevated)",
                fontSize: "14px",
              }}
              placeholder="Buscar por nome, CNPJ ou e-mail..."
              value={uiState.search}
              onChange={handleSearchChange}
              type="text"
            />
          </div>

          <div
            style={{
              fontSize: "12px",
              fontWeight: "var(--weight-medium)",
              color: "var(--color-text-tertiary)",
              letterSpacing: "var(--tracking-wider)",
              textTransform: "uppercase",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {filtered.length} /{" "}
            <span style={{ color: "var(--color-text)" }}>
              {fornecedores.length} {fornecedores.length === 1 ? "empresa" : "empresas"}
            </span>
          </div>
        </motion.div>

        {/* ─── Erro ──────────────────────────────────────────────── */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: "16px 20px",
              borderRadius: "var(--radius-lg)",
              background: "var(--color-error-bg)",
              border: "1px solid rgba(185,28,28,0.25)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "24px",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "var(--color-error)",
                boxShadow: "0 0 0 4px rgba(185,28,28,0.15)",
              }}
            />
            <span style={{ fontSize: "14px", color: "var(--color-error)" }}>
              Não foi possível conectar ao servidor. Verifique se os microsserviços estão
              rodando.
            </span>
          </motion.div>
        )}

        {/* ─── Conteúdo ──────────────────────────────────────────── */}
        {isLoading ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "20px",
            }}
          >
            {[...Array(6)].map((_, i) => (
              <EmpresaCardSkeleton key={i} delay={i * 0.06} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
            style={{
              padding: "80px 40px",
              textAlign: "center",
              borderRadius: "var(--radius-2xl)",
            }}
          >
            <div
              style={{
                width: "88px",
                height: "88px",
                margin: "0 auto 24px",
                borderRadius: "var(--radius-2xl)",
                background: "var(--color-bg-secondary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Building2 size={36} style={{ color: "var(--color-text-tertiary)" }} />
            </div>
            <h3
              style={{
                fontSize: "22px",
                fontWeight: "var(--weight-semibold)",
                color: "var(--color-text)",
                marginBottom: "8px",
                letterSpacing: "var(--tracking-tight)",
              }}
            >
              {uiState.search ? "Nenhuma empresa encontrada" : "Comece pela primeira"}
            </h3>
            <p
              style={{
                fontSize: "15px",
                color: "var(--color-text-secondary)",
                marginBottom: "28px",
                maxWidth: "420px",
                margin: "0 auto 28px",
                lineHeight: 1.55,
              }}
            >
              {uiState.search
                ? "Tente ajustar os termos de busca."
                : "Cadastre sua primeira empresa para começar a gerenciar estoque, usuários e vendas."}
            </p>
            {!uiState.search && (
              <Link
                to="/empresas/cadastrar"
                className="btn btn-primary"
                style={{ display: "inline-flex" }}
              >
                <Plus size={16} /> Cadastrar empresa
              </Link>
            )}
          </motion.div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "20px",
            }}
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((f, i) => {
                const gradient = AVATAR_GRADIENTS[hashToIndex(f.id, AVATAR_GRADIENTS.length)];
                const initial = (f.nomeFantasia || f.razaoSocial).charAt(0).toUpperCase();
                return (
                  <motion.article
                    key={f.id}
                    layout
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{
                      delay: Math.min(i * 0.05, 0.4),
                      duration: 0.55,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    whileHover={{ y: -4 }}
                    onClick={() => openGate(f)}
                    style={{
                      cursor: "pointer",
                      position: "relative",
                      padding: "28px",
                      borderRadius: "var(--radius-2xl)",
                      background: "var(--color-bg-card)",
                      border: "1px solid var(--color-border)",
                      boxShadow: "0 1px 2px rgba(15,17,21,0.04)",
                      transition: "border-color 0.35s ease, box-shadow 0.35s ease",
                      overflow: "hidden",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--color-border-strong)";
                      e.currentTarget.style.boxShadow =
                        "0 24px 48px -24px rgba(15,17,21,0.18), 0 0 0 1px var(--color-accent-muted)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--color-border)";
                      e.currentTarget.style.boxShadow = "0 1px 2px rgba(15,17,21,0.04)";
                    }}
                  >
                    {/* Glow decorativo */}
                    <div
                      aria-hidden
                      style={{
                        position: "absolute",
                        top: "-60px",
                        right: "-60px",
                        width: "180px",
                        height: "180px",
                        borderRadius: "50%",
                        background: gradient,
                        opacity: 0.06,
                        filter: "blur(20px)",
                        pointerEvents: "none",
                      }}
                    />

                    {/* Header: avatar + nome */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "16px",
                        marginBottom: "22px",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          width: "56px",
                          height: "56px",
                          borderRadius: "var(--radius-xl)",
                          background: gradient,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "22px",
                          fontWeight: "var(--weight-semibold)",
                          color: "#fff",
                          letterSpacing: "-0.02em",
                          flexShrink: 0,
                          boxShadow: "0 8px 24px -8px rgba(15,17,21,0.24)",
                          fontFamily: "var(--font-display)",
                        }}
                      >
                        {initial}
                      </div>
                      <div style={{ minWidth: 0, flex: 1, paddingTop: "4px" }}>
                        <p
                          className="truncate"
                          style={{
                            fontSize: "17px",
                            fontWeight: "var(--weight-semibold)",
                            color: "var(--color-text)",
                            letterSpacing: "var(--tracking-tight)",
                            lineHeight: 1.25,
                          }}
                        >
                          {f.nomeFantasia || f.razaoSocial}
                        </p>
                        {f.nomeFantasia && (
                          <p
                            className="truncate"
                            style={{
                              fontSize: "12px",
                              color: "var(--color-text-tertiary)",
                              marginTop: "3px",
                              letterSpacing: "var(--tracking-normal)",
                            }}
                          >
                            {f.razaoSocial}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Info grid */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                        marginBottom: "24px",
                      }}
                    >
                      <p
                        className="truncate"
                        style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
                      >
                        {f.email}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          fontSize: "11px",
                          color: "var(--color-text-tertiary)",
                          fontVariantNumeric: "tabular-nums",
                          letterSpacing: "var(--tracking-wide)",
                        }}
                      >
                        <span>{formatCNPJ(f.cnpj)}</span>
                        {f.telefone && (
                          <>
                            <span style={{ opacity: 0.4 }}>•</span>
                            <span>{formatPhone(f.telefone)}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Ações */}
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{
                          flex: 1,
                          borderRadius: "var(--radius-pill)",
                          fontSize: "13px",
                          fontWeight: "var(--weight-medium)",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          openGate(f);
                        }}
                      >
                        <Lock size={14} /> Acessar
                        <ArrowRight
                          size={14}
                          style={{ marginLeft: "auto", opacity: 0.55 }}
                        />
                      </button>
                      {isAdmin && (
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{
                            color: "var(--color-error)",
                            borderRadius: "var(--radius-pill)",
                            padding: "0 14px",
                            flexShrink: 0,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setUiState((prev) => ({ ...prev, deleteTarget: f }));
                          }}
                          title="Excluir empresa"
                          aria-label="Excluir empresa"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ─── Gate Modal ─────────────────────────────────────────── */}
      <Modal
        open={!!uiState.selectedFornecedor}
        onClose={closeGate}
        title={`Acessar ${
          uiState.selectedFornecedor?.nomeFantasia ||
          uiState.selectedFornecedor?.razaoSocial ||
          "Empresa"
        }`}
        size="sm"
      >
        <form
          onSubmit={handleValidar}
          style={{ display: "flex", flexDirection: "column", gap: "24px" }}
          noValidate
        >
          {/* Preview da empresa */}
          {uiState.selectedFornecedor && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "16px",
                borderRadius: "var(--radius-xl)",
                background: "var(--color-bg-secondary)",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "var(--radius-lg)",
                  background:
                    AVATAR_GRADIENTS[
                      hashToIndex(uiState.selectedFornecedor.id, AVATAR_GRADIENTS.length)
                    ],
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "19px",
                  fontWeight: "var(--weight-semibold)",
                  color: "#fff",
                  flexShrink: 0,
                  fontFamily: "var(--font-display)",
                }}
              >
                {(
                  uiState.selectedFornecedor.nomeFantasia ||
                  uiState.selectedFornecedor.razaoSocial ||
                  "E"
                )
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <p
                  className="truncate"
                  style={{
                    fontSize: "15px",
                    fontWeight: "var(--weight-semibold)",
                    color: "var(--color-text)",
                  }}
                >
                  {uiState.selectedFornecedor.nomeFantasia ||
                    uiState.selectedFornecedor.razaoSocial}
                </p>
                <p
                  className="truncate"
                  style={{
                    fontSize: "12px",
                    color: "var(--color-text-tertiary)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {formatCNPJ(uiState.selectedFornecedor.cnpj)}
                </p>
              </div>
            </div>
          )}

          <p
            style={{
              fontSize: "14px",
              color: "var(--color-text-secondary)",
              lineHeight: 1.55,
            }}
          >
            Digite a senha de acesso para entrar no painel desta empresa.
          </p>

          {uiState.gateError && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: "12px 16px",
                borderRadius: "var(--radius-lg)",
                background: "var(--color-error-bg)",
                border: "1px solid rgba(185,28,28,0.25)",
              }}
            >
              <p style={{ fontSize: "13px", color: "var(--color-error)" }}>
                {uiState.gateError}
              </p>
            </motion.div>
          )}

          <div className="input-group">
            <label className="input-label">Senha de acesso</label>
            <div style={{ position: "relative" }}>
              <Lock
                size={16}
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--color-text-tertiary)",
                }}
              />
              <input
                ref={passwordRef}
                type={uiState.showSenha ? "text" : "password"}
                className="input-field"
                style={{ paddingLeft: "40px", paddingRight: "40px" }}
                placeholder="Digite a senha..."
                value={uiState.senha}
                onChange={handleSenhaChange}
                autoComplete="off"
                required
                disabled={uiState.validating}
              />
              <button
                type="button"
                onClick={toggleShowSenha}
                disabled={uiState.validating}
                tabIndex={-1}
                style={{
                  position: "absolute",
                  right: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--color-text-tertiary)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                {uiState.showSenha ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={uiState.validating || !uiState.senha.trim()}
            whileHover={{ scale: uiState.senha.trim() ? 1.01 : 1 }}
            whileTap={{ scale: uiState.senha.trim() ? 0.98 : 1 }}
            className="btn btn-primary"
            style={{ width: "100%", height: "46px" }}
          >
            {uiState.validating ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Validando...
              </>
            ) : (
              <>
                <ArrowRight size={16} /> Entrar no painel
              </>
            )}
          </motion.button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!uiState.deleteTarget}
        onClose={() => setUiState((prev) => ({ ...prev, deleteTarget: null }))}
        onConfirm={() =>
          uiState.deleteTarget && deleteMut.mutate(uiState.deleteTarget.id)
        }
        title={`Excluir ${
          uiState.deleteTarget?.nomeFantasia ||
          uiState.deleteTarget?.razaoSocial ||
          "empresa"
        }?`}
        description="Todos os dados desta empresa serão removidos permanentemente. Esta ação não pode ser desfeita."
        confirmText="Excluir Empresa"
        loading={deleteMut.isPending}
      />

      {/* Keyframes para o shimmer (inline para não tocar CSS global) */}
      <style>{`
        @keyframes emp-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
