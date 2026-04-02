import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Search, Pencil, Trash2, Building2, Mail, Phone, Hash, Globe } from "lucide-react";
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

const schema = z.object({
  cnpj:         z.string().min(14, "CNPJ inválido"),
  razaoSocial:  z.string().min(2, "Razão social é obrigatória"),
  nomeFantasia: z.string().optional(),
  email:        z.string().email("E-mail inválido"),
  telefone:     z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

// Formatar CNPJ
function formatCNPJ(value: string) {
  const nums = value.replace(/\D/g, "").slice(0, 14);
  if (nums.length <= 2) return nums;
  if (nums.length <= 5) return `${nums.slice(0, 2)}.${nums.slice(2)}`;
  if (nums.length <= 8) return `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5)}`;
  if (nums.length <= 12) return `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5, 8)}/${nums.slice(8)}`;
  return `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5, 8)}/${nums.slice(8, 12)}-${nums.slice(12)}`;
}

// Formatar Telefone
function formatPhone(value: string) {
  const nums = value.replace(/\D/g, "").slice(0, 11);
  if (nums.length <= 2) return nums.length ? `(${nums}` : "";
  if (nums.length <= 7) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
  if (nums.length <= 10) return `(${nums.slice(0, 2)}) ${nums.slice(2, 6)}-${nums.slice(6)}`;
  return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
}

function SupplierForm({
  defaultValues,
  onSubmit,
  loading,
}: {
  defaultValues?: Partial<FormValues>;
  onSubmit: (v: FormValues) => void;
  loading?: boolean;
}) {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("cnpj", formatCNPJ(e.target.value));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("telefone", formatPhone(e.target.value));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <div className="input-group">
            <label className="input-label">Razão Social *</label>
            <div className="relative">
              <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
              <input
                {...register("razaoSocial")}
                placeholder="Nome legal da empresa"
                className={`input-field pl-10 ${errors.razaoSocial ? "error" : ""}`}
              />
            </div>
            {errors.razaoSocial && <span className="input-error">{errors.razaoSocial.message}</span>}
          </div>
        </div>
        
        <div className="input-group">
          <label className="input-label">Nome Fantasia</label>
          <div className="relative">
            <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
            <input
              {...register("nomeFantasia")}
              placeholder="Nome comercial"
              className="input-field pl-10"
            />
          </div>
        </div>
        
        <div className="input-group">
          <label className="input-label">CNPJ *</label>
          <div className="relative">
            <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
            <input
              {...register("cnpj")}
              onChange={handleCNPJChange}
              placeholder="00.000.000/0001-00"
              className={`input-field pl-10 font-mono ${errors.cnpj ? "error" : ""}`}
            />
          </div>
          {errors.cnpj && <span className="input-error">{errors.cnpj.message}</span>}
        </div>
        
        <div className="input-group">
          <label className="input-label">E-mail *</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
            <input
              {...register("email")}
              type="email"
              placeholder="contato@empresa.com"
              className={`input-field pl-10 ${errors.email ? "error" : ""}`}
            />
          </div>
          {errors.email && <span className="input-error">{errors.email.message}</span>}
        </div>
        
        <div className="input-group">
          <label className="input-label">Telefone</label>
          <div className="relative">
            <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
            <input
              {...register("telefone")}
              onChange={handlePhoneChange}
              placeholder="(00) 00000-0000"
              className="input-field pl-10"
            />
          </div>
        </div>
      </div>
      
      <div className="border-t border-[#1A1D24] pt-4 mt-6">
        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? "Salvando..." : "Salvar Fornecedor"}
        </button>
      </div>
    </form>
  );
}

