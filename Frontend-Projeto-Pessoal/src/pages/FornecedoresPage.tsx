import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Search, Pencil, Trash2, Building2, Mail, Phone, Hash } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  apiListFornecedores,
  apiCreateFornecedor,
  apiUpdateFornecedor,
  apiDeleteFornecedor,
  type Fornecedor,
  type FornecedorPayload,
} from "../api/client";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { useAuth } from "../auth/AuthContext";

// ── Schema ─────────────────────────────────────────────────────────────────
const schema = z.object({
  cnpj:         z.string().min(14, "CNPJ inválido"),
  razaoSocial:  z.string().min(2, "Razão social obrigatória"),
  nomeFantasia: z.string().optional(),
  email:        z.string().email("E-mail inválido"),
  telefone:     z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

// ── Form ───────────────────────────────────────────────────────────────────
function FornecedorForm({
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

  const Field = ({ name, label, icon: Icon, placeholder, type = "text" }: {
    name: keyof FormValues; label: string; icon: React.ElementType; placeholder: string; type?: string;
  }) => (
    <div className="input-group">
      <label className="input-label">{label}</label>
      <div className="relative">
        <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
        <input
          {...register(name)}
          type={type}
          placeholder={placeholder}
          className={`input-field pl-9 ${errors[name] ? "error" : ""}`}
        />
      </div>
      {errors[name] && <span className="input-error">{errors[name]?.message}</span>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Field name="razaoSocial"  label="Razão Social"   icon={Building2} placeholder="Nome jurídico" />
        </div>
        <Field name="nomeFantasia" label="Nome Fantasia"  icon={Building2} placeholder="Nome comercial" />
        <Field name="cnpj"         label="CNPJ"           icon={Hash}      placeholder="00.000.000/0001-00" />
        <Field name="email"        label="E-mail"         icon={Mail}      placeholder="contato@empresa.com" type="email" />
        <Field name="telefone"     label="Telefone"       icon={Phone}     placeholder="(00) 00000-0000" />
      </div>
      <div className="divider" />
      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        {loading ? "Salvando..." : "Salvar fornecedor"}
      </button>
    </form>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export function FornecedoresPage() {
  const { user } = useAuth();
  const isGerente = user?.roles?.includes("GERENTE") ?? false;
  const canEdit = isGerente || (user?.roles?.includes("FUNCIONARIO") ?? false);
  const qc = useQueryClient();
  const [search, setSearch]   = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState<Fornecedor | null>(null);
  const [deleting, setDeleting]   = useState<Fornecedor | null>(null);

  const { data: fornecedores = [], isLoading, error: fornecedoresError } = useQuery<Fornecedor[], Error>({
    queryKey: ["fornecedores"],
    queryFn: () => apiListFornecedores(),
  });

  const createMut = useMutation({
    mutationFn: (p: FornecedorPayload) => apiCreateFornecedor(p),
    onSuccess: async (res) => {
      if (res.ok) {
        toast.success("Fornecedor criado com sucesso!");
        await qc.invalidateQueries({ queryKey: ["fornecedores"] });
        setModalOpen(false);
      } else {
        toast.error("Erro ao criar fornecedor");
      }
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: FornecedorPayload }) =>
      apiUpdateFornecedor(id, payload),
    onSuccess: async (res) => {
      if (res.ok) {
        toast.success("Fornecedor atualizado!");
        await qc.invalidateQueries({ queryKey: ["fornecedores"] });
        setEditing(null);
      } else {
        toast.error("Erro ao atualizar");
      }
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => apiDeleteFornecedor(id),
    onSuccess: async () => {
      toast.success("Fornecedor removido");
      await qc.invalidateQueries({ queryKey: ["fornecedores"] });
      setDeleting(null);
    },
  });

  const filtered = fornecedores.filter((f: Fornecedor) => {
    const q = search.toLowerCase();
    return (
      f.razaoSocial.toLowerCase().includes(q) ||
      (f.nomeFantasia ?? "").toLowerCase().includes(q) ||
      f.email.toLowerCase().includes(q) ||
      f.cnpj.includes(q)
    );
  });

  return (
    <div className="page-container min-h-screen">
      {/* Erro de carregamento */}
      {fornecedoresError && (
        <div className="mb-4 p-3 rounded-xl text-sm text-rose-400 flex items-center gap-2"
          style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)" }}>
          <span className="w-2 h-2 rounded-full bg-rose-400 flex-shrink-0" />
          Erro ao carregar fornecedores: {String(fornecedoresError)}
        </div>
      )}
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="page-header">
        <div>
          <p className="text-xs text-slate-600 uppercase tracking-widest mb-1">Gestão</p>
          <h1 className="text-2xl font-bold text-slate-100">Fornecedores</h1>
          <p className="text-sm text-slate-500 mt-0.5">{fornecedores.length} cadastrados</p>
        </div>
        {isGerente && (
          <button onClick={() => setModalOpen(true)} className="btn btn-primary">
            <Plus size={16} /> <span className="hidden sm:inline">Novo Fornecedor</span>
          </button>
        )}
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="search-bar mb-4" style={{ maxWidth: 360, width: "100%" }}>
        <Search size={15} className="search-icon" />
        <input
          className="input-field"
          placeholder="Buscar por nome, CNPJ ou e-mail..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </motion.div>

      {/* Table */}
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
            <Building2 size={40} />
            <p className="text-slate-500 mt-2 text-sm">
              {search ? "Nenhum resultado" : "Nenhum fornecedor cadastrado"}
            </p>
            {!search && isGerente && (
              <button onClick={() => setModalOpen(true)} className="btn btn-primary mt-4">
                <Plus size={14} /> Adicionar fornecedor
              </button>
            )}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Empresa</th>
                <th className="hidden md:table-cell">CNPJ</th>
                <th className="hidden sm:table-cell">E-mail</th>
                <th className="hidden lg:table-cell">Telefone</th>
                {(canEdit || isGerente) && <th style={{ width: 90 }} />}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((f: Fornecedor, i: number) => (
                  <motion.tr
                    key={f.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: "rgba(0,240,255,0.08)", color: "#00f0ff" }}>
                          {(f.nomeFantasia || f.razaoSocial).charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-slate-200 font-medium truncate">{f.nomeFantasia || f.razaoSocial}</p>
                          {f.nomeFantasia && (
                            <p className="text-xs text-slate-600 truncate">{f.razaoSocial}</p>
                          )}
                          <p className="text-xs text-slate-600 truncate sm:hidden">{f.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden md:table-cell">
                      <span className="text-xs font-mono text-slate-400">{f.cnpj}</span>
                    </td>
                    <td className="hidden sm:table-cell">
                      <span className="text-sm">{f.email}</span>
                    </td>
                    <td className="hidden lg:table-cell">
                      <span className="text-sm">{f.telefone || <span className="text-slate-700">—</span>}</span>
                    </td>
                    {(canEdit || isGerente) && (
                      <td>
                        <div className="flex items-center gap-1 justify-end">
                          {canEdit && (
                            <button
                              onClick={() => setEditing(f)}
                              className="btn btn-ghost btn-icon text-slate-500 hover:text-cyan-400"
                            >
                              <Pencil size={14} />
                            </button>
                          )}
                          {isGerente && (
                            <button
                              onClick={() => setDeleting(f)}
                              className="btn btn-ghost btn-icon text-slate-500 hover:text-rose-400"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        )}
      </motion.div>

      {/* Create Modal */}
      {isGerente && (
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Novo Fornecedor">
          <FornecedorForm
            onSubmit={(v) => createMut.mutate(v)}
            loading={createMut.isPending}
          />
        </Modal>
      )}

      {/* Edit Modal */}
      {canEdit && (
        <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar Fornecedor">
          {editing && (
            <FornecedorForm
              defaultValues={editing}
              onSubmit={(v) => updateMut.mutate({ id: editing.id, payload: v })}
              loading={updateMut.isPending}
            />
          )}
        </Modal>
      )}

      {/* Delete Confirm */}
      {isGerente && (
        <ConfirmDialog
          open={!!deleting}
          onClose={() => setDeleting(null)}
          onConfirm={() => deleting && deleteMut.mutate(deleting.id)}
          description={`Deseja remover "${deleting?.nomeFantasia || deleting?.razaoSocial}"? Esta ação não pode ser desfeita.`}
          loading={deleteMut.isPending}
        />
      )}
    </div>
  );
}
