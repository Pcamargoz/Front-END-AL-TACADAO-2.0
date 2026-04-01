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
  { key: "suppliers", label: "Suppliers",  icon: Truck,       tint: "rgba(232,160,32,0.05)", color: "#E8A020", desc: "registered"  },
  { key: "products",  label: "Products",   icon: Package,     tint: "rgba(99,102,241,0.05)", color: "#818CF8", desc: "in stock"    },
  { key: "users",     label: "Users",      icon: Users,       tint: "rgba(34,197,94,0.05)",  color: "#22C55E", desc: "in system"   },
  { key: "brands",    label: "Brands",     icon: TrendingUp,  tint: "rgba(236,72,153,0.05)", color: "#EC4899", desc: "unique"      },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item      = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

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

  const statsValues: Record<string, number> = {
    suppliers: suppliers.length,
    products:  products.length,
    users:     users.length,
    brands:    Object.keys(brandCount).length,
  };

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="page-container min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <p className="page-eyebrow">{greeting}</p>
        <h1 className="page-title">{user?.nome || user?.login}</h1>
        <p className="page-subtitle">System overview</p>
      </motion.div>

      {/* Stat Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-6"
      >
        {STATS_DEFS.map(({ key, label, icon: Icon, tint, color, desc }) => (
          <motion.div
            key={key}
            variants={item}
            className="stat-card card card-hover cursor-default"
            style={{ "--card-tint": tint } as React.CSSProperties}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: tint, border: `1px solid ${color}1A` }}
              >
                <Icon size={17} style={{ color }} />
              </div>
              <span
                className="badge"
                style={{ background: `${color}12`, color, border: `1px solid ${color}20` }}
              >
                live
              </span>
            </div>
            <AnimatedCounter
              to={statsValues[key] ?? 0}
              className="stat-value block mb-1"
            />
            <p style={{ fontSize: "0.78rem", color: "#52525B" }}>
              {label}{" "}
              <span style={{ color }}>{desc}</span>
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Brand Chart */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.28, duration: 0.35 }}
          className="lg:col-span-1 card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ fontSize: "0.85rem", fontWeight: 600, color: "#A1A1AA" }}>
              Brand distribution
            </h2>
            <span className="badge" style={{ background: "rgba(129,140,248,0.10)", color: "#818CF8" }}>
              {brandData.length} brands
            </span>
          </div>

          {brandData.length === 0 ? (
            <div className="empty-state">
              <Package size={28} />
              <p style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>No products registered</p>
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
                      background: "#1C1C20", border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: "7px", color: "#EFEFEF", fontSize: "12px",
                    }}
                    formatter={(v) => [`${v} product(s)`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {brandData.slice(0, 5).map((b) => (
                  <div key={b.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: b.color }} />
                      <span style={{ fontSize: "0.78rem", color: "#6B6B74" }} className="truncate max-w-[120px]">{b.name}</span>
                    </div>
                    <span style={{ fontSize: "0.78rem", fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, color: b.color }}>
                      {b.value}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>

        {/* Recent Suppliers */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.33, duration: 0.35 }}
          className="card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ fontSize: "0.85rem", fontWeight: 600, color: "#A1A1AA" }}>Recent suppliers</h2>
            <Link
              to="/suppliers"
              className="flex items-center gap-1 transition-colors"
              style={{ fontSize: "0.78rem", color: "#52525B" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#E8A020")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#52525B")}
            >
              View all <ArrowRight size={11} />
            </Link>
          </div>
          {suppliers.length === 0 ? (
            <div className="empty-state">
              <Truck size={28} />
              <p style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>No suppliers yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {suppliers.slice(0, 6).map((f) => (
                <div key={f.id} className="flex items-center gap-3 p-2 rounded-lg transition-colors"
                  style={{ cursor: "default" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: "rgba(232,160,32,0.08)", color: "#E8A020" }}>
                    {(f.nomeFantasia || f.razaoSocial).charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden flex-1">
                    <p className="truncate" style={{ fontSize: "0.85rem", color: "#A1A1AA", fontWeight: 500 }}>
                      {f.nomeFantasia || f.razaoSocial}
                    </p>
                    <p className="truncate" style={{ fontSize: "0.75rem", color: "#3C3C44" }}>{f.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Products */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.38, duration: 0.35 }}
          className="card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ fontSize: "0.85rem", fontWeight: 600, color: "#A1A1AA" }}>Latest products</h2>
            <Link
              to="/inventory"
              className="flex items-center gap-1 transition-colors"
              style={{ fontSize: "0.78rem", color: "#52525B" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#818CF8")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#52525B")}
            >
              View all <ArrowRight size={11} />
            </Link>
          </div>
          {products.length === 0 ? (
            <div className="empty-state">
              <Package size={28} />
              <p style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>No products yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {products.slice(-6).reverse().map((p) => {
                const meta = p.marca ? BRAND_META[p.marca] : null;
                return (
                  <div key={p.id}
                    className="flex items-center gap-3 p-2 rounded-lg transition-colors"
                    style={{ cursor: "default" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{ background: meta?.bg ?? "rgba(100,116,139,0.10)" }}>
                      <Package size={13} style={{ color: meta?.color ?? "#52525B" }} />
                    </div>
                    <div className="overflow-hidden flex-1">
                      <p className="truncate" style={{ fontSize: "0.85rem", color: "#A1A1AA", fontWeight: 500 }}>
                        {p.descricao}
                      </p>
                      <p className="truncate" style={{ fontSize: "0.75rem", color: meta?.color ?? "#3C3C44" }}>
                        {meta?.label ?? p.marca ?? "No brand"}
                      </p>
                    </div>
                    {p.medida != null && (
                      <span style={{ fontSize: "0.72rem", color: "#3C3C44", fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>
                        {p.medida}g
                      </span>
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