export function SuppliersPage() {
  const { user } = useAuth();
  const isManager = user?.roles?.includes("GERENTE") ?? false;
  const canEdit   = isManager || (user?.roles?.includes("FUNCIONARIO") ?? false);

  const qc = useQueryClient();
  const [search,     setSearch]     = useState("");
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editing,    setEditing]    = useState<Fornecedor | null>(null);
  const [deleting,   setDeleting]   = useState<Fornecedor | null>(null);

  const { data: suppliers = [], isLoading, error } = useQuery<Fornecedor[], Error>({
    queryKey: ["fornecedores"],
    queryFn:  apiListFornecedores,
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
        toast.error("Erro ao atualizar fornecedor");
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

  const filtered = suppliers.filter((f) => {
    const q = search.toLowerCase();
    return (
      f.razaoSocial.toLowerCase().includes(q) ||
      (f.nomeFantasia ?? "").toLowerCase().includes(q) ||
      f.email.toLowerCase().includes(q) ||
      f.cnpj.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          Erro ao carregar fornecedores: {String(error)}
        </div>
      )}

      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <p className="text-[#00FF87] text-sm font-medium tracking-wider uppercase mb-1">Gerenciamento</p>
          <h1 className="text-2xl font-display font-bold text-[#F5F5F5]">Fornecedores</h1>
          <p className="text-[#9CA3AF] text-sm mt-1">{suppliers.length} cadastrados</p>
        </div>
        {isManager && (
          <button onClick={() => setModalOpen(true)} className="btn btn-primary">
            <Plus size={18} /> <span>Novo Fornecedor</span>
          </button>
        )}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 0.1 }}
        className="relative max-w-md"
      >
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
        <input
          className="input-field pl-10 w-full"
          placeholder="Buscar por nome, CNPJ ou e-mail..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="card overflow-hidden"
      >
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-[#1A1D24] rounded animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-sm bg-[#1A1D24] flex items-center justify-center">
              <Building2 size={32} className="text-[#4B5563]" />
            </div>
            <p className="text-[#9CA3AF]">
              {search ? "Nenhum resultado encontrado" : "Nenhum fornecedor cadastrado"}
            </p>
            {!search && isManager && (
              <button onClick={() => setModalOpen(true)} className="btn btn-primary mt-4">
                <Plus size={16} /> Adicionar Fornecedor
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1A1D24]">
                  <th className="text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider px-4 py-3">
                    Empresa
                  </th>
                  <th className="text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider px-4 py-3 hidden md:table-cell">
                    CNPJ
                  </th>
                  <th className="text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider px-4 py-3 hidden sm:table-cell">
                    E-mail
                  </th>
                  <th className="text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider px-4 py-3 hidden lg:table-cell">
                    Telefone
                  </th>
                  {(canEdit || isManager) && (
                    <th className="text-right text-xs font-medium text-[#4B5563] uppercase tracking-wider px-4 py-3 w-24">
                      Ações
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((f, i) => (
                    <motion.tr
                      key={f.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-[#1A1D24] last:border-0 hover:bg-[#1A1D24]/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-sm flex items-center justify-center text-sm font-bold flex-shrink-0"
                            style={{ background: "rgba(0,255,135,0.1)", color: "#00FF87" }}
                          >
                            {(f.nomeFantasia || f.razaoSocial).charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[#F5F5F5] font-medium truncate">
                              {f.nomeFantasia || f.razaoSocial}
                            </p>
                            {f.nomeFantasia && (
                              <p className="text-[#4B5563] text-xs truncate">{f.razaoSocial}</p>
                            )}
                            <p className="text-[#4B5563] text-xs truncate sm:hidden">{f.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-sm font-mono text-[#9CA3AF]">{f.cnpj}</span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-sm text-[#9CA3AF]">{f.email}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-sm text-[#9CA3AF]">
                          {f.telefone || <span className="text-[#4B5563]">—</span>}
                        </span>
                      </td>
                      {(canEdit || isManager) && (
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 justify-end">
                            {canEdit && (
                              <button
                                onClick={() => setEditing(f)}
                                className="p-2 rounded-sm text-[#4B5563] hover:text-[#00FF87] hover:bg-[#00FF87]/10 transition-colors"
                              >
                                <Pencil size={16} />
                              </button>
                            )}
                            {isManager && (
                              <button
                                onClick={() => setDeleting(f)}
                                className="p-2 rounded-sm text-[#4B5563] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
                              >
                                <Trash2 size={16} />
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
          </div>
        )}
      </motion.div>

      {isManager && (
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Novo Fornecedor">
          <SupplierForm onSubmit={(v) => createMut.mutate(v)} loading={createMut.isPending} />
        </Modal>
      )}

      {canEdit && (
        <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar Fornecedor">
          {editing && (
            <SupplierForm
              defaultValues={editing}
              onSubmit={(v) => updateMut.mutate({ id: editing.id, payload: v })}
              loading={updateMut.isPending}
            />
          )}
        </Modal>
      )}

      {isManager && (
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
