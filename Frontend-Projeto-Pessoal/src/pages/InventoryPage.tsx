import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Search, Pencil, Trash2, Package, LayoutGrid, List, Scale, Dumbbell, DollarSign } from "lucide-react";
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
import { BRAND_META, ALL_BRANDS, getMockPrice, formatCurrency } from "../lib/utils";
import { useAuth } from "../auth/AuthContext";

const schema = z.object({
  descricao:    z.string().min(2, "Descrição é obrigatória"),
  medida:       z.string().optional(),
  marca:        z.string().min(1, "Selecione uma marca"),
  fornecedorId: z.string().min(1, "Selecione um fornecedor"),
});
type FormValues = z.infer<typeof schema>;

function ProductForm({
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
    resolver: zodResolver(schema),
    defaultValues,
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ["fornecedores"],
    queryFn:  apiListFornecedores,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="input-label mb-2 block">Descrição do produto *</label>
        <input
          {...register("descricao")}
          placeholder="Ex: Whey Protein Isolado 900g"
          className={`input-field ${errors.descricao ? "border-[#EF4444]" : ""}`}
        />
        {errors.descricao && <span className="text-xs text-[#EF4444] mt-1 block">{errors.descricao.message}</span>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="input-label mb-2 block">Peso (g)</label>
          <div className="relative">
            <Scale size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
            <input {...register("medida")} type="number" placeholder="900" className="input-field pl-10" />
          </div>
        </div>
        <div>
          <label className="input-label mb-2 block">Marca *</label>
          <select {...register("marca")} className={`input-field ${errors.marca ? "border-[#EF4444]" : ""}`}>
            <option value="">Selecione a marca</option>
            {ALL_BRANDS.map((b) => (
              <option key={b} value={b}>{BRAND_META[b].label}</option>
            ))}
          </select>
          {errors.marca && <span className="text-xs text-[#EF4444] mt-1 block">{errors.marca.message}</span>}
        </div>
      </div>

      <div>
        <label className="input-label mb-2 block">Fornecedor *</label>
        <select {...register("fornecedorId")} className={`input-field ${errors.fornecedorId ? "border-[#EF4444]" : ""}`}>
          <option value="">Selecione o fornecedor</option>
          {suppliers.map((f) => (
            <option key={f.id} value={f.id}>
              {f.nomeFantasia ? `${f.nomeFantasia} (${f.razaoSocial})` : f.razaoSocial}
            </option>
          ))}
        </select>
        {errors.fornecedorId && <span className="text-xs text-[#EF4444] mt-1 block">{errors.fornecedorId.message}</span>}
      </div>

      <div className="pt-4 border-t border-[#1A1D24]" />
      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-[#090B10]/30 border-t-[#090B10] animate-spin" />
            Salvando...
          </span>
        ) : (
          isNew ? "Adicionar produto" : "Salvar alterações"
        )}
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
  const price = getMockPrice(product.id);
  
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
        {meta && (
          <span 
            className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-sm"
            style={{ background: meta.bg, color: meta.color }}
          >
            {meta.label}
          </span>
        )}
        {product.medida != null && (
          <span className="text-xs text-[#4B5563] font-mono">
            {product.medida}g
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 mb-3">
        <div 
          className="w-10 h-10 rounded-sm flex items-center justify-center flex-shrink-0"
          style={{ background: meta?.bg ?? "#1A1D24" }}
        >
          <Dumbbell size={18} style={{ color: meta?.color ?? "#4B5563" }} />
        </div>
        <p className="text-sm font-medium text-[#F5F5F5] line-clamp-2">
          {product.descricao}
        </p>
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className="price">{formatCurrency(price)}</span>
        {product.fornecedor && (
          <span className="text-xs text-[#4B5563] truncate max-w-[120px]">
            {product.fornecedor.nomeFantasia || product.fornecedor.razaoSocial}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-[#1A1D24]">
        {canEdit && (
          <button onClick={onEdit} className="btn btn-ghost btn-sm flex-1 hover:text-[#00FF87]">
            <Pencil size={12} /> Editar
          </button>
        )}
        {canDelete && (
          <button onClick={onDelete} className="btn btn-ghost btn-sm flex-1 hover:text-[#EF4444]">
            <Trash2 size={12} /> Remover
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
        toast.success("Produto adicionado com sucesso");
        await qc.invalidateQueries({ queryKey: ["estoque"] });
        setModalOpen(false);
      } else {
        const body = await res.json().catch(() => null);
        toast.error(body?.message ?? "Falha ao criar produto");
      }
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProdutoPayload }) =>
      apiUpdateProduto(id, payload),
    onSuccess: async (res) => {
      if (res.ok) {
        toast.success("Produto atualizado com sucesso");
        await qc.invalidateQueries({ queryKey: ["estoque"] });
        setEditing(null);
      } else {
        const body = await res.json().catch(() => null);
        toast.error(body?.message ?? "Falha ao atualizar produto");
      }
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => apiDeleteProduto(id),
    onSuccess: async () => {
      toast.success("Produto removido com sucesso");
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
    <div className="space-y-6">
      {error && (
        <div className="p-3 rounded-sm bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
          <span className="text-sm text-[#EF4444]">Falha ao carregar produtos: {String(error)}</span>
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#00E5FF] mb-1 block">
            Estoque
          </span>
          <h1 className="text-2xl font-display font-bold text-[#F5F5F5]">Produtos</h1>
          <p className="text-sm text-[#9CA3AF]">{products.length} produto{products.length !== 1 ? "s" : ""} cadastrado{products.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setView("grid")}
            className={`btn btn-icon btn-sm ${view === "grid" ? "btn-secondary" : "btn-ghost"}`}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setView("list")}
            className={`btn btn-icon btn-sm ${view === "list" ? "btn-secondary" : "btn-ghost"}`}
          >
            <List size={16} />
          </button>
          {isManager && (
            <button onClick={() => setModalOpen(true)} className="btn btn-primary ml-2">
              <Plus size={16} />
              <span className="hidden sm:inline">Novo Produto</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
          <input
            type="text"
            className="input-field pl-10"
            placeholder="Buscar produto ou marca..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setBrand(null)}
            className={`px-3 py-1.5 rounded-sm text-xs font-medium transition-colors ${
              !brandFilter
                ? "bg-[#00FF87]/10 text-[#00FF87] border border-[#00FF87]/25"
                : "text-[#4B5563] border border-[#1A1D24] hover:border-[#4B5563]"
            }`}
          >
            Todas
          </button>
          {brandsPresent.map((b) => {
            const m = BRAND_META[b];
            if (!m) return null;
            const active = brandFilter === b;
            return (
              <button
                key={b}
                onClick={() => setBrand(active ? null : b)}
                className={`px-3 py-1.5 rounded-sm text-xs font-medium transition-colors ${
                  active
                    ? "border"
                    : "text-[#4B5563] border border-[#1A1D24] hover:border-[#4B5563]"
                }`}
                style={active ? { background: m.bg, color: m.color, borderColor: `${m.color}44` } : undefined}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Content */}
      {isLoading ? (
        <div className={`grid gap-4 ${view === "grid" ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: view === "grid" ? 200 : 80, animationDelay: `${i * 0.06}s` }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <Package size={48} className="mx-auto text-[#4B5563] mb-3" />
          <p className="text-[#9CA3AF] mb-4">
            {search || brandFilter ? "Nenhum produto encontrado" : "Estoque vazio"}
          </p>
          {!search && !brandFilter && isManager && (
            <button onClick={() => setModalOpen(true)} className="btn btn-primary">
              <Plus size={16} /> Adicionar produto
            </button>
          )}
        </div>
      ) : view === "grid" ? (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-[#4B5563] uppercase tracking-wider border-b border-[#1A1D24]">
                  <th className="px-6 py-4">Produto</th>
                  <th className="px-6 py-4 hidden sm:table-cell">Marca</th>
                  <th className="px-6 py-4 hidden md:table-cell">Peso</th>
                  <th className="px-6 py-4 hidden lg:table-cell">Preço</th>
                  <th className="px-6 py-4 hidden xl:table-cell">Fornecedor</th>
                  {(canEdit || isManager) && <th className="px-6 py-4 w-24" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1D24]">
                <AnimatePresence>
                  {filtered.map((p, i) => {
                    const meta = p.marca ? BRAND_META[p.marca] : null;
                    const price = getMockPrice(p.id);
                    return (
                      <motion.tr
                        key={p.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.025 }}
                        className="hover:bg-[#1A1D24]/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-9 h-9 rounded-sm flex items-center justify-center flex-shrink-0"
                              style={{ background: meta?.bg ?? "#1A1D24" }}
                            >
                              <Dumbbell size={14} style={{ color: meta?.color ?? "#4B5563" }} />
                            </div>
                            <div className="min-w-0">
                              <span className="text-sm font-medium text-[#F5F5F5] truncate block">{p.descricao}</span>
                              {meta && (
                                <span className="text-xs sm:hidden" style={{ color: meta.color }}>{meta.label}</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                          {meta ? (
                            <span 
                              className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-sm"
                              style={{ background: meta.bg, color: meta.color }}
                            >
                              {meta.label}
                            </span>
                          ) : (
                            <span className="text-[#4B5563]">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          {p.medida != null ? (
                            <span className="text-sm text-[#9CA3AF] font-mono">{p.medida}g</span>
                          ) : (
                            <span className="text-[#4B5563]">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          <span className="price text-sm">{formatCurrency(price)}</span>
                        </td>
                        <td className="px-6 py-4 hidden xl:table-cell">
                          {p.fornecedor ? (
                            <span className="text-sm text-[#9CA3AF]">
                              {p.fornecedor.nomeFantasia || p.fornecedor.razaoSocial}
                            </span>
                          ) : (
                            <span className="text-[#4B5563]">—</span>
                          )}
                        </td>
                        {(canEdit || isManager) && (
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1 justify-end">
                              {canEdit && (
                                <button onClick={() => setEditing(p)} className="btn btn-ghost btn-icon btn-sm hover:text-[#00FF87]">
                                  <Pencil size={14} />
                                </button>
                              )}
                              {isManager && (
                                <button onClick={() => setDeleting(p)} className="btn btn-ghost btn-icon btn-sm hover:text-[#EF4444]">
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
        </motion.div>
      )}

      {isManager && (
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Novo Produto">
          <ProductForm onSubmit={(v) => createMut.mutate(toPayload(v))} loading={createMut.isPending} isNew />
        </Modal>
      )}

      {canEdit && (
        <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar Produto">
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
          description={`Remover "${deleting?.descricao}"? Esta ação não pode ser desfeita.`}
          loading={deleteMut.isPending}
        />
      )}
    </div>
  );
}
