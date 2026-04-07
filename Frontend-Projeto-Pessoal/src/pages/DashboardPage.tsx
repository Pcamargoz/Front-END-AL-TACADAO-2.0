import { useQuery } from "@tanstack/react-query";
import { Package, TrendingUp, ArrowRight, DollarSign, ArrowUpRight, ArrowDownRight, Activity, Clock, ShoppingBag, Dumbbell, Building2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { apiListEstoque, type Produto } from "../api/client";
import { BRAND_META, formatCurrency, getMockPrice } from "../lib/utils";
import { useAuth } from "../auth/AuthContext";
import { useFornecedor } from "../context/FornecedorContext";
import { motion } from "framer-motion";

function getProductPrice(product: Produto): number {
  return product.preco ?? getMockPrice(product.id);
}

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
      className="stat-card"
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
        <div className="stat-icon">{icon}</div>
        {change !== undefined && (
          <span className={`stat-change ${isPositive ? "positive" : "negative"}`}>
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{title}</div>
    </motion.div>
  );
}

interface RecentActivityItem {
  id: string;
  title: string;
  timestamp: string;
  icon: React.ReactNode;
}

function RecentActivity({ items }: { items: RecentActivityItem[] }) {
  return (
    <div className="card" style={{ padding: "var(--space-6)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-6)" }}>
        <h3 style={{ fontSize: "var(--text-body)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <Activity size={18} style={{ color: "var(--color-accent)" }} />
          Atividade Recente
        </h3>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        {items.map((item) => (
          <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "var(--radius-md)",
              background: "var(--color-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--color-text-tertiary)", flexShrink: 0,
            }}>
              {item.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-text-primary)" }} className="truncate">{item.title}</p>
              <p style={{ fontSize: "var(--text-caption)", color: "var(--color-text-tertiary)", display: "flex", alignItems: "center", gap: "4px" }}>
                <Clock size={12} /> {item.timestamp}
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
  const { nome: fornecedorNome, isGerente } = useFornecedor();
  const { id } = useParams();

  const { data: productsData } = useQuery({ queryKey: ["estoque"], queryFn: () => apiListEstoque() });
  const products: Produto[] = productsData?.content ?? [];

  const brandCount: Record<string, number> = {};
  products.forEach((p) => { if (p.marca) brandCount[p.marca] = (brandCount[p.marca] || 0) + 1; });

  const brandData = Object.entries(brandCount)
    .map(([brand, count]) => ({
      name: BRAND_META[brand]?.label ?? brand,
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
    { id: "1", title: "Novo produto cadastrado: Whey Protein", timestamp: "Há 2 horas", icon: <Package size={16} /> },
    { id: "2", title: "Estoque atualizado: Creatina", timestamp: "Há 4 horas", icon: <Package size={16} /> },
    { id: "3", title: "Pedido #1234 finalizado", timestamp: "Há 6 horas", icon: <ShoppingBag size={16} /> },
    { id: "4", title: "Novo produto: BCAA", timestamp: "Há 8 horas", icon: <Package size={16} /> },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  return (
    <div style={{ padding: "var(--space-8) var(--container-padding)", maxWidth: "var(--container-wide)", margin: "0 auto", display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
      {/* Company Info */}
      {fornecedorNome && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: "flex", alignItems: "center", gap: "var(--space-4)",
            padding: "var(--space-4)", borderRadius: "var(--radius-lg)",
            background: "var(--color-accent-subtle)", border: "1px solid var(--color-accent-muted)",
          }}
        >
          <div style={{
            width: "48px", height: "48px", borderRadius: "var(--radius-md)",
            background: "var(--color-accent-muted)", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Building2 size={22} style={{ color: "var(--color-accent)" }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "var(--text-caption)", color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "var(--tracking-wider)" }}>Empresa</p>
            <p style={{ fontSize: "18px", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)" }}>{fornecedorNome}</p>
          </div>
          <span className={`badge ${isGerente ? "badge-accent" : "badge-neutral"}`}>
            {isGerente ? "GERENTE" : "FUNCIONÁRIO"}
          </span>
        </motion.div>
      )}

      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "var(--space-4)" }}
      >
        <div>
          <h1 className="text-display-xs">{greeting}, {user?.nome || user?.login}!</h1>
          <p className="text-body" style={{ marginTop: "var(--space-1)" }}>Aqui está o resumo do seu negócio hoje</p>
        </div>
        <Link to={`/empresas/${id}/painel/estoque`} className="btn btn-primary">
          <Package size={18} /> Ver Estoque
        </Link>
      </motion.div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "var(--space-5)" }}>
        <StatCard title="Receita Estimada" value={formatCurrency(totalRevenue)} change={12.5} icon={<DollarSign size={24} />} />
        <StatCard title="Produtos" value={products.length} change={8.2} icon={<Package size={24} />} />
        <StatCard title="Marcas" value={brandData.length} change={5.1} icon={<TrendingUp size={24} />} />
      </div>

      {/* Main Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "var(--space-6)" }}>
        {/* Brand Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="card" style={{ padding: "var(--space-6)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-6)" }}>
            <h3 style={{ fontSize: "var(--text-body)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              <TrendingUp size={18} style={{ color: "var(--color-accent)" }} />
              Distribuição por Marca
            </h3>
            <span className="badge badge-neutral">{brandData.length} marcas</span>
          </div>

          {brandData.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><Package size={32} /></div>
              <p className="empty-description">Nenhum produto cadastrado</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={brandData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {brandData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} opacity={0.85} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-bg-elevated)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-md)",
                      color: "var(--color-text-primary)",
                      fontSize: "13px",
                      boxShadow: "var(--shadow-md)",
                    }}
                    formatter={(v) => [`${v} produto(s)`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", marginTop: "var(--space-4)" }}>
                {brandData.slice(0, 5).map((b) => (
                  <div key={b.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                      <span style={{ width: "10px", height: "10px", borderRadius: "var(--radius-full)", background: b.color }} />
                      <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-text-secondary)" }} className="truncate">{b.name}</span>
                    </div>
                    <span style={{ fontSize: "var(--text-body-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-primary)" }}>{b.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>

        {/* Top Products */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="card" style={{ padding: "var(--space-6)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-6)" }}>
            <h3 style={{ fontSize: "var(--text-body)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              <Package size={18} style={{ color: "var(--color-accent)" }} />
              Produtos em Destaque
            </h3>
            <Link to={`/empresas/${id}/painel/estoque`} style={{ fontSize: "var(--text-caption)", color: "var(--color-accent)", display: "flex", alignItems: "center", gap: "4px" }}>
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>

          {topProducts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><Package size={32} /></div>
              <p className="empty-description">Nenhum produto ainda</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {topProducts.map((p) => {
                const meta = p.marca ? BRAND_META[p.marca] : null;
                return (
                  <div key={p.id} style={{
                    display: "flex", alignItems: "center", gap: "var(--space-3)",
                    padding: "var(--space-3)", borderRadius: "var(--radius-md)",
                    transition: "background var(--duration-fast) var(--ease-out)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-bg-secondary)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{
                      width: "40px", height: "40px", borderRadius: "var(--radius-md)",
                      background: meta?.bg || "var(--color-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Dumbbell size={18} style={{ color: meta?.color || "var(--color-text-tertiary)" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-text-primary)" }} className="truncate">{p.descricao}</p>
                      <p style={{ fontSize: "var(--text-caption)", color: "var(--color-accent)" }}>{meta?.label ?? p.marca ?? "Sem marca"}</p>
                    </div>
                    <span className="price">{formatCurrency(getProductPrice(p))}</span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <RecentActivity items={recentActivity} />
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--space-4)" }}>
        {[
          { icon: <Package size={22} />, label: "Ver Estoque", to: `/empresas/${id}/painel/estoque` },
          { icon: <ShoppingBag size={22} />, label: "Meu Perfil", to: `/empresas/${id}/painel/perfil` },
          { icon: <Activity size={22} />, label: "Voltar às Empresas", to: "/empresas" },
        ].map((action, i) => (
          <Link
            key={i}
            to={action.to}
            className="card card-hover"
            style={{
              padding: "var(--space-5)", display: "flex", alignItems: "center", gap: "var(--space-4)", cursor: "pointer",
            }}
          >
            <div style={{
              width: "48px", height: "48px", borderRadius: "var(--radius-md)",
              background: "var(--color-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--color-text-tertiary)", transition: "all var(--duration-fast) var(--ease-out)",
            }}>
              {action.icon}
            </div>
            <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-text-secondary)" }}>{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
