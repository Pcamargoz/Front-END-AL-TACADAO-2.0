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
  nome:  z.string().optional(),
  login: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email"),
  role:  z.enum(["GERENTE", "FUNCIONARIO", "ESTAGIARIO"]),
});
type FormValues = z.infer<typeof schema>;

function roleBadge(role?: string) {
  if (role === "GERENTE")    return { bg: "rgba(232,160,32,0.10)",  color: "#E8A020", label: "Manager"  };
  if (role === "FUNCIONARIO") return { bg: "rgba(34,197,94,0.10)",  color: "#22C55E", label: "Employee" };
  return                             { bg: "rgba(129,140,248,0.10)", color: "#818CF8", label: "Intern"   };
}

function UserForm({
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
        <label className="input-label">Full name (optional)</label>
        <input {...register("nome")} className="input-field" placeholder="Full name" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="input-group">
          <label className="input-label">Username</label>
          <input {...register("login")} className={`input-field ${errors.login ? "error" : ""}`} />
          {errors.login && <span className="input-error">{errors.login.message}</span>}
        </div>
        <div className="input-group">
          <label className="input-label">Email</label>
          <input {...register("email")} className={`input-field ${errors.email ? "error" : ""}`} />
          {errors.email && <span className="input-error">{errors.email.message}</span>}
        </div>
      </div>

      <div className="input-group">
        <label className="input-label">Role</label>
        <select {...register("role")} className={`input-field ${errors.role ? "error" : ""}`}>
          <option value="GERENTE">Manager</option>
          <option value="FUNCIONARIO">Employee</option>
          <option value="ESTAGIARIO">Intern</option>
        </select>
        {errors.role && <span className="input-error">{errors.role.message}</span>}
      </div>

      <div className="divider" />
      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        {loading ? "Saving..." : "Save user"}
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

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ["usuarios"],
    queryFn:  apiListUsuarios,
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUsuarioPayload }) =>
      apiUpdateUsuario(id, payload),
    onSuccess: async (res) => {
      if (res.ok) {
        toast.success("User updated");
        await qc.invalidateQueries({ queryKey: ["usuarios"] });
        setEditing(null);
      } else {
        toast.error("Failed to update user");
      }
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => apiDeleteUsuario(id),
    onSuccess: async (res) => {
      if (res.ok) {
        toast.success("User removed");
        await qc.invalidateQueries({ queryKey: ["usuarios"] });
        setDeleting(null);
      } else {
        toast.error("Failed to remove user");
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
    <div className="page-container min-h-screen">
      {error && (
        <div className="alert alert-error mb-4">
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#E5484D" }} />
          Failed to load users: {String(error)}
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="page-header">
        <div>
          <p className="page-eyebrow">Access</p>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">{users.length} registered</p>
        </div>
        {canUpdate && (
          <Link to="/register" className="btn btn-primary">
            <Plus size={15} /> New user
          </Link>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="search-bar mb-4" style={{ maxWidth: 360, width: "100%" }}>
        <Search size={14} className="search-icon" />
        <input
          className="input-field"
          placeholder="Search by name, username, email or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="card overflow-hidden"
      >
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-11 w-full" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <UserRound size={36} />
            <p style={{ color: "#52525B", fontSize: "0.875rem", marginTop: "0.5rem" }}>
              {search ? "No results found" : "No users registered"}
            </p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th className="hidden md:table-cell">Email</th>
                <th className="hidden sm:table-cell">Role</th>
                <th className="hidden lg:table-cell">Registered</th>
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
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.035 }}
                    >
                      <td>
                        <span style={{ color: "#EFEFEF", fontWeight: 500 }}>{u.nome || "—"}</span>
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
                                className="btn btn-ghost btn-icon"
                                onMouseEnter={(e) => (e.currentTarget.style.color = "#E8A020")}
                                onMouseLeave={(e) => (e.currentTarget.style.color = "")}
                              >
                                <Pencil size={13} />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => setDeleting(u)}
                                className="btn btn-ghost btn-icon"
                                onMouseEnter={(e) => (e.currentTarget.style.color = "#E5484D")}
                                onMouseLeave={(e) => (e.currentTarget.style.color = "")}
                              >
                                <Trash2 size={13} />
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

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit user">
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

      {canDelete && (
        <ConfirmDialog
          open={!!deleting}
          onClose={() => setDeleting(null)}
          onConfirm={() => deleting && deleteMut.mutate(deleting.id)}
          loading={deleteMut.isPending}
          description={`Remove "${deleting?.nome || deleting?.login}"? This action cannot be undone.`}
        />
      )}
    </div>
  );
}
