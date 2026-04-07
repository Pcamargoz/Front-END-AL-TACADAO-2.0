import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Shield, Truck, CreditCard, Dumbbell, Flame, Pill, Heart, ShoppingBag, ChevronDown } from "lucide-react";
import { apiListEstoque, type Produto } from "../api/client";
import { BRAND_META, formatCurrency, CATEGORIES } from "../lib/utils";
import { useCart } from "../hooks/useCart";

function FeaturedProductCard({ product }: { product: Produto }) {
  const { addItem, isInCart } = useCart();
  const meta = product.marca ? BRAND_META[product.marca] : null;
  const price = product.preco ?? 0; // Using actual price or fallback

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }} className="product-card">
      <div style={{ aspectRatio: "1 / 1", background: "var(--color-bg-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", borderRadius: "calc(var(--radius-2xl) - 1px) calc(var(--radius-2xl) - 1px) 0 0" }}>
        <div style={{ width: "96px", height: "96px", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.5s ease", background: meta?.bg || "var(--color-accent-subtle)" }}
             onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")} onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}>
          <Dumbbell size={40} style={{ color: meta?.color || "var(--color-accent)" }} />
        </div>
      </div>
      <div style={{ padding: "var(--space-6)" }}>
        {meta && <span style={{ display: "inline-block", fontSize: "11px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "var(--space-2)", padding: "4px 8px", borderRadius: "6px", background: meta.bg, color: meta.color }}>{meta.label}</span>}
        <h3 className="line-clamp-2" style={{ fontSize: "15px", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-primary)", marginBottom: "4px", minHeight: "44px", lineHeight: "1.4" }}>{product.descricao}</h3>
        {product.medida && <p style={{ fontSize: "13px", color: "var(--color-text-tertiary)", marginBottom: "var(--space-4)" }}>{product.medida}g</p>}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: product.medida ? "0" : "auto" }}>
          <span style={{ fontSize: "18px", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)" }}>{formatCurrency(price)}</span>
          <button onClick={() => addItem(product, 1, price)} disabled={isInCart(product.id)} className={`btn btn-sm ${isInCart(product.id) ? "btn-secondary" : "btn-primary"}`}>
            {isInCart(product.id) ? "Adicionado" : <><ShoppingBag size={14} /> Comprar</>}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function CategoryCard({ category }: { category: typeof CATEGORIES[number] }) {
  const icons: Record<string, React.ReactNode> = {
    proteinas: <Dumbbell size={28} />, "pre-treino": <Zap size={28} />,
    creatina: <Flame size={28} />, vitaminas: <Pill size={28} />, aminoacidos: <Heart size={28} />,
  };

  return (
    <Link to={`/produtos?categoria=${category.id}`}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }} className="category-card" style={{ padding: "var(--space-6)", textAlign: "center", borderRadius: "var(--radius-2xl)", background: "var(--color-bg-elevated)", border: "1px solid var(--color-border)", transition: "all 0.3s ease" }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "var(--shadow-lg)"; e.currentTarget.style.borderColor = "var(--color-accent)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; e.currentTarget.style.borderColor = "var(--color-border)"; }}>
        <div style={{ width: "56px", height: "56px", margin: "0 auto var(--space-4)", borderRadius: "var(--radius-xl)", background: "var(--color-accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-accent)" }}>
          {icons[category.id] || <span style={{ fontSize: "24px" }}>{category.icon}</span>}
        </div>
        <h3 style={{ fontSize: "15px", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-primary)" }}>{category.label}</h3>
      </motion.div>
    </Link>
  );
}

function BenefitItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }} style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-5)" }}>
      <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "var(--color-accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "var(--color-accent)" }}>{icon}</div>
      <div>
        <h4 style={{ fontSize: "17px", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)", marginBottom: "4px" }}>{title}</h4>
        <p style={{ fontSize: "15px", color: "var(--color-text-secondary)", lineHeight: "1.6" }}>{description}</p>
      </div>
    </motion.div>
  );
}

function StatsSection() {
  const stats = [
    { value: "500+", label: "Produtos" }, { value: "50+", label: "Marcas" },
    { value: "1000+", label: "Clientes" }, { value: "24h", label: "Entrega" },
  ];
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }} style={{ marginTop: "80px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "var(--space-8)", textAlign: "center" }}>
      {stats.map((stat, i) => (
        <div key={i}>
          <p style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-accent)", marginBottom: "4px", letterSpacing: "var(--tracking-tight)" }}>{stat.value}</p>
          <p style={{ fontSize: "13px", fontWeight: "var(--font-weight-medium)", letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--color-text-tertiary)" }}>{stat.label}</p>
        </div>
      ))}
    </motion.div>
  );
}

