import { useState, useMemo } from "react";
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
  Scale,
  Truck
} from "lucide-react";
import { apiListEstoque, type Produto } from "../api/client";
import { BRAND_META, getMockPrice, formatCurrency } from "../lib/utils";
import { useCart } from "../hooks/useCart";

function getProductPrice(product: Produto): number {
  return product.preco ?? getMockPrice(product.id);
}

interface NutritionInfo {
  label: string;
  value: string;
  icon: React.ReactNode;
}

function getNutritionInfo(): NutritionInfo[] {
  return [
    { label: "Calorias", value: "120 kcal", icon: <Flame size={18} /> },
    { label: "Proteínas", value: "24g", icon: <Zap size={18} /> },
    { label: "Carboidratos", value: "3g", icon: <Scale size={18} /> },
    { label: "Gorduras", value: "1.5g", icon: <Package size={18} /> },
  ];
}

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem, isInCart, getItemQuantity } = useCart();
  
  const [quantity, setQuantity] = useState(1);

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["estoque"],
    queryFn: () => apiListEstoque(),
  });
  const products: Produto[] = productsData?.content ?? [];

  const product = products.find((p) => p.id === id);

  const realFlavors = useMemo(() => {
    if (!product) return [];
    const sameBrand = products.filter((p) => p.marca === product.marca);
    const flavors = [...new Set(sameBrand.map((p) => p.sabor).filter(Boolean))] as string[];
    return flavors.length > 0 ? flavors : product.sabor ? [product.sabor] : [];
  }, [products, product]);

  const realSizes = useMemo(() => {
    if (!product) return [];
    const sameBrand = products.filter((p) => p.marca === product.marca);
    const sizes = [...new Set(sameBrand.map((p) => p.medida).filter((m) => m != null))] as number[];
    const formatted = sizes.sort((a, b) => a - b).map((s) => `${s}g`);
    return formatted.length > 0 ? formatted : product.medida != null ? [`${product.medida}g`] : [];
  }, [products, product]);

  const [selectedFlavor, setSelectedFlavor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const inCart = isInCart(id || "");
  const cartQuantity = getItemQuantity(id || "");
  const price = product ? getProductPrice(product) : 0;
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
      <div className="min-h-screen bg-surface py-12">
        <div className="container-apple">
          <div className="skeleton h-6 w-32 mb-8 rounded-lg" />
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="skeleton aspect-square rounded-2xl" />
            <div className="space-y-4">
              <div className="skeleton h-8 w-48 rounded-lg" />
              <div className="skeleton h-12 w-64 rounded-lg" />
              <div className="skeleton h-24 w-full rounded-lg" />
              <div className="skeleton h-12 w-32 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-surface-secondary flex items-center justify-center mx-auto mb-6">
            <Package size={40} className="text-tertiary" />
          </div>
          <h2 className="text-title-md text-primary mb-2">Produto não encontrado</h2>
          <p className="text-body text-secondary mb-8 max-w-sm">
            O produto que você está procurando não existe ou foi removido.
          </p>
          <Link to="/produtos" className="btn btn-primary">
            Voltar ao catálogo
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="container-apple py-8 lg:py-12">
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-body-sm mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-secondary hover:text-accent transition-colors"
          >
            <ArrowLeft size={16} />
            Voltar
          </button>
          <span className="text-tertiary">/</span>
          <Link to="/produtos" className="text-secondary hover:text-accent transition-colors">
            Produtos
          </Link>
          <span className="text-tertiary">/</span>
          <span className="text-primary truncate max-w-[200px]">{product.descricao}</span>
        </motion.nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="space-y-4"
          >
            <div className="aspect-square rounded-2xl overflow-hidden bg-surface-secondary flex items-center justify-center relative">
              <Dumbbell size={120} className="text-tertiary" />
              {meta && (
                <span className="absolute top-4 left-4 text-caption font-medium text-accent bg-accent/10 px-3 py-1.5 rounded-full">
                  {meta.label}
                </span>
              )}
            </div>
            
            {/* Thumbnails */}
            <div className="flex gap-3">
              {[1, 2, 3].map((i) => (
                <button
                  key={i}
                  className={`w-20 h-20 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    i === 1 
                      ? "ring-2 ring-accent bg-surface-secondary" 
                      : "bg-surface-secondary hover:bg-surface-tertiary"
                  }`}
                >
                  <Dumbbell size={24} className="text-tertiary" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="space-y-8"
          >
            {/* Title & Price */}
            <div>
              {meta && (
                <span className="text-caption font-medium text-accent mb-2 block">
                  {meta.label}
                </span>
              )}
              <h1 className="text-display-xs text-primary mb-2">
                {product.descricao}
              </h1>
              {product.medida && (
                <p className="text-body-sm text-tertiary mb-4">{product.medida}g</p>
              )}
              <p className="text-display-xs text-accent font-semibold">{formatCurrency(price)}</p>
            </div>

            {/* Fornecedor */}
            {product.fornecedor && (
              <div className="flex items-center gap-3 p-4 bg-surface-secondary rounded-xl">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Package size={18} className="text-accent" />
                </div>
                <div>
                  <p className="text-caption text-tertiary">Fornecedor</p>
                  <p className="text-body-sm text-primary font-medium">
                    {product.fornecedor.nomeFantasia || product.fornecedor.razaoSocial}
                  </p>
                </div>
              </div>
            )}

            {/* Flavor Selection */}
            {realFlavors.length > 0 && (
              <div>
                <label className="input-label mb-3 block">Sabor</label>
                <div className="flex flex-wrap gap-2">
                  {realFlavors.map((flavor) => (
                    <button
                      key={flavor}
                      onClick={() => setSelectedFlavor(flavor)}
                      className={`px-4 py-2.5 rounded-full text-body-sm font-medium transition-all duration-200 ${
                        (selectedFlavor || realFlavors[0]) === flavor
                          ? "bg-primary text-on-primary"
                          : "bg-surface-secondary text-secondary hover:bg-surface-tertiary hover:text-primary"
                      }`}
                    >
                      {flavor}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {realSizes.length > 0 && (
              <div>
                <label className="input-label mb-3 block">Tamanho</label>
                <div className="flex gap-2">
                  {realSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-6 py-3 rounded-xl text-body-sm font-medium transition-all duration-200 border-2 ${
                        (selectedSize || realSizes[0]) === size
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border bg-surface text-secondary hover:border-tertiary"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-surface-secondary rounded-xl">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center text-secondary hover:text-primary transition-colors"
                  aria-label="Diminuir quantidade"
                >
                  <Minus size={18} />
                </button>
                <span className="w-12 text-center text-body font-medium text-primary">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 flex items-center justify-center text-secondary hover:text-primary transition-colors"
                  aria-label="Aumentar quantidade"
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

            {/* Shipping info */}
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-900/30">
              <Truck size={20} className="text-green-600 dark:text-green-400" />
              <div>
                <p className="text-body-sm text-green-700 dark:text-green-300 font-medium">Frete Grátis</p>
                <p className="text-caption text-green-600 dark:text-green-400">Para compras acima de R$ 199</p>
              </div>
            </div>

            {/* Nutrition Info */}
            <div className="bg-white/5 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-lg shadow-black/10 p-6 transition-all duration-200 ease-out hover:shadow-xl hover:border-slate-600/60">
              <h3 className="text-title-sm text-primary mb-4 flex items-center gap-2">
                <Flame size={18} className="text-accent" />
                Informações Nutricionais
                <span className="text-caption text-tertiary font-normal">(porção de 30g)</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {getNutritionInfo().map((info) => (
                  <div key={info.label} className="text-center p-4 bg-surface-secondary rounded-xl">
                    <div className="flex items-center justify-center text-accent mb-2">
                      {info.icon}
                    </div>
                    <div className="text-title-sm text-primary font-semibold">{info.value}</div>
                    <div className="text-caption text-tertiary">{info.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-title-sm text-primary mb-3">Descrição</h3>
              <p className="text-body text-secondary leading-relaxed">
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
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-20"
          >
            <h2 className="text-title-lg text-primary mb-8">Produtos Relacionados</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedProducts.map((p, index) => {
                const pMeta = p.marca ? BRAND_META[p.marca] : null;
                const pPrice = getProductPrice(p);
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.4 }}
                  >
                    <Link
                      to={`/produtos/${p.id}`}
                      className="bg-white/5 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-lg shadow-black/10 overflow-hidden group block transition-all duration-200 ease-out hover:shadow-xl hover:scale-[1.02] hover:border-emerald-500/40"
                    >
                      <div className="aspect-square bg-surface-secondary flex items-center justify-center">
                        <Dumbbell size={40} className="text-tertiary group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      <div className="p-4">
                        {pMeta && (
                          <span className="text-caption font-medium text-accent mb-1 block">
                            {pMeta.label}
                          </span>
                        )}
                        <h3 className="text-body-sm text-primary group-hover:text-accent transition-colors line-clamp-2 min-h-[40px]">
                          {p.descricao}
                        </h3>
                        <span className="text-body font-semibold text-accent mt-2 block">
                          {formatCurrency(pPrice)}
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}
