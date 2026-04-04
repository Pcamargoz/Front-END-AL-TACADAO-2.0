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
    <div className="min-h-screen bg-[#090B10]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <p className="text-[#00FF87] text-sm font-medium tracking-wider uppercase mb-1">
              Olá, {user?.nome || user?.login}
            </p>
            <h1 className="text-2xl font-display font-bold text-[#F5F5F5]">
              Empresas
            </h1>
            <p className="text-[#9CA3AF] text-sm mt-1">
              Selecione uma empresa para acessar o painel de administração
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="btn btn-secondary">
              <House size={16} /> <span>Menu inicial</span>
            </Link>
            <Link to="/empresas/cadastrar" className="btn btn-primary">
              <Plus size={18} /> <span>Nova Empresa</span>
            </Link>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative max-w-md mb-6"
        >
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
          <input
            className="input-field pl-10 w-full"
            placeholder="Buscar por nome, CNPJ ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </motion.div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-sm flex items-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Erro ao carregar empresas: {String(error)}
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-[#1A1D24] rounded-sm animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-sm bg-[#1A1D24] flex items-center justify-center">
              <Building2 size={32} className="text-[#4B5563]" />
            </div>
            <p className="text-[#9CA3AF] mb-4">
              {search ? "Nenhuma empresa encontrada" : "Nenhuma empresa cadastrada"}
            </p>
            {!search && (
              <Link to="/empresas/cadastrar" className="btn btn-primary">
                <Plus size={16} /> Cadastrar Empresa
              </Link>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <AnimatePresence>
              {filtered.map((f, i) => (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="card p-5 hover:border-[#00FF87]/25 transition-all group cursor-pointer"
                  onClick={() => openGate(f)}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div
                      className="w-12 h-12 rounded-sm flex items-center justify-center text-lg font-bold flex-shrink-0"
                      style={{ background: "rgba(0,255,135,0.1)", color: "#00FF87" }}
                    >
                      {(f.nomeFantasia || f.razaoSocial).charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[#F5F5F5] font-medium truncate">
                        {f.nomeFantasia || f.razaoSocial}
                      </p>
                      {f.nomeFantasia && (
                        <p className="text-[#4B5563] text-xs truncate">{f.razaoSocial}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 mb-4">
                    <p className="text-xs text-[#9CA3AF] truncate">{f.email}</p>
                    <p className="text-xs font-mono text-[#4B5563]">{f.cnpj}</p>
                    {f.telefone && (
                      <p className="text-xs text-[#4B5563]">{f.telefone}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button className="btn btn-secondary flex-1 group-hover:border-[#00FF87]/40 group-hover:text-[#00FF87]">
                      <Lock size={14} />
                      <span>Acessar</span>
                      <ArrowRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    {isAdmin && (
                      <button
                        className="btn btn-secondary px-3 hover:border-[#EF4444]/40 hover:text-[#EF4444] transition-colors"
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(f); }}
                        title="Excluir empresa"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        <p className="text-center text-xs text-[#4B5563] mt-8">
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
        <form onSubmit={handleValidar} className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-sm bg-[#1A1D24]">
            <div
              className="w-10 h-10 rounded-sm flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: "rgba(0,255,135,0.1)", color: "#00FF87" }}
            >
              {(selectedFornecedor?.nomeFantasia || selectedFornecedor?.razaoSocial || "E").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm text-[#F5F5F5] font-medium truncate">
                {selectedFornecedor?.nomeFantasia || selectedFornecedor?.razaoSocial}
              </p>
              <p className="text-xs text-[#4B5563] font-mono truncate">{selectedFornecedor?.cnpj}</p>
            </div>
          </div>

          <p className="text-sm text-[#9CA3AF]">
            Digite a senha de acesso para entrar no painel desta empresa.
          </p>

          {gateError && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-sm bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
              <span className="text-sm text-[#EF4444]">{gateError}</span>
            </motion.div>
          )}

          <div>
            <label className="input-label mb-2 block">Senha de acesso</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
              <input
                type={showSenha ? "text" : "password"}
                className="input-field pl-10 pr-10"
                placeholder="Digite a senha..."
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoFocus
                required
              />
              <button
                type="button"
                onClick={() => setShowSenha((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4B5563] hover:text-[#9CA3AF] transition-colors"
              >
                {showSenha ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={validating || !senha.trim()}
            className="btn btn-primary w-full"
          >
            {validating ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Validando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <ArrowRight size={16} />
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