export function HomePage() {
  const { data: productsData } = useQuery({ queryKey: ["estoque"], queryFn: () => apiListEstoque() });
  const products: Produto[] = productsData?.content ?? [];
  const featuredProducts = products.slice(0, 8);

  return (
    <div className="page-wrapper">
      <section className="hero">
        <div style={{ position: "relative", zIndex: 10, textAlign: "center", padding: "0 var(--space-4)", maxWidth: "896px", margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}>
            <span style={{ display: "inline-block", marginBottom: "var(--space-5)", fontSize: "12px", fontWeight: "var(--font-weight-semibold)", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-accent)" }}>Distribuidora B2B</span>
            <h1 className="hero-title">Suplementos<br /><span style={{ color: "var(--color-accent)" }}>Premium</span></h1>
            <p className="hero-subtitle">A maior variedade de suplementos para sua loja. Preços competitivos, entrega rápida e qualidade garantida.</p>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "var(--space-4)" }}>
              <Link to="/produtos" className="btn btn-primary btn-lg">Ver Produtos <ArrowRight size={18} /></Link>
              <Link to="/cadastro" className="btn btn-secondary btn-lg">Cadastre-se</Link>
            </div>
          </motion.div>
          <StatsSection />
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} style={{ position: "absolute", bottom: "40px", left: "50%", transform: "translateX(-50%)" }}>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", color: "var(--color-text-tertiary)" }}>
            <span style={{ fontSize: "11px", fontWeight: "var(--font-weight-medium)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Rolar</span>
            <ChevronDown size={20} />
          </motion.div>
        </motion.div>
      </section>

      <section className="section bg-surface-secondary">
        <div className="container-apple">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} style={{ textAlign: "center", marginBottom: "56px" }}>
            <span className="text-eyebrow" style={{ marginBottom: "12px" }}>Navegue por</span>
            <h2 className="text-headline">Categorias</h2>
          </motion.div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "var(--space-5)" }}>
            {CATEGORIES.slice(0, 8).map((cat) => <CategoryCard key={cat.id} category={cat} />)}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-apple">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "56px", gap: "var(--space-4)" }}>
            <div>
              <span className="text-eyebrow" style={{ marginBottom: "12px" }}>Destaques</span>
              <h2 className="text-headline">Produtos em Alta</h2>
            </div>
            <Link to="/produtos" className="btn btn-secondary hidden sm\:flex">Ver todos <ArrowRight size={16} /></Link>
          </motion.div>
          {featuredProducts.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "var(--space-5)" }}>
              {featuredProducts.map((p) => <FeaturedProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="empty-state card">
              <div style={{ width: "64px", height: "64px", margin: "0 auto var(--space-4)", borderRadius: "var(--radius-full)", background: "var(--color-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Dumbbell size={32} style={{ color: "var(--color-text-tertiary)" }} />
              </div>
              <p style={{ color: "var(--color-text-secondary)", marginBottom: "var(--space-6)" }}>Nenhum produto cadastrado ainda.</p>
              <Link to="/cadastro" className="btn btn-primary">Cadastre-se para adicionar</Link>
            </div>
          )}
          <div className="sm\:hidden" style={{ marginTop: "40px", textAlign: "center" }}>
            <Link to="/produtos" className="btn btn-secondary">Ver todos <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      <section className="section bg-surface-secondary">
        <div className="container-apple">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} style={{ textAlign: "center", marginBottom: "56px" }}>
            <span className="text-eyebrow" style={{ marginBottom: "12px" }}>Por que escolher</span>
            <h2 className="text-headline">AL-TACADÃO</h2>
          </motion.div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "var(--space-8)", maxWidth: "896px", margin: "0 auto" }}>
            <BenefitItem icon={<Truck size={24} />} title="Entrega Expressa" description="Receba seus produtos em até 24h para a região metropolitana. Frete grátis acima de R$ 500." />
            <BenefitItem icon={<Shield size={24} />} title="Produtos Originais" description="Garantia de autenticidade. Trabalhamos apenas com distribuidores oficiais." />
            <BenefitItem icon={<CreditCard size={24} />} title="Condições Especiais" description="Preços exclusivos para revendedores. Parcelamento em até 12x." />
            <BenefitItem icon={<Zap size={24} />} title="Suporte Dedicado" description="Equipe especializada para ajudar na escolha dos melhores produtos." />
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingBottom: "96px" }}>
        <div className="container-apple" style={{ textAlign: "center" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} style={{ maxWidth: "672px", margin: "0 auto" }}>
            <h2 className="text-headline" style={{ marginBottom: "16px" }}>Pronto para<br /><span style={{ color: "var(--color-accent)" }}>começar?</span></h2>
            <p className="text-body-lg" style={{ color: "var(--color-text-secondary)", marginBottom: "40px", margin: "0 auto" }}>Cadastre-se agora e tenha acesso aos melhores preços do mercado.</p>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "var(--space-3)", padding: "0 var(--space-4)" }}>
              <Link to="/cadastro" className="btn btn-primary btn-lg">Criar Conta Grátis</Link>
              <Link to="/produtos" className="btn btn-ghost">Explorar Catálogo <ArrowRight size={16} /></Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
