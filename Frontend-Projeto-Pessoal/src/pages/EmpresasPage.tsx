import { useState, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { Search, Plus, Building2, Lock, Eye, EyeOff, ArrowRight, Loader2, House, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { apiListFornecedores, apiValidarAcessoFornecedor, apiDeleteFornecedor, type Fornecedor, type ValidarAcessoResponse } from "../api/client";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { useFornecedor } from "../context/FornecedorContext";
import { useAuth } from "../auth/AuthContext";
import { formatCNPJ, formatPhone } from "../lib/utils";

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
    deleteTarget: null as Fornecedor | null
  }));

  const deleteMut = useMutation({
    mutationFn: (id: string) => apiDeleteFornecedor(id).then((res) => {
      if (!res.ok) throw new Error("Erro ao excluir empresa");
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fornecedores"] });
      toast.success("Empresa excluída com sucesso");
      setUiState(prev => ({ ...prev, deleteTarget: null }));
    },
    onError: (err: Error) => toast.error(err.message || "Erro ao excluir empresa"),
  });

  const { data: fornecedores = [], isLoading, error } = useQuery<Fornecedor[], Error>({ queryKey: ["fornecedores"], queryFn: apiListFornecedores });

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setUiState(prev => ({ ...prev, search: e.target.value })), []);
  const handleSenhaChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setUiState(prev => ({ ...prev, senha: e.target.value })), []);
  const toggleShowSenha = useCallback(() => setUiState(prev => ({ ...prev, showSenha: !prev.showSenha })), []);

  const openGate = useCallback((f: Fornecedor) => {
    setUiState(prev => ({ ...prev, selectedFornecedor: f, senha: "", gateError: "", showSenha: false }));
    setTimeout(() => { if (passwordRef.current) passwordRef.current.focus(); }, 150);
  }, []);

  const closeGate = useCallback(() => setUiState(prev => ({ ...prev, selectedFornecedor: null, senha: "", gateError: "" })), []);

  const handleValidar = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uiState.selectedFornecedor || !uiState.senha.trim() || uiState.validating) return;

    setUiState(prev => ({ ...prev, validating: true, gateError: "" }));
    try {
      const res = await apiValidarAcessoFornecedor(uiState.selectedFornecedor.id, uiState.senha);
      if (res.ok) {
        const data = (await res.json()) as ValidarAcessoResponse;
        entrarFornecedor({ fornecedorToken: data.fornecedorToken, fornecedorId: uiState.selectedFornecedor.id, role: data.role, nome: data.fornecedorNome });
        toast.success(`Bem-vindo ao painel de ${data.fornecedorNome}!`);
        navigate(`/empresas/${uiState.selectedFornecedor.id}/painel`);
      } else {
        const body = await res.json().catch(() => null);
        setUiState(prev => ({ ...prev, gateError: body?.message || "Senha inválida", validating: false }));
      }
    } catch {
      setUiState(prev => ({ ...prev, gateError: "Erro ao validar acesso. Tente novamente.", validating: false }));
    }
  }, [uiState.selectedFornecedor, uiState.senha, uiState.validating, entrarFornecedor, navigate]);

  const filtered = fornecedores.filter((f) => {
    if (!uiState.search) return true;
    const q = uiState.search.toLowerCase();
    return f.razaoSocial.toLowerCase().includes(q) || (f.nomeFantasia ?? "").toLowerCase().includes(q) || f.email.toLowerCase().includes(q) || f.cnpj.includes(q);
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg-primary)" }}>
      <div style={{ padding: "var(--space-8) var(--space-6)" }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "var(--space-4)", marginBottom: "var(--space-8)" }}>
          <div>
            <p style={{ fontSize: "12px", fontWeight: "var(--font-weight-medium)", color: "var(--color-accent)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", marginBottom: "4px" }}>
              Olá, {user?.nome || user?.login}
            </p>
            <h1 className="page-title">Empresas</h1>
            <p className="page-subtitle">Selecione uma empresa para acessar o painel de administração</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <Link to="/" className="btn btn-secondary"><House size={18} /> <span className="hidden sm\:inline">Menu inicial</span></Link>
            <Link to="/empresas/cadastrar" className="btn btn-primary"><Plus size={18} /> <span className="hidden sm\:inline">Nova Empresa</span></Link>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} style={{ position: "relative", maxWidth: "400px", marginBottom: "var(--space-8)" }}>
          <Search size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-tertiary)" }} />
          <input ref={searchRef} className="input-field" style={{ paddingLeft: "42px", width: "100%" }} placeholder="Buscar por nome, CNPJ ou e-mail..." value={uiState.search} onChange={handleSearchChange} type="text" />
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ padding: "var(--space-3)", borderRadius: "var(--radius-lg)", background: "var(--color-error-bg)", border: "1px solid var(--color-error)", display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-6)" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "var(--radius-full)", background: "var(--color-error)" }} />
            <span style={{ fontSize: "14px", color: "var(--color-error)" }}>Não foi possível conectar ao servidor. Verifique se os microserviços estão rodando.</span>
          </motion.div>
        )}

        {/* Content */}
        {isLoading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "var(--space-5)" }}>
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: "192px", borderRadius: "var(--radius-xl)", animationDelay: `${i * 0.1}s` }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: "var(--space-12)", textAlign: "center" }}>
            <div style={{ width: "80px", height: "80px", margin: "0 auto var(--space-4)", borderRadius: "var(--radius-2xl)", background: "var(--color-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Building2 size={36} style={{ color: "var(--color-text-tertiary)" }} />
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)", marginBottom: "var(--space-2)" }}>{uiState.search ? "Nenhuma empresa encontrada" : "Nenhuma empresa cadastrada"}</h3>
            <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", marginBottom: "var(--space-6)" }}>{uiState.search ? "Tente ajustar sua busca" : "Comece cadastrando sua primeira empresa"}</p>
            {!uiState.search && <Link to="/empresas/cadastrar" className="btn btn-primary" style={{ display: "inline-flex" }}><Plus size={18} /> Cadastrar Empresa</Link>}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "var(--space-5)" }}>
            <AnimatePresence>
              {filtered.map((f, i) => (
                <motion.div key={f.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.04, duration: 0.3 }}
                  className="card" style={{ cursor: "pointer", transition: "transform var(--duration-normal) var(--ease-out), box-shadow var(--duration-normal), border-color var(--duration-normal)" }}
                  onClick={() => openGate(f)} onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.boxShadow = "var(--shadow-lg)"; e.currentTarget.style.borderColor = "var(--color-accent)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; e.currentTarget.style.borderColor = "var(--color-border)"; }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-4)", marginBottom: "var(--space-5)" }}>
                    <div style={{ width: "56px", height: "56px", borderRadius: "var(--radius-2xl)", background: "var(--color-accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: "var(--font-weight-semibold)", color: "var(--color-accent)", flexShrink: 0 }}>
                      {(f.nomeFantasia || f.razaoSocial).charAt(0).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontSize: "16px", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-primary)" }} className="truncate">{f.nomeFantasia || f.razaoSocial}</p>
                      {f.nomeFantasia && <p style={{ fontSize: "12px", color: "var(--color-text-tertiary)" }} className="truncate">{f.razaoSocial}</p>}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", marginBottom: "var(--space-5)" }}>
                    <p style={{ fontSize: "14px", color: "var(--color-text-secondary)" }} className="truncate">{f.email}</p>
                    <p style={{ fontSize: "12px", color: "var(--color-text-tertiary)" }}>{formatCNPJ(f.cnpj)}</p>
                    {f.telefone && <p style={{ fontSize: "12px", color: "var(--color-text-tertiary)" }}>{formatPhone(f.telefone)}</p>}
                  </div>
                  <div style={{ display: "flex", gap: "var(--space-2)" }}>
                    <button className="btn btn-secondary" style={{ flex: 1 }}><Lock size={16} /> Acessar <ArrowRight size={16} style={{ marginLeft: "auto", opacity: 0.5 }} /></button>
                    {isAdmin && (
                      <button className="btn btn-secondary flex-none" style={{ color: "var(--color-error)" }} onClick={(e) => { e.stopPropagation(); setUiState(prev => ({ ...prev, deleteTarget: f })); }} title="Excluir empresa">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        <p style={{ textAlign: "center", fontSize: "12px", color: "var(--color-text-tertiary)", marginTop: "var(--space-10)" }}>
          {fornecedores.length} empresa{fornecedores.length !== 1 ? "s" : ""} cadastrada{fornecedores.length !== 1 ? "s" : ""}
        </p>
      </div>

      <Modal open={!!uiState.selectedFornecedor} onClose={closeGate} title={`Acessar ${uiState.selectedFornecedor?.nomeFantasia || uiState.selectedFornecedor?.razaoSocial || "Empresa"}`} size="sm">
        <form onSubmit={handleValidar} style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }} noValidate>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", padding: "var(--space-4)", borderRadius: "var(--radius-xl)", background: "var(--color-bg-secondary)" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "var(--radius-xl)", background: "var(--color-accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: "var(--font-weight-semibold)", color: "var(--color-accent)", flexShrink: 0 }}>
              {(uiState.selectedFornecedor?.nomeFantasia || uiState.selectedFornecedor?.razaoSocial || "E").charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: "16px", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-primary)" }} className="truncate">
                {uiState.selectedFornecedor?.nomeFantasia || uiState.selectedFornecedor?.razaoSocial}
              </p>
              <p style={{ fontSize: "12px", color: "var(--color-text-tertiary)" }} className="truncate">{uiState.selectedFornecedor?.cnpj ? formatCNPJ(uiState.selectedFornecedor.cnpj) : ""}</p>
            </div>
          </div>

          <p style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>Digite a senha de acesso para entrar no painel desta empresa.</p>

          {uiState.gateError && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} style={{ padding: "var(--space-4)", borderRadius: "var(--radius-xl)", background: "var(--color-error-bg)", border: "1px solid var(--color-error)" }}>
              <p style={{ fontSize: "14px", color: "var(--color-error)" }}>{uiState.gateError}</p>
            </motion.div>
          )}

          <div className="input-group">
            <label className="input-label">Senha de acesso</label>
            <div style={{ position: "relative" }}>
              <Lock size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-tertiary)" }} />
              <input ref={passwordRef} type={uiState.showSenha ? "text" : "password"} className="input-field" style={{ paddingLeft: "42px", paddingRight: "42px" }} placeholder="Digite a senha..." value={uiState.senha} onChange={handleSenhaChange} autoComplete="off" required disabled={uiState.validating} />
              <button type="button" onClick={toggleShowSenha} disabled={uiState.validating} tabIndex={-1} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-tertiary)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                {uiState.showSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={uiState.validating || !uiState.senha.trim()} className="btn btn-primary w-full">
            {uiState.validating ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}><Loader2 size={18} className="animate-spin" /> Validando...</span> : <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}><ArrowRight size={18} /> Entrar no Painel</span>}
          </button>
        </form>
      </Modal>

      <ConfirmDialog open={!!uiState.deleteTarget} onClose={() => setUiState(prev => ({ ...prev, deleteTarget: null }))} onConfirm={() => uiState.deleteTarget && deleteMut.mutate(uiState.deleteTarget.id)} title={`Excluir ${uiState.deleteTarget?.nomeFantasia || uiState.deleteTarget?.razaoSocial || "empresa"}?`} description="Todos os dados desta empresa serão removidos permanentemente. Esta ação não pode ser desfeita." confirmText="Excluir Empresa" loading={deleteMut.isPending} />
    </div>
  );
}
