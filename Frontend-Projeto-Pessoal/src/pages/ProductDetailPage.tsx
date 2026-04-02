import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  ShoppingBag, 
  Minus, 
  Plus, 
  Check, 
  Dumbbell,
  Package,
  Flame,
  Zap,
  Scale
} from "lucide-react";
import { apiListEstoque, type Produto } from "../api/client";
import { BRAND_META, getMockPrice, formatCurrency, ALL_BRANDS } from "../lib/utils";
import { useCart } from "../hooks/useCart";

// Mock data for product details
const MOCK_FLAVORS = ["Chocolate", "Baunilha", "Morango", "Cookies & Cream", "Cappuccino"];
const MOCK_SIZES = ["450g", "900g", "1.8kg"];

interface NutritionInfo {
  label: string;
  value: string;
  icon: React.ReactNode;
}

function getNutritionInfo(): NutritionInfo[] {
  return [
    { label: "Calorias", value: "120 kcal", icon: <Flame size={16} /> },
    { label: "Proteínas", value: "24g", icon: <Zap size={16} /> },
    { label: "Carboidratos", value: "3g", icon: <Scale size={16} /> },
    { label: "Gorduras", value: "1.5g", icon: <Package size={16} /> },
  ];
}

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem, isInCart, getItemQuantity } = useCart();
  
  const [quantity, setQuantity] = useState(1);
  const [selectedFlavor, setSelectedFlavor] = useState(MOCK_FLAVORS[0]);
  const [selectedSize, setSelectedSize] = useState(MOCK_SIZES[1]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["estoque"],
    queryFn: apiListEstoque,
  });

  const product = products.find((p) => p.id === id);
  const inCart = isInCart(id || "");
  const cartQuantity = getItemQuantity(id || "");
  const price = id ? getMockPrice(id) : 0;
  const meta = product?.marca ? BRAND_META[product.marca] : null;

  // Produtos relacionados (mesma marca ou aleatórios)
  const relatedProducts = products
    .filter((p) => p.id !== id)
    .filter((p) => p.marca === product?.marca || !product?.marca)
    .slice(0, 4);

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity, price);
      setQuantity(1);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="skeleton h-6 w-32 mb-8" />
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="skeleton aspect-square rounded-sm" />
            <div className="space-y-4">
              <div className="skeleton h-8 w-48" />
              <div className="skeleton h-12 w-64" />
              <div className="skeleton h-24 w-full" />
              <div className="skeleton h-12 w-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package size={64} className="text-[#4B5563] mx-auto mb-4" />
          <h2 className="text-xl font-medium text-[#F5F5F5] mb-2">Produto não encontrado</h2>
          <p className="text-[#9CA3AF] mb-6">O produto que você está procurando não existe ou foi removido.</p>
          <Link to="/produtos" className="btn btn-primary">
            Voltar ao catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-[#9CA3AF] hover:text-[#00FF87] transition-colors"
          >
            <ArrowLeft size={16} />
            Voltar
          </button>
          <span className="text-[#4B5563]">/</span>
          <Link to="/produtos" className="text-[#9CA3AF] hover:text-[#00FF87] transition-colors">
            Produtos
          </Link>
          <span className="text-[#4B5563]">/</span>
          <span className="text-[#F5F5F5] truncate max-w-[200px]">{product.descricao}</span>
        </motion.nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div 
              className="aspect-square rounded-sm overflow-hidden flex items-center justify-center relative"
              style={{ 
                background: `linear-gradient(135deg, ${meta?.bg || "#1A1D24"}, #111318)` 
              }}
            >
              <div 
                className="w-40 h-40 rounded-sm flex items-center justify-center"
                style={{ background: meta?.bg || "rgba(255,255,255,0.1)" }}
              >
                <Dumbbell size={80} style={{ color: meta?.color || "#4B5563" }} />
              </div>
              {meta && (
                <div 
                  className="absolute top-4 left-4 px-3 py-1.5 rounded-sm text-xs font-bold tracking-wider uppercase"
                  style={{ background: meta.bg, color: meta.color }}
                >
                  {meta.label}
                </div>
              )}
            </div>
            
            {/* Thumbnails (mock) */}
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <button
                  key={i}
                  className={`w-16 h-16 rounded-sm flex items-center justify-center border-2 transition-colors ${
                    i === 1 ? "border-[#00FF87]" : "border-[#1A1D24] hover:border-[#4B5563]"
                  }`}
                  style={{ background: meta?.bg || "#1A1D24" }}
                >
                  <Dumbbell size={20} style={{ color: meta?.color || "#4B5563" }} />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Title & Price */}
            <div>
              {meta && (
                <span 
                  className="inline-block text-xs font-bold tracking-wider uppercase mb-2 px-2 py-1 rounded-sm"
                  style={{ background: meta.bg, color: meta.color }}
                >
                  {meta.label}
                </span>
              )}
              <h1 className="text-2xl lg:text-3xl font-display font-bold text-[#F5F5F5] mb-2">
                {product.descricao}
              </h1>
              {product.medida && (
                <p className="text-sm text-[#4B5563] font-mono mb-4">{product.medida}g</p>
              )}
              <p className="price text-3xl">{formatCurrency(price)}</p>
            </div>

            {/* Flavor Selection */}
            <div>
              <label className="input-label mb-3 block">Sabor</label>
              <div className="flex flex-wrap gap-2">
                {MOCK_FLAVORS.map((flavor) => (
                  <button
                    key={flavor}
                    onClick={() => setSelectedFlavor(flavor)}
                    className={`px-4 py-2 rounded-sm text-sm font-medium transition-all ${
                      selectedFlavor === flavor
                        ? "bg-[#00FF87] text-[#090B10]"
                        : "bg-[#1A1D24] text-[#9CA3AF] hover:bg-[#252830] hover:text-[#F5F5F5]"
                    }`}
                  >
                    {flavor}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <label className="input-label mb-3 block">Tamanho</label>
              <div className="flex gap-2">
                {MOCK_SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-6 py-3 rounded-sm text-sm font-mono font-medium transition-all border-2 ${
                      selectedSize === size
                        ? "border-[#00FF87] bg-[#00FF87]/10 text-[#00FF87]"
                        : "border-[#1A1D24] bg-[#111318] text-[#9CA3AF] hover:border-[#4B5563]"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-[#1A1D24] rounded-sm">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center text-[#9CA3AF] hover:text-[#F5F5F5] transition-colors"
                >
                  <Minus size={18} />
                </button>
                <span className="w-12 text-center font-mono text-[#F5F5F5]">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 flex items-center justify-center text-[#9CA3AF] hover:text-[#F5F5F5] transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className={`btn flex-1 ${inCart ? "btn-secondary" : "btn-primary"}`}
              >
                {inCart ? (
                  <>
                    <Check size={18} />
                    No carrinho ({cartQuantity})
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} />
                    Adicionar ao carrinho
                  </>
                )}
              </button>
            </div>

            {/* Nutrition Info */}
            <div className="card p-4">
              <h3 className="text-sm font-medium text-[#F5F5F5] mb-4 flex items-center gap-2">
                <Flame size={16} className="text-[#00E5FF]" />
                Informações Nutricionais
                <span className="text-xs text-[#4B5563] font-normal">(porção de 30g)</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {getNutritionInfo().map((info) => (
                  <div key={info.label} className="text-center p-3 bg-[#090B10] rounded-sm">
                    <div className="flex items-center justify-center text-[#00FF87] mb-2">
                      {info.icon}
                    </div>
                    <div className="text-lg font-mono font-bold text-[#F5F5F5]">{info.value}</div>
                    <div className="text-xs text-[#4B5563]">{info.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-sm font-medium text-[#F5F5F5] mb-2">Descrição</h3>
              <p className="text-sm text-[#9CA3AF] leading-relaxed">
                Suplemento de alta qualidade desenvolvido para atletas e praticantes de atividades físicas 
                que buscam máximo desempenho e resultados. Fórmula premium com ingredientes selecionados 
                para garantir a melhor absorção e eficácia.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-16"
          >
            <h2 className="section-title mb-8">Produtos Relacionados</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((p) => {
                const pMeta = p.marca ? BRAND_META[p.marca] : null;
                const pPrice = getMockPrice(p.id);
                return (
                  <Link
                    key={p.id}
                    to={`/produtos/${p.id}`}
                    className="product-card group"
                  >
                    <div className="aspect-square bg-gradient-to-br from-[#1A1D24] to-[#111318] flex items-center justify-center">
                      <div 
                        className="w-16 h-16 rounded-sm flex items-center justify-center"
                        style={{ background: pMeta?.bg || "rgba(255,255,255,0.05)" }}
                      >
                        <Dumbbell size={28} style={{ color: pMeta?.color || "#4B5563" }} />
                      </div>
                    </div>
                    <div className="p-4">
                      {pMeta && (
                        <span 
                          className="inline-block text-[9px] font-bold tracking-wider uppercase mb-1 px-1.5 py-0.5 rounded-sm"
                          style={{ background: pMeta.bg, color: pMeta.color }}
                        >
                          {pMeta.label}
                        </span>
                      )}
                      <h3 className="text-sm text-[#F5F5F5] group-hover:text-[#00FF87] transition-colors line-clamp-2 min-h-[40px]">
                        {p.descricao}
                      </h3>
                      <span className="price text-sm">{formatCurrency(pPrice)}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}
