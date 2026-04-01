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

const schema = z.object({
  cnpj:         z.string().min(14, "Invalid CNPJ"),
  razaoSocial:  z.string().min(2, "Legal name is required"),
  nomeFantasia: z.string().optional(),
  email:        z.string().email("Invalid email"),
  telefone:     z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

function SupplierForm({
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
        <Icon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#3C3C44" }} />
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
          <Field name="razaoSocial"  label="Legal name"    icon={Building2} placeholder="Company legal name" />
        </div>
        <Field name="nomeFantasia" label="Trade name"    icon={Building2} placeholder="Brand / trade name" />
        <Field name="cnpj"         label="CNPJ"          icon={Hash}      placeholder="00.000.000/0001-00" />
        <Field name="email"        label="Email"         icon={Mail}      placeholder="contact@company.com" type="email" />
        <Field name="telefone"     label="Phone"         icon={Phone}     placeholder="(00) 00000-0000" />
      </div>
      <div className="divider" />
      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        {loading ? "Saving..." : "Save supplier"}
      </button>
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
        toast.success("Supplier created");
        await qc.invalidateQueries({ queryKey: ["fornecedores"] });
        setModalOpen(false);
      } else {
        toast.error("Failed to create supplier");
      }
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: FornecedorPayload }) =>
      apiUpdateFornecedor(id, payload),
    onSuccess: async (res) => {
      if (res.ok) {
        toast.success("Supplier updated");
        await qc.invalidateQueries({ queryKey: ["fornecedores"] });
        setEditing(null);
      } else {
        toast.error("Failed to update supplier");
      }
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => apiDeleteFornecedor(id),
    onSuccess: async () => {
      toast.success("Supplier removed");
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
    <div className="page-container min-h-screen">
      {error && (
        <div className="alert alert-error mb-4">
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#E5484D" }} />
          Failed to load suppliers: {String(error)}
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="page-header">
        <div>
          <p className="page-eyebrow">Management</p>
          <h1 className="page-title">Suppliers</h1>
          <p className="page-subtitle">{suppliers.length} registered</p>
        </div>
        {isManager && (
          <button onClick={() => setModalOpen(true)} className="btn btn-primary">
            <Plus size={15} /> <span className="hidden sm:inline">New supplier</span>
          </button>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="search-bar mb-4" style={{ maxWidth: 360, width: "100%" }}>
        <Search size={14} className="search-icon" />
        <input
          className="input-field"
          placeholder="Search by name, CNPJ or email..."
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
            <Building2 size={36} />
            <p style={{ color: "#52525B", fontSize: "0.875rem", marginTop: "0.5rem" }}>
              {search ? "No results found" : "No suppliers registered"}
            </p>
            {!search && isManager && (
              <button onClick={() => setModalOpen(true)} className="btn btn-primary mt-4">
                <Plus size={14} /> Add supplier
              </button>
            )}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Company</th>
                <th className="hidden md:table-cell">CNPJ</th>
                <th className="hidden sm:table-cell">Email</th>
                <th className="hidden lg:table-cell">Phone</th>
                {(canEdit || isManager) && <th style={{ width: 90 }} />}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((f, i) => (
                  <motion.tr
                    key={f.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.035 }}
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: "rgba(232,160,32,0.08)", color: "#E8A020" }}>
                          {(f.nomeFantasia || f.razaoSocial).charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p style={{ fontSize: "0.875rem", color: "#EFEFEF", fontWeight: 500 }} className="truncate">
                            {f.nomeFantasia || f.razaoSocial}
                          </p>
                          {f.nomeFantasia && (
                            <p style={{ fontSize: "0.75rem", color: "#3C3C44" }} className="truncate">{f.razaoSocial}</p>
                          )}
                          <p style={{ fontSize: "0.75rem", color: "#3C3C44" }} className="truncate sm:hidden">{f.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden md:table-cell">
                      <span style={{ fontSize: "0.78rem", fontFamily: "'JetBrains Mono', monospace" }}>{f.cnpj}</span>
                    </td>
                    <td className="hidden sm:table-cell">
                      <span style={{ fontSize: "0.875rem" }}>{f.email}</span>
                    </td>
                    <td className="hidden lg:table-cell">
                      <span style={{ fontSize: "0.875rem" }}>
                        {f.telefone || <span style={{ color: "#2E2E34" }}>—</span>}
                      </span>
                    </td>
                    {(canEdit || isManager) && (
                      <td>
                        <div className="flex items-center gap-1 justify-end">
                          {canEdit && (
                            <button
                              onClick={() => setEditing(f)}
                              className="btn btn-ghost btn-icon"
                              onMouseEnter={(e) => (e.currentTarget.style.color = "#E8A020")}
                              onMouseLeave={(e) => (e.currentTarget.style.color = "")}
                            >
                              <Pencil size={13} />
                            </button>
                          )}
                          {isManager && (
                            <button
                              onClick={() => setDeleting(f)}
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
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        )}
      </motion.div>

      {isManager && (
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New supplier">
          <SupplierForm onSubmit={(v) => createMut.mutate(v)} loading={createMut.isPending} />
        </Modal>
      )}

      {canEdit && (
        <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit supplier">
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
          description={`Remove "${deleting?.nomeFantasia || deleting?.razaoSocial}"? This action cannot be undone.`}
          loading={deleteMut.isPending}
        />
      )}
    </div>
  );
}
