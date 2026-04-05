import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Package, 
  X, 
  Dumbbell, 
  ShoppingBag,
  LayoutGrid,
  List,
  SlidersHorizontal,
  Check
} from "lucide-react";
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
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="card p-4 flex items-center gap-5 group"
      >
        {/* Image placeholder */}
        <div className="w-20 h-20 rounded-xl bg-surface-secondary flex items-center justify-center flex-shrink-0 group-hover:bg-surface-tertiary transition-colors">
          <Dumbbell size={28} className="text-tertiary" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {meta && (
            <span className="inline-block text-caption font-medium text-accent mb-1">
              {meta.label}
            </span>
          )}
          <Link to={`/produtos/${product.id}`}>
            <h3 className="text-body font-medium text-primary hover:text-accent transition-colors line-clamp-1">
              {product.descricao}
            </h3>
          </Link>
          <div className="flex items-center gap-3 mt-1">
            {product.medida && (
              <span className="text-caption text-tertiary">{product.medida}g</span>
            )}
            {product.sabor && (
              <span className="text-caption text-secondary">{product.sabor}</span>
            )}
          </div>
        </div>

        {/* Price & Action */}
        <div className="flex items-center gap-4">
          <span className="text-title-sm text-primary font-semibold whitespace-nowrap">
            {formatCurrency(price)}
          </span>
          <button
            onClick={() => addItem(product, 1, price)}
            disabled={inCart}
            className={`btn btn-sm ${inCart ? "btn-secondary" : "btn-primary"}`}
          >
            {inCart ? (
              <>
                <Check size={14} />
                No carrinho
              </>
            ) : (
              "Adicionar"
            )}
          </button>
        </div>
      </motion.div>
    );
  }

  // Grid view
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="card overflow-hidden group"
    >
      <Link to={`/produtos/${product.id}`}>
        <div className="aspect-square bg-surface-secondary flex items-center justify-center relative overflow-hidden">
          <Dumbbell size={48} className="text-tertiary group-hover:scale-110 transition-transform duration-500" />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </Link>

      <div className="p-5">
        {/* Brand tag */}
        {meta && (
          <span className="text-caption font-medium text-accent mb-2 block">
            {meta.label}
          </span>
        )}

        {/* Title */}
        <Link to={`/produtos/${product.id}`}>
          <h3 className="text-body font-medium text-primary hover:text-accent transition-colors mb-1 line-clamp-2 min-h-[44px]">
            {product.descricao}
          </h3>
        </Link>

        {/* Details */}
        <div className="flex items-center gap-2 mb-4">
          {product.medida && (
            <span className="text-caption text-tertiary">{product.medida}g</span>
          )}
          {product.sabor && (
            <>
              {product.medida && <span className="text-tertiary">·</span>}
              <span className="text-caption text-secondary">{product.sabor}</span>
            </>
          )}
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between">
          <span className="text-title-sm text-primary font-semibold">
            {formatCurrency(price)}
          </span>
          <button
            onClick={() => addItem(product, 1, price)}
            disabled={inCart}
            className={`btn btn-sm btn-icon ${inCart ? "btn-secondary" : "btn-primary"}`}
            aria-label={inCart ? "Já no carrinho" : "Adicionar ao carrinho"}
          >
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
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const searchQuery = searchParams.get("q") || "";
  const brandFilter = searchParams.get("marca") || "";
  const sortBy = searchParams.get("sort") || "nome";

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["estoque"],
    queryFn: () => apiListEstoque(),
  });
  const products: Produto[] = productsData?.content ?? [];

  // Filtragem e ordenação
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filtro por busca
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.descricao.toLowerCase().includes(q) ||
          (p.marca && BRAND_META[p.marca]?.label.toLowerCase().includes(q))
      );
    }

    // Filtro por marca
    if (brandFilter) {
      result = result.filter((p) => p.marca === brandFilter);
    }

    // Ordenação
    result.sort((a, b) => {
      switch (sortBy) {
        case "preco-asc":
          return getProductPrice(a) - getProductPrice(b);
        case "preco-desc":
          return getProductPrice(b) - getProductPrice(a);
        case "nome":
        default:
          return a.descricao.localeCompare(b.descricao);
      }
    });

    return result;
  }, [products, searchQuery, brandFilter, sortBy]);

  // Marcas disponíveis nos produtos
  const availableBrands = useMemo(() => {
    const brands = new Set(products.map((p) => p.marca).filter(Boolean));
    return ALL_BRANDS.filter((b) => brands.has(b));
  }, [products]);

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasActiveFilters = searchQuery || brandFilter;

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="bg-surface-secondary border-b border-border">
        <div className="container-apple py-12 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <span className="text-caption font-medium text-accent tracking-wide uppercase mb-2 block">
              Catálogo
            </span>
            <h1 className="text-display-sm text-primary mb-2">Produtos</h1>
            <p className="text-body text-secondary">
              {filteredProducts.length} produto{filteredProducts.length !== 1 ? "s" : ""} disponíve{filteredProducts.length !== 1 ? "is" : "l"}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container-apple py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-60 flex-shrink-0">
            <div className="sticky top-24 space-y-8">
              {/* Search */}
              <div className="input-group">
                <label className="input-label">Buscar</label>
                <div className="relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-tertiary" />
                  <input
                    type="text"
                    placeholder="Nome do produto..."
                    value={searchQuery}
                    onChange={(e) => updateFilter("q", e.target.value)}
                    className="input-field pl-11"
                  />
                </div>
              </div>

              {/* Brand Filter */}
              <div>
                <label className="input-label mb-3 block">Marca</label>
                <div className="space-y-1">
                  <button
                    onClick={() => updateFilter("marca", "")}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-body-sm transition-all duration-200 ${
                      !brandFilter 
                        ? "bg-accent/10 text-accent font-medium" 
                        : "text-secondary hover:bg-surface-secondary hover:text-primary"
                    }`}
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
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-body-sm transition-all duration-200 ${
                          isActive 
                            ? "bg-accent/10 text-accent font-medium" 
                            : "text-secondary hover:bg-surface-secondary hover:text-primary"
                        }`}
                      >
                        {meta?.label || brand}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sort */}
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

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="btn btn-secondary w-full"
                >
                  <X size={16} />
                  Limpar filtros
                </button>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Mobile Filter Bar */}
            <div className="lg:hidden flex items-center gap-3 mb-6">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-tertiary" />
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchQuery}
                  onChange={(e) => updateFilter("q", e.target.value)}
                  className="input-field pl-11"
                />
              </div>
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="btn btn-secondary btn-icon relative"
                aria-label="Abrir filtros"
              >
                <SlidersHorizontal size={18} />
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-accent" />
                )}
              </button>
            </div>

            {/* View Toggle & Results */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-1 p-1 bg-surface-secondary rounded-xl">
                <button
                  onClick={() => setView("grid")}
                  className={`btn btn-icon btn-sm ${view === "grid" ? "bg-surface shadow-sm" : "btn-ghost"}`}
                  aria-label="Visualização em grade"
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`btn btn-icon btn-sm ${view === "list" ? "bg-surface shadow-sm" : "btn-ghost"}`}
                  aria-label="Visualização em lista"
                >
                  <List size={16} />
                </button>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-body-sm text-secondary hover:text-accent flex items-center gap-1.5 transition-colors"
                >
                  <X size={14} />
                  Limpar filtros
                </button>
              )}
            </div>

            {/* Products Grid/List */}
            {isLoading ? (
              <div className={`grid gap-5 ${view === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                {[...Array(6)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`skeleton rounded-2xl ${view === "grid" ? "aspect-[3/4]" : "h-24"}`}
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card py-16 text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-surface-secondary flex items-center justify-center mx-auto mb-4">
                  <Package size={32} className="text-tertiary" />
                </div>
                <h3 className="text-title-sm text-primary mb-2">Nenhum produto encontrado</h3>
                <p className="text-body-sm text-secondary mb-6">Tente ajustar seus filtros de busca</p>
                <button onClick={clearFilters} className="btn btn-secondary">
                  Limpar filtros
                </button>
              </motion.div>
            ) : (
              <motion.div 
                layout
                className={`grid gap-5 ${
                  view === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                }`}
              >
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        duration: 0.4, 
                        delay: index * 0.05,
                        ease: [0.25, 0.1, 0.25, 1] 
                      }}
                    >
                      <ProductCard product={product} view={view} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFilterOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="fixed right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-surface border-l border-border z-50 lg:hidden overflow-y-auto"
            >
              {/* Header */}
              <div className="p-5 border-b border-border flex items-center justify-between sticky top-0 bg-surface">
                <h3 className="text-title-sm text-primary">Filtros</h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="btn btn-ghost btn-icon"
                  aria-label="Fechar filtros"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="p-5 space-y-8">
                {/* Brand Filter */}
                <div>
                  <label className="input-label mb-3 block">Marca</label>
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        updateFilter("marca", "");
                        setMobileFilterOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-body-sm transition-all duration-200 ${
                        !brandFilter 
                          ? "bg-accent/10 text-accent font-medium" 
                          : "text-secondary hover:bg-surface-secondary"
                      }`}
                    >
                      Todas as marcas
                    </button>
                    {availableBrands.map((brand) => {
                      const meta = BRAND_META[brand];
                      const isActive = brandFilter === brand;
                      return (
                        <button
                          key={brand}
                          onClick={() => {
                            updateFilter("marca", isActive ? "" : brand);
                            setMobileFilterOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 rounded-xl text-body-sm transition-all duration-200 ${
                            isActive 
                              ? "bg-accent/10 text-accent font-medium" 
                              : "text-secondary hover:bg-surface-secondary"
                          }`}
                        >
                          {meta?.label || brand}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sort */}
                <div className="input-group">
                  <label className="input-label">Ordenar por</label>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      updateFilter("sort", e.target.value);
                      setMobileFilterOpen(false);
                    }}
                    className="input-field"
                  >
                    <option value="nome">Nome (A-Z)</option>
                    <option value="preco-asc">Menor preço</option>
                    <option value="preco-desc">Maior preço</option>
                  </select>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <button
                    onClick={() => {
                      clearFilters();
                      setMobileFilterOpen(false);
                    }}
                    className="btn btn-secondary w-full"
                  >
                    <X size={16} />
                    Limpar filtros
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
