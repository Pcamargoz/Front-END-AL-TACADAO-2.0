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

// ── Schema ─────────────────────────────────────────────────────────────────
const schema = z.object({
  descricao:    z.string().min(2, "Descrição obrigatória"),
  medida:       z.string().optional(),
  marca:        z.string().min(1, "Marca é obrigatória"),
  fornecedorId: z.string().min(1, "Selecione um fornecedor"),
});
type FormValues = z.infer<typeof schema>;

// ── Form ───────────────────────────────────────────────────────────────────
function ProdutoForm({
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

  const { data: fornecedores = [] } = useQuery({
    queryKey: ["fornecedores"],
    queryFn: () => apiListFornecedores(),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="input-group">
        <label className="input-label">Descrição</label>
        <input
          {...register("descricao")}
          placeholder="Nome do produto"
          className={`input-field ${errors.descricao ? "error" : ""}`}
        />
        {errors.descricao && <span className="input-error">{errors.descricao.message}</span>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="input-group">
          <label className="input-label">Medida (g)</label>
          <div className="relative">
            <Weight size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
            <input {...register("medida")} type="number" placeholder="500" className="input-field pl-9" />
          </div>
        </div>
        <div className="input-group">
          <label className="input-label">Marca *</label>
          <select {...register("marca")} className={`input-field ${errors.marca ? "error" : ""}`}>
            <option value="">Selecionar marca</option>
            {ALL_BRANDS.map((b) => (
              <option key={b} value={b}>{BRAND_META[b].label}</option>
            ))}
          </select>
          {errors.marca && <span className="input-error">{errors.marca.message}</span>}
        </div>
      </div>

      <div className="input-group">
        <label className="input-label">Fornecedor *</label>
        <select
          {...register("fornecedorId")}
          className={`input-field ${errors.fornecedorId ? "error" : ""}`}
        >
          <option value="">Selecionar fornecedor</option>
          {fornecedores.map((f) => (
            <option key={f.id} value={f.id}>
              {f.nomeFantasia ? `${f.nomeFantasia} (${f.razaoSocial})` : f.razaoSocial}
            </option>
          ))}
        </select>
        {errors.fornecedorId && (
          <span className="input-error">{errors.fornecedorId.message}</span>
        )}
      </div>

      <div className="divider" />
      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        {loading ? "Salvando..." : "Salvar produto"}
      </button>
    </form>
  );
}

// ── Product Card ───────────────────────────────────────────────────────────
function ProdutoCard({
  produto,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}: {
  produto: Produto;
  onEdit: () => void;
  onDelete: () => void;
  canEdit: boolean;
  canDelete: boolean;
}) {
  const meta = produto.marca ? BRAND_META[produto.marca] : null;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="glass glass-hover tilt-card rounded-2xl p-4 flex flex-col gap-3"
      style={{ border: `1px solid ${meta?.color ?? "#334155"}1a` }}
    >
      {/* Brand badge */}
      <div className="flex items-start justify-between gap-2">
        <div
          className="brand-chip"
          style={{ background: meta?.bg ?? "rgba(100,116,139,0.12)", color: meta?.color ?? "#64748b" }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta?.color ?? "#64748b" }} />
          {meta?.label ?? produto.marca ?? "Sem marca"}
        </div>
        {produto.medida != null && (
          <span className="text-xs text-slate-600">{produto.medida}g</span>
        )}
      </div>

      {/* Icon + name */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: meta?.bg ?? "rgba(100,116,139,0.08)" }}
        >
          <Package size={18} style={{ color: meta?.color ?? "#64748b" }} />
        </div>
        <p className="text-sm font-medium text-slate-200 leading-snug">{produto.descricao}</p>
      </div>

      {/* Supplier */}
      {produto.fornecedor && (
        <p className="text-xs text-slate-600 truncate">
          {produto.fornecedor.nomeFantasia || produto.fornecedor.razaoSocial}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-white/5 mt-auto">
        {canEdit && (
          <button onClick={onEdit} className="btn btn-ghost btn-sm flex-1 text-slate-500 hover:text-cyan-400">
            <Pencil size={13} /> Editar
          </button>
        )}
        {canDelete && (
          <button onClick={onDelete} className="btn btn-ghost btn-sm flex-1 text-slate-500 hover:text-rose-400">
            <Trash2 size={13} /> Remover
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export function EstoquePage() {
  const { user } = useAuth();
  const isGerente = user?.roles?.includes("GERENTE") ?? false;
  const canEdit = isGerente || (user?.roles?.includes("FUNCIONARIO") ?? false);

  const qc = useQueryClient();
  const [search, setSearch]       = useState("");
  const [brandFilter, setBrand]   = useState<string | null>(null);
  const [view, setView]           = useState<"grid" | "list">("grid");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState<Produto | null>(null);
  const [deleting, setDeleting]   = useState<Produto | null>(null);

  const { data: produtos = [], isLoading, error: produtosError } = useQuery<Produto[], Error>({
    queryKey: ["estoque"],
    queryFn: () => apiListEstoque(),
  });

  const createMut = useMutation({
    mutationFn: (p: ProdutoPayload) => apiCreateProduto(p),
    onSuccess: async (res) => {
      if (res.ok) {
        toast.success("Produto adicionado!");
        await qc.invalidateQueries({ queryKey: ["estoque"] });
        setModalOpen(false);
      } else {
        const body = await res.json().catch(() => null);
        toast.error(body?.message ?? "Erro ao criar produto");
      }
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProdutoPayload }) =>
      apiUpdateProduto(id, payload),
    onSuccess: async (res) => {
      if (res.ok) {
        toast.success("Produto atualizado!");
        await qc.invalidateQueries({ queryKey: ["estoque"] });
        setEditing(null);
      } else {
        const body = await res.json().catch(() => null);
        toast.error(body?.message ?? "Erro ao atualizar");
      }
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => apiDeleteProduto(id),
    onSuccess: async () => {
      toast.success("Produto removido");
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

  const brandsPresent = [...new Set(produtos.map((p: Produto) => p.marca).filter(Boolean))] as string[];

  const filtered = produtos.filter((p: Produto) => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.descricao.toLowerCase().includes(q) ||
      (p.marca ?? "").toLowerCase().includes(q);
    const matchBrand = !brandFilter || p.marca === brandFilter;
    return matchSearch && matchBrand;
  });

  // Monta os defaultValues do form de edição com o razaoSocial do fornecedor atual
  const editingDefaults = editing ? {
    descricao: editing.descricao,
    medida: editing.medida?.toString(),
    marca: editing.marca ?? "",
    fornecedorId: editing.fornecedor?.id ?? "",
  } : undefined;

  return (
    <div className="page-container min-h-screen">
      {/* Erro de carregamento */}
      {produtosError && (
        <div className="mb-4 p-3 rounded-xl text-sm text-rose-400 flex items-center gap-2"
          style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)" }}>
          <span className="w-2 h-2 rounded-full bg-rose-400 flex-shrink-0" />
          Erro ao carregar produtos: {String(produtosError)}
        </div>
      )}
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="page-header">
        <div>
          <p className="text-xs text-slate-600 uppercase tracking-widest mb-1">Inventário</p>
          <h1 className="text-2xl font-bold text-slate-100">Estoque</h1>
          <p className="text-sm text-slate-500 mt-0.5">{produtos.length} produtos</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setView("grid")}
            className={`btn btn-icon ${view === "grid" ? "btn-secondary" : "btn-ghost"}`}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setView("list")}
            className={`btn btn-icon ${view === "list" ? "btn-secondary" : "btn-ghost"}`}
          >
            <List size={16} />
          </button>
          {isGerente && (
            <button onClick={() => setModalOpen(true)} className="btn btn-primary ml-1">
              <Plus size={16} />
              <span className="hidden sm:inline">Novo Produto</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="flex flex-wrap items-center gap-3 mb-5">
        <div className="search-bar" style={{ minWidth: 0, flex: "1 1 200px", maxWidth: 320 }}>
          <Search size={15} className="search-icon" />
          <input
            className="input-field"
            placeholder="Buscar produto ou marca..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {/* Brand filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setBrand(null)}
            className={`badge cursor-pointer transition-all ${!brandFilter
              ? "neon-border-cyan text-cyan-400"
              : "text-slate-500 border border-white/5 hover:border-white/10"}`}
            style={{ background: !brandFilter ? "rgba(0,240,255,0.07)" : "transparent" }}
          >
            Todos
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
                  color: active ? m.color : "#475569",
                  border: `1px solid ${active ? m.color + "44" : "rgba(255,255,255,0.06)"}`,
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
            <div key={i} className="skeleton rounded-2xl" style={{ height: view === "grid" ? 180 : 72, animationDelay: `${i * 0.06}s` }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state glass rounded-2xl">
          <Package size={40} />
          <p className="text-slate-500 mt-2 text-sm">
            {search || brandFilter ? "Nenhum produto encontrado" : "Estoque vazio"}
          </p>
            {!search && !brandFilter && isGerente && (
              <button onClick={() => setModalOpen(true)} className="btn btn-primary mt-4">
                <Plus size={14} /> Adicionar produto
              </button>
          )}
        </div>
      ) : view === "grid" ? (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          <AnimatePresence>
            {filtered.map((p: Produto) => (
                <ProdutoCard
                  key={p.id}
                  produto={p}
                  onEdit={() => canEdit && setEditing(p)}
                  onDelete={() => setDeleting(p)}
                  canEdit={canEdit}
                  canDelete={isGerente}
                />
              ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(167,139,250,0.08)" }}
        >
          <table className="data-table">
            <thead>
              <tr>
                <th>Produto</th>
                <th className="hidden sm:table-cell">Marca</th>
                <th className="hidden md:table-cell">Medida</th>
                <th className="hidden lg:table-cell">Fornecedor</th>
                {(canEdit || isGerente) && <th style={{ width: 90 }} />}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((p: Produto, i: number) => {
                  const meta = p.marca ? BRAND_META[p.marca] : null;
                  return (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: meta?.bg ?? "rgba(100,116,139,0.1)" }}>
                            <Package size={14} style={{ color: meta?.color ?? "#64748b" }} />
                          </div>
                          <div className="min-w-0">
                            <span className="text-slate-200 font-medium truncate block">{p.descricao}</span>
                            {meta && (
                              <span className="text-xs sm:hidden" style={{ color: meta.color }}>{meta.label}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell">
                        {meta ? (
                          <span className="brand-chip" style={{ background: meta.bg, color: meta.color }}>
                            {meta.label}
                          </span>
                        ) : <span className="text-slate-700">—</span>}
                      </td>
                      <td className="hidden md:table-cell">
                        {p.medida != null
                          ? <span className="text-slate-400">{p.medida}g</span>
                          : <span className="text-slate-700">—</span>}
                      </td>
                      <td className="hidden lg:table-cell">
                        <span className="text-sm">
                          {p.fornecedor
                            ? p.fornecedor.nomeFantasia || p.fornecedor.razaoSocial
                            : <span className="text-slate-700">—</span>}
                        </span>
                      </td>
                      {(canEdit || isGerente) && (
                        <td>
                          <div className="flex items-center gap-1 justify-end">
                            {canEdit && (
                              <button onClick={() => setEditing(p)} className="btn btn-ghost btn-icon text-slate-500 hover:text-cyan-400">
                                <Pencil size={14} />
                              </button>
                            )}
                            {isGerente && (
                              <button onClick={() => setDeleting(p)} className="btn btn-ghost btn-icon text-slate-500 hover:text-rose-400">
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
        </motion.div>
      )}

      {/* Create Modal */}
      {isGerente && (
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Novo Produto">
          <ProdutoForm
            onSubmit={(v) => createMut.mutate(toPayload(v))}
            loading={createMut.isPending}
          />
        </Modal>
      )}

      {/* Edit Modal */}
      {canEdit && (
        <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar Produto">
          {editing && (
            <ProdutoForm
              defaultValues={editingDefaults}
              onSubmit={(v) => updateMut.mutate({ id: editing.id, payload: toPayload(v) })}
              loading={updateMut.isPending}
            />
          )}
        </Modal>
      )}

      {/* Delete */}
      {isGerente && (
        <ConfirmDialog
          open={!!deleting}
          onClose={() => setDeleting(null)}
          onConfirm={() => deleting && deleteMut.mutate(deleting.id)}
          description={`Remover "${deleting?.descricao}"?`}
          loading={deleteMut.isPending}
        />
      )}
    </div>
  );
}
