import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingBag, Minus, Plus, Check, Dumbbell, Package, Flame, Zap, Scale, Truck } from "lucide-react";
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

  const { data: productsData, isLoading } = useQuery({ queryKey: ["estoque"], queryFn: () => apiListEstoque() });
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
      <div style={{ minHeight: "100vh", background: "var(--color-bg-primary)", padding: "var(--space-12) 0" }}>
        <div className="container-apple">
          <div className="skeleton" style={{ height: "24px", width: "128px", marginBottom: "var(--space-8)", borderRadius: "var(--radius-lg)" }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "var(--space-12)" }}>
            <div className="skeleton" style={{ aspectRatio: "1/1", borderRadius: "calc(var(--radius-2xl) * 1.5)" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              <div className="skeleton" style={{ height: "32px", width: "192px", borderRadius: "var(--radius-lg)" }} />
              <div className="skeleton" style={{ height: "48px", width: "256px", borderRadius: "var(--radius-lg)" }} />
              <div className="skeleton" style={{ height: "96px", width: "100%", borderRadius: "var(--radius-lg)" }} />
              <div className="skeleton" style={{ height: "48px", width: "128px", borderRadius: "var(--radius-lg)" }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--color-bg-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", padding: "var(--space-6)" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "var(--radius-2xl)", background: "var(--color-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto var(--space-6)" }}>
            <Package size={40} style={{ color: "var(--color-text-tertiary)" }} />
          </div>
          <h2 className="text-title-md" style={{ marginBottom: "var(--space-2)" }}>Produto não encontrado</h2>
          <p className="text-body" style={{ marginBottom: "var(--space-8)", maxWidth: "320px", margin: "0 auto var(--space-8)" }}>
            O produto que você está procurando não existe ou foi removido.
          </p>
          <Link to="/produtos" className="btn btn-primary">Voltar ao catálogo</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg-primary)" }}>
      <div className="container-apple" style={{ padding: "clamp(32px, 5vw, 48px) var(--container-padding)" }}>
        {/* Breadcrumb */}
        <motion.nav initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", marginBottom: "var(--space-8)" }}>
          <button onClick={() => navigate(-1)} style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--color-text-secondary)", transition: "color 0.2s", background: "none", border: "none", cursor: "pointer" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-accent)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--color-text-secondary)"}>
            <ArrowLeft size={16} /> Voltar
          </button>
          <span style={{ color: "var(--color-text-tertiary)" }}>/</span>
          <Link to="/produtos" style={{ color: "var(--color-text-secondary)", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-accent)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--color-text-secondary)"}>Produtos</Link>
          <span style={{ color: "var(--color-text-tertiary)" }}>/</span>
          <span className="truncate" style={{ color: "var(--color-text-primary)", maxWidth: "200px" }}>{product.descricao}</span>
        </motion.nav>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "clamp(32px, 5vw, 64px)" }}>
          {/* Image */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div style={{ aspectRatio: "1/1", borderRadius: "calc(var(--radius-2xl) * 1.5)", overflow: "hidden", background: "var(--color-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <Dumbbell size={120} style={{ color: "var(--color-text-tertiary)" }} />
              {meta && <span style={{ position: "absolute", top: "24px", left: "24px", fontSize: "12px", fontWeight: "var(--font-weight-medium)", color: meta.color, background: meta.bg, padding: "6px 12px", borderRadius: "999px" }}>{meta.label}</span>}
            </div>
            {/* Thumbnails */}
            <div style={{ display: "flex", gap: "12px" }}>
              {[1, 2, 3].map((i) => (
                <button key={i} style={{ width: "80px", height: "80px", borderRadius: "var(--radius-xl)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", background: i === 1 ? "var(--color-bg-secondary)" : "var(--color-bg-secondary)", border: i === 1 ? "2px solid var(--color-accent)" : "2px solid transparent", cursor: "pointer" }} onMouseEnter={(e) => { if(i!==1) e.currentTarget.style.background = "var(--color-bg-tertiary)"; }} onMouseLeave={(e) => { if(i!==1) e.currentTarget.style.background = "var(--color-bg-secondary)"; }}>
                  <Dumbbell size={24} style={{ color: "var(--color-text-tertiary)" }} />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }} style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {meta && <span style={{ fontSize: "12px", fontWeight: "var(--font-weight-medium)", color: "var(--color-accent)", marginBottom: "8px" }}>{meta.label}</span>}
              <h1 className="text-display-xs" style={{ marginBottom: "8px" }}>{product.descricao}</h1>
              {product.medida && <p className="text-body-sm" style={{ marginBottom: "16px" }}>{product.medida}g</p>}
              <p className="text-display-xs" style={{ color: "var(--color-accent)", fontWeight: "var(--font-weight-semibold)" }}>{formatCurrency(price)}</p>
            </div>

            {product.fornecedor && (
              <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", background: "var(--color-bg-secondary)", borderRadius: "var(--radius-xl)" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "var(--color-accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Package size={18} style={{ color: "var(--color-accent)" }} />
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "var(--color-text-tertiary)" }}>Fornecedor</p>
                  <p style={{ fontSize: "14px", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-primary)" }}>{product.fornecedor.nomeFantasia || product.fornecedor.razaoSocial}</p>
                </div>
              </div>
            )}

            {realFlavors.length > 0 && (
              <div>
                <label className="input-label" style={{ marginBottom: "12px", display: "block" }}>Sabor</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {realFlavors.map((flavor) => (
                    <button key={flavor} onClick={() => setSelectedFlavor(flavor)} style={{ padding: "10px 16px", borderRadius: "999px", fontSize: "14px", fontWeight: "var(--font-weight-medium)", transition: "all 0.2s", background: (selectedFlavor || realFlavors[0]) === flavor ? "var(--color-primary)" : "var(--color-bg-secondary)", color: (selectedFlavor || realFlavors[0]) === flavor ? "var(--color-bg-primary)" : "var(--color-text-secondary)", border: "none", cursor: "pointer" }} onMouseEnter={(e) => { if((selectedFlavor || realFlavors[0]) !== flavor) e.currentTarget.style.background = "var(--color-bg-tertiary)"; e.currentTarget.style.color = "var(--color-text-primary)"; }} onMouseLeave={(e) => { if((selectedFlavor || realFlavors[0]) !== flavor) e.currentTarget.style.background = "var(--color-bg-secondary)"; e.currentTarget.style.color = "var(--color-text-secondary)"; }}>{flavor}</button>
                  ))}
                </div>
              </div>
            )}

            {realSizes.length > 0 && (
              <div>
                <label className="input-label" style={{ marginBottom: "12px", display: "block" }}>Tamanho</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {realSizes.map((size) => (
                    <button key={size} onClick={() => setSelectedSize(size)} style={{ padding: "12px 24px", borderRadius: "var(--radius-xl)", fontSize: "14px", fontWeight: "var(--font-weight-medium)", transition: "all 0.2s", background: (selectedSize || realSizes[0]) === size ? "var(--color-accent-subtle)" : "transparent", color: (selectedSize || realSizes[0]) === size ? "var(--color-accent)" : "var(--color-text-secondary)", border: (selectedSize || realSizes[0]) === size ? "2px solid var(--color-accent)" : "2px solid var(--color-border)", cursor: "pointer" }} onMouseEnter={(e) => { if((selectedSize || realSizes[0]) !== size) e.currentTarget.style.borderColor = "var(--color-text-tertiary)"; }} onMouseLeave={(e) => { if((selectedSize || realSizes[0]) !== size) e.currentTarget.style.borderColor = "var(--color-border)"; }}>{size}</button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", background: "var(--color-bg-secondary)", borderRadius: "var(--radius-xl)" }}>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-secondary)", transition: "color 0.2s", background: "none", border: "none", cursor: "pointer" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-text-primary)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--color-text-secondary)"}><Minus size={18} /></button>
                <span style={{ width: "48px", textAlign: "center", fontSize: "16px", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-primary)" }}>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} style={{ width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-secondary)", transition: "color 0.2s", background: "none", border: "none", cursor: "pointer" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-text-primary)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--color-text-secondary)"}><Plus size={18} /></button>
              </div>
              <button onClick={handleAddToCart} className={`btn ${inCart ? "btn-secondary" : "btn-primary"}`} style={{ flex: 1, padding: "0 24px", height: "48px" }}>
                {inCart ? <><Check size={18} /> No carrinho ({cartQuantity})</> : <><ShoppingBag size={18} /> Adicionar ao carrinho</>}
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", background: "rgba(34, 197, 94, 0.1)", borderRadius: "var(--radius-xl)", border: "1px solid rgba(34, 197, 94, 0.2)" }}>
              <Truck size={20} style={{ color: "rgb(34, 197, 94)" }} />
              <div>
                <p style={{ fontSize: "14px", fontWeight: "var(--font-weight-medium)", color: "rgb(21, 128, 61)" }}>Frete Grátis</p>
                <p style={{ fontSize: "12px", color: "rgb(34, 197, 94)" }}>Para compras acima de R$ 199</p>
              </div>
            </div>

            <div className="card" style={{ padding: "var(--space-6)" }}>
              <h3 className="text-title-sm" style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Flame size={18} style={{ color: "var(--color-accent)" }} /> Informações Nutricionais
                <span style={{ fontSize: "12px", color: "var(--color-text-tertiary)", fontWeight: 400 }}>(porção de 30g)</span>
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "16px" }}>
                {getNutritionInfo().map((info) => (
                  <div key={info.label} style={{ textAlign: "center", padding: "16px", background: "var(--color-bg-secondary)", borderRadius: "var(--radius-xl)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-accent)", marginBottom: "8px" }}>{info.icon}</div>
                    <div style={{ fontSize: "15px", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)" }}>{info.value}</div>
                    <div style={{ fontSize: "12px", color: "var(--color-text-tertiary)" }}>{info.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <h3 className="text-title-sm" style={{ marginBottom: "12px" }}>Descrição</h3>
              <p className="text-body" style={{ lineHeight: "1.6" }}>
                Suplemento de alta qualidade desenvolvido para atletas e praticantes de atividades físicas 
                que buscam máximo desempenho e resultados. Fórmula premium com ingredientes selecionados 
                para garantir a melhor absorção e eficácia.
              </p>
            </div>
          </motion.div>
        </div>

        {relatedProducts.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }} style={{ marginTop: "80px" }}>
            <h2 className="text-title-lg" style={{ marginBottom: "32px", color: "var(--color-text-primary)" }}>Produtos Relacionados</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "var(--space-5)" }}>
              {relatedProducts.map((p, index) => {
                const pMeta = p.marca ? BRAND_META[p.marca] : null;
                const pPrice = getProductPrice(p);
                return (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * index, duration: 0.4 }}>
                    <Link to={`/produtos/${p.id}`} className="card" style={{ display: "block", textDecoration: "none", overflow: "hidden", transition: "transform 0.2s, box-shadow 0.2s", cursor: "pointer" }} onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }}>
                      <div style={{ aspectRatio: "1/1", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-bg-secondary)" }}>
                        <Dumbbell size={40} style={{ color: "var(--color-text-tertiary)", transition: "transform 0.3s" }} onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"} onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"} />
                      </div>
                      <div style={{ padding: "16px" }}>
                        {pMeta && <span style={{ fontSize: "12px", fontWeight: "var(--font-weight-medium)", color: "var(--color-accent)", display: "block", marginBottom: "4px" }}>{pMeta.label}</span>}
                        <h3 className="line-clamp-2" style={{ fontSize: "14px", color: "var(--color-text-primary)", transition: "color 0.2s", minHeight: "40px" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-accent)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--color-text-primary)"}>{p.descricao}</h3>
                        <span style={{ display: "block", fontSize: "16px", fontWeight: "var(--font-weight-semibold)", color: "var(--color-accent)", marginTop: "8px" }}>{formatCurrency(pPrice)}</span>
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
