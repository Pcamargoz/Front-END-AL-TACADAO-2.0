import { useQuery } from "@tanstack/react-query";
import { Truck, Package, Users, TrendingUp, ArrowRight, DollarSign, ArrowUpRight, ArrowDownRight, Activity, Clock, ShoppingBag, Dumbbell } from "lucide-react";
import { Link } from "react-router-dom";
import { Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { apiListFornecedores, apiListEstoque, apiListUsuarios } from "../api/client";
import { BRAND_META, formatCurrency, getMockPrice } from "../lib/utils";
import { useAuth } from "../auth/AuthContext";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, change, icon, color }: StatCardProps) {
  const isPositive = change && change > 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div 
          className="w-12 h-12 rounded-sm flex items-center justify-center"
          style={{ background: `${color}15` }}
        >
          <div style={{ color }}>{icon}</div>
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? "text-[#10B981]" : "text-[#EF4444]"}`}>
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <h3 className="text-2xl font-display font-bold text-[#F5F5F5] mb-1">{value}</h3>
      <p className="text-sm text-[#4B5563]">{title}</p>
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
        <h3 className="font-medium text-[#F5F5F5] flex items-center gap-2">
          <Activity size={18} className="text-[#00E5FF]" />
          Atividade Recente
        </h3>
        <button className="text-xs text-[#00FF87] hover:text-[#00E5FF] transition-colors">
          Ver tudo
        </button>
      </div>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-[#1A1D24] flex items-center justify-center text-[#9CA3AF]">
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#F5F5F5] truncate">{item.title}</p>
              <p className="text-xs text-[#4B5563] flex items-center gap-1">
                <Clock size={10} /> {item.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();

  const { data: suppliers = [] } = useQuery({ queryKey: ["fornecedores"], queryFn: apiListFornecedores });
  const { data: products  = [] } = useQuery({ queryKey: ["estoque"],      queryFn: apiListEstoque      });
  const { data: users     = [] } = useQuery({ queryKey: ["usuarios"],     queryFn: apiListUsuarios     });

  const brandCount: Record<string, number> = {};
  products.forEach((p) => { if (p.marca) brandCount[p.marca] = (brandCount[p.marca] || 0) + 1; });

  const brandData = Object.entries(brandCount)
    .map(([brand, count]) => ({
      name:  BRAND_META[brand]?.label ?? brand,
      value: count,
      color: BRAND_META[brand]?.color ?? "#52525B",
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // Mock metrics
  const totalRevenue = products.reduce((acc, p) => acc + getMockPrice(p.id), 0);
  const activeUsers = users.filter((u) => u.roles?.includes("FUNCIONARIO") || u.roles?.includes("ESTAGIARIO")).length;
  
  // Top products (by mock price)
  const topProducts = [...products]
    .sort((a, b) => getMockPrice(b.id) - getMockPrice(a.id))
    .slice(0, 5);

  // Mock recent activity
  const recentActivity: RecentActivityItem[] = [
    { id: "1", type: "product", title: "Novo produto cadastrado: Whey Protein", timestamp: "Há 2 horas", icon: <Package size={14} /> },
    { id: "2", type: "user", title: "Novo funcionário adicionado", timestamp: "Há 4 horas", icon: <Users size={14} /> },
    { id: "3", type: "order", title: "Pedido #1234 finalizado", timestamp: "Há 6 horas", icon: <ShoppingBag size={14} /> },
    { id: "4", type: "product", title: "Estoque atualizado: Creatina", timestamp: "Há 8 horas", icon: <Package size={14} /> },
  ];

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-[#F5F5F5]">
            {greeting}, {user?.nome || "Gerente"}! 👋
          </h1>
          <p className="text-sm text-[#9CA3AF]">
            Aqui está o resumo do seu negócio hoje
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/produtos" className="btn btn-secondary">
            <Package size={16} /> Novo Produto
          </Link>
          <Link to="/admin/usuarios" className="btn btn-primary">
            <Users size={16} /> Novo Usuário
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Receita Total"
          value={formatCurrency(totalRevenue)}
          change={12.5}
          icon={<DollarSign size={24} />}
          color="#00FF87"
        />
        <StatCard
          title="Produtos"
          value={products.length}
          change={8.2}
          icon={<Package size={24} />}
          color="#00E5FF"
        />
        <StatCard
          title="Usuários Ativos"
          value={activeUsers}
          change={-2.4}
          icon={<Users size={24} />}
          color="#F59E0B"
        />
        <StatCard
          title="Fornecedores"
          value={suppliers.length}
          change={5.1}
          icon={<TrendingUp size={24} />}
          color="#A855F7"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Brand Chart */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-medium text-[#F5F5F5] flex items-center gap-2">
              <TrendingUp size={18} className="text-[#00FF87]" />
              Distribuição por Marca
            </h3>
            <span className="text-xs px-2 py-1 rounded-sm bg-[#00E5FF]/10 text-[#00E5FF]">
              {brandData.length} marcas
            </span>
          </div>

          {brandData.length === 0 ? (
            <div className="text-center py-8">
              <Package size={40} className="mx-auto text-[#4B5563] mb-3" />
              <p className="text-sm text-[#9CA3AF]">Nenhum produto cadastrado</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie
                    data={brandData}
                    cx="50%" cy="50%"
                    innerRadius={48} outerRadius={76}
                    paddingAngle={3} dataKey="value"
                  >
                    {brandData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} opacity={0.8} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#111318", border: "1px solid #1A1D24",
                      borderRadius: "4px", color: "#F5F5F5", fontSize: "12px",
                    }}
                    formatter={(v) => [`${v} produto(s)`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {brandData.slice(0, 5).map((b) => (
                  <div key={b.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: b.color }} />
                      <span className="text-sm text-[#9CA3AF] truncate max-w-[120px]">{b.name}</span>
                    </div>
                    <span className="text-sm font-mono" style={{ color: b.color }}>
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
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-medium text-[#F5F5F5] flex items-center gap-2">
              <Package size={18} className="text-[#00E5FF]" />
              Produtos em Destaque
            </h3>
            <Link to="/admin/produtos" className="text-xs text-[#00FF87] hover:text-[#00E5FF] transition-colors flex items-center gap-1">
              Ver todos <ArrowRight size={12} />
            </Link>
          </div>

          {topProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package size={40} className="mx-auto text-[#4B5563] mb-3" />
              <p className="text-sm text-[#9CA3AF]">Nenhum produto ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p) => {
                const meta = p.marca ? BRAND_META[p.marca] : null;
                return (
                  <div key={p.id} className="flex items-center gap-3 p-2 rounded-sm hover:bg-[#1A1D24]/50 transition-colors">
                    <div 
                      className="w-8 h-8 rounded-sm flex items-center justify-center"
                      style={{ background: meta?.bg ?? "#1A1D24" }}
                    >
                      <Dumbbell size={14} style={{ color: meta?.color ?? "#4B5563" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#F5F5F5] truncate">{p.descricao}</p>
                      <p className="text-xs" style={{ color: meta?.color ?? "#4B5563" }}>
                        {meta?.label ?? p.marca ?? "Sem marca"}
                      </p>
                    </div>
                    <span className="price text-sm">{formatCurrency(getMockPrice(p.id))}</span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.35 }}
        >
          <RecentActivity items={recentActivity} />
        </motion.div>
      </div>

      {/* Recent Suppliers */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.35 }}
        className="card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-medium text-[#F5F5F5] flex items-center gap-2">
            <Truck size={18} className="text-[#F59E0B]" />
            Fornecedores Recentes
          </h3>
          <Link to="/admin/fornecedores" className="text-xs text-[#00FF87] hover:text-[#00E5FF] transition-colors flex items-center gap-1">
            Ver todos <ArrowRight size={12} />
          </Link>
        </div>

        {suppliers.length === 0 ? (
          <div className="text-center py-8">
            <Truck size={40} className="mx-auto text-[#4B5563] mb-3" />
            <p className="text-sm text-[#9CA3AF]">Nenhum fornecedor cadastrado</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers.slice(0, 6).map((f) => (
              <div key={f.id} className="flex items-center gap-3 p-3 rounded-sm bg-[#0A0C10] hover:bg-[#1A1D24]/50 transition-colors">
                <div className="w-10 h-10 rounded-sm flex items-center justify-center text-sm font-bold bg-[#F59E0B]/10 text-[#F59E0B]">
                  {(f.nomeFantasia || f.razaoSocial).charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#F5F5F5] truncate font-medium">
                    {f.nomeFantasia || f.razaoSocial}
                  </p>
                  <p className="text-xs text-[#4B5563] truncate">{f.email}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: <Package size={20} />, label: "Adicionar Produto", to: "/admin/produtos", color: "#00FF87" },
          { icon: <Users size={20} />, label: "Gerenciar Equipe", to: "/admin/usuarios", color: "#00E5FF" },
          { icon: <ShoppingBag size={20} />, label: "Ver Pedidos", to: "/admin", color: "#F59E0B" },
          { icon: <Activity size={20} />, label: "Relatórios", to: "/admin", color: "#A855F7" },
        ].map((action, i) => (
          <Link
            key={i}
            to={action.to}
            className="card p-4 flex items-center gap-3 hover:border-[#00FF87]/25 transition-all group"
          >
            <div 
              className="w-10 h-10 rounded-sm flex items-center justify-center transition-colors"
              style={{ background: `${action.color}10` }}
            >
              <div style={{ color: action.color }}>{action.icon}</div>
            </div>
            <span className="text-sm text-[#9CA3AF] group-hover:text-[#F5F5F5] transition-colors">
              {action.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
