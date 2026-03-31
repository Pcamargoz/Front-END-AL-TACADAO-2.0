import { useQuery } from "@tanstack/react-query";
import { Truck, Package, Users, TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { apiListFornecedores, apiListEstoque, apiListUsuarios } from "../api/client";
import { AnimatedCounter } from "../components/ui/AnimatedCounter";
import { BRAND_META } from "../lib/utils";
import { useAuth } from "../auth/AuthContext";
import { motion } from "framer-motion";

const STATS_DEFS = [
  {
    key: "fornecedores",
    label: "Fornecedores",
    icon: Truck,
    color: "#00f0ff",
    cardColor: "rgba(0,240,255,0.07)",
    desc: "cadastrados",
  },
  {
    key: "produtos",
    label: "Produtos",
    icon: Package,
    color: "#a78bfa",
    cardColor: "rgba(167,139,250,0.07)",
    desc: "em estoque",
  },
  {
    key: "usuarios",
    label: "Usuários",
    icon: Users,
    color: "#10b981",
    cardColor: "rgba(16,185,129,0.07)",
    desc: "no sistema",
  },
  {
    key: "marcas",
    label: "Marcas",
    icon: TrendingUp,
    color: "#f59e0b",
    cardColor: "rgba(245,158,11,0.07)",
    desc: "diferentes",
  },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item      = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export function DashboardPage() {
  const { user } = useAuth();

  const { data: fornecedores = [] } = useQuery({
    queryKey: ["fornecedores"],
    queryFn: apiListFornecedores,
  });
  const { data: produtos = [] } = useQuery({
    queryKey: ["estoque"],
    queryFn: apiListEstoque,
  });
  const { data: usuarios = [] } = useQuery({
    queryKey: ["usuarios"],
    queryFn: apiListUsuarios,
  });

  // Brand distribution
  const brandCount: Record<string, number> = {};
  produtos.forEach((p) => {
    if (p.marca) brandCount[p.marca] = (brandCount[p.marca] || 0) + 1;
  });
  const brandData = Object.entries(brandCount)
    .map(([brand, count]) => ({
      name: BRAND_META[brand]?.label ?? brand,
      value: count,
      color: BRAND_META[brand]?.color ?? "#64748b",
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const marcasUnicas = Object.keys(brandCount).length;

  const statsValues: Record<string, number> = {
    fornecedores: fornecedores.length,
    produtos: produtos.length,
    usuarios: usuarios.length,
    marcas: marcasUnicas,
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  return (
    <div className="page-container min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-xs text-slate-600 uppercase tracking-widest mb-1">{greeting},</p>
        <h1 className="text-2xl font-bold text-slate-100">
          {user?.nome || user?.login}{" "}
          <span className="gradient-text">👋</span>
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Visão geral do sistema NUCLEUS</p>
      </motion.div>

      {/* Stat Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-6"
      >
        {STATS_DEFS.map(({ key, label, icon: Icon, color, cardColor, desc }) => (
          <motion.div
            key={key}
            variants={item}
            className="stat-card glass glass-hover rounded-2xl cursor-default"
            style={{ "--card-color": cardColor } as React.CSSProperties}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: cardColor, border: `1px solid ${color}22` }}
              >
                <Icon size={20} style={{ color }} />
              </div>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ color, background: `${color}15` }}>
                live
              </span>
            </div>
            <AnimatedCounter
              to={statsValues[key] ?? 0}
              className="text-3xl font-bold text-slate-100 block mb-1"
            />
            <p className="text-xs text-slate-500">{label} <span style={{ color }}>{desc}</span></p>
          </motion.div>
        ))}
      </motion.div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Brand Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-1 glass rounded-2xl p-5"
          style={{ border: "1px solid rgba(139,92,246,0.12)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-300">Marcas no Estoque</h2>
            <span className="badge" style={{ background: "rgba(139,92,246,0.12)", color: "#a78bfa" }}>
              {brandData.length} marcas
            </span>
          </div>

          {brandData.length === 0 ? (
            <div className="empty-state">
              <Package size={32} />
              <p className="text-sm mt-2">Sem produtos cadastrados</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={brandData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {brandData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} opacity={0.85} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#12152a",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "8px",
                      color: "#e2e8f0",
                      fontSize: "12px",
                    }}
                    formatter={(v) => [`${v} produto(s)`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {brandData.slice(0, 5).map((b) => (
                  <div key={b.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: b.color }} />
                      <span className="text-xs text-slate-400 truncate max-w-[120px]">{b.name}</span>
                    </div>
                    <span className="text-xs font-semibold" style={{ color: b.color }}>{b.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>

        {/* Recent Fornecedores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass rounded-2xl p-5"
          style={{ border: "1px solid rgba(0,240,255,0.08)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-300">Fornecedores Recentes</h2>
            <Link to="/fornecedores" className="text-xs flex items-center gap-1 text-cyan-400/70 hover:text-cyan-400 transition-colors">
              Ver todos <ArrowRight size={12} />
            </Link>
          </div>
          {fornecedores.length === 0 ? (
            <div className="empty-state">
              <Truck size={32} />
              <p className="text-sm mt-2">Nenhum fornecedor</p>
            </div>
          ) : (
            <div className="space-y-2">
              {fornecedores.slice(0, 6).map((f) => (
                <div key={f.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl transition-all hover:bg-white/3"
                  style={{ border: "1px solid transparent" }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: "rgba(0,240,255,0.08)", color: "#00f0ff" }}>
                    {(f.nomeFantasia || f.razaoSocial).charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden flex-1">
                    <p className="text-sm text-slate-300 truncate">{f.nomeFantasia || f.razaoSocial}</p>
                    <p className="text-xs text-slate-600 truncate">{f.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Produtos */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-5"
          style={{ border: "1px solid rgba(167,139,250,0.08)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-300">Últimos Produtos</h2>
            <Link to="/estoque" className="text-xs flex items-center gap-1 text-violet-400/70 hover:text-violet-400 transition-colors">
              Ver todos <ArrowRight size={12} />
            </Link>
          </div>
          {produtos.length === 0 ? (
            <div className="empty-state">
              <Package size={32} />
              <p className="text-sm mt-2">Nenhum produto</p>
            </div>
          ) : (
            <div className="space-y-2">
              {produtos.slice(-6).reverse().map((p) => {
                const meta = p.marca ? BRAND_META[p.marca] : null;
                return (
                  <div key={p.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl transition-all hover:bg-white/3"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: meta?.bg ?? "rgba(100,116,139,0.12)",
                        border: `1px solid ${meta?.color ?? "#64748b"}22`,
                      }}>
                      <Package size={14} style={{ color: meta?.color ?? "#64748b" }} />
                    </div>
                    <div className="overflow-hidden flex-1">
                      <p className="text-sm text-slate-300 truncate">{p.descricao}</p>
                      <p className="text-xs truncate" style={{ color: meta?.color ?? "#64748b" }}>
                        {meta?.label ?? p.marca ?? "Sem marca"}
                      </p>
                    </div>
                    {p.medida != null && (
                      <span className="text-xs text-slate-500 flex-shrink-0">{p.medida}g</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
