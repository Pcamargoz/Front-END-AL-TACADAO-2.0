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

  // CORREÇÃO 1: Referencias para campos críticos
  const searchRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // CORREÇÃO 2: Estados consolidados para evitar re-renders
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
    onError: (err: Error) => {
      toast.error(err.message || "Erro ao excluir empresa");
    },
  });

  const { data: fornecedores = [], isLoading, error } = useQuery<Fornecedor[], Error>({
    queryKey: ["fornecedores"],
    queryFn: apiListFornecedores,
  });

  // CORREÇÃO 3: Handlers memoizados
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUiState(prev => ({ ...prev, search: e.target.value }));
  }, []);

  const handleSenhaChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUiState(prev => ({ ...prev, senha: e.target.value }));
  }, []);

  const toggleShowSenha = useCallback(() => {
    setUiState(prev => ({ ...prev, showSenha: !prev.showSenha }));
  }, []);

  const openGate = useCallback((f: Fornecedor) => {
    setUiState(prev => ({
      ...prev,
      selectedFornecedor: f,
      senha: "",
      gateError: "",
      showSenha: false
    }));
    
    // CORREÇÃO 4: Foco programático com delay para garantir renderização
    setTimeout(() => {
      if (passwordRef.current) {
        passwordRef.current.focus();
      }
    }, 150);
  }, []);

  const closeGate = useCallback(() => {
    setUiState(prev => ({
      ...prev,
      selectedFornecedor: null,
      senha: "",
      gateError: ""
    }));
  }, []);

  const handleValidar = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uiState.selectedFornecedor || !uiState.senha.trim() || uiState.validating) return;

    setUiState(prev => ({ ...prev, validating: true, gateError: "" }));

    try {
      const res = await apiValidarAcessoFornecedor(uiState.selectedFornecedor.id, uiState.senha);
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
        setUiState(prev => ({ 
          ...prev, 
          gateError: body?.message || "Senha inválida",
          validating: false 
        }));
      }
    } catch {
      setUiState(prev => ({ 
        ...prev, 
        gateError: "Erro ao validar acesso. Tente novamente.",
        validating: false 
      }));
    }
  }, [uiState.selectedFornecedor, uiState.senha, uiState.validating, entrarFornecedor, navigate]);

  // CORREÇÃO 5: Filtro otimizado
  const filtered = fornecedores.filter((f) => {
    if (!uiState.search) return true;
    const q = uiState.search.toLowerCase();
    return (
      f.razaoSocial.toLowerCase().includes(q) ||
      (f.nomeFantasia ?? "").toLowerCase().includes(q) ||
      f.email.toLowerCase().includes(q) ||
      f.cnpj.includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-surface">
      <div className="container-apple py-8 lg:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <p className="text-accent text-body-sm font-medium tracking-wide uppercase mb-1">
              Olá, {user?.nome || user?.login}
            </p>
            <h1 className="text-display-sm text-primary">
              Empresas
            </h1>
            <p className="text-body text-secondary mt-1">
              Selecione uma empresa para acessar o painel de administração
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="btn btn-secondary">
              <House size={18} />
              <span>Menu inicial</span>
            </Link>
            <Link to="/empresas/cadastrar" className="btn btn-primary">
              <Plus size={18} />
              <span>Nova Empresa</span>
            </Link>
          </div>
        </motion.div>

        {/* CORREÇÃO 6: Search com referência estável */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative max-w-md mb-8"
        >
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-tertiary" />
          <input
            ref={searchRef}
            className="input-field pl-11 w-full"
            placeholder="Buscar por nome, CNPJ ou e-mail..."
            value={uiState.search}
            onChange={handleSearchChange}
            type="text"
          />
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50/40 dark:bg-red-950/10 border border-red-200/50 dark:border-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-2 mb-6 backdrop-blur-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500/60" />
            <span className="text-body-sm">Não foi possível conectar ao servidor. Verifique se os microserviços estão rodando.</span>
          </motion.div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div 
                key={`skeleton-${i}`}
                className="h-48 skeleton rounded-2xl" 
                style={{ animationDelay: `${i * 0.1}s` }} 
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-lg shadow-black/10 p-12 text-center"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-surface-secondary flex items-center justify-center">
              <Building2 size={36} className="text-tertiary" />
            </div>
            <h3 className="text-title-sm text-primary mb-2">
              {uiState.search ? "Nenhuma empresa encontrada" : "Nenhuma empresa cadastrada"}
            </h3>
            <p className="text-body-sm text-secondary mb-6">
              {uiState.search ? "Tente ajustar sua busca" : "Comece cadastrando sua primeira empresa"}
            </p>
            {!uiState.search && (
              <Link to="/empresas/cadastrar" className="btn btn-primary">
                <Plus size={18} />
                Cadastrar Empresa
              </Link>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            <AnimatePresence>
              {filtered.map((f, i) => (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  className="bg-white/5 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-lg shadow-black/10 p-6 group cursor-pointer transition-all duration-200 ease-out hover:shadow-xl hover:scale-[1.02] hover:border-emerald-500/40"
                  onClick={() => openGate(f)}
                >
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-xl font-semibold text-accent flex-shrink-0">
                      {(f.nomeFantasia || f.razaoSocial).charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-body font-medium text-primary truncate">
                        {f.nomeFantasia || f.razaoSocial}
                      </p>
                      {f.nomeFantasia && (
                        <p className="text-caption text-tertiary truncate">{f.razaoSocial}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 mb-5">
                    <p className="text-body-sm text-secondary truncate">{f.email}</p>
                    <p className="text-caption text-tertiary">{formatCNPJ(f.cnpj)}</p>
                    {f.telefone && (
                      <p className="text-caption text-tertiary">{formatPhone(f.telefone)}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button className="btn btn-secondary flex-1 group-hover:bg-accent/10 group-hover:text-accent group-hover:border-accent/30 transition-all">
                      <Lock size={16} />
                      <span>Acessar</span>
                      <ArrowRight size={16} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    {isAdmin && (
                      <button
                        className="btn btn-secondary px-3 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setUiState(prev => ({ ...prev, deleteTarget: f })); 
                        }}
                        title="Excluir empresa"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        <p className="text-center text-caption text-tertiary mt-10">
          {fornecedores.length} empresa{fornecedores.length !== 1 ? "s" : ""} cadastrada{fornecedores.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* CORREÇÃO 7: Gate Modal com foco protegido */}
      <Modal
        open={!!uiState.selectedFornecedor}
        onClose={closeGate}
        title={`Acessar ${uiState.selectedFornecedor?.nomeFantasia || uiState.selectedFornecedor?.razaoSocial || "Empresa"}`}
        size="sm"
      >
        <form onSubmit={handleValidar} className="space-y-5" noValidate>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-secondary">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-lg font-semibold text-accent flex-shrink-0">
              {(uiState.selectedFornecedor?.nomeFantasia || uiState.selectedFornecedor?.razaoSocial || "E").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-body font-medium text-primary truncate">
                {uiState.selectedFornecedor?.nomeFantasia || uiState.selectedFornecedor?.razaoSocial}
              </p>
              <p className="text-caption text-tertiary truncate">{uiState.selectedFornecedor?.cnpj ? formatCNPJ(uiState.selectedFornecedor.cnpj) : ""}</p>
            </div>
          </div>

          <p className="text-body-sm text-secondary">
            Digite a senha de acesso para entrar no painel desta empresa.
          </p>

          {uiState.gateError && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30"
            >
              <p className="text-body-sm text-red-600 dark:text-red-400">{uiState.gateError}</p>
            </motion.div>
          )}

          {/* CORREÇÃO 8: Input de senha com foco garantido */}
          <div className="input-group">
            <label className="input-label">Senha de acesso</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-tertiary" />
              <input
                ref={passwordRef}
                type={uiState.showSenha ? "text" : "password"}
                className="input-field pl-11 pr-11"
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
                className="absolute right-4 top-1/2 -translate-y-1/2 text-tertiary hover:text-secondary transition-colors"
                tabIndex={-1}
              >
                {uiState.showSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={uiState.validating || !uiState.senha.trim()}
            className="btn btn-primary w-full"
          >
            {uiState.validating ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={18} className="animate-spin" />
                Validando...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <ArrowRight size={18} />
                Entrar no Painel
              </span>
            )}
          </button>
        </form>
      </Modal>

      {/* Delete Confirm (ADMIN only) */}
      <ConfirmDialog
        open={!!uiState.deleteTarget}
        onClose={() => setUiState(prev => ({ ...prev, deleteTarget: null }))}
        onConfirm={() => uiState.deleteTarget && deleteMut.mutate(uiState.deleteTarget.id)}
        title={`Excluir ${uiState.deleteTarget?.nomeFantasia || uiState.deleteTarget?.razaoSocial || "empresa"}?`}
        description="Todos os dados desta empresa serão removidos permanentemente. Esta ação não pode ser desfeita."
        confirmText="Excluir Empresa"
        loading={deleteMut.isPending}
      />
    </div>
  );
}
