import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Package, X, Dumbbell, ShoppingBag,
  LayoutGrid, List as ListIcon, SlidersHorizontal, Check,
} from "lucide-react";
import { apiListEstoque, type Produto } from "../api/client";
import { BRAND_META, ALL_BRANDS, getMockPrice, formatCurrency } from "../lib/utils";
import { useCart } from "../hooks/useCart";

const APPLE_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function getProductPrice(product: Produto): number {
  return product.preco ?? getMockPrice(product.id);
}

/* ────────────────────────────────────────────────────────────────────────────
 * Skeleton
 * ──────────────────────────────────────────────────────────────────────────── */
function SkeletonGrid({ count, view }: { count: number; view: "grid" | "list" }) {
  if (view === "list") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {[...Array(count)].map((_, i) => (
          <div key={i} className="card" style={{ padding: 20, display: "flex", gap: 20, alignItems: "center" }}>
            <div className="skeleton" style={{ width: 80, height: 80, borderRadius: 14, flexShrink: 0 }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
              <div className="skeleton" style={{ height: 12, width: "30%" }} />
              <div className="skeleton" style={{ height: 14, width: "70%" }} />
              <div className="skeleton" style={{ height: 12, width: "20%" }} />
            </div>
            <div className="skeleton" style={{ width: 100, height: 36, borderRadius: 999 }} />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton skeleton-media" />
          <div className="skeleton-body">
            <div className="skeleton skeleton-line short" />
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line medium" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Product card
 * ──────────────────────────────────────────────────────────────────────────── */
function ProductCard({ product, view }: { product: Produto; view: "grid" | "list" }) {
  const { addItem, isInCart } = useCart();
  const meta = product.marca ? BRAND_META[product.marca] : null;
  const price = getProductPrice(product);
  const inCart = isInCart(product.id);

  if (view === "list") {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.4, ease: APPLE_EASE }}
        className="card card-hover"
        style={{ padding: 20, display: "flex", alignItems: "center", gap: 20 }}
      >
        <Link to={`/produtos/${product.id}`} style={{
          width: 88, height: 88, borderRadius: 16, flexShrink: 0,
          background: "radial-gradient(at 30% 20%, var(--color-bg-secondary), var(--color-bg-tertiary))",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Dumbbell size={32} strokeWidth={1.6} style={{ color: meta?.color || "var(--color-text-tertiary)" }} />
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          {meta && (
            <span className="badge" style={{ marginBottom: 6, color: meta.color, background: meta.bg }}>
              {meta.label}
            </span>
          )}
          <Link to={`/produtos/${product.id}`} style={{ color: "inherit", display: "block" }}>
            <h3 className="truncate" style={{
              fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600,
              color: "var(--color-text)", letterSpacing: "-0.01em",
            }}>
              {product.descricao}
            </h3>
          </Link>
          <div style={{ display: "flex", gap: 12, marginTop: 6, fontSize: 13, color: "var(--color-text-tertiary)" }}>
            {product.medida && <span>{product.medida}g</span>}
            {product.sabor && <span>· {product.sabor}</span>}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
          <span className="price" style={{ fontSize: 20, whiteSpace: "nowrap" }}>{formatCurrency(price)}</span>
          <button
            onClick={() => addItem(product, 1, price)}
            disabled={inCart}
            className={`btn btn-sm ${inCart ? "btn-secondary" : "btn-primary"}`}
          >
            {inCart ? <><Check size={14} strokeWidth={2.2} /> No carrinho</> : "Adicionar"}
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.45, ease: APPLE_EASE }}
      className="product-card"
    >
      <Link to={`/produtos/${product.id}`} style={{ display: "block" }}>
        <div className="product-media">
          <div
            className="product-icon"
            style={{
              width: 110, height: 110, borderRadius: 26,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: meta?.bg || "var(--color-accent-subtle)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4), 0 24px 40px -16px rgba(0,0,0,0.16)",
            }}
          >
            <Dumbbell size={44} strokeWidth={1.6} style={{ color: meta?.color || "var(--color-accent)" }} />
          </div>
        </div>
      </Link>
      <div style={{ padding: 22 }}>
        {meta && (
          <span className="badge" style={{ marginBottom: 10, color: meta.color, background: meta.bg }}>
            {meta.label}
          </span>
        )}
        <Link to={`/produtos/${product.id}`} style={{ color: "inherit" }}>
          <h3 className="line-clamp-2" style={{
            fontFamily: "var(--font-display)",
            fontSize: 16, fontWeight: 600, color: "var(--color-text)",
            marginBottom: 6, minHeight: 44, lineHeight: 1.35, letterSpacing: "-0.01em",
          }}>
            {product.descricao}
          </h3>
        </Link>
        <div style={{ display: "flex", gap: 8, marginBottom: 18, fontSize: 12, color: "var(--color-text-tertiary)" }}>
          {product.medida && <span>{product.medida}g</span>}
          {product.sabor && <><span>·</span><span>{product.sabor}</span></>}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span className="price" style={{ fontSize: 19 }}>{formatCurrency(price)}</span>
          <button
            onClick={() => addItem(product, 1, price)}
            disabled={inCart}
            className={`btn btn-sm btn-icon ${inCart ? "btn-secondary" : "btn-primary"}`}
            aria-label={inCart ? "Já no carrinho" : "Adicionar ao carrinho"}
          >
            {inCart ? <Check size={16} strokeWidth={2.2} /> : <ShoppingBag size={16} strokeWidth={2.2} />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Page
 * ──────────────────────────────────────────────────────────────────────────── */
export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const searchQuery = searchParams.get("q") || "";
  const brandFilter = searchParams.get("marca") || "";
  const sortBy = searchParams.get("sort") || "nome";

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["estoque"],
    queryFn: () => apiListEstoque(),
  });
  const products: Produto[] = productsData?.content ?? [];

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) =>
        p.descricao.toLowerCase().includes(q) ||
        (p.marca && BRAND_META[p.marca]?.label.toLowerCase().includes(q))
      );
    }
    if (brandFilter) result = result.filter((p) => p.marca === brandFilter);
    result.sort((a, b) => {
      switch (sortBy) {
        case "preco-asc":  return getProductPrice(a) - getProductPrice(b);
        case "preco-desc": return getProductPrice(b) - getProductPrice(a);
        default:           return a.descricao.localeCompare(b.descricao);
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
  const hasActiveFilters = Boolean(searchQuery || brandFilter);

  const FilterPanel = (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div className="input-group">
        <label className="input-label">Buscar</label>
        <div style={{ position: "relative" }}>
          <Search size={18} strokeWidth={2.2} style={{
            position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
            color: "var(--color-text-tertiary)", pointerEvents: "none",
          }} />
          <input
            type="text"
            placeholder="Nome, marca…"
            value={searchQuery}
            onChange={(e) => updateFilter("q", e.target.value)}
            className="input-field"
            style={{ paddingLeft: 46 }}
          />
        </div>
      </div>

      <div>
        <label className="input-label" style={{ marginBottom: 12, display: "block" }}>Marca</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <button
            onClick={() => updateFilter("marca", "")}
            className="tactile"
            style={{
              width: "100%", textAlign: "left",
              padding: "10px 16px", borderRadius: 12, fontSize: 14,
              background: !brandFilter ? "var(--color-accent-subtle)" : "transparent",
              color: !brandFilter ? "var(--color-accent)" : "var(--color-text-secondary)",
              fontWeight: !brandFilter ? 600 : 400,
              transition: "all 180ms cubic-bezier(0.22,1,0.36,1)",
            }}
          >
            Todas as marcas
          </button>
          {availableBrands.map((brand) => {
            const meta = BRAND_META[brand];
            const isActive = brandFilter === brand;
            return (
              <button
                key={brand}
                onClick={() => updateFilter("marca", isActive ? "" : brand)}
                className="tactile"
                style={{
                  width: "100%", textAlign: "left",
                  padding: "10px 16px", borderRadius: 12, fontSize: 14,
                  background: isActive ? "var(--color-accent-subtle)" : "transparent",
                  color: isActive ? "var(--color-accent)" : "var(--color-text-secondary)",
                  fontWeight: isActive ? 600 : 400,
                  transition: "all 180ms cubic-bezier(0.22,1,0.36,1)",
                }}
              >
                {meta?.label || brand}
              </button>
            );
          })}
        </div>
      </div>

      <div className="input-group">
        <label className="input-label">Ordenar por</label>
        <select
          value={sortBy}
          onChange={(e) => updateFilter("sort", e.target.value)}
          className="input-field"
        >
          <option value="nome">Nome (A-Z)</option>
          <option value="preco-asc">Menor preço</option>
          <option value="preco-desc">Maior preço</option>
        </select>
      </div>

      {hasActiveFilters && (
        <button onClick={clearFilters} className="btn btn-secondary" style={{ width: "100%" }}>
          <X size={16} strokeWidth={2.2} /> Limpar filtros
        </button>
      )}
    </div>
  );

  return (
    <div className="page-wrapper">
      {/* Header */}
      <section style={{
        background: "var(--color-bg-secondary)",
        borderBottom: "1px solid var(--color-border)",
      }}>
        <div className="container-apple" style={{ padding: "72px var(--container-padding) 56px" }}>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: APPLE_EASE }}
          >
            <span className="text-eyebrow" style={{ marginBottom: 14 }}>Catálogo</span>
            <h1 className="text-display" style={{ marginTop: 8, marginBottom: 14 }}>
              Tudo em{" "}
              <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", color: "var(--color-accent)", fontWeight: 400 }}>
                um lugar.
              </span>
            </h1>
            <p className="text-body-lg" style={{ maxWidth: 580 }}>
              {filteredProducts.length} produto{filteredProducts.length !== 1 ? "s" : ""}{" "}
              {filteredProducts.length !== 1 ? "disponíveis" : "disponível"} agora.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container-apple" style={{ padding: "clamp(32px, 5vw, 56px) var(--container-padding)" }}>
        <div style={{ display: "flex", gap: 56, alignItems: "flex-start" }}>
          {/* Sidebar (desktop) */}
          <aside className="hidden lg\:block" style={{ width: 260, flexShrink: 0 }}>
            <div style={{ position: "sticky", top: 96 }}>{FilterPanel}</div>
          </aside>

          <main style={{ flex: 1, minWidth: 0 }}>
            {/* Mobile bar */}
            <div className="lg\:hidden" style={{ display: "flex", gap: 12, marginBottom: 24 }}>
              <div style={{ flex: 1, position: "relative" }}>
                <Search size={18} strokeWidth={2.2} style={{
                  position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
                  color: "var(--color-text-tertiary)", pointerEvents: "none",
                }} />
                <input
                  type="text"
                  placeholder="Buscar produtos…"
                  value={searchQuery}
                  onChange={(e) => updateFilter("q", e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: 46 }}
                />
              </div>
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="btn btn-secondary btn-icon"
                style={{ position: "relative" }}
                aria-label="Filtros"
              >
                <SlidersHorizontal size={18} strokeWidth={2.2} />
                {hasActiveFilters && (
                  <span style={{
                    position: "absolute", top: -2, right: -2,
                    width: 10, height: 10, borderRadius: "50%",
                    background: "var(--color-accent)",
                    boxShadow: "0 0 0 2px var(--color-bg)",
                  }} />
                )}
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
              <div style={{
                display: "flex", gap: 4, padding: 4,
                background: "var(--color-bg-secondary)",
                borderRadius: "var(--radius-full)",
                border: "1px solid var(--color-border)",
              }}>
                <button
                  onClick={() => setView("grid")}
                  className={`btn btn-icon btn-sm ${view === "grid" ? "btn-primary" : "btn-ghost"}`}
                  aria-label="Visualizar em grade"
                >
                  <LayoutGrid size={15} strokeWidth={2.2} />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`btn btn-icon btn-sm ${view === "list" ? "btn-primary" : "btn-ghost"}`}
                  aria-label="Visualizar em lista"
                >
                  <ListIcon size={15} strokeWidth={2.2} />
                </button>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="btn btn-ghost btn-sm"
                >
                  <X size={14} strokeWidth={2.2} /> Limpar
                </button>
              )}
            </div>

            {isLoading ? (
              <SkeletonGrid count={view === "grid" ? 8 : 6} view={view} />
            ) : filteredProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: APPLE_EASE }}
                className="empty-state card"
              >
                <div className="empty-icon">
                  <Package size={32} strokeWidth={1.6} />
                </div>
                <h3 className="empty-title">Nenhum produto encontrado</h3>
                <p className="empty-description">Tente ajustar seus filtros ou termo de busca.</p>
                <button onClick={clearFilters} className="btn btn-secondary">Limpar filtros</button>
              </motion.div>
            ) : (
              <motion.div
                layout
                style={{
                  display: "grid",
                  gridTemplateColumns: view === "grid" ? "repeat(auto-fill, minmax(260px, 1fr))" : "1fr",
                  gap: 20,
                }}
              >
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} view={view} />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile filters sheet */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMobileFiltersOpen(false)}
              style={{
                position: "fixed", inset: 0, zIndex: 90,
                background: "var(--color-overlay)",
                backdropFilter: "blur(6px)",
              }}
              className="lg\:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 280 }}
              style={{
                position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 100,
                background: "var(--color-bg-elevated)",
                borderTopLeftRadius: "var(--radius-3xl)",
                borderTopRightRadius: "var(--radius-3xl)",
                padding: "32px 24px 40px",
                maxHeight: "85vh", overflowY: "auto",
                boxShadow: "var(--shadow-xl)",
              }}
              className="lg\:hidden"
            >
              <div style={{
                width: 40, height: 5, borderRadius: 999,
                background: "var(--color-border-strong)",
                margin: "0 auto 24px",
              }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h3 className="text-title-sm">Filtros</h3>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="btn btn-ghost btn-icon btn-sm"
                  aria-label="Fechar"
                >
                  <X size={18} strokeWidth={2.2} />
                </button>
              </div>
              {FilterPanel}
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="btn btn-primary"
                style={{ width: "100%", marginTop: 24 }}
              >
                Ver {filteredProducts.length} resultados
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
