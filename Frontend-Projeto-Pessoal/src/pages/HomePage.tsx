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
  ShoppingBag
} from "lucide-react";
import { apiListEstoque, type Produto } from "../api/client";
import { BRAND_META, getMockPrice, formatCurrency, CATEGORIES } from "../lib/utils";
import { useCart } from "../hooks/useCart";

function FeaturedProductCard({ product }: { product: Produto }) {
  const { addItem, isInCart } = useCart();
  const meta = product.marca ? BRAND_META[product.marca] : null;
  const price = getMockPrice(product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="product-card group"
    >
      <div className="aspect-square bg-gradient-to-br from-[#1A1D24] to-[#111318] flex items-center justify-center relative overflow-hidden">
        <div 
          className="w-24 h-24 rounded-sm flex items-center justify-center"
          style={{ background: meta?.bg || "rgba(255,255,255,0.05)" }}
        >
          <Dumbbell size={40} style={{ color: meta?.color || "#4B5563" }} />
        </div>
        <div className="absolute inset-0 bg-[#00FF87]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="p-4">
        {meta && (
          <span 
            className="inline-block text-[10px] font-bold tracking-wider uppercase mb-2 px-2 py-0.5 rounded-sm"
            style={{ background: meta.bg, color: meta.color }}
          >
            {meta.label}
          </span>
        )}
        <h3 className="text-sm font-medium text-[#F5F5F5] mb-1 line-clamp-2 min-h-[40px]">
          {product.descricao}
        </h3>
        {product.medida && (
          <p className="text-xs text-[#4B5563] font-mono mb-3">{product.medida}g</p>
        )}
        <div className="flex items-center justify-between">
          <span className="price text-lg">{formatCurrency(price)}</span>
          <button
            onClick={() => addItem(product, 1, price)}
            disabled={isInCart(product.id)}
            className={`btn btn-sm ${isInCart(product.id) ? "btn-secondary" : "btn-primary"}`}
          >
            {isInCart(product.id) ? "✓" : <ShoppingBag size={14} />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function CategoryCard({ category }: { category: typeof CATEGORIES[number] }) {
  const icons: Record<string, React.ReactNode> = {
    proteinas: <Dumbbell size={32} />,
    "pre-treino": <Zap size={32} />,
    creatina: <Flame size={32} />,
    vitaminas: <Pill size={32} />,
    aminoacidos: <Heart size={32} />,
  };

  return (
    <Link to={`/produtos?categoria=${category.id}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        whileHover={{ y: -4 }}
        className="category-card"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-sm bg-[#00E5FF]/10 flex items-center justify-center text-[#00E5FF]">
          {icons[category.id] || <span className="text-2xl">{category.icon}</span>}
        </div>
        <h3 className="font-medium text-[#F5F5F5]">{category.label}</h3>
      </motion.div>
    </Link>
  );
}

function BenefitItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="flex items-start gap-4"
    >
      <div className="w-12 h-12 rounded-sm bg-[#00FF87]/10 border border-[#00FF87]/20 flex items-center justify-center flex-shrink-0 text-[#00FF87]">
        {icon}
      </div>
      <div>
        <h4 className="font-medium text-[#F5F5F5] mb-1">{title}</h4>
        <p className="text-sm text-[#9CA3AF]">{description}</p>
      </div>
    </motion.div>
  );
}

export function HomePage() {
  const { data: productsData } = useQuery({
    queryKey: ["estoque"],
    queryFn: () => apiListEstoque(),
  });
  const products: Produto[] = productsData?.content ?? [];

  const featuredProducts = products.slice(0, 8);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00FF87]/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00E5FF]/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block mb-4 text-xs font-bold tracking-[0.3em] uppercase text-[#00FF87]">
              Distribuidora B2B
            </span>
            <h1 className="hero-title mb-6">
              SUPLEMENTOS
              <br />
              <span className="text-neon text-glow">PREMIUM</span>
            </h1>
            <p className="hero-subtitle mx-auto mb-8">
              A maior variedade de suplementos para sua loja. Preços competitivos, 
              entrega rápida e qualidade garantida das melhores marcas do mercado.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/produtos" className="btn btn-primary btn-lg">
                Ver Produtos <ArrowRight size={18} />
              </Link>
              <Link to="/cadastro" className="btn btn-secondary btn-lg">
                Cadastre-se
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {[
              { value: "500+", label: "Produtos" },
              { value: "50+", label: "Marcas" },
              { value: "1000+", label: "Clientes" },
              { value: "24h", label: "Entrega" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="font-display text-3xl md:text-4xl text-[#00FF87] mb-1">{stat.value}</p>
                <p className="text-xs uppercase tracking-wider text-[#4B5563]">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-[#4B5563] flex justify-center pt-2">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-[#00FF87]"
            />
          </div>
        </motion.div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-4 bg-[#0A0C10]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#00E5FF] mb-2 block">
              Navegue por
            </span>
            <h2 className="section-title">CATEGORIAS</h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.slice(0, 8).map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#00FF87] mb-2 block">
                Destaques
              </span>
              <h2 className="section-title">PRODUTOS EM ALTA</h2>
            </div>
            <Link to="/produtos" className="btn btn-secondary hidden sm:flex">
              Ver todos <ArrowRight size={16} />
            </Link>
          </motion.div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredProducts.map((product) => (
                <FeaturedProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 card">
              <Dumbbell size={48} className="mx-auto text-[#4B5563] mb-4" />
              <p className="text-[#9CA3AF] mb-4">Nenhum produto cadastrado ainda.</p>
              <Link to="/cadastro" className="btn btn-primary">
                Cadastre-se para adicionar
              </Link>
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link to="/produtos" className="btn btn-secondary">
              Ver todos <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-[#0A0C10]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#00E5FF] mb-2 block">
              Por que escolher
            </span>
            <h2 className="section-title">AL-TACADÃO</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
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

      {/* CTA Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#00FF87]/5 rounded-full blur-[100px]" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-4xl md:text-5xl mb-4 text-[#F5F5F5]">
              PRONTO PARA<br />
              <span className="text-neon text-glow">COMEÇAR?</span>
            </h2>
            <p className="text-[#9CA3AF] mb-8 max-w-lg mx-auto">
              Cadastre-se agora e tenha acesso aos melhores preços do mercado.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/cadastro" className="btn btn-primary btn-lg">
                Criar Conta Grátis
              </Link>
              <Link to="/produtos" className="btn btn-ghost">
                Explorar Catálogo
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
