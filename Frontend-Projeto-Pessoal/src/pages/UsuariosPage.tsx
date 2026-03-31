import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Plus, Search, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";
import {
  apiDeleteUsuario,
  apiListUsuarios,
  apiUpdateUsuario,
  type UpdateUsuarioPayload,
  type Usuario,
} from "../api/client";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { Modal } from "../components/ui/Modal";
import { formatDate } from "../lib/utils";
import { useAuth } from "../auth/AuthContext";

const schema = z.object({
  nome: z.string().optional(),
  login: z.string().min(1, "Login é obrigatório"),
  email: z.string().email("E-mail inválido"),
  role: z.enum(["GERENTE", "FUNCIONARIO", "ESTAGIARIO"]),
});
type FormValues = z.infer<typeof schema>;

function roleBadge(role?: string) {
  if (role === "GERENTE") return { bg: "rgba(245,158,11,0.12)", color: "#f59e0b", label: "Gerente" };
  if (role === "FUNCIONARIO") return { bg: "rgba(0,240,255,0.12)", color: "#00f0ff", label: "Funcionário" };
  return { bg: "rgba(167,139,250,0.12)", color: "#a78bfa", label: "Estagiário" };
}

function UsuarioForm({
  defaultValues,
  onSubmit,
  loading,
}: {
  defaultValues?: Partial<FormValues>;
  onSubmit: (v: FormValues) => void;
  loading?: boolean;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="input-group">
        <label className="input-label">Nome (opcional)</label>
        <input {...register("nome")} className="input-field" placeholder="Nome completo" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="input-group">
          <label className="input-label">Login</label>
          <input {...register("login")} className={`input-field ${errors.login ? "error" : ""}`} />
          {errors.login && <span className="input-error">{errors.login.message}</span>}
        </div>
        <div className="input-group">
          <label className="input-label">E-mail</label>
          <input {...register("email")} className={`input-field ${errors.email ? "error" : ""}`} />
          {errors.email && <span className="input-error">{errors.email.message}</span>}
        </div>
      </div>

      <div className="input-group">
        <label className="input-label">Perfil</label>
        <select {...register("role")} className={`input-field ${errors.role ? "error" : ""}`}>
          <option value="GERENTE">Gerente</option>
          <option value="FUNCIONARIO">Funcionário</option>
          <option value="ESTAGIARIO">Estagiário</option>
        </select>
        {errors.role && <span className="input-error">{errors.role.message}</span>}
      </div>

      <div className="divider" />
      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        {loading ? "Salvando..." : "Salvar usuário"}
      </button>
    </form>
  );
}

export function UsuariosPage() {
  const { user } = useAuth();
  const role = user?.roles?.[0];
  const canUpdate = role === "GERENTE" || role === "FUNCIONARIO";
  const canDelete = role === "GERENTE";

  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Usuario | null>(null);
  const [deleting, setDeleting] = useState<Usuario | null>(null);

  const { data: usuarios = [], isLoading, error } = useQuery({
    queryKey: ["usuarios"],
    queryFn: apiListUsuarios,
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUsuarioPayload }) => apiUpdateUsuario(id, payload),
    onSuccess: async (res) => {
      if (res.ok) {
        toast.success("Usuário atualizado!");
        await qc.invalidateQueries({ queryKey: ["usuarios"] });
        setEditing(null);
      } else {
        toast.error("Erro ao atualizar usuário");
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
        toast.error("Erro ao remover usuário");
      }
    },
  });

  const filtered = usuarios.filter((u) => {
    const q = search.toLowerCase();
    return (
      (u.nome ?? "").toLowerCase().includes(q) ||
      u.login.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.roles.join(" ").toLowerCase().includes(q)
    );
  });

  const defaultValues = editing ? {
    nome: editing.nome ?? "",
    login: editing.login,
    email: editing.email,
    role: (editing.roles[0] ?? "ESTAGIARIO") as FormValues["role"],
  } : undefined;

  return (
    <div className="page-container min-h-screen">
      {error && (
        <div className="mb-4 p-3 rounded-xl text-sm text-rose-400 flex items-center gap-2"
          style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)" }}>
          <span className="w-2 h-2 rounded-full bg-rose-400 flex-shrink-0" />
          Erro ao carregar usuários: {String(error)}
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="page-header">
        <div>
          <p className="text-xs text-slate-600 uppercase tracking-widest mb-1">Acesso</p>
          <h1 className="text-2xl font-bold text-slate-100">Usuários</h1>
          <p className="text-sm text-slate-500 mt-0.5">{usuarios.length} cadastrados</p>
        </div>
        {canUpdate && (
          <Link to="/cadastro" className="btn btn-primary">
            <Plus size={16} /> Novo Usuário
          </Link>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="search-bar mb-4" style={{ maxWidth: 360, width: "100%" }}>
        <Search size={15} className="search-icon" />
        <input
          className="input-field"
          placeholder="Buscar por nome, login, e-mail ou perfil..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass rounded-2xl overflow-hidden"
        style={{ border: "1px solid rgba(0,240,255,0.08)" }}
      >
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-12 w-full" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <UserRound size={40} />
            <p className="text-slate-500 mt-2 text-sm">{search ? "Nenhum resultado" : "Nenhum usuário cadastrado"}</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Login</th>
                <th className="hidden md:table-cell">E-mail</th>
                <th className="hidden sm:table-cell">Roles</th>
                <th className="hidden lg:table-cell">Cadastro</th>
                {(canUpdate || canDelete) && <th style={{ width: 90 }} />}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((u, i) => {
                  const badge = roleBadge(u.roles[0]);
                  return (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <td>
                        <span className="text-slate-200 font-medium">{u.nome || "—"}</span>
                      </td>
                      <td>{u.login}</td>
                      <td className="hidden md:table-cell">{u.email}</td>
                      <td className="hidden sm:table-cell">
                        <span className="badge" style={{ background: badge.bg, color: badge.color }}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="hidden lg:table-cell">
                        {u.dataCadastro ? formatDate(u.dataCadastro) : "—"}
                      </td>
                      {(canUpdate || canDelete) && (
                        <td>
                          <div className="flex items-center gap-1 justify-end">
                            {canUpdate && (
                              <button
                                onClick={() => setEditing(u)}
                                className="btn btn-ghost btn-icon text-slate-500 hover:text-cyan-400"
                              >
                                <Pencil size={14} />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => setDeleting(u)}
                                className="btn btn-ghost btn-icon text-slate-500 hover:text-rose-400"
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
        )}
      </motion.div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar Usuário">
        {editing && (
          <UsuarioForm
            defaultValues={defaultValues}
            loading={updateMut.isPending}
            onSubmit={(v) => updateMut.mutate({
              id: editing.id,
              payload: { nome: v.nome?.trim() || undefined, login: v.login, email: v.email, roles: [v.role] },
            })}
          />
        )}
      </Modal>

      {canDelete && (
        <ConfirmDialog
          open={!!deleting}
          onClose={() => setDeleting(null)}
          onConfirm={() => deleting && deleteMut.mutate(deleting.id)}
          loading={deleteMut.isPending}
          description={`Deseja remover "${deleting?.nome || deleting?.login}"? Esta ação não pode ser desfeita.`}
        />
      )}
    </div>
  );
}
