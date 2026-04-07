import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Package, X, Dumbbell, ShoppingBag, LayoutGrid, ListIcon, SlidersHorizontal, Check } from "lucide-react";
import { apiListEstoque, type Produto } from "../api/client";
import { BRAND_META, ALL_BRANDS, getMockPrice, formatCurrency } from "../lib/utils";
import { useCart } from "../hooks/useCart";

function getProductPrice(product: Produto): number {
  return product.preco ?? getMockPrice(product.id);
}

function ProductCard({ product, view }: { product: Produto; view: "grid" | "list" }) {
  const { addItem, isInCart } = useCart();
  const meta = product.marca ? BRAND_META[product.marca] : null;
  const price = getProductPrice(product);
  const inCart = isInCart(product.id);

  if (view === "list") {
    return (
      <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }} className="card" style={{ padding: "var(--space-4)", display: "flex", alignItems: "center", gap: "var(--space-5)", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }}>
        <div style={{ width: "80px", height: "80px", borderRadius: "12px", background: "var(--color-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Dumbbell size={28} style={{ color: "var(--color-text-tertiary)" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {meta && <span style={{ display: "inline-block", fontSize: "12px", fontWeight: "var(--font-weight-medium)", color: "var(--color-accent)", marginBottom: "4px" }}>{meta.label}</span>}
          <Link to={`/produtos/${product.id}`} style={{ textDecoration: "none", color: "inherit" }}>
            <h3 className="truncate" style={{ fontSize: "16px", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-primary)", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-accent)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--color-text-primary)"}>{product.descricao}</h3>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginTop: "4px" }}>
            {product.medida && <span style={{ fontSize: "12px", color: "var(--color-text-tertiary)" }}>{product.medida}g</span>}
            {product.sabor && <span style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>{product.sabor}</span>}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
          <span style={{ fontSize: "18px", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)", whiteSpace: "nowrap" }}>{formatCurrency(price)}</span>
          <button onClick={() => addItem(product, 1, price)} disabled={inCart} className={`btn btn-sm ${inCart ? "btn-secondary" : "btn-primary"}`}>
            {inCart ? <><Check size={14} /> No carrinho</> : "Adicionar"}
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }} className="product-card">
      <Link to={`/produtos/${product.id}`} style={{ display: "block", textDecoration: "none" }}>
        <div style={{ aspectRatio: "1/1", background: "var(--color-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", borderRadius: "calc(var(--radius-2xl) - 1px) calc(var(--radius-2xl) - 1px) 0 0" }}>
          <Dumbbell size={48} style={{ color: "var(--color-text-tertiary)", transition: "transform 0.5s ease" }} onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"} onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"} />
        </div>
      </Link>
      <div style={{ padding: "var(--space-5)" }}>
        {meta && <span style={{ fontSize: "12px", fontWeight: "var(--font-weight-medium)", color: "var(--color-accent)", marginBottom: "8px", display: "block" }}>{meta.label}</span>}
        <Link to={`/produtos/${product.id}`} style={{ textDecoration: "none", color: "inherit" }}>
          <h3 className="line-clamp-2" style={{ fontSize: "16px", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-primary)", marginBottom: "4px", minHeight: "44px" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-accent)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--color-text-primary)"}>{product.descricao}</h3>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          {product.medida && <span style={{ fontSize: "12px", color: "var(--color-text-tertiary)" }}>{product.medida}g</span>}
          {product.sabor && <><span style={{ color: "var(--color-text-tertiary)" }}>&middot;</span><span style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>{product.sabor}</span></>}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "18px", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)" }}>{formatCurrency(price)}</span>
          <button onClick={() => addItem(product, 1, price)} disabled={inCart} className={`btn btn-sm btn-icon ${inCart ? "btn-secondary" : "btn-primary"}`} aria-label={inCart ? "Já no carrinho" : "Adicionar ao carrinho"}>
            {inCart ? <Check size={16} /> : <ShoppingBag size={16} />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState<"grid" | "list">("grid");

  const searchQuery = searchParams.get("q") || "";
  const brandFilter = searchParams.get("marca") || "";
  const sortBy = searchParams.get("sort") || "nome";

  const { data: productsData, isLoading } = useQuery({ queryKey: ["estoque"], queryFn: () => apiListEstoque() });
  const products: Produto[] = productsData?.content ?? [];

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (searchQuery) result = result.filter((p) => p.descricao.toLowerCase().includes(searchQuery.toLowerCase()) || (p.marca && BRAND_META[p.marca]?.label.toLowerCase().includes(searchQuery.toLowerCase())));
    if (brandFilter) result = result.filter((p) => p.marca === brandFilter);
    result.sort((a, b) => {
      switch (sortBy) {
        case "preco-asc": return getProductPrice(a) - getProductPrice(b);
        case "preco-desc": return getProductPrice(b) - getProductPrice(a);
        case "nome": default: return a.descricao.localeCompare(b.descricao);
      }
    });
    return result;
  }, [products, searchQuery, brandFilter, sortBy]);

  const availableBrands = useMemo(() => {
    const brands = new Set(products.map((p) => p.marca).filter(Boolean));
    return ALL_BRANDS.filter((b) => brands.has(b));
  }, [products]);

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value); else newParams.delete(key);
    setSearchParams(newParams);
  };

  const clearFilters = () => setSearchParams({});
  const hasActiveFilters = searchQuery || brandFilter;

  return (
    <div className="page-wrapper" style={{ background: "var(--color-bg-primary)" }}>
      {/* Header */}
      <div style={{ background: "var(--color-bg-secondary)", borderBottom: "1px solid var(--color-border)" }}>
        <div className="container-apple" style={{ padding: "48px var(--container-padding)" }}>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}>
            <span style={{ fontSize: "12px", fontWeight: "var(--font-weight-medium)", color: "var(--color-accent)", letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", marginBottom: "8px", display: "block" }}>Catálogo</span>
            <h1 className="text-display-sm" style={{ marginBottom: "8px" }}>Produtos</h1>
            <p className="text-body" style={{ color: "var(--color-text-secondary)" }}>{filteredProducts.length} produto{filteredProducts.length !== 1 ? "s" : ""} disponíve{filteredProducts.length !== 1 ? "is" : "l"}</p>
          </motion.div>
        </div>
      </div>

      <div className="container-apple" style={{ padding: "clamp(24px, 5vw, 48px) var(--container-padding)" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-12)" }}>
          {/* Sidebar */}
          <aside className="hidden lg\:block" style={{ width: "240px", flexShrink: 0 }}>
            <div style={{ position: "sticky", top: "120px", display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
              <div className="input-group">
                <label className="input-label">Buscar</label>
                <div style={{ position: "relative" }}>
                  <Search size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-tertiary)" }} />
                  <input type="text" placeholder="Nome do produto..." value={searchQuery} onChange={(e) => updateFilter("q", e.target.value)} className="input-field" style={{ paddingLeft: "44px" }} />
                </div>
              </div>
              <div>
                <label className="input-label" style={{ marginBottom: "12px", display: "block" }}>Marca</label>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <button onClick={() => updateFilter("marca", "")} style={{ width: "100%", textAlign: "left", padding: "10px 16px", borderRadius: "12px", fontSize: "14px", transition: "all 0.2s", background: !brandFilter ? "var(--color-accent-subtle)" : "transparent", color: !brandFilter ? "var(--color-accent)" : "var(--color-text-secondary)", fontWeight: !brandFilter ? 500 : 400 }} onMouseEnter={(e) => !brandFilter || (e.currentTarget.style.background = "var(--color-bg-secondary)", e.currentTarget.style.color = "var(--color-text-primary)")} onMouseLeave={(e) => !brandFilter || (e.currentTarget.style.background = "transparent", e.currentTarget.style.color = "var(--color-text-secondary)")}>Todas as marcas</button>
                  {availableBrands.map((brand) => {
                    const meta = BRAND_META[brand]; const isActive = brandFilter === brand;
                    return <button key={brand} onClick={() => updateFilter("marca", isActive ? "" : brand)} style={{ width: "100%", textAlign: "left", padding: "10px 16px", borderRadius: "12px", fontSize: "14px", transition: "all 0.2s", background: isActive ? "var(--color-accent-subtle)" : "transparent", color: isActive ? "var(--color-accent)" : "var(--color-text-secondary)", fontWeight: isActive ? 500 : 400 }} onMouseEnter={(e) => isActive || (e.currentTarget.style.background = "var(--color-bg-secondary)", e.currentTarget.style.color = "var(--color-text-primary)")} onMouseLeave={(e) => isActive || (e.currentTarget.style.background = "transparent", e.currentTarget.style.color = "var(--color-text-secondary)")}>{meta?.label || brand}</button>;
                  })}
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Ordenar por</label>
                <select value={sortBy} onChange={(e) => updateFilter("sort", e.target.value)} className="input-field"><option value="nome">Nome (A-Z)</option><option value="preco-asc">Menor preço</option><option value="preco-desc">Maior preço</option></select>
              </div>
              {hasActiveFilters && <button onClick={clearFilters} className="btn btn-secondary" style={{ width: "100%" }}><X size={16} /> Limpar filtros</button>}
            </div>
          </aside>

          {/* Main List */}
          <main style={{ flex: 1, minWidth: 0 }}>
            {/* Mobile filter logic can be integrated exactly the same here, just relying on lg:hidden style later */}
            <div className="lg\:hidden" style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
              <div style={{ flex: 1, position: "relative" }}>
                <Search size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-tertiary)" }} />
                <input type="text" placeholder="Buscar produtos..." value={searchQuery} onChange={(e) => updateFilter("q", e.target.value)} className="input-field" style={{ paddingLeft: "44px" }} />
              </div>
              <button onClick={() => console.log('Mobile filters')} className="btn btn-secondary btn-icon" style={{ position: "relative" }}>
                <SlidersHorizontal size={18} />
                {hasActiveFilters && <span style={{ position: "absolute", top: "-4px", right: "-4px", width: "10px", height: "10px", borderRadius: "50%", background: "var(--color-accent)" }} />}
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px", background: "var(--color-bg-secondary)", borderRadius: "12px" }}>
                <button onClick={() => setView("grid")} className={`btn btn-icon btn-sm ${view === "grid" ? "btn-primary" : "btn-ghost"}`}><LayoutGrid size={16} /></button>
                <button onClick={() => setView("list")} className={`btn btn-icon btn-sm ${view === "list" ? "btn-primary" : "btn-ghost"}`}><ListIcon size={16} /></button>
              </div>
              {hasActiveFilters && <button onClick={clearFilters} style={{ fontSize: "14px", color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none" }}><X size={14} /> Limpar filtros</button>}
            </div>

            {isLoading ? (
              <div style={{ display: "grid", gridTemplateColumns: view === "grid" ? "repeat(auto-fill, minmax(240px, 1fr))" : "1fr", gap: "20px" }}>
                {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: view === "grid" ? "320px" : "96px", borderRadius: "16px", animationDelay: `${i * 0.1}s` }} />)}
              </div>
            ) : filteredProducts.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: "64px 0", textAlign: "center" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "var(--color-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}><Package size={32} style={{ color: "var(--color-text-tertiary)" }} /></div>
                <h3 style={{ fontSize: "18px", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)", marginBottom: "8px" }}>Nenhum produto encontrado</h3>
                <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", marginBottom: "24px" }}>Tente ajustar seus filtros de busca</p>
                <button onClick={clearFilters} className="btn btn-secondary" style={{ margin: "0 auto" }}>Limpar filtros</button>
              </motion.div>
            ) : (
              <motion.div layout style={{ display: "grid", gridTemplateColumns: view === "grid" ? "repeat(auto-fill, minmax(240px, 1fr))" : "1fr", gap: "20px" }}>
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product, index) => (
                    <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.05, ease: [0.25, 0.1, 0.25, 1] }}>
                      <ProductCard product={product} view={view} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
