import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  X, 
  Dumbbell, 
  ShoppingBag,
  LayoutGrid,
  List,
  SlidersHorizontal
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
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="card flex items-center gap-4 p-4 hover:border-[#00FF87]/25 transition-colors"
      >
        <div 
          className="w-20 h-20 rounded-sm flex items-center justify-center flex-shrink-0"
          style={{ background: meta?.bg || "rgba(255,255,255,0.05)" }}
        >
          <Dumbbell size={28} style={{ color: meta?.color || "#4B5563" }} />
        </div>
        <div className="flex-1 min-w-0">
          {meta && (
            <span 
              className="inline-block text-[10px] font-bold tracking-wider uppercase mb-1 px-2 py-0.5 rounded-sm"
              style={{ background: meta.bg, color: meta.color }}
            >
              {meta.label}
            </span>
          )}
          <Link to={`/produtos/${product.id}`}>
            <h3 className="text-sm font-medium text-[#F5F5F5] hover:text-[#00FF87] transition-colors line-clamp-1">
              {product.descricao}
            </h3>
          </Link>
          {product.medida && (
            <p className="text-xs text-[#4B5563] font-mono">{product.medida}g</p>
          )}
          {product.sabor && (
            <p className="text-xs text-[#9CA3AF]">{product.sabor}</p>
          )}
          {product.fornecedor && (
            <p className="text-xs text-[#4B5563] truncate">
              {product.fornecedor.nomeFantasia || product.fornecedor.razaoSocial}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="price text-lg whitespace-nowrap">{formatCurrency(price)}</span>
          <button
            onClick={() => addItem(product, 1, price)}
            disabled={inCart}
            className={`btn btn-sm ${inCart ? "btn-secondary" : "btn-primary"}`}
          >
            {inCart ? "No carrinho" : "Adicionar"}
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="product-card group"
    >
      <Link to={`/produtos/${product.id}`}>
        <div className="aspect-square bg-gradient-to-br from-[#1A1D24] to-[#111318] flex items-center justify-center relative overflow-hidden">
          <div 
            className="w-20 h-20 rounded-sm flex items-center justify-center"
            style={{ background: meta?.bg || "rgba(255,255,255,0.05)" }}
          >
            <Dumbbell size={36} style={{ color: meta?.color || "#4B5563" }} />
          </div>
          <div className="absolute inset-0 bg-[#00FF87]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </Link>

      <div className="p-4">
        {meta && (
          <span 
            className="inline-block text-[10px] font-bold tracking-wider uppercase mb-2 px-2 py-0.5 rounded-sm"
            style={{ background: meta.bg, color: meta.color }}
          >
            {meta.label}
          </span>
        )}
        <Link to={`/produtos/${product.id}`}>
          <h3 className="text-sm font-medium text-[#F5F5F5] hover:text-[#00FF87] transition-colors mb-1 line-clamp-2 min-h-[40px]">
            {product.descricao}
          </h3>
        </Link>
        {product.medida && (
          <p className="text-xs text-[#4B5563] font-mono mb-1">{product.medida}g</p>
        )}
        {product.sabor && (
          <p className="text-xs text-[#9CA3AF] mb-1">{product.sabor}</p>
        )}
        {product.fornecedor && (
          <p className="text-xs text-[#4B5563] mb-3 truncate">
            {product.fornecedor.nomeFantasia || product.fornecedor.razaoSocial}
          </p>
        )}
        {!product.sabor && !product.fornecedor && !product.medida && <div className="mb-3" />}
        <div className="flex items-center justify-between">
          <span className="price">{formatCurrency(price)}</span>
          <button
            onClick={() => addItem(product, 1, price)}
            disabled={inCart}
            className={`btn btn-sm btn-icon ${inCart ? "btn-secondary" : "btn-primary"}`}
          >
            {inCart ? "✓" : <ShoppingBag size={14} />}
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
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-[#0A0C10] border-b border-[#1A1D24] py-8">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#00FF87] mb-2 block">
              Catálogo
            </span>
            <h1 className="page-title">PRODUTOS</h1>
            <p className="text-[#9CA3AF] mt-2">
              {filteredProducts.length} produto{filteredProducts.length !== 1 ? "s" : ""} encontrado{filteredProducts.length !== 1 ? "s" : ""}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Search */}
              <div>
                <label className="input-label mb-2 block">Buscar</label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
                  <input
                    type="text"
                    placeholder="Nome do produto..."
                    value={searchQuery}
                    onChange={(e) => updateFilter("q", e.target.value)}
                    className="input-field pl-10"
                  />
                </div>
              </div>

              {/* Brand Filter */}
              <div>
                <label className="input-label mb-3 block">Marca</label>
                <div className="space-y-2">
                  <button
                    onClick={() => updateFilter("marca", "")}
                    className={`w-full text-left px-3 py-2 rounded-sm text-sm transition-colors ${
                      !brandFilter 
                        ? "bg-[#00FF87]/10 text-[#00FF87]" 
                        : "text-[#9CA3AF] hover:bg-[#1A1D24]"
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
                        className={`w-full text-left px-3 py-2 rounded-sm text-sm transition-colors flex items-center gap-2 ${
                          isActive 
                            ? "bg-[#00FF87]/10 text-[#00FF87]" 
                            : "text-[#9CA3AF] hover:bg-[#1A1D24]"
                        }`}
                      >
                        <span 
                          className="w-2 h-2 rounded-full" 
                          style={{ background: meta?.color || "#4B5563" }} 
                        />
                        {meta?.label || brand}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="input-label mb-2 block">Ordenar por</label>
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
                  <X size={14} /> Limpar filtros
                </button>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Mobile Filter Bar */}
            <div className="lg:hidden flex items-center gap-3 mb-6">
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => updateFilter("q", e.target.value)}
                  className="input-field pl-10"
                />
              </div>
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="btn btn-secondary btn-icon relative"
              >
                <SlidersHorizontal size={18} />
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#00FF87]" />
                )}
              </button>
            </div>

            {/* View Toggle & Results */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
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
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-[#9CA3AF] hover:text-[#00FF87] flex items-center gap-1"
                >
                  <X size={14} /> Limpar
                </button>
              )}
            </div>

            {/* Products Grid/List */}
            {isLoading ? (
              <div className={`grid gap-4 ${view === "grid" ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1"}`}>
                {[...Array(6)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`skeleton ${view === "grid" ? "aspect-[3/4]" : "h-24"}`}
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="empty-state card py-16">
                <Filter size={48} className="text-[#4B5563] mb-4" />
                <h3 className="text-lg font-medium text-[#F5F5F5] mb-2">Nenhum produto encontrado</h3>
                <p className="text-sm text-[#9CA3AF] mb-4">Tente ajustar seus filtros de busca</p>
                <button onClick={clearFilters} className="btn btn-secondary">
                  Limpar filtros
                </button>
              </div>
            ) : (
              <motion.div 
                layout
                className={`grid gap-4 ${
                  view === "grid" ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1"
                }`}
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

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFilterOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed right-0 top-0 bottom-0 w-80 max-w-full bg-[#111318] border-l border-[#1A1D24] z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-4 border-b border-[#1A1D24] flex items-center justify-between">
                <h3 className="font-medium text-[#F5F5F5]">Filtros</h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="btn btn-ghost btn-icon"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-4 space-y-6">
                {/* Brand Filter */}
                <div>
                  <label className="input-label mb-3 block">Marca</label>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        updateFilter("marca", "");
                        setMobileFilterOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-sm text-sm transition-colors ${
                        !brandFilter 
                          ? "bg-[#00FF87]/10 text-[#00FF87]" 
                          : "text-[#9CA3AF] hover:bg-[#1A1D24]"
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
                          className={`w-full text-left px-3 py-2 rounded-sm text-sm transition-colors flex items-center gap-2 ${
                            isActive 
                              ? "bg-[#00FF87]/10 text-[#00FF87]" 
                              : "text-[#9CA3AF] hover:bg-[#1A1D24]"
                          }`}
                        >
                          <span 
                            className="w-2 h-2 rounded-full" 
                            style={{ background: meta?.color || "#4B5563" }} 
                          />
                          {meta?.label || brand}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <label className="input-label mb-2 block">Ordenar por</label>
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

                {hasActiveFilters && (
                  <button
                    onClick={() => {
                      clearFilters();
                      setMobileFilterOpen(false);
                    }}
                    className="btn btn-secondary w-full"
                  >
                    <X size={14} /> Limpar filtros
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
