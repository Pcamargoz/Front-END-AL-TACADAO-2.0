import { useQuery } from "@tanstack/react-query";
import { Package, TrendingUp, ArrowRight, DollarSign, ArrowUpRight, ArrowDownRight, Activity, Clock, ShoppingBag, Dumbbell, Building2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { apiListEstoque, type Produto } from "../api/client";
import { BRAND_META, formatCurrency, getMockPrice } from "../lib/utils";
import { useAuth } from "../auth/AuthContext";
import { useFornecedor } from "../context/FornecedorContext";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
}

function StatCard({ title, value, change, icon }: StatCardProps) {
  const isPositive = change && change > 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-surface-secondary flex items-center justify-center">
          <span className="text-accent">{icon}</span>
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-caption font-medium ${isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <h3 className="text-display-xs text-primary mb-1">{value}</h3>
      <p className="text-body-sm text-secondary">{title}</p>
    </motion.div>
  );
}

interface RecentActivityItem {
  id: string;
  type: "product" | "user" | "order";
  title: string;
  timestamp: string;
  icon: React.ReactNode;
}

function RecentActivity({ items }: { items: RecentActivityItem[] }) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-title-sm text-primary flex items-center gap-2">
          <Activity size={18} className="text-accent" />
          Atividade Recente
        </h3>
        <button className="text-caption text-accent hover:text-accent-hover transition-colors">
          Ver tudo
        </button>
      </div>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface-secondary flex items-center justify-center text-tertiary">
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-body-sm text-primary truncate">{item.title}</p>
              <p className="text-caption text-tertiary flex items-center gap-1">
                <Clock size={12} /> {item.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getProductPrice(product: Produto): number {
  return product.preco ?? getMockPrice(product.id);
}

export function DashboardPage() {
  const { user } = useAuth();
  const { nome: fornecedorNome, isGerente } = useFornecedor();
  const { id } = useParams();

  const { data: productsData } = useQuery({ queryKey: ["estoque"], queryFn: () => apiListEstoque() });
  
  const products: Produto[] = productsData?.content ?? [];

  const brandCount: Record<string, number> = {};
  products.forEach((p) => { if (p.marca) brandCount[p.marca] = (brandCount[p.marca] || 0) + 1; });

  const brandData = Object.entries(brandCount)
    .map(([brand, count]) => ({
      name:  BRAND_META[brand]?.label ?? brand,
      value: count,
      color: BRAND_META[brand]?.color ?? "var(--color-text-quaternary)",
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const totalRevenue = products.reduce((acc, p) => acc + getProductPrice(p), 0);
  
  const topProducts = [...products]
    .sort((a, b) => getProductPrice(b) - getProductPrice(a))
    .slice(0, 5);

  const recentActivity: RecentActivityItem[] = [
    { id: "1", type: "product", title: "Novo produto cadastrado: Whey Protein", timestamp: "Há 2 horas", icon: <Package size={16} /> },
    { id: "2", type: "product", title: "Estoque atualizado: Creatina", timestamp: "Há 4 horas", icon: <Package size={16} /> },
    { id: "3", type: "order", title: "Pedido #1234 finalizado", timestamp: "Há 6 horas", icon: <ShoppingBag size={16} /> },
    { id: "4", type: "product", title: "Novo produto: BCAA", timestamp: "Há 8 horas", icon: <Package size={16} /> },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  return (
    <div className="space-y-8 p-6 lg:p-8">
      {/* Empresa Info Header */}
      {fornecedorNome && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-4 rounded-xl bg-accent/5 border border-accent/20"
        >
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
            <Building2 size={22} className="text-accent" />
          </div>
          <div className="flex-1">
            <p className="text-caption text-tertiary uppercase tracking-wider">Empresa</p>
            <p className="text-title-md text-primary">{fornecedorNome}</p>
          </div>
          <span className={`text-caption font-medium px-3 py-1.5 rounded-full ${
            isGerente 
              ? "bg-accent/10 text-accent" 
              : "bg-blue-500/10 text-blue-500"
          }`}>
            {isGerente ? "GERENTE" : "FUNCIONÁRIO"}
          </span>
        </motion.div>
      )}

      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-display-xs text-primary">
            {greeting}, {user?.nome || user?.login}!
          </h1>
          <p className="text-body text-secondary mt-1">
            Aqui está o resumo do seu negócio hoje
          </p>
        </div>
        <Link to={`/empresas/${id}/painel/estoque`} className="btn btn-primary">
          <Package size={18} />
          Ver Estoque
        </Link>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard
          title="Receita Estimada"
          value={formatCurrency(totalRevenue)}
          change={12.5}
          icon={<DollarSign size={24} />}
        />
        <StatCard
          title="Produtos"
          value={products.length}
          change={8.2}
          icon={<Package size={24} />}
        />
        <StatCard
          title="Marcas"
          value={brandData.length}
          change={5.1}
          icon={<TrendingUp size={24} />}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Brand Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-title-sm text-primary flex items-center gap-2">
              <TrendingUp size={18} className="text-accent" />
              Distribuição por Marca
            </h3>
            <span className="text-caption px-2.5 py-1 rounded-full bg-surface-secondary text-secondary">
              {brandData.length} marcas
            </span>
          </div>

          {brandData.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-surface-secondary flex items-center justify-center mx-auto mb-4">
                <Package size={32} className="text-tertiary" />
              </div>
              <p className="text-body-sm text-secondary">Nenhum produto cadastrado</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={brandData}
                    cx="50%" cy="50%"
                    innerRadius={50} outerRadius={80}
                    paddingAngle={3} dataKey="value"
                  >
                    {brandData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} opacity={0.85} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      color: "var(--text-primary)",
                      fontSize: "13px",
                      boxShadow: "var(--shadow-md)",
                    }}
                    formatter={(v) => [`${v} produto(s)`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {brandData.slice(0, 5).map((b) => (
                  <div key={b.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: b.color }} />
                      <span className="text-body-sm text-secondary truncate max-w-[140px]">{b.name}</span>
                    </div>
                    <span className="text-body-sm font-medium text-primary">
                      {b.value}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-title-sm text-primary flex items-center gap-2">
              <Package size={18} className="text-accent" />
              Produtos em Destaque
            </h3>
            <Link 
              to={`/empresas/${id}/painel/estoque`} 
              className="text-caption text-accent hover:text-accent-hover transition-colors flex items-center gap-1"
            >
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>

          {topProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-surface-secondary flex items-center justify-center mx-auto mb-4">
                <Package size={32} className="text-tertiary" />
              </div>
              <p className="text-body-sm text-secondary">Nenhum produto ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p) => {
                const meta = p.marca ? BRAND_META[p.marca] : null;
                return (
                  <div 
                    key={p.id} 
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-secondary transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-surface-secondary flex items-center justify-center">
                      <Dumbbell size={18} className="text-tertiary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-body-sm text-primary truncate">{p.descricao}</p>
                      <p className="text-caption text-accent">
                        {meta?.label ?? p.marca ?? "Sem marca"}
                      </p>
                    </div>
                    <span className="text-body-sm font-semibold text-accent">
                      {formatCurrency(getProductPrice(p))}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <RecentActivity items={recentActivity} />
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: <Package size={22} />, label: "Ver Estoque", to: `/empresas/${id}/painel/estoque` },
          { icon: <ShoppingBag size={22} />, label: "Meu Perfil", to: `/empresas/${id}/painel/perfil` },
          { icon: <Activity size={22} />, label: "Voltar às Empresas", to: "/empresas" },
        ].map((action, i) => (
          <Link
            key={i}
            to={action.to}
            className="card p-5 flex items-center gap-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-surface-secondary flex items-center justify-center group-hover:bg-accent/10 transition-colors">
              <span className="text-tertiary group-hover:text-accent transition-colors">
                {action.icon}
              </span>
            </div>
            <span className="text-body text-secondary group-hover:text-primary transition-colors">
              {action.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
