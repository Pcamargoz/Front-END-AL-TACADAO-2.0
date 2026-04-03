import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Search, Trash2, UserRound, Mail, Shield, Calendar, Link2, UserCheck, UserX, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  apiDeleteUsuario,
  apiListUsuarios,
  apiUpdateUsuario,
  apiUpdateUsuarioRoles,
  apiVincularUsuarioEmpresa,
  apiAprovarUsuario,
  apiRejeitarUsuario,
  apiListFornecedores,
  type UpdateUsuarioPayload,
  type Usuario,
  type Fornecedor,
  type UserRole,
} from "../api/client";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { Modal } from "../components/ui/Modal";
import { formatDate } from "../lib/utils";
import { useAuth } from "../auth/AuthContext";

const schema = z.object({
  nome:  z.string().optional(),
  login: z.string().min(1, "Usuário é obrigatório"),
  email: z.string().email("E-mail inválido"),
  senha: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

function roleBadge(role?: string) {
  if (role === "GERENTE") return { bg: "rgba(0,255,135,0.10)",  color: "#00FF87", label: "Gerente" };
  return                         { bg: "rgba(0,229,255,0.10)", color: "#00E5FF", label: "Usuário" };
}

function UserForm({
  defaultValues,
  onSubmit,
  loading,
  isNew,
}: {
  defaultValues?: Partial<FormValues>;
  onSubmit: (v: FormValues) => void;
  loading?: boolean;
  isNew?: boolean;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(isNew ? schema.extend({ senha: z.string().min(6, "Mínimo 6 caracteres") }) : schema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="input-label mb-2 block">Nome completo</label>
        <input {...register("nome")} className="input-field" placeholder="Nome do usuário" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="input-label mb-2 block">Usuário *</label>
          <input {...register("login")} className={`input-field ${errors.login ? "border-[#EF4444]" : ""}`} placeholder="usuario" />
          {errors.login && <span className="text-xs text-[#EF4444] mt-1 block">{errors.login.message}</span>}
        </div>
        <div>
          <label className="input-label mb-2 block">E-mail *</label>
          <input {...register("email")} type="email" className={`input-field ${errors.email ? "border-[#EF4444]" : ""}`} placeholder="email@empresa.com" />
          {errors.email && <span className="text-xs text-[#EF4444] mt-1 block">{errors.email.message}</span>}
        </div>
      </div>

      {isNew && (
        <div>
          <label className="input-label mb-2 block">Senha *</label>
          <input {...register("senha")} type="password" className={`input-field ${errors.senha ? "border-[#EF4444]" : ""}`} placeholder="••••••••" />
          {errors.senha && <span className="text-xs text-[#EF4444] mt-1 block">{errors.senha.message}</span>}
        </div>
      )}

      <div className="pt-4 border-t border-[#1A1D24]" />
      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-[#090B10]/30 border-t-[#090B10] animate-spin" />
            Salvando...
          </span>
        ) : (
          isNew ? "Criar usuário" : "Salvar alterações"
        )}
      </button>
    </form>
  );
}

// Modal para vincular usuário à empresa
function VincularEmpresaModal({
  open,
  onClose,
  usuario,
  fornecedores,
  onVincular,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  usuario: Usuario | null;
  fornecedores: Fornecedor[];
  onVincular: (empresaId: string) => void;
  loading: boolean;
}) {
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>("");

  return (
    <Modal open={open} onClose={onClose} title="Vincular à Empresa">
      <div className="space-y-4">
        <p className="text-sm text-[#9CA3AF]">
          Selecione a empresa para vincular o usuário <strong className="text-[#F5F5F5]">{usuario?.nome || usuario?.login}</strong>
        </p>

        <div>
          <label className="input-label mb-2 block">Empresa</label>
          <select
            value={selectedEmpresa}
            onChange={(e) => setSelectedEmpresa(e.target.value)}
            className="input-field"
          >
            <option value="">Selecione uma empresa...</option>
            {fornecedores.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nomeFantasia || f.razaoSocial} - {f.cnpj}
              </option>
            ))}
          </select>
        </div>

        {fornecedores.length === 0 && (
          <div className="p-3 rounded-sm bg-[#F59E0B]/10 border border-[#F59E0B]/20">
            <p className="text-xs text-[#F59E0B]">
              Nenhuma empresa cadastrada. Crie uma empresa primeiro na página de Fornecedores.
            </p>
          </div>
        )}

        <div className="pt-4 border-t border-[#1A1D24]" />
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="btn btn-secondary flex-1"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={() => selectedEmpresa && onVincular(selectedEmpresa)}
            className="btn btn-primary flex-1"
            disabled={loading || !selectedEmpresa}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-[#090B10]/30 border-t-[#090B10] animate-spin" />
                Vinculando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Link2 size={16} />
                Vincular
              </span>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// Modal para alterar role do usuário
function AlterarRoleModal({
  open,
  onClose,
  usuario,
  onAlterar,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  usuario: Usuario | null;
  onAlterar: (roles: UserRole[]) => void;
  loading: boolean;
}) {
  const currentRole = usuario?.roles?.[0] ?? "USER";
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole as UserRole);

  return (
    <Modal open={open} onClose={onClose} title="Alterar Função">
      <div className="space-y-4">
        <p className="text-sm text-[#9CA3AF]">
          Alterar função do usuário <strong className="text-[#F5F5F5]">{usuario?.nome || usuario?.login}</strong>
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setSelectedRole("USER")}
            className={`p-4 rounded-sm border-2 text-left transition-all ${
              selectedRole === "USER"
                ? "border-[#00E5FF] bg-[#00E5FF]/5"
                : "border-[#1A1D24] hover:border-[#4B5563]"
            }`}
          >
            <span className={`text-sm font-medium block ${selectedRole === "USER" ? "text-[#00E5FF]" : "text-[#F5F5F5]"}`}>
              Usuário
            </span>
            <span className="text-xs text-[#4B5563]">Acesso básico ao sistema</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole("GERENTE")}
            className={`p-4 rounded-sm border-2 text-left transition-all ${
              selectedRole === "GERENTE"
                ? "border-[#00FF87] bg-[#00FF87]/5"
                : "border-[#1A1D24] hover:border-[#4B5563]"
            }`}
          >
            <span className={`text-sm font-medium block ${selectedRole === "GERENTE" ? "text-[#00FF87]" : "text-[#F5F5F5]"}`}>
              Gerente
            </span>
            <span className="text-xs text-[#4B5563]">Acesso total ao sistema</span>
          </button>
        </div>

        <div className="pt-4 border-t border-[#1A1D24]" />
        <div className="flex gap-3">
          <button onClick={onClose} className="btn btn-secondary flex-1" disabled={loading}>
            Cancelar
          </button>
          <button
            onClick={() => onAlterar([selectedRole])}
            className="btn btn-primary flex-1"
            disabled={loading}
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function UsersPage() {
  const { user, isManager } = useAuth();

  const qc = useQueryClient();
  const [search,       setSearch]       = useState("");
  const [editing,      setEditing]      = useState<Usuario | null>(null);
  const [deleting,     setDeleting]     = useState<Usuario | null>(null);
  const [vinculando,   setVinculando]   = useState<Usuario | null>(null);
  const [alterandoRole, setAlterandoRole] = useState<Usuario | null>(null);
  const [filterPending, setFilterPending] = useState(false);

  const { data: usersData, isLoading, error } = useQuery({
    queryKey: ["usuarios"],
    queryFn:  () => apiListUsuarios(),
  });
  const users = usersData?.content ?? [];

  const { data: fornecedores = [] } = useQuery({
    queryKey: ["fornecedores"],
    queryFn:  apiListFornecedores,
    enabled:  isManager,
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUsuarioPayload }) =>
      apiUpdateUsuario(id, payload),
    onSuccess: async (res) => {
      if (res.ok) {
        toast.success("Usuário atualizado");
        await qc.invalidateQueries({ queryKey: ["usuarios"] });
        setEditing(null);
      } else {
        toast.error("Falha ao atualizar usuário");
      }
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => apiDeleteUsuario(id),
    onSuccess: async (res) => {
      if (res.ok) {
        toast.success("Usuário removido");
        await qc.invalidateQueries({ queryKey: ["usuarios"] });
        setDeleting(null);
      } else {
        toast.error("Falha ao remover usuário");
      }
    },
  });

  const vincularMut = useMutation({
    mutationFn: ({ usuarioId, empresaId }: { usuarioId: string; empresaId: string }) =>
      apiVincularUsuarioEmpresa(usuarioId, empresaId),
    onSuccess: async (res) => {
      if (res.ok) {
        toast.success("Usuário vinculado à empresa com sucesso!");
        await qc.invalidateQueries({ queryKey: ["usuarios"] });
        setVinculando(null);
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.message || "Falha ao vincular usuário");
      }
    },
  });

  // Mutation para aprovar usuário pendente
  const aprovarMut = useMutation({
    mutationFn: (usuarioId: string) => apiAprovarUsuario(usuarioId),
    onSuccess: async (res) => {
      if (res.ok) {
        toast.success("Usuário aprovado com sucesso!");
        await qc.invalidateQueries({ queryKey: ["usuarios"] });
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.message || "Falha ao aprovar usuário");
      }
    },
  });

  // Mutation para rejeitar usuário pendente
  const rejeitarMut = useMutation({
    mutationFn: (usuarioId: string) => apiRejeitarUsuario(usuarioId),
    onSuccess: async (res) => {
      if (res.ok) {
        toast.success("Usuário rejeitado");
        await qc.invalidateQueries({ queryKey: ["usuarios"] });
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.message || "Falha ao rejeitar usuário");
      }
    },
  });

  const rolesMut = useMutation({
    mutationFn: ({ id, roles }: { id: string; roles: UserRole[] }) =>
      apiUpdateUsuarioRoles(id, roles),
    onSuccess: async (res) => {
      if (res.ok) {
        toast.success("Função alterada com sucesso!");
        await qc.invalidateQueries({ queryKey: ["usuarios"] });
        setAlterandoRole(null);
      } else {
        toast.error("Falha ao alterar função");
      }
    },
  });

  // Filtrar usuários
  const filtered = users.filter((u) => {
    // Filtro de pendentes (status PENDENTE ou sem empresaId)
    const isPending = u.status === "PENDENTE" || !u.empresaId;
    if (filterPending && !isPending) return false;
    
    const q = search.toLowerCase();
    return (
      (u.nome ?? "").toLowerCase().includes(q) ||
      u.login.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.roles.join(" ").toLowerCase().includes(q)
    );
  });

  // Contar usuários pendentes
  const pendingCount = users.filter((u) => u.status === "PENDENTE" || !u.empresaId).length;
  const activeCount = users.filter((u) => u.status === "ATIVO" && u.empresaId).length;

  const defaultValues = editing ? {
    nome:  editing.nome ?? "",
    login: editing.login,
    email: editing.email,
  } : undefined;

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 rounded-sm bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
          <span className="text-sm text-[#EF4444]">Falha ao carregar usuários: {String(error)}</span>
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#00FF87] mb-1 block">
            Gestão
          </span>
          <h1 className="text-2xl font-display font-bold text-[#F5F5F5]">Usuários</h1>
          <p className="text-sm text-[#9CA3AF]">
            {activeCount} usuário{activeCount !== 1 ? "s" : ""} ativo{activeCount !== 1 ? "s" : ""}
            {pendingCount > 0 && (
              <span className="text-[#F59E0B]"> • {pendingCount} aguardando aprovação</span>
            )}
          </p>
        </div>
      </motion.div>

      {/* Pending Users Alert */}
      {pendingCount > 0 && isManager && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-sm bg-[#F59E0B]/10 border border-[#F59E0B]/20"
        >
          <div className="flex items-start gap-3">
            <Clock size={20} className="text-[#F59E0B] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[#F5F5F5]">
                {pendingCount} usuário{pendingCount !== 1 ? "s" : ""} aguardando aprovação
              </p>
              <p className="text-xs text-[#9CA3AF] mt-1">
                Revise e aprove os usuários que solicitaram acesso à sua empresa.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
          <input
            type="text"
            className="input-field pl-10 w-full"
            placeholder="Buscar por nome, usuário, e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        {pendingCount > 0 && (
          <button
            onClick={() => setFilterPending(!filterPending)}
            className={`btn ${filterPending ? "btn-primary" : "btn-secondary"}`}
          >
            <Clock size={16} />
            Pendentes ({pendingCount})
          </button>
        )}
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="card overflow-hidden"
      >
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-12 w-full" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <UserRound size={48} className="mx-auto text-[#4B5563] mb-3" />
            <p className="text-[#9CA3AF]">
              {search || filterPending ? "Nenhum resultado encontrado" : "Nenhum usuário cadastrado"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-[#4B5563] uppercase tracking-wider border-b border-[#1A1D24]">
                  <th className="px-6 py-4">Usuário</th>
                  <th className="px-6 py-4 hidden md:table-cell">E-mail</th>
                  <th className="px-6 py-4 hidden sm:table-cell">Função</th>
                  <th className="px-6 py-4 hidden lg:table-cell">Empresa</th>
                  <th className="px-6 py-4 hidden xl:table-cell">Cadastro</th>
                  {isManager && <th className="px-6 py-4 w-32" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1D24]">
                <AnimatePresence>
                  {filtered.map((u, i) => {
                    const badge = roleBadge(u.roles[0]);
                    const isSelf = u.id === user?.id;
                    const isPending = u.status === "PENDENTE" || !u.empresaId;
                    
                    return (
                      <motion.tr
                        key={u.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.035 }}
                        className="hover:bg-[#1A1D24]/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-sm flex items-center justify-center text-sm font-bold ${
                              isPending ? "bg-[#F59E0B]/10 text-[#F59E0B]" : "bg-[#00FF87]/10 text-[#00FF87]"
                            }`}>
                              {(u.nome || u.login).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[#F5F5F5]">{u.nome || "—"}</p>
                              <p className="text-xs text-[#4B5563]">@{u.login}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <div className="flex items-center gap-2 text-sm text-[#9CA3AF]">
                            <Mail size={14} className="text-[#4B5563]" />
                            {u.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                          <button
                            onClick={() => isManager && !isSelf && !isPending && setAlterandoRole(u)}
                            disabled={!isManager || isSelf || isPending}
                            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-sm transition-opacity ${
                              isManager && !isSelf && !isPending ? "hover:opacity-80 cursor-pointer" : ""
                            }`}
                            style={{ background: badge.bg, color: badge.color }}
                          >
                            <Shield size={12} />
                            {badge.label}
                          </button>
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          {isPending ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-sm bg-[#F59E0B]/10 text-[#F59E0B]">
                              <Clock size={12} />
                              Pendente
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-sm bg-[#10B981]/10 text-[#10B981]">
                              <CheckCircle2 size={12} />
                              Ativo
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 hidden xl:table-cell">
                          <div className="flex items-center gap-2 text-xs text-[#4B5563]">
                            <Calendar size={12} />
                            {u.dataCadastro ? formatDate(u.dataCadastro) : "—"}
                          </div>
                        </td>
                        {isManager && (
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1 justify-end">
                              {/* Botões de aprovar/rejeitar para usuários pendentes */}
                              {isPending && (
                                <>
                                  <button
                                    onClick={() => aprovarMut.mutate(u.id)}
                                    disabled={aprovarMut.isPending}
                                    className="btn btn-ghost btn-icon btn-sm hover:text-[#00FF87] hover:bg-[#00FF87]/10"
                                    title="Aprovar usuário"
                                  >
                                    <UserCheck size={14} />
                                  </button>
                                  <button
                                    onClick={() => rejeitarMut.mutate(u.id)}
                                    disabled={rejeitarMut.isPending}
                                    className="btn btn-ghost btn-icon btn-sm hover:text-[#EF4444] hover:bg-[#EF4444]/10"
                                    title="Rejeitar usuário"
                                  >
                                    <UserX size={14} />
                                  </button>
                                </>
                              )}
                              {/* Vincular manualmente (fallback para usuários antigos sem empresa) */}
                              {isPending && fornecedores.length > 0 && (
                                <button
                                  onClick={() => setVinculando(u)}
                                  className="btn btn-ghost btn-icon btn-sm hover:text-[#00E5FF]"
                                  title="Vincular à outra empresa"
                                >
                                  <Link2 size={14} />
                                </button>
                              )}
                              <button
                                onClick={() => setEditing(u)}
                                className="btn btn-ghost btn-icon btn-sm hover:text-[#00FF87]"
                                title="Editar"
                              >
                                <Pencil size={14} />
                              </button>
                              {!isSelf && (
                                <button
                                  onClick={() => setDeleting(u)}
                                  className="btn btn-ghost btn-icon btn-sm hover:text-[#EF4444]"
                                  title="Remover"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Edit Modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar Usuário">
        {editing && (
          <UserForm
            defaultValues={defaultValues}
            loading={updateMut.isPending}
            onSubmit={(v) => updateMut.mutate({
              id: editing.id,
              payload: { nome: v.nome?.trim() || undefined, login: v.login, email: v.email },
            })}
          />
        )}
      </Modal>

      {/* Vincular Empresa Modal */}
      <VincularEmpresaModal
        open={!!vinculando}
        onClose={() => setVinculando(null)}
        usuario={vinculando}
        fornecedores={fornecedores}
        onVincular={(empresaId) => vinculando && vincularMut.mutate({ usuarioId: vinculando.id, empresaId })}
        loading={vincularMut.isPending}
      />

      {/* Alterar Role Modal */}
      <AlterarRoleModal
        open={!!alterandoRole}
        onClose={() => setAlterandoRole(null)}
        usuario={alterandoRole}
        onAlterar={(roles) => alterandoRole && rolesMut.mutate({ id: alterandoRole.id, roles })}
        loading={rolesMut.isPending}
      />

      {/* Delete Confirmation */}
      {isManager && (
        <ConfirmDialog
          open={!!deleting}
          onClose={() => setDeleting(null)}
          onConfirm={() => deleting && deleteMut.mutate(deleting.id)}
          loading={deleteMut.isPending}
          description={`Remover "${deleting?.nome || deleting?.login}"? Esta ação não pode ser desfeita.`}
        />
      )}
    </div>
  );
}
