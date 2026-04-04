import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus, Users, Pencil, Trash2, Shield } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  apiListUsuariosEmpresa,
  apiCriarUsuarioNaEmpresa,
  apiUpdateUsuarioEmpresa,
  apiRemoveUsuarioEmpresa,
  type FornecedorUsuario,
  type CriarUsuarioEmpresaPayload,
} from "../api/client";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { useFornecedor } from "../context/FornecedorContext";

// ── Schema de validacao ────────────────────────────────────────────────
const schema = z.object({
  nome:  z.string().min(2, "Nome e obrigatorio"),
  login: z.string().min(3, "Login deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email invalido"),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  role:  z.enum(["FUNCIONARIO", "ESTAGIARIO"], { message: "Selecione um cargo" }),
});
type FormValues = z.infer<typeof schema>;

// ── Role badges ────────────────────────────────────────────────────────
const ROLE_META: Record<string, { label: string; bg: string; color: string }> = {
  GERENTE:      { label: "Gerente",      bg: "rgba(0,255,135,0.12)", color: "#00FF87" },
  FUNCIONARIO:  { label: "Funcionario",  bg: "rgba(0,229,255,0.12)", color: "#00E5FF" },
  ESTAGIARIO:   { label: "Estagiario",   bg: "rgba(232,160,32,0.12)", color: "#E8A020" },
};

function getRoleMeta(role: string) {
  return ROLE_META[role] ?? { label: role, bg: "rgba(75,85,99,0.15)", color: "#9CA3AF" };
}

// ── Formulario de novo usuario ─────────────────────────────────────────
function UsuarioForm({
  onSubmit,
  loading,
}: {
  onSubmit: (v: FormValues) => void;
  loading?: boolean;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: "FUNCIONARIO" },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="input-label mb-2 block">Nome completo *</label>
        <input
          {...register("nome")}
          placeholder="Ex: Joao Silva"
          className={`input-field ${errors.nome ? "border-[#EF4444]" : ""}`}
        />
        {errors.nome && <span className="text-xs text-[#EF4444] mt-1 block">{errors.nome.message}</span>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="input-label mb-2 block">Login *</label>
          <input
            {...register("login")}
            placeholder="Ex: joao.silva"
            className={`input-field ${errors.login ? "border-[#EF4444]" : ""}`}
          />
          {errors.login && <span className="text-xs text-[#EF4444] mt-1 block">{errors.login.message}</span>}
        </div>
        <div>
          <label className="input-label mb-2 block">Email *</label>
          <input
            {...register("email")}
            type="email"
            placeholder="Ex: joao@empresa.com"
            className={`input-field ${errors.email ? "border-[#EF4444]" : ""}`}
          />
          {errors.email && <span className="text-xs text-[#EF4444] mt-1 block">{errors.email.message}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="input-label mb-2 block">Senha *</label>
          <input
            {...register("senha")}
            type="password"
            placeholder="Minimo 6 caracteres"
            className={`input-field ${errors.senha ? "border-[#EF4444]" : ""}`}
          />
          {errors.senha && <span className="text-xs text-[#EF4444] mt-1 block">{errors.senha.message}</span>}
        </div>
        <div>
          <label className="input-label mb-2 block">Cargo *</label>
          <select
            {...register("role")}
            className={`input-field ${errors.role ? "border-[#EF4444]" : ""}`}
          >
            <option value="FUNCIONARIO">Funcionario</option>
            <option value="ESTAGIARIO">Estagiario</option>
          </select>
          {errors.role && <span className="text-xs text-[#EF4444] mt-1 block">{errors.role.message}</span>}
        </div>
      </div>

      <div className="pt-4 border-t border-[#1A1D24]" />
      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-[#090B10]/30 border-t-[#090B10] animate-spin" />
            Criando usuario...
          </span>
        ) : (
          <span className="flex items-center gap-2 justify-center">
            <UserPlus size={16} />
            Criar usuario
          </span>
        )}
      </button>
    </form>
  );
}

