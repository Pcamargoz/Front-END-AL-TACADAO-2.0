import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Search, Pencil, Trash2, Package, LayoutGrid, List, Scale, Dumbbell, DollarSign, UserRound } from "lucide-react";
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
  MARCAS_VALIDAS,
} from "../api/client";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { BRAND_META, ALL_BRANDS, formatCurrency } from "../lib/utils";
import { useFornecedor } from "../context/FornecedorContext";
import { useAuth } from "../auth/AuthContext";

const schema = z.object({
  descricao:    z.string().min(2, "Descrição é obrigatória"),
  sabor:        z.string().optional(),
  medida:       z.string().optional(),
  preco:        z.string().min(1, "Preço é obrigatório").refine((value) => {
    const parsed = Number(value.replace(",", "."));
    return Number.isFinite(parsed) && parsed > 0;
  }, "Preço deve ser maior que zero"),
  marca:        z.string().min(1, "Selecione uma marca"),
  fornecedorId: z.string().min(1, "Selecione um fornecedor"),
});
type FormValues = z.infer<typeof schema>;

function getCreatorLabel(product: Produto): string {
  const nome = product.usuarioCadastro?.nome?.trim();
  const login = product.usuarioCadastro?.login?.trim();
  if (nome && login && nome.toLowerCase() !== login.toLowerCase()) return `${nome} (@${login})`;
  if (nome) return nome;
  if (login) return `@${login}`;
  return "Não informado";
}

/* ── Product Form ──────────────────────────────────────────────────────── */

function ProductForm({ defaultValues, onSubmit, loading, isNew }: {
  defaultValues?: Partial<FormValues>;
  onSubmit: (v: FormValues) => void;
  loading?: boolean;
  isNew?: boolean;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });
  const { user } = useAuth();
  const { data: suppliers = [] } = useQuery({ queryKey: ["fornecedores"], queryFn: apiListFornecedores });

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      {user && (
        <div style={{
          display: "flex", alignItems: "center", gap: "var(--space-2)",
          padding: "var(--space-3)", borderRadius: "var(--radius-md)",
          background: "var(--color-bg-secondary)", border: "1px solid var(--color-divider)",
        }}>
          <UserRound size={14} style={{ color: "var(--color-text-quaternary)", flexShrink: 0 }} />
          <span style={{ fontSize: "12px", color: "var(--color-text-quaternary)" }}>
            Cadastrando como: <span style={{ color: "var(--color-text-tertiary)" }}>{user.nome ?? user.login} (@{user.login})</span>
          </span>
        </div>
      )}

      {/* Description */}
      <div className="input-group">
        <label className="input-label">Descrição do produto *</label>
        <input {...register("descricao")} placeholder="Ex: Whey Protein Isolado 900g" className={`input-field ${errors.descricao ? "border-error" : ""}`} />
        {errors.descricao && <span style={{ fontSize: "12px", color: "var(--color-error)" }}>{errors.descricao.message}</span>}
      </div>

      {/* Sabor / Medida / Preço */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "var(--space-4)" }}>
        <div className="input-group">
          <label className="input-label">Sabor</label>
          <input {...register("sabor")} placeholder="Ex: Chocolate" className="input-field" />
        </div>
        <div className="input-group">
          <label className="input-label">Medida (ex: 1.5)</label>
          <div style={{ position: "relative" }}>
            <Scale size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-quaternary)" }} />
            <input {...register("medida")} type="number" step="0.01" placeholder="1.5" className="input-field" style={{ paddingLeft: "38px" }} />
          </div>
        </div>
        <div className="input-group">
          <label className="input-label">Preço (R$) *</label>
          <div style={{ position: "relative" }}>
            <DollarSign size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-quaternary)" }} />
            <input {...register("preco")} type="number" step="0.01" min="0.01" placeholder="129.90" className={`input-field ${errors.preco ? "border-error" : ""}`} style={{ paddingLeft: "38px" }} />
          </div>
          {errors.preco && <span style={{ fontSize: "12px", color: "var(--color-error)" }}>{errors.preco.message}</span>}
        </div>
      </div>

      {/* Marca / Fornecedor */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-4)" }}>
        <div className="input-group">
          <label className="input-label">Marca *</label>
          <select {...register("marca")} className={`input-field ${errors.marca ? "border-error" : ""}`}>
            <option value="">Selecione a marca</option>
            {ALL_BRANDS.map((b) => <option key={b} value={b}>{BRAND_META[b]?.label ?? b}</option>)}
            {MARCAS_VALIDAS.filter(m => !ALL_BRANDS.includes(m)).map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          {errors.marca && <span style={{ fontSize: "12px", color: "var(--color-error)" }}>{errors.marca.message}</span>}
        </div>
        <div className="input-group">
          <label className="input-label">Fornecedor do Produto *</label>
          <select {...register("fornecedorId")} className={`input-field ${errors.fornecedorId ? "border-error" : ""}`}>
            <option value="">Selecione o fornecedor</option>
            {suppliers.map((f) => (
              <option key={f.id} value={f.id}>{f.nomeFantasia ? `${f.nomeFantasia} (${f.razaoSocial})` : f.razaoSocial}</option>
            ))}
          </select>
          {errors.fornecedorId && <span style={{ fontSize: "12px", color: "var(--color-error)" }}>{errors.fornecedorId.message}</span>}
          <span style={{ fontSize: "12px", color: "var(--color-text-quaternary)" }}>De quem o produto é comprado</span>
        </div>
      </div>

      <hr className="divider" />
      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        {loading ? (
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }} />
            Salvando...
          </span>
        ) : (isNew ? "Adicionar produto" : "Salvar alterações")}
      </button>
    </form>
  );
}

