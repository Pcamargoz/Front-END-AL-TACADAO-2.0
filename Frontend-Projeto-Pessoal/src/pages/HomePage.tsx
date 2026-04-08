import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  ArrowRight, ArrowUpRight, Zap, Shield, Truck, CreditCard,
  Dumbbell, Flame, Pill, Heart, ShoppingBag, Sparkles,
} from "lucide-react";
import { apiListEstoque, type Produto } from "../api/client";
import { BRAND_META, formatCurrency, CATEGORIES } from "../lib/utils";
import { useCart } from "../hooks/useCart";

/* ────────────────────────────────────────────────────────────────────────────
 * Motion presets — Apple keynote pacing
 * ──────────────────────────────────────────────────────────────────────────── */
const APPLE_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, ease: APPLE_EASE, delay: i * 0.08 },
  }),
};

/* ────────────────────────────────────────────────────────────────────────────
 * Featured product card
 * ──────────────────────────────────────────────────────────────────────────── */
function FeaturedProductCard({ product, index }: { product: Produto; index: number }) {
  const { addItem, isInCart } = useCart();
  const meta = product.marca ? BRAND_META[product.marca] : null;
  const price = product.preco ?? 0;

  return (
    <motion.article
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={fadeUp}
      custom={index}
      className="product-card"
    >
      <Link to={`/produtos/${product.id}`} style={{ display: "block" }}>
        <div className="product-media">
          <div
            className="product-icon"
            style={{
              width: 120, height: 120, borderRadius: 28,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: meta?.bg || "var(--color-accent-subtle)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4), 0 24px 48px -16px rgba(0,0,0,0.18)",
            }}
          >
            <Dumbbell size={48} style={{ color: meta?.color || "var(--color-accent)" }} strokeWidth={1.6} />
          </div>
        </div>
      </Link>

      <div style={{ padding: "var(--space-6)" }}>
        {meta && (
          <span className="badge badge-neutral" style={{ marginBottom: 12, color: meta.color, background: meta.bg }}>
            {meta.label}
          </span>
        )}
        <Link to={`/produtos/${product.id}`} style={{ color: "inherit" }}>
          <h3 className="line-clamp-2" style={{
            fontFamily: "var(--font-display)",
            fontSize: 17, fontWeight: 600, color: "var(--color-text)",
            marginBottom: 6, minHeight: 46, lineHeight: 1.35, letterSpacing: "-0.01em",
          }}>
            {product.descricao}
          </h3>
        </Link>
        {product.medida && (
          <p style={{ fontSize: 13, color: "var(--color-text-tertiary)", marginBottom: 18 }}>
            {product.medida}g
          </p>
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <span className="price" style={{ fontSize: 20 }}>{formatCurrency(price)}</span>
          <button
            onClick={(e) => { e.preventDefault(); addItem(product, 1, price); }}
            disabled={isInCart(product.id)}
            className={`btn btn-sm ${isInCart(product.id) ? "btn-secondary" : "btn-primary"}`}
            aria-label={isInCart(product.id) ? "Já no carrinho" : "Adicionar ao carrinho"}
          >
            {isInCart(product.id) ? "Adicionado" : <><ShoppingBag size={14} strokeWidth={2.2} /> Comprar</>}
          </button>
        </div>
      </div>
    </motion.article>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Category card
 * ──────────────────────────────────────────────────────────────────────────── */
function CategoryCard({ category, index }: { category: typeof CATEGORIES[number]; index: number }) {
  const icons: Record<string, React.ReactNode> = {
    proteinas:   <Dumbbell size={28} strokeWidth={1.6} />,
    "pre-treino":<Zap size={28} strokeWidth={1.6} />,
    creatina:    <Flame size={28} strokeWidth={1.6} />,
    vitaminas:   <Pill size={28} strokeWidth={1.6} />,
    aminoacidos: <Heart size={28} strokeWidth={1.6} />,
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={fadeUp}
      custom={index * 0.6}
    >
      <Link to={`/produtos?categoria=${category.id}`} className="category-card tactile" style={{ display: "block" }}>
        <div style={{
          width: 64, height: 64, margin: "0 auto var(--space-5)",
          borderRadius: 20,
          background: "linear-gradient(145deg, var(--color-accent-subtle), var(--color-accent-muted))",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--color-accent)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4)",
        }}>
          {icons[category.id] || <span style={{ fontSize: 28 }}>{category.icon}</span>}
        </div>
        <h3 style={{
          fontFamily: "var(--font-display)",
          fontSize: 16, fontWeight: 600, color: "var(--color-text)", letterSpacing: "-0.01em",
        }}>
          {category.label}
        </h3>
      </Link>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Benefit row
 * ──────────────────────────────────────────────────────────────────────────── */
function BenefitItem({
  icon, title, description, index,
}: { icon: React.ReactNode; title: string; description: string; index: number }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={fadeUp}
      custom={index}
      style={{ display: "flex", alignItems: "flex-start", gap: 20 }}
    >
      <div style={{
        width: 56, height: 56, borderRadius: 18, flexShrink: 0,
        background: "linear-gradient(145deg, var(--color-accent-subtle), var(--color-accent-muted))",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "var(--color-accent)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)",
      }}>
        {icon}
      </div>
      <div>
        <h4 style={{
          fontFamily: "var(--font-display)",
          fontSize: 19, fontWeight: 600, color: "var(--color-text)",
          marginBottom: 6, letterSpacing: "-0.01em",
        }}>{title}</h4>
        <p style={{ fontSize: 15, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
          {description}
        </p>
      </div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Stats marquee
 * ──────────────────────────────────────────────────────────────────────────── */
function StatsRow() {
  const stats = [
    { value: "500+",  label: "Produtos" },
    { value: "50+",   label: "Marcas oficiais" },
    { value: "1.000+",label: "Lojas parceiras" },
    { value: "24h",   label: "Entrega expressa" },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.9, ease: APPLE_EASE }}
      style={{
        marginTop: 96,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: "var(--space-8)",
        textAlign: "center",
      }}
    >
      {stats.map((s) => (
        <div key={s.label}>
          <p style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(36px, 5vw, 56px)",
            fontWeight: 600,
            color: "var(--color-text)",
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}>
            {s.value}
          </p>
          <p style={{
            fontSize: 12, fontWeight: 500,
            letterSpacing: "0.14em", textTransform: "uppercase",
            color: "var(--color-text-tertiary)", marginTop: 10,
          }}>
            {s.label}
          </p>
        </div>
      ))}
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Main Page
 * ──────────────────────────────────────────────────────────────────────────── */
export function HomePage() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["estoque"],
    queryFn: () => apiListEstoque(),
  });
  const products: Produto[] = productsData?.content ?? [];
  const featuredProducts = products.slice(0, 8);

  return (
    <div className="page-wrapper">
      {/* ═══════════════════════════════════════════════════════════════════
       * HERO
       * ═══════════════════════════════════════════════════════════════════ */}
      <section className="hero" ref={heroRef}>
        <motion.div
          style={{ y: heroY, opacity: heroOpacity, position: "relative", zIndex: 10, textAlign: "center", padding: "0 var(--container-padding)", maxWidth: 980, margin: "0 auto" }}
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: APPLE_EASE }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "8px 16px", marginBottom: 28,
              borderRadius: "var(--radius-full)",
              background: "var(--glass-bg)",
              backdropFilter: "var(--glass-blur)",
              WebkitBackdropFilter: "var(--glass-blur)",
              border: "1px solid var(--glass-border)",
              fontSize: 13, fontWeight: 500,
              color: "var(--color-text-secondary)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <Sparkles size={14} style={{ color: "var(--color-accent)" }} />
            Distribuidora B2B • Suplementos premium
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: APPLE_EASE, delay: 0.1 }}
            className="hero-title"
          >
            Força em{" "}
            <span style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontWeight: 400,
              color: "var(--color-accent)",
              letterSpacing: "-0.02em",
            }}>
              atacado.
            </span>
            <br />
            Performance{" "}
            <span style={{ color: "var(--color-text-tertiary)" }}>sem ruído.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: APPLE_EASE, delay: 0.25 }}
            className="hero-subtitle"
          >
            A maior curadoria de suplementos para revendedores. Marcas oficiais,
            preços competitivos e entrega rápida — tudo em uma única plataforma.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: APPLE_EASE, delay: 0.4 }}
            style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14 }}
          >
            <Link to="/produtos" className="btn btn-primary btn-lg">
              Ver catálogo <ArrowRight size={18} strokeWidth={2.2} />
            </Link>
            <Link to="/cadastro" className="btn btn-glass btn-lg">
              Criar conta grátis
            </Link>
          </motion.div>

          <StatsRow />
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
       * CATEGORIES
       * ═══════════════════════════════════════════════════════════════════ */}
      <section className="section" style={{ background: "var(--color-bg-secondary)" }}>
        <div className="container-apple">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: APPLE_EASE }}
            style={{ textAlign: "center", marginBottom: 72 }}
          >
            <span className="text-eyebrow" style={{ marginBottom: 16 }}>Navegue por</span>
            <h2 className="text-headline" style={{ marginTop: 8 }}>
              Tudo que sua loja precisa,{" "}
              <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", color: "var(--color-text-tertiary)", fontWeight: 400 }}>
                organizado.
              </span>
            </h2>
          </motion.div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 20,
          }}>
            {CATEGORIES.slice(0, 8).map((cat, i) => <CategoryCard key={cat.id} category={cat} index={i} />)}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
       * FEATURED PRODUCTS
       * ═══════════════════════════════════════════════════════════════════ */}
      <section className="section">
        <div className="container-apple">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: APPLE_EASE }}
            style={{
              display: "flex", flexWrap: "wrap", justifyContent: "space-between",
              alignItems: "flex-end", marginBottom: 72, gap: 16,
            }}
          >
            <div>
              <span className="text-eyebrow" style={{ marginBottom: 16 }}>Em alta</span>
              <h2 className="text-headline" style={{ marginTop: 8 }}>
                Mais{" "}
                <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", color: "var(--color-accent)", fontWeight: 400 }}>
                  vendidos
                </span>
                {" "}da semana
              </h2>
            </div>
            <Link to="/produtos" className="btn btn-secondary hidden sm\:flex">
              Ver todos <ArrowUpRight size={16} strokeWidth={2.2} />
            </Link>
          </motion.div>

          {isLoading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
              {[...Array(8)].map((_, i) => (
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
          ) : featuredProducts.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
              {featuredProducts.map((p, i) => <FeaturedProductCard key={p.id} product={p} index={i} />)}
            </div>
          ) : (
            <div className="empty-state card">
              <div className="empty-icon">
                <Dumbbell size={32} strokeWidth={1.6} />
              </div>
              <h3 className="empty-title">Catálogo em preparação</h3>
              <p className="empty-description">
                Em breve teremos centenas de produtos disponíveis para você revender.
              </p>
              <Link to="/cadastro" className="btn btn-primary">Cadastre-se primeiro</Link>
            </div>
          )}

          <div className="sm\:hidden" style={{ marginTop: 40, textAlign: "center" }}>
            <Link to="/produtos" className="btn btn-secondary">
              Ver todos <ArrowRight size={16} strokeWidth={2.2} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
       * BENEFITS
       * ═══════════════════════════════════════════════════════════════════ */}
      <section className="section" style={{ background: "var(--color-bg-secondary)" }}>
        <div className="container-apple">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: APPLE_EASE }}
            style={{ textAlign: "center", marginBottom: 80 }}
          >
            <span className="text-eyebrow" style={{ marginBottom: 16 }}>Por que AL TACADÃO</span>
            <h2 className="text-headline" style={{ marginTop: 8 }}>
              Pensado para quem{" "}
              <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", color: "var(--color-accent)", fontWeight: 400 }}>
                vende.
              </span>
            </h2>
          </motion.div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
            gap: 48,
            maxWidth: 980, margin: "0 auto",
          }}>
            <BenefitItem index={0} icon={<Truck size={26} strokeWidth={1.6} />} title="Entrega expressa" description="Receba seus pedidos em até 24h para a região metropolitana. Frete grátis acima de R$ 500." />
            <BenefitItem index={1} icon={<Shield size={26} strokeWidth={1.6} />} title="100% originais" description="Trabalhamos exclusivamente com distribuidores oficiais. Garantia de autenticidade nota fiscal." />
            <BenefitItem index={2} icon={<CreditCard size={26} strokeWidth={1.6} />} title="Condições B2B" description="Preços de revenda, parcelamento em até 12x e linhas de crédito personalizadas." />
            <BenefitItem index={3} icon={<Zap size={26} strokeWidth={1.6} />} title="Suporte dedicado" description="Equipe especializada para te ajudar a montar o mix ideal e potencializar suas vendas." />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
       * CTA
       * ═══════════════════════════════════════════════════════════════════ */}
      <section className="section" style={{ paddingBottom: 120 }}>
        <div className="container-apple">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: APPLE_EASE }}
            style={{
              maxWidth: 880, margin: "0 auto", textAlign: "center",
              padding: "clamp(48px, 8vw, 96px) clamp(24px, 5vw, 72px)",
              borderRadius: "var(--radius-3xl)",
              background: "var(--color-bg-elevated)",
              border: "1px solid var(--color-border)",
              boxShadow: "var(--shadow-xl)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{
              position: "absolute", inset: 0, zIndex: 0,
              background: "var(--hero-mesh)",
              opacity: 0.6,
            }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <h2 className="text-headline" style={{ marginBottom: 20 }}>
                Pronto para{" "}
                <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", color: "var(--color-accent)", fontWeight: 400 }}>
                  começar?
                </span>
              </h2>
              <p className="text-body-lg" style={{ margin: "0 auto 40px", maxWidth: 520 }}>
                Cadastre-se em minutos e desbloqueie acesso a preços de atacado nas melhores marcas do mercado.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14 }}>
                <Link to="/cadastro" className="btn btn-primary btn-lg">
                  Criar conta grátis <ArrowRight size={18} strokeWidth={2.2} />
                </Link>
                <Link to="/produtos" className="btn btn-ghost btn-lg">
                  Explorar catálogo
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
