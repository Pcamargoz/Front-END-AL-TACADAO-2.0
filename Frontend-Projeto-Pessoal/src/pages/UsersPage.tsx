import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Plus, Search, Trash2, UserRound, Mail, Shield, Calendar } from "lucide-react";
import { toast } from "sonner";
import {
  apiDeleteUsuario,
  apiListUsuarios,
  apiUpdateUsuario,
  apiCadastro,
  type UpdateUsuarioPayload,
  type Usuario,
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
  role:  z.enum(["GERENTE", "FUNCIONARIO", "ESTAGIARIO"]),
});
type FormValues = z.infer<typeof schema>;

function roleBadge(role?: string) {
  if (role === "GERENTE")    return { bg: "rgba(0,255,135,0.10)",  color: "#00FF87", label: "Gerente"     };
  if (role === "FUNCIONARIO") return { bg: "rgba(0,229,255,0.10)", color: "#00E5FF", label: "Funcionário" };
  return                             { bg: "rgba(245,158,11,0.10)", color: "#F59E0B", label: "Estagiário"  };
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

      <div>
        <label className="input-label mb-2 block">Função</label>
        <select {...register("role")} className={`input-field ${errors.role ? "border-[#EF4444]" : ""}`}>
          <option value="GERENTE">Gerente</option>
          <option value="FUNCIONARIO">Funcionário</option>
          <option value="ESTAGIARIO">Estagiário</option>
        </select>
        {errors.role && <span className="text-xs text-[#EF4444] mt-1 block">{errors.role.message}</span>}
      </div>

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

export function UsersPage() {
  const { user } = useAuth();
  const role      = user?.roles?.[0];
  const canUpdate = role === "GERENTE" || role === "FUNCIONARIO";
  const canDelete = role === "GERENTE";

  const qc = useQueryClient();
  const [search,   setSearch]   = useState("");
  const [editing,  setEditing]  = useState<Usuario | null>(null);
  const [deleting, setDeleting] = useState<Usuario | null>(null);
  const [creating, setCreating] = useState(false);

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ["usuarios"],
    queryFn:  apiListUsuarios,
  });

  const createMut = useMutation({
    mutationFn: async (v: FormValues) => {
      const res = await apiCadastro({
        nome: v.nome?.trim() || undefined,
        login: v.login,
        email: v.email,
        senha: v.senha!,
        roles: [v.role],
      });
      if (res.status !== 201) throw new Error("Falha ao criar usuário");
      return res;
    },
    onSuccess: async () => {
      toast.success("Usuário criado com sucesso");
      await qc.invalidateQueries({ queryKey: ["usuarios"] });
      setCreating(false);
    },
    onError: () => {
      toast.error("Falha ao criar usuário");
    },
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

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      (u.nome ?? "").toLowerCase().includes(q) ||
      u.login.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.roles.join(" ").toLowerCase().includes(q)
    );
  });

  const defaultValues = editing ? {
    nome:  editing.nome ?? "",
    login: editing.login,
    email: editing.email,
    role:  (editing.roles[0] ?? "ESTAGIARIO") as FormValues["role"],
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
          <p className="text-sm text-[#9CA3AF]">{users.length} usuário{users.length !== 1 ? "s" : ""} cadastrado{users.length !== 1 ? "s" : ""}</p>
        </div>
        {canUpdate && (
          <button onClick={() => setCreating(true)} className="btn btn-primary">
            <Plus size={16} /> Novo Usuário
          </button>
        )}
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
          <input
            type="text"
            className="input-field pl-10"
            placeholder="Buscar por nome, usuário, e-mail ou função..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
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
              {search ? "Nenhum resultado encontrado" : "Nenhum usuário cadastrado"}
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
                  <th className="px-6 py-4 hidden lg:table-cell">Cadastro</th>
                  {(canUpdate || canDelete) && <th className="px-6 py-4 w-24" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1D24]">
                <AnimatePresence>
                  {filtered.map((u, i) => {
                    const badge = roleBadge(u.roles[0]);
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
                            <div className="w-9 h-9 rounded-sm flex items-center justify-center text-sm font-bold bg-[#00FF87]/10 text-[#00FF87]">
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
                          <span 
                            className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-sm"
                            style={{ background: badge.bg, color: badge.color }}
                          >
                            <Shield size={12} />
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          <div className="flex items-center gap-2 text-xs text-[#4B5563]">
                            <Calendar size={12} />
                            {u.dataCadastro ? formatDate(u.dataCadastro) : "—"}
                          </div>
                        </td>
                        {(canUpdate || canDelete) && (
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1 justify-end">
                              {canUpdate && (
                                <button
                                  onClick={() => setEditing(u)}
                                  className="btn btn-ghost btn-icon btn-sm hover:text-[#00FF87]"
                                >
                                  <Pencil size={14} />
                                </button>
                              )}
                              {canDelete && (
                                <button
                                  onClick={() => setDeleting(u)}
                                  className="btn btn-ghost btn-icon btn-sm hover:text-[#EF4444]"
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

      {/* Create Modal */}
      <Modal open={creating} onClose={() => setCreating(false)} title="Novo Usuário">
        <UserForm
          defaultValues={{ role: "FUNCIONARIO" }}
          loading={createMut.isPending}
          isNew
          onSubmit={(v) => createMut.mutate(v)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar Usuário">
        {editing && (
          <UserForm
            defaultValues={defaultValues}
            loading={updateMut.isPending}
            onSubmit={(v) => updateMut.mutate({
              id: editing.id,
              payload: { nome: v.nome?.trim() || undefined, login: v.login, email: v.email, roles: [v.role] },
            })}
          />
        )}
      </Modal>

      {/* Delete Confirmation */}
      {canDelete && (
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