/* ── Product Card ──────────────────────────────────────────────────────── */

function ProductCard({ product, onEdit, onDelete, canEdit, canDelete }: {
  product: Produto; onEdit: () => void; onDelete: () => void; canEdit: boolean; canDelete: boolean;
}) {
  const meta = product.marca ? BRAND_META[product.marca] : null;
  const registeredBy = getCreatorLabel(product);

  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }} transition={{ duration: 0.2 }}
      className="product-card" style={{ padding: "var(--space-5)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
        {meta && <span className="badge" style={{ background: meta.bg, color: meta.color }}>{meta.label}</span>}
        {product.medida != null && <span style={{ fontSize: "12px", color: "var(--color-text-quaternary)", fontFamily: "var(--font-mono)" }}>{product.medida}g</span>}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-3)" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "var(--radius-md)", background: meta?.bg ?? "var(--color-bg-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Dumbbell size={18} style={{ color: meta?.color ?? "var(--color-text-quaternary)" }} />
        </div>
        <p style={{ fontSize: "var(--text-body-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-primary)" }} className="line-clamp-2">{product.descricao}</p>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-2)" }}>
        {product.preco != null ? <span className="price">{formatCurrency(product.preco)}</span> : <span style={{ fontSize: "12px", color: "var(--color-text-quaternary)" }}>Sem preço</span>}
        {product.fornecedor && <span style={{ fontSize: "12px", color: "var(--color-text-quaternary)" }} className="truncate">{product.fornecedor.nomeFantasia || product.fornecedor.razaoSocial}</span>}
      </div>

      <p style={{ fontSize: "12px", color: "var(--color-text-quaternary)", display: "flex", alignItems: "center", gap: "4px", marginBottom: "var(--space-3)" }}>
        <UserRound size={11} /> <span className="truncate">Cadastrado por: <span style={{ color: "var(--color-text-tertiary)" }}>{registeredBy}</span></span>
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", paddingTop: "var(--space-3)", borderTop: "1px solid var(--color-divider)" }}>
        {canEdit && <button onClick={onEdit} className="btn btn-ghost btn-sm" style={{ flex: 1 }}><Pencil size={12} /> Editar</button>}
        {canDelete && <button onClick={onDelete} className="btn btn-ghost btn-sm" style={{ flex: 1, color: "var(--color-error)" }}><Trash2 size={12} /> Remover</button>}
      </div>
    </motion.div>
  );
}

/* ── Inventory Page ────────────────────────────────────────────────────── */

