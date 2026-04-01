import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Search, Pencil, Trash2, Package, LayoutGrid, List, Weight } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  apiListEstoque,
  apiCreateProduto,
  apiUpdateProduto,
  apiDeleteProduto,
  apiListFornecedores,
  type Produto,
  type ProdutoPayload,
} from "../api/client";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { BRAND_META, ALL_BRANDS } from "../lib/utils";
import { useAuth } from "../auth/AuthContext";

const schema = z.object({
  descricao:    z.string().min(2, "Description is required"),
  medida:       z.string().optional(),
  marca:        z.string().min(1, "Brand is required"),
  fornecedorId: z.string().min(1, "Select a supplier"),
});
type FormValues = z.infer<typeof schema>;

function ProductForm({
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

  const { data: suppliers = [] } = useQuery({
    queryKey: ["fornecedores"],
    queryFn:  apiListFornecedores,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="input-group">
        <label className="input-label">Description</label>
        <input
          {...register("descricao")}
          placeholder="Product name / description"
          className={`input-field ${errors.descricao ? "error" : ""}`}
        />
        {errors.descricao && <span className="input-error">{errors.descricao.message}</span>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="input-group">
          <label className="input-label">Weight (g)</label>
          <div className="relative">
            <Weight size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#3C3C44" }} />
            <input {...register("medida")} type="number" placeholder="500" className="input-field pl-9" />
          </div>
        </div>
        <div className="input-group">
          <label className="input-label">Brand *</label>
          <select {...register("marca")} className={`input-field ${errors.marca ? "error" : ""}`}>
            <option value="">Select brand</option>
            {ALL_BRANDS.map((b) => (
              <option key={b} value={b}>{BRAND_META[b].label}</option>
            ))}
          </select>
          {errors.marca && <span className="input-error">{errors.marca.message}</span>}
        </div>
      </div>

      <div className="input-group">
        <label className="input-label">Supplier *</label>
        <select {...register("fornecedorId")} className={`input-field ${errors.fornecedorId ? "error" : ""}`}>
          <option value="">Select supplier</option>
          {suppliers.map((f) => (
            <option key={f.id} value={f.id}>
              {f.nomeFantasia ? `${f.nomeFantasia} (${f.razaoSocial})` : f.razaoSocial}
            </option>
          ))}
        </select>
        {errors.fornecedorId && <span className="input-error">{errors.fornecedorId.message}</span>}
      </div>

      <div className="divider" />
      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        {loading ? "Saving..." : "Save product"}
      </button>
    </form>
  );
}

function ProductCard({
  product, onEdit, onDelete, canEdit, canDelete,
}: {
  product: Produto; onEdit: () => void; onDelete: () => void; canEdit: boolean; canDelete: boolean;
}) {
  const meta = product.marca ? BRAND_META[product.marca] : null;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.2 }}
      className="card card-hover flex flex-col gap-3 p-4"
      style={{ borderColor: meta ? `${meta.color}18` : undefined }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="brand-chip" style={{ background: meta?.bg ?? "rgba(100,116,139,0.10)", color: meta?.color ?? "#52525B" }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta?.color ?? "#52525B" }} />
          {meta?.label ?? product.marca ?? "No brand"}
        </div>
        {product.medida != null && (
          <span style={{ fontSize: "0.72rem", color: "#3C3C44", fontFamily: "'JetBrains Mono', monospace" }}>
            {product.medida}g
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: meta?.bg ?? "rgba(100,116,139,0.08)" }}>
          <Package size={16} style={{ color: meta?.color ?? "#52525B" }} />
        </div>
        <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "#EFEFEF", lineHeight: 1.35 }}>
          {product.descricao}
        </p>
      </div>

      {product.fornecedor && (
        <p className="truncate" style={{ fontSize: "0.75rem", color: "#3C3C44" }}>
          {product.fornecedor.nomeFantasia || product.fornecedor.razaoSocial}
        </p>
      )}

      <div className="flex items-center gap-2 pt-1 mt-auto" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        {canEdit && (
          <button onClick={onEdit} className="btn btn-ghost btn-sm flex-1"
            style={{ color: "#52525B" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#E8A020")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#52525B")}
          >
            <Pencil size={12} /> Edit
          </button>
        )}
        {canDelete && (
          <button onClick={onDelete} className="btn btn-ghost btn-sm flex-1"
            style={{ color: "#52525B" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#E5484D")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#52525B")}
          >
            <Trash2 size={12} /> Remove
          </button>
        )}
      </div>
    </motion.div>
  );
}

export function InventoryPage() {
  const { user } = useAuth();
  const isManager = user?.roles?.includes("GERENTE") ?? false;
  const canEdit   = isManager || (user?.roles?.includes("FUNCIONARIO") ?? false);

  const qc = useQueryClient();
  const [search,     setSearch]     = useState("");
  const [brandFilter, setBrand]     = useState<string | null>(null);
  const [view,       setView]       = useState<"grid" | "list">("grid");
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editing,    setEditing]    = useState<Produto | null>(null);
  const [deleting,   setDeleting]   = useState<Produto | null>(null);

  const { data: products = [], isLoading, error } = useQuery<Produto[], Error>({
    queryKey: ["estoque"],
    queryFn:  apiListEstoque,
  });

  const createMut = useMutation({
    mutationFn: (p: ProdutoPayload) => apiCreateProduto(p),
    onSuccess: async (res) => {
      if (res.ok) {
        toast.success("Product added");
        await qc.invalidateQueries({ queryKey: ["estoque"] });
        setModalOpen(false);
      } else {
        const body = await res.json().catch(() => null);
        toast.error(body?.message ?? "Failed to create product");
      }
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProdutoPayload }) =>
      apiUpdateProduto(id, payload),
    onSuccess: async (res) => {
      if (res.ok) {
        toast.success("Product updated");
        await qc.invalidateQueries({ queryKey: ["estoque"] });
        setEditing(null);
      } else {
        const body = await res.json().catch(() => null);
        toast.error(body?.message ?? "Failed to update product");
      }
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => apiDeleteProduto(id),
    onSuccess: async () => {
      toast.success("Product removed");
      await qc.invalidateQueries({ queryKey: ["estoque"] });
      setDeleting(null);
    },
  });

  const toPayload = (v: FormValues): ProdutoPayload => ({
    descricao: v.descricao,
    medida: v.medida ? Number(v.medida) : undefined,
    marca: v.marca,
    fornecedorId: v.fornecedorId,
  });

  const brandsPresent = [...new Set(products.map((p) => p.marca).filter(Boolean))] as string[];

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.descricao.toLowerCase().includes(q) || (p.marca ?? "").toLowerCase().includes(q);
    const matchBrand  = !brandFilter || p.marca === brandFilter;
    return matchSearch && matchBrand;
  });

  const editingDefaults = editing ? {
    descricao:    editing.descricao,
    medida:       editing.medida?.toString(),
    marca:        editing.marca ?? "",
    fornecedorId: editing.fornecedor?.id ?? "",
  } : undefined;

  return (
    <div className="page-container min-h-screen">
      {error && (
        <div className="alert alert-error mb-4">
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#E5484D" }} />
          Failed to load products: {String(error)}
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="page-header">
        <div>
          <p className="page-eyebrow">Inventory</p>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{products.length} items</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setView("grid")}
            className={`btn btn-icon ${view === "grid" ? "btn-secondary" : "btn-ghost"}`}
          >
            <LayoutGrid size={15} />
          </button>
          <button
            onClick={() => setView("list")}
            className={`btn btn-icon ${view === "list" ? "btn-secondary" : "btn-ghost"}`}
          >
            <List size={15} />
          </button>
          {isManager && (
            <button onClick={() => setModalOpen(true)} className="btn btn-primary ml-1">
              <Plus size={15} />
              <span className="hidden sm:inline">New product</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="flex flex-wrap items-center gap-3 mb-5">
        <div className="search-bar" style={{ minWidth: 0, flex: "1 1 200px", maxWidth: 320 }}>
          <Search size={14} className="search-icon" />
          <input
            className="input-field"
            placeholder="Search product or brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setBrand(null)}
            className="badge cursor-pointer transition-all"
            style={{
              background: !brandFilter ? "rgba(232,160,32,0.10)" : "transparent",
              color: !brandFilter ? "#E8A020" : "#52525B",
              border: `1px solid ${!brandFilter ? "rgba(232,160,32,0.25)" : "rgba(255,255,255,0.06)"}`,
            }}
          >
            All
          </button>
          {brandsPresent.map((b) => {
            const m = BRAND_META[b];
            if (!m) return null;
            const active = brandFilter === b;
            return (
              <button
                key={b}
                onClick={() => setBrand(active ? null : b)}
                className="badge cursor-pointer transition-all"
                style={{
                  background: active ? m.bg : "transparent",
                  color: active ? m.color : "#52525B",
                  border: `1px solid ${active ? `${m.color}44` : "rgba(255,255,255,0.06)"}`,
                }}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Content */}
      {isLoading ? (
        <div className={`grid gap-3 ${view === "grid" ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton rounded-xl" style={{ height: view === "grid" ? 168 : 68, animationDelay: `${i * 0.06}s` }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state card rounded-xl">
          <Package size={36} />
          <p style={{ color: "#52525B", fontSize: "0.875rem", marginTop: "0.5rem" }}>
            {search || brandFilter ? "No products found" : "Inventory is empty"}
          </p>
          {!search && !brandFilter && isManager && (
            <button onClick={() => setModalOpen(true)} className="btn btn-primary mt-4">
              <Plus size={14} /> Add product
            </button>
          )}
        </div>
      ) : view === "grid" ? (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          <AnimatePresence>
            {filtered.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onEdit={() => canEdit && setEditing(p)}
                onDelete={() => setDeleting(p)}
                canEdit={canEdit}
                canDelete={isManager}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card overflow-hidden"
        >
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th className="hidden sm:table-cell">Brand</th>
                <th className="hidden md:table-cell">Weight</th>
                <th className="hidden lg:table-cell">Supplier</th>
                {(canEdit || isManager) && <th style={{ width: 90 }} />}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((p, i) => {
                  const meta = p.marca ? BRAND_META[p.marca] : null;
                  return (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.025 }}
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                            style={{ background: meta?.bg ?? "rgba(100,116,139,0.10)" }}>
                            <Package size={13} style={{ color: meta?.color ?? "#52525B" }} />
                          </div>
                          <div className="min-w-0">
                            <span style={{ color: "#EFEFEF", fontWeight: 500 }} className="truncate block">{p.descricao}</span>
                            {meta && (
                              <span className="text-xs sm:hidden" style={{ color: meta.color }}>{meta.label}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell">
                        {meta
                          ? <span className="brand-chip" style={{ background: meta.bg, color: meta.color }}>{meta.label}</span>
                          : <span style={{ color: "#2E2E34" }}>—</span>}
                      </td>
                      <td className="hidden md:table-cell">
                        {p.medida != null
                          ? <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.82rem" }}>{p.medida}g</span>
                          : <span style={{ color: "#2E2E34" }}>—</span>}
                      </td>
                      <td className="hidden lg:table-cell">
                        {p.fornecedor
                          ? p.fornecedor.nomeFantasia || p.fornecedor.razaoSocial
                          : <span style={{ color: "#2E2E34" }}>—</span>}
                      </td>
                      {(canEdit || isManager) && (
                        <td>
                          <div className="flex items-center gap-1 justify-end">
                            {canEdit && (
                              <button onClick={() => setEditing(p)} className="btn btn-ghost btn-icon"
                                onMouseEnter={(e) => (e.currentTarget.style.color = "#E8A020")}
                                onMouseLeave={(e) => (e.currentTarget.style.color = "")}>
                                <Pencil size={13} />
                              </button>
                            )}
                            {isManager && (
                              <button onClick={() => setDeleting(p)} className="btn btn-ghost btn-icon"
                                onMouseEnter={(e) => (e.currentTarget.style.color = "#E5484D")}
                                onMouseLeave={(e) => (e.currentTarget.style.color = "")}>
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
        </motion.div>
      )}

      {isManager && (
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New product">
          <ProductForm onSubmit={(v) => createMut.mutate(toPayload(v))} loading={createMut.isPending} />
        </Modal>
      )}

      {canEdit && (
        <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit product">
          {editing && (
            <ProductForm
              defaultValues={editingDefaults}
              onSubmit={(v) => updateMut.mutate({ id: editing.id, payload: toPayload(v) })}
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
          description={`Remove "${deleting?.descricao}"? This action cannot be undone.`}
          loading={deleteMut.isPending}
        />
      )}
    </div>
  );
}
