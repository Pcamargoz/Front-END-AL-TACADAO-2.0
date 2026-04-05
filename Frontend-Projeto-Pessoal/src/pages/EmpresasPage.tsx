import { useState } from "react";
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

export function EmpresasPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { entrarFornecedor } = useFornecedor();
  const queryClient = useQueryClient();
  const isAdmin = user?.roles?.includes("ADMIN") ?? false;

  const [search, setSearch] = useState("");
  const [selectedFornecedor, setSelectedFornecedor] = useState<Fornecedor | null>(null);
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [validating, setValidating] = useState(false);
  const [gateError, setGateError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Fornecedor | null>(null);

  const deleteMut = useMutation({
    mutationFn: (id: string) => apiDeleteFornecedor(id).then((res) => {
      if (!res.ok) throw new Error("Erro ao excluir empresa");
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fornecedores"] });
      toast.success("Empresa excluída com sucesso");
      setDeleteTarget(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Erro ao excluir empresa");
    },
  });

  const { data: fornecedores = [], isLoading, error } = useQuery<Fornecedor[], Error>({
    queryKey: ["fornecedores"],
    queryFn: apiListFornecedores,
  });

  const filtered = fornecedores.filter((f) => {
    const q = search.toLowerCase();
    return (
      f.razaoSocial.toLowerCase().includes(q) ||
      (f.nomeFantasia ?? "").toLowerCase().includes(q) ||
      f.email.toLowerCase().includes(q) ||
      f.cnpj.includes(q)
    );
  });

  const openGate = (f: Fornecedor) => {
    setSelectedFornecedor(f);
    setSenha("");
    setGateError("");
    setShowSenha(false);
  };

  const closeGate = () => {
    setSelectedFornecedor(null);
    setSenha("");
    setGateError("");
  };

  const handleValidar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFornecedor || !senha.trim()) return;

    setValidating(true);
    setGateError("");

    try {
      const res = await apiValidarAcessoFornecedor(selectedFornecedor.id, senha);
      if (res.ok) {
        const data = (await res.json()) as ValidarAcessoResponse;
        entrarFornecedor({
          fornecedorToken: data.fornecedorToken,
          fornecedorId: selectedFornecedor.id,
          role: data.role,
          nome: data.fornecedorNome,
        });
        toast.success(`Bem-vindo ao painel de ${data.fornecedorNome}!`);
        navigate(`/empresas/${selectedFornecedor.id}/painel`);
      } else {
        const body = await res.json().catch(() => null);
        setGateError(body?.message || "Senha inválida");
      }
    } catch {
      setGateError("Erro ao validar acesso. Tente novamente.");
    } finally {
      setValidating(false);
    }
  };

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

        {/* Search */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative max-w-md mb-8"
        >
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-tertiary" />
          <input
            className="input-field pl-11 w-full"
            placeholder="Buscar por nome, CNPJ ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </motion.div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Erro ao carregar empresas: {String(error)}
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className="h-48 skeleton rounded-2xl" 
                style={{ animationDelay: `${i * 0.1}s` }} 
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-12 text-center"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-surface-secondary flex items-center justify-center">
              <Building2 size={36} className="text-tertiary" />
            </div>
            <h3 className="text-title-sm text-primary mb-2">
              {search ? "Nenhuma empresa encontrada" : "Nenhuma empresa cadastrada"}
            </h3>
            <p className="text-body-sm text-secondary mb-6">
              {search ? "Tente ajustar sua busca" : "Comece cadastrando sua primeira empresa"}
            </p>
            {!search && (
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
                  className="card p-6 group cursor-pointer"
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
                    <p className="text-caption text-tertiary">{f.cnpj}</p>
                    {f.telefone && (
                      <p className="text-caption text-tertiary">{f.telefone}</p>
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
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(f); }}
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

      {/* Gate Modal */}
      <Modal
        open={!!selectedFornecedor}
        onClose={closeGate}
        title={`Acessar ${selectedFornecedor?.nomeFantasia || selectedFornecedor?.razaoSocial || "Empresa"}`}
        size="sm"
      >
        <form onSubmit={handleValidar} className="space-y-5">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-secondary">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-lg font-semibold text-accent flex-shrink-0">
              {(selectedFornecedor?.nomeFantasia || selectedFornecedor?.razaoSocial || "E").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-body font-medium text-primary truncate">
                {selectedFornecedor?.nomeFantasia || selectedFornecedor?.razaoSocial}
              </p>
              <p className="text-caption text-tertiary truncate">{selectedFornecedor?.cnpj}</p>
            </div>
          </div>

          <p className="text-body-sm text-secondary">
            Digite a senha de acesso para entrar no painel desta empresa.
          </p>

          {gateError && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30"
            >
              <p className="text-body-sm text-red-600 dark:text-red-400">{gateError}</p>
            </motion.div>
          )}

          <div className="input-group">
            <label className="input-label">Senha de acesso</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-tertiary" />
              <input
                type={showSenha ? "text" : "password"}
                className="input-field pl-11 pr-11"
                placeholder="Digite a senha..."
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoFocus
                required
              />
              <button
                type="button"
                onClick={() => setShowSenha((s) => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-tertiary hover:text-secondary transition-colors"
              >
                {showSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={validating || !senha.trim()}
            className="btn btn-primary w-full"
          >
            {validating ? (
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
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMut.mutate(deleteTarget.id)}
        title={`Excluir ${deleteTarget?.nomeFantasia || deleteTarget?.razaoSocial || "empresa"}?`}
        description="Todos os dados desta empresa serão removidos permanentemente. Esta ação não pode ser desfeita."
        confirmText="Excluir Empresa"
        loading={deleteMut.isPending}
      />
    </div>
  );
}