// ── Card de usuario ────────────────────────────────────────────────────
function UsuarioCard({
  usuario,
  onEditRole,
  onDelete,
}: {
  usuario: FornecedorUsuario;
  onEditRole: () => void;
  onDelete: () => void;
}) {
  const meta = getRoleMeta(usuario.role);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.2 }}
      className="card p-4 hover:border-[#00FF87]/25 transition-all group"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <span
          className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-sm"
          style={{ background: meta.bg, color: meta.color }}
        >
          {meta.label}
        </span>
        {usuario.dataCadastro && (
          <span className="text-xs text-[#4B5563] font-mono">
            {new Date(usuario.dataCadastro).toLocaleDateString("pt-BR")}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-sm flex items-center justify-center flex-shrink-0"
          style={{ background: meta.bg }}
        >
          <Shield size={18} style={{ color: meta.color }} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#F5F5F5] truncate">
            {usuario.nomeUsuario || "Sem nome"}
          </p>
          {usuario.loginUsuario && (
            <p className="text-xs text-[#9CA3AF] font-mono truncate">
              @{usuario.loginUsuario}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-[#1A1D24]">
        <button onClick={onEditRole} className="btn btn-ghost btn-sm flex-1 hover:text-[#00FF87]">
          <Pencil size={12} /> Editar cargo
        </button>
        <button onClick={onDelete} className="btn btn-ghost btn-sm flex-1 hover:text-[#EF4444]">
          <Trash2 size={12} /> Remover
        </button>
      </div>
    </motion.div>
  );
}

// ── Pagina principal ───────────────────────────────────────────────────
export function EmpresaUsuariosPage() {
  const { fornecedorId, isGerente } = useFornecedor();
  const qc = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<FornecedorUsuario | null>(null);
  const [editRole, setEditRole] = useState("");
  const [deleting, setDeleting] = useState<FornecedorUsuario | null>(null);

  // ── Queries ──────────────────────────────────────────────────────────
  const { data: usuarios = [], isLoading, error } = useQuery({
    queryKey: ["empresa-usuarios", fornecedorId],
    queryFn: () => apiListUsuariosEmpresa(fornecedorId!),
    enabled: !!fornecedorId && isGerente,
  });

  // ── Mutations ────────────────────────────────────────────────────────
  const createMut = useMutation({
    mutationFn: (payload: CriarUsuarioEmpresaPayload) =>
      apiCriarUsuarioNaEmpresa(fornecedorId!, payload),
    onSuccess: async (res) => {
      if (res.ok) {
        toast.success("Usuario criado e associado com sucesso");
        await qc.invalidateQueries({ queryKey: ["empresa-usuarios", fornecedorId] });
        setModalOpen(false);
      } else {
        const body = await res.json().catch(() => null);
        toast.error(body?.message ?? "Falha ao criar usuario");
      }
    },
    onError: (err: any) => {
      toast.error(err?.message ?? "Erro de conexao ao criar usuario. Tente novamente.");
    },
  });

  const updateRoleMut = useMutation({
    mutationFn: ({ usuarioId, role }: { usuarioId: string; role: string }) =>
      apiUpdateUsuarioEmpresa(fornecedorId!, usuarioId, role),
    onSuccess: async (res) => {
      if (res.ok) {
        toast.success("Cargo atualizado com sucesso");
        await qc.invalidateQueries({ queryKey: ["empresa-usuarios", fornecedorId] });
        setEditingUser(null);
      } else {
        const body = await res.json().catch(() => null);
        toast.error(body?.message ?? "Falha ao atualizar cargo");
      }
    },
    onError: (err: any) => {
      toast.error(err?.message ?? "Erro de conexao ao atualizar cargo. Tente novamente.");
    },
  });

  const deleteMut = useMutation({
    mutationFn: (usuarioId: string) =>
      apiRemoveUsuarioEmpresa(fornecedorId!, usuarioId),
    onSuccess: async () => {
      toast.success("Usuario removido da empresa");
      await qc.invalidateQueries({ queryKey: ["empresa-usuarios", fornecedorId] });
      setDeleting(null);
    },
    onError: (err: any) => {
      toast.error(err?.message ?? "Erro de conexao ao remover usuario. Tente novamente.");
    },
  });

  // ── Acesso restrito ──────────────────────────────────────────────────
  if (!isGerente) {
    return (
      <div className="card text-center py-16">
        <Shield size={48} className="mx-auto text-[#4B5563] mb-4" />
        <h2 className="text-lg font-semibold text-[#F5F5F5] mb-2">Acesso restrito</h2>
        <p className="text-sm text-[#9CA3AF]">
          Apenas gerentes podem gerenciar usuarios
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error banner */}
      {error && (
        <div className="p-3 rounded-sm bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
          <span className="text-sm text-[#EF4444]">Falha ao carregar usuarios: {String(error)}</span>
        </div>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#00E5FF] mb-1 block">
            Equipe
          </span>
          <h1 className="text-2xl font-display font-bold text-[#F5F5F5]">Usuarios</h1>
          <p className="text-sm text-[#9CA3AF]">
            {usuarios.length} usuario{usuarios.length !== 1 ? "s" : ""} na empresa
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={() => setModalOpen(true)} className="btn btn-primary">
            <UserPlus size={16} />
            <span className="hidden sm:inline">Novo Usuario</span>
          </button>
        </div>
      </motion.div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 180, animationDelay: `${i * 0.06}s` }} />
          ))}
        </div>
      ) : usuarios.length === 0 ? (
        <div className="card text-center py-12">
          <Users size={48} className="mx-auto text-[#4B5563] mb-3" />
          <p className="text-[#9CA3AF] mb-4">Nenhum usuario na empresa</p>
          <button onClick={() => setModalOpen(true)} className="btn btn-primary">
            <UserPlus size={16} /> Adicionar usuario
          </button>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {usuarios.map((u) => (
              <UsuarioCard
                key={u.id}
                usuario={u}
                onEditRole={() => {
                  setEditingUser(u);
                  setEditRole(u.role);
                }}
                onDelete={() => setDeleting(u)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Modal: Novo Usuario */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Novo Usuario">
        <UsuarioForm
          onSubmit={(v) => createMut.mutate(v)}
          loading={createMut.isPending}
        />
      </Modal>

      {/* Modal: Editar Cargo */}
      <Modal open={!!editingUser} onClose={() => setEditingUser(null)} title="Editar Cargo" size="sm">
        {editingUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-3 py-2 rounded-sm bg-[#1A1D24]/60 border border-[#1A1D24]">
              <Shield size={14} className="text-[#4B5563] flex-shrink-0" />
              <span className="text-xs text-[#4B5563]">
                Alterando cargo de: <span className="text-[#9CA3AF]">{editingUser.nomeUsuario ?? editingUser.loginUsuario ?? "Usuario"}</span>
              </span>
            </div>
            <div>
              <label className="input-label mb-2 block">Novo cargo</label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                className="input-field"
              >
                <option value="FUNCIONARIO">Funcionario</option>
                <option value="ESTAGIARIO">Estagiario</option>
              </select>
            </div>
            <div className="pt-4 border-t border-[#1A1D24]" />
            <button
              onClick={() => updateRoleMut.mutate({ usuarioId: editingUser.usuarioId, role: editRole })}
              className="btn btn-primary w-full"
              disabled={updateRoleMut.isPending}
            >
              {updateRoleMut.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-[#090B10]/30 border-t-[#090B10] animate-spin" />
                  Salvando...
                </span>
              ) : (
                "Salvar alteracoes"
              )}
            </button>
          </div>
        )}
      </Modal>

      {/* Confirm: Remover */}
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && deleteMut.mutate(deleting.usuarioId)}
        description={`Remover "${deleting?.nomeUsuario ?? deleting?.loginUsuario ?? "este usuario"}" da empresa? Esta acao nao pode ser desfeita.`}
        loading={deleteMut.isPending}
      />
    </div>
  );
}
