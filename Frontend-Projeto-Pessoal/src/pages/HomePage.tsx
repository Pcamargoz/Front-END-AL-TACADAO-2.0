import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Zap, 
  Shield, 
  Truck, 
  CreditCard,
  Dumbbell,
  Flame,
  Pill,
  Heart,
  ShoppingBag,
  ChevronDown
} from "lucide-react";
import { apiListEstoque, type Produto } from "../api/client";
import { BRAND_META, getMockPrice, formatCurrency, CATEGORIES } from "../lib/utils";
import { useCart } from "../hooks/useCart";

function getProductPrice(product: Produto): number {
  return product.preco ?? getMockPrice(product.id);
}

/* -------------------------------------------------------------------------------
 * PRODUCT CARD - Apple Style
 * Clean, minimal, with subtle hover animation
 * -------------------------------------------------------------------------------
 */
function FeaturedProductCard({ product }: { product: Produto }) {
  const { addItem, isInCart } = useCart();
  const meta = product.marca ? BRAND_META[product.marca] : null;
  const price = getProductPrice(product);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="product-card group"
    >
      {/* Product Image Area */}
      <div className="aspect-square bg-[var(--color-bg-tertiary)] flex items-center justify-center relative overflow-hidden">
        <div 
          className="w-24 h-24 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110"
          style={{ background: meta?.bg || "var(--color-accent-subtle)" }}
        >
          <Dumbbell size={40} style={{ color: meta?.color || "var(--color-accent)" }} />
        </div>
      </div>

      {/* Product Info */}
      <div className="p-6">
        {meta && (
          <span 
            className="inline-block text-[11px] font-semibold tracking-wider uppercase mb-2 px-2 py-1 rounded-md"
            style={{ background: meta.bg, color: meta.color }}
          >
            {meta.label}
          </span>
        )}
        <h3 className="text-[15px] font-medium text-[var(--color-text-primary)] mb-1 line-clamp-2 min-h-[44px] leading-snug">
          {product.descricao}
        </h3>
        {product.medida && (
          <p className="text-[13px] text-[var(--color-text-tertiary)] mb-4">{product.medida}g</p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-[var(--color-text-primary)]">
            {formatCurrency(price)}
          </span>
          <button
            onClick={() => addItem(product, 1, price)}
            disabled={isInCart(product.id)}
            className={`btn btn-sm ${isInCart(product.id) ? "btn-secondary" : "btn-primary"}`}
          >
            {isInCart(product.id) ? "Adicionado" : <><ShoppingBag size={14} /> Comprar</>}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------------
 * CATEGORY CARD - Apple Style
 * -------------------------------------------------------------------------------
 */
function CategoryCard({ category }: { category: typeof CATEGORIES[number] }) {
  const icons: Record<string, React.ReactNode> = {
    proteinas: <Dumbbell size={28} />,
    "pre-treino": <Zap size={28} />,
    creatina: <Flame size={28} />,
    vitaminas: <Pill size={28} />,
    aminoacidos: <Heart size={28} />,
  };

  return (
    <Link to={`/produtos?categoria=${category.id}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="category-card group"
      >
        <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-[var(--color-accent-subtle)] flex items-center justify-center text-[var(--color-accent)] transition-transform duration-300 group-hover:scale-110">
          {icons[category.id] || <span className="text-2xl">{category.icon}</span>}
        </div>
        <h3 className="text-[15px] font-medium text-[var(--color-text-primary)]">
          {category.label}
        </h3>
      </motion.div>
    </Link>
  );
}

/* -------------------------------------------------------------------------------
 * BENEFIT ITEM - Apple Style
 * -------------------------------------------------------------------------------
 */
function BenefitItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex items-start gap-5"
    >
      <div className="w-12 h-12 rounded-xl bg-[var(--color-accent-subtle)] flex items-center justify-center flex-shrink-0 text-[var(--color-accent)]">
        {icon}
      </div>
      <div>
        <h4 className="text-[17px] font-semibold text-[var(--color-text-primary)] mb-1">{title}</h4>
        <p className="text-[15px] text-[var(--color-text-secondary)] leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------------
 * SCROLL INDICATOR - Apple Style
 * -------------------------------------------------------------------------------
 */
function ScrollIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5 }}
      className="absolute bottom-10 left-1/2 -translate-x-1/2"
    >
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="flex flex-col items-center gap-2 text-[var(--color-text-tertiary)]"
      >
        <span className="text-[11px] font-medium tracking-wider uppercase">Rolar</span>
        <ChevronDown size={20} />
      </motion.div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------------
 * STATS SECTION - Apple Style
 * -------------------------------------------------------------------------------
 */
function StatsSection() {
  const stats = [
    { value: "500+", label: "Produtos" },
    { value: "50+", label: "Marcas" },
    { value: "1000+", label: "Clientes" },
    { value: "24h", label: "Entrega" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12"
    >
      {stats.map((stat, i) => (
        <div key={i} className="text-center">
          <p className="text-4xl md:text-5xl font-semibold text-[var(--color-accent)] mb-1 tracking-tight">
            {stat.value}
          </p>
          <p className="text-[13px] font-medium tracking-wider uppercase text-[var(--color-text-tertiary)]">
            {stat.label}
          </p>
        </div>
      ))}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------------
 * HOME PAGE - Apple Style
 * -------------------------------------------------------------------------------
 */
export function HomePage() {
  const { data: productsData } = useQuery({
    queryKey: ["estoque"],
    queryFn: () => apiListEstoque(),
  });
  const products: Produto[] = productsData?.content ?? [];
  const featuredProducts = products.slice(0, 8);

  return (
    <div className="page-wrapper">
      
      {/* -----------------------------------------------------------------------
       * HERO SECTION
       * ----------------------------------------------------------------------- */}
      <section className="hero">
         <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* Eyebrow */}
            <span className="inline-block mb-5 text-[12px] font-semibold tracking-[0.2em] uppercase text-[var(--color-accent)]">
              Distribuidora B2B
            </span>

            {/* Title */}
            <h1 className="hero-title">
              Suplementos
              <br />
              <span className="text-accent">Premium</span>
            </h1>

            {/* Subtitle */}
            <p className="hero-subtitle">
              A maior variedade de suplementos para sua loja. 
              Preços competitivos, entrega rápida e qualidade garantida.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/produtos" className="btn btn-primary btn-lg">
                Ver Produtos
                <ArrowRight size={18} />
              </Link>
              <Link to="/cadastro" className="btn btn-secondary btn-lg">
                Cadastre-se
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <StatsSection />
        </div>

        {/* Scroll Indicator */}
        <ScrollIndicator />
      </section>

      {/* -----------------------------------------------------------------------
       * CATEGORIES SECTION
       * ----------------------------------------------------------------------- */}
      <section className="section bg-[var(--color-bg-secondary)]">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <span className="text-eyebrow mb-3 block">Navegue por</span>
            <h2 className="text-headline">Categorias</h2>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
            {CATEGORIES.slice(0, 8).map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* -----------------------------------------------------------------------
       * FEATURED PRODUCTS SECTION
       * ----------------------------------------------------------------------- */}
      <section className="section">
        <div className="container container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-14 gap-4"
          >
            <div>
              <span className="text-eyebrow mb-3 block">Destaques</span>
              <h2 className="text-headline">Produtos em Alta</h2>
            </div>
            <Link to="/produtos" className="btn btn-secondary hidden sm:flex">
              Ver todos <ArrowRight size={16} />
            </Link>
          </motion.div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {featuredProducts.map((product) => (
                <FeaturedProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/5 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-lg shadow-black/10">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center">
                <Dumbbell size={32} className="text-[var(--color-text-tertiary)]" />
              </div>
              <p className="text-[var(--color-text-secondary)] mb-6">
                Nenhum produto cadastrado ainda.
              </p>
              <Link to="/cadastro" className="btn btn-primary">
                Cadastre-se para adicionar
              </Link>
            </div>
          )}

          {/* Mobile CTA */}
          <div className="mt-10 text-center sm:hidden">
            <Link to="/produtos" className="btn btn-secondary">
              Ver todos <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* -----------------------------------------------------------------------
       * BENEFITS SECTION
       * ----------------------------------------------------------------------- */}
      <section className="section bg-[var(--color-bg-secondary)]">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <span className="text-eyebrow mb-3 block">Por que escolher</span>
            <h2 className="text-headline">AL-TACADÃO</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 max-w-4xl mx-auto">
            <BenefitItem
              icon={<Truck size={24} />}
              title="Entrega Expressa"
              description="Receba seus produtos em até 24h para a região metropolitana. Frete grátis acima de R$ 500."
            />
            <BenefitItem
              icon={<Shield size={24} />}
              title="Produtos Originais"
              description="Garantia de autenticidade. Trabalhamos apenas com distribuidores oficiais."
            />
            <BenefitItem
              icon={<CreditCard size={24} />}
              title="Condições Especiais"
              description="Preços exclusivos para revendedores. Parcelamento em até 12x."
            />
            <BenefitItem
              icon={<Zap size={24} />}
              title="Suporte Dedicado"
              description="Equipe especializada para ajudar na escolha dos melhores produtos."
            />
          </div>
        </div>
      </section>

      {/* -----------------------------------------------------------------------
       * CTA SECTION
       * ----------------------------------------------------------------------- */}
      <section className="section pb-20 lg:pb-24">
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-headline mb-4">
              Pronto para
              <br />
              <span className="text-accent">começar?</span>
            </h2>
            <p className="text-body-lg text-[var(--color-text-secondary)] mb-10 max-w-lg mx-auto">
              Cadastre-se agora e tenha acesso aos melhores preços do mercado.
            </p>
             <div className="flex flex-col sm:flex-row items-center justify-center gap-3 px-4">
              <Link to="/cadastro" className="btn btn-primary btn-lg">
                Criar Conta Grátis
              </Link>
              <Link to="/produtos" className="btn btn-ghost">
                Explorar Catálogo <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