export function InventoryPage() {
  const { isGerente } = useFornecedor();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [brandFilter, setBrand] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Produto | null>(null);
  const [deleting, setDeleting] = useState<Produto | null>(null);

  const { data: productsData, isLoading, error } = useQuery({ queryKey: ["estoque"], queryFn: () => apiListEstoque() });
  const products: Produto[] = productsData?.content ?? [];

  const createMut = useMutation({
    mutationFn: (p: ProdutoPayload) => apiCreateProduto(p),
    onSuccess: async (res) => {
      if (res.ok) { toast.success("Produto adicionado com sucesso"); await qc.invalidateQueries({ queryKey: ["estoque"] }); setModalOpen(false); }
      else { const body = await res.json().catch(() => null); toast.error(body?.message ?? "Falha ao criar produto"); }
    },
    onError: (err: any) => toast.error(err?.message ?? "Erro de conexão ao criar produto."),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProdutoPayload }) => apiUpdateProduto(id, payload),
    onSuccess: async (res) => {
      if (res.ok) { toast.success("Produto atualizado com sucesso"); await qc.invalidateQueries({ queryKey: ["estoque"] }); setEditing(null); }
      else { const body = await res.json().catch(() => null); toast.error(body?.message ?? "Falha ao atualizar produto"); }
    },
    onError: (err: any) => toast.error(err?.message ?? "Erro de conexão ao atualizar produto."),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => apiDeleteProduto(id),
    onSuccess: async () => { toast.success("Produto removido"); await qc.invalidateQueries({ queryKey: ["estoque"] }); setDeleting(null); },
    onError: (err: any) => toast.error(err?.message ?? "Erro de conexão ao remover produto."),
  });

  const toPayload = (v: FormValues): ProdutoPayload => ({
    descricao: v.descricao, sabor: v.sabor, medida: v.medida ? Number(v.medida) : undefined,
    preco: Number(v.preco.replace(",", ".")), marca: v.marca, fornecedorId: v.fornecedorId,
  });

  const brandsPresent = [...new Set(products.map((p) => p.marca).filter(Boolean))] as string[];
  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    return (!q || p.descricao.toLowerCase().includes(q) || (p.marca ?? "").toLowerCase().includes(q)) && (!brandFilter || p.marca === brandFilter);
  });

  const editingDefaults = editing ? {
    descricao: editing.descricao, sabor: editing.sabor ?? "", medida: editing.medida?.toString(),
    preco: editing.preco?.toString() ?? "", marca: editing.marca ?? "", fornecedorId: editing.fornecedor?.id ?? "",
  } : undefined;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {error && (
        <div style={{ padding: "var(--space-3)", borderRadius: "var(--radius-md)", background: "var(--color-error-bg)", border: "1px solid var(--color-error)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "var(--radius-full)", background: "var(--color-error)" }} />
          <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-error)" }}>Falha ao carregar produtos: {String(error)}</span>
        </div>
      )}

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="page-header">
        <div>
          <span className="page-eyebrow">Estoque</span>
          <h1 className="page-title">Produtos</h1>
          <p className="page-subtitle">{products.length} produto{products.length !== 1 ? "s" : ""} cadastrado{products.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="page-actions">
          <button onClick={() => setView("grid")} className={`btn btn-icon btn-sm ${view === "grid" ? "btn-secondary" : "btn-ghost"}`}><LayoutGrid size={16} /></button>
          <button onClick={() => setView("list")} className={`btn btn-icon btn-sm ${view === "list" ? "btn-secondary" : "btn-ghost"}`}><List size={16} /></button>
          <button onClick={() => setModalOpen(true)} className="btn btn-primary"><Plus size={16} /> <span className="hidden sm\:inline">Novo Produto</span></button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-4)" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "200px", maxWidth: "400px" }}>
          <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-quaternary)" }} />
          <input type="text" className="input-field" style={{ paddingLeft: "40px" }} placeholder="Buscar produto ou marca..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
          <button onClick={() => setBrand(null)} className={`btn btn-sm ${!brandFilter ? "btn-primary" : "btn-ghost"}`}>Todas</button>
          {brandsPresent.map((b) => {
            const m = BRAND_META[b];
            if (!m) return null;
            const active = brandFilter === b;
            return (
              <button key={b} onClick={() => setBrand(active ? null : b)} className="btn btn-sm"
                style={active ? { background: m.bg, color: m.color, border: `1px solid ${m.color}44` } : { background: "transparent", border: "1px solid var(--color-border)", color: "var(--color-text-tertiary)" }}>
                {m.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Content */}
      {isLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: view === "grid" ? "repeat(auto-fill, minmax(260px, 1fr))" : "1fr", gap: "var(--space-4)" }}>
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton" style={{ height: view === "grid" ? 200 : 80, animationDelay: `${i * 0.06}s` }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state" style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)" }}>
          <div className="empty-icon"><Package size={32} /></div>
          <p className="empty-title">{search || brandFilter ? "Nenhum produto encontrado" : "Estoque vazio"}</p>
          <p className="empty-description">{search || brandFilter ? "Tente ajustar os filtros de busca" : "Comece adicionando seu primeiro produto"}</p>
          {!search && !brandFilter && <button onClick={() => setModalOpen(true)} className="btn btn-primary"><Plus size={16} /> Adicionar produto</button>}
        </div>
      ) : view === "grid" ? (
        <motion.div layout style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "var(--space-4)" }}>
          <AnimatePresence>
            {filtered.map((p) => <ProductCard key={p.id} product={p} onEdit={() => setEditing(p)} onDelete={() => setDeleting(p)} canEdit={true} canDelete={isGerente} />)}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card" style={{ overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", fontSize: "12px", color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", borderBottom: "1px solid var(--color-divider)" }}>
                  <th style={{ padding: "var(--space-4) var(--space-5)", minWidth: "200px" }}>Produto</th>
                  <th style={{ padding: "var(--space-4) var(--space-5)", minWidth: "100px" }}>Marca</th>
                  <th style={{ padding: "var(--space-4) var(--space-5)", minWidth: "80px" }}>Peso</th>
                  <th style={{ padding: "var(--space-4) var(--space-5)" }}>Preço</th>
                  <th style={{ padding: "var(--space-4) var(--space-5)", minWidth: "120px" }}>Fornecedor</th>
                  <th style={{ padding: "var(--space-4) var(--space-5)", width: "80px" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((p, i) => {
                    const meta = p.marca ? BRAND_META[p.marca] : null;
                    const registeredBy = getCreatorLabel(p);
                    return (
                      <motion.tr key={p.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.025 }}
                        style={{ borderBottom: "1px solid var(--color-divider)", transition: "background var(--duration-fast) var(--ease-out)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-bg-hover)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                        <td style={{ padding: "var(--space-3) var(--space-5)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                            <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-sm)", background: meta?.bg ?? "var(--color-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <Dumbbell size={14} style={{ color: meta?.color ?? "var(--color-text-quaternary)" }} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <span style={{ fontSize: "var(--text-body-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-primary)" }} className="truncate">{p.descricao}</span>
                              <span style={{ fontSize: "12px", color: "var(--color-text-quaternary)", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                                <UserRound size={11} /> <span className="truncate">{registeredBy}</span>
                              </span>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "var(--space-3) var(--space-5)" }}>
                          {meta ? <span className="badge" style={{ background: meta.bg, color: meta.color }}>{meta.label}</span> : <span style={{ color: "var(--color-text-quaternary)" }}>—</span>}
                        </td>
                        <td style={{ padding: "var(--space-3) var(--space-5)" }}>
                          {p.medida != null ? <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)" }}>{p.medida}g</span> : <span style={{ color: "var(--color-text-quaternary)" }}>—</span>}
                        </td>
                        <td style={{ padding: "var(--space-3) var(--space-5)" }}>
                          {p.preco != null ? <span className="price" style={{ fontSize: "var(--text-body-sm)" }}>{formatCurrency(p.preco)}</span> : <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-text-quaternary)" }}>Sem preço</span>}
                        </td>
                        <td style={{ padding: "var(--space-3) var(--space-5)" }}>
                          {p.fornecedor ? <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-text-secondary)" }}>{p.fornecedor.nomeFantasia || p.fornecedor.razaoSocial}</span> : <span style={{ color: "var(--color-text-quaternary)" }}>—</span>}
                        </td>
                        <td style={{ padding: "var(--space-3) var(--space-5)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "2px", justifyContent: "flex-end" }}>
                            <button onClick={() => setEditing(p)} className="btn btn-ghost btn-icon btn-sm"><Pencil size={14} /></button>
                            {isGerente && <button onClick={() => setDeleting(p)} className="btn btn-ghost btn-icon btn-sm" style={{ color: "var(--color-error)" }}><Trash2 size={14} /></button>}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Novo Produto">
        <ProductForm onSubmit={(v) => createMut.mutate(toPayload(v))} loading={createMut.isPending} isNew />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar Produto">
        {editing && <ProductForm defaultValues={editingDefaults} onSubmit={(v) => updateMut.mutate({ id: editing.id, payload: toPayload(v) })} loading={updateMut.isPending} />}
      </Modal>

      {isGerente && (
        <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} onConfirm={() => deleting && deleteMut.mutate(deleting.id)}
          description={`Remover "${deleting?.descricao}"? Esta ação não pode ser desfeita.`} loading={deleteMut.isPending} />
      )}
    </div>
  );
}
