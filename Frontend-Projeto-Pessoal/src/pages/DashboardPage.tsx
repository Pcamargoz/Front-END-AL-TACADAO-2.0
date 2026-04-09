import { useQuery } from "@tanstack/react-query";
import {
  Package,
  TrendingUp,
  ArrowRight,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Clock,
  ShoppingBag,
  Dumbbell,
  Building2,
  Users,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { motion } from "framer-motion";
import { apiListEstoque, type Produto } from "../api/client";
import { BRAND_META, formatCurrency, getMockPrice } from "../lib/utils";
import { useAuth } from "../auth/AuthContext";
import { useFornecedor } from "../context/FornecedorContext";

function getProductPrice(p: Produto): number {
  return p.preco ?? getMockPrice(p.id);
}

// ── Motion presets ──────────────────────────────────────────────────────
const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};
const smooth = { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const };

// ── Stat Card (editorial, big tabular numerals) ────────────────────────
interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  accent?: "emerald" | "blue" | "amber";
  delay?: number;
}

function StatCard({ title, value, change, icon, accent = "emerald", delay = 0 }: StatCardProps) {
  const isPositive = change !== undefined && change > 0;
  const accentMap = {
    emerald: "var(--color-accent)",
    blue: "var(--color-accent-blue)",
    amber: "var(--color-accent-amber)",
  } as const;
  const bgMap = {
    emerald: "var(--color-accent-subtle)",
    blue: "var(--color-accent-blue-subtle)",
    amber: "var(--color-accent-amber-subtle)",
  } as const;

  return (
    <motion.div
      {...fadeUp}
      transition={{ ...smooth, delay }}
      whileHover={{ y: -3 }}
      style={{
        position: "relative",
        padding: "28px",
        borderRadius: "var(--radius-2xl)",
        background: "var(--color-bg-card)",
        border: "1px solid var(--color-border)",
        boxShadow: "0 1px 2px rgba(15,17,21,0.04)",
        overflow: "hidden",
        transition: "border-color 0.3s ease, box-shadow 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow =
          "0 24px 48px -24px rgba(15,17,21,0.18), 0 0 0 1px " + accentMap[accent];
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 1px 2px rgba(15,17,21,0.04)";
      }}
    >
      {/* Glow corner */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "-50px",
          right: "-50px",
          width: "160px",
          height: "160px",
          borderRadius: "50%",
          background: accentMap[accent],
          opacity: 0.08,
          filter: "blur(30px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "28px",
          position: "relative",
        }}
      >
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "var(--radius-lg)",
            background: bgMap[accent],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: accentMap[accent],
          }}
        >
          {icon}
        </div>
        {change !== undefined && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 10px",
              borderRadius: "var(--radius-pill)",
              background: isPositive
                ? "rgba(4,120,87,0.10)"
                : "rgba(185,28,28,0.10)",
              color: isPositive ? "var(--color-success)" : "var(--color-error)",
              fontSize: "11px",
              fontWeight: "var(--weight-semibold)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(change)}%
          </div>
        )}
      </div>

      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(30px, 4vw, 42px)",
          fontWeight: "var(--weight-semibold)",
          color: "var(--color-text)",
          letterSpacing: "var(--tracking-tighter)",
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
          marginBottom: "10px",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: "12px",
          fontWeight: "var(--weight-medium)",
          color: "var(--color-text-tertiary)",
          letterSpacing: "var(--tracking-wider)",
          textTransform: "uppercase",
        }}
      >
        {title}
      </div>
    </motion.div>
  );
}

// ── Section Title ──────────────────────────────────────────────────────
function SectionTitle({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        marginBottom: "20px",
        gap: "16px",
      }}
    >
      <div>
        {eyebrow && (
          <div
            style={{
              fontSize: "11px",
              fontWeight: "var(--weight-semibold)",
              color: "var(--color-accent)",
              letterSpacing: "var(--tracking-widest)",
              textTransform: "uppercase",
              marginBottom: "6px",
            }}
          >
            {eyebrow}
          </div>
        )}
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-title-sm)",
            fontWeight: "var(--weight-semibold)",
            color: "var(--color-text)",
            letterSpacing: "var(--tracking-tight)",
            lineHeight: 1.15,
          }}
        >
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const { nome: fornecedorNome, isGerente, role } = useFornecedor();
  const { id } = useParams();

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["estoque"],
    queryFn: () => apiListEstoque(),
  });
  const products: Produto[] = productsData?.content ?? [];

  const brandCount: Record<string, number> = {};
  products.forEach((p) => {
    if (p.marca) brandCount[p.marca] = (brandCount[p.marca] || 0) + 1;
  });

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

  const recentActivity = [
    { id: "1", title: "Novo produto cadastrado: Whey Protein", timestamp: "Há 2 horas", icon: <Package size={14} /> },
    { id: "2", title: "Estoque atualizado: Creatina", timestamp: "Há 4 horas", icon: <Package size={14} /> },
    { id: "3", title: "Pedido #1234 finalizado", timestamp: "Há 6 horas", icon: <ShoppingBag size={14} /> },
    { id: "4", title: "Novo produto: BCAA", timestamp: "Há 8 horas", icon: <Package size={14} /> },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  const firstName = (user?.nome || user?.login || "").split(" ")[0];

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", position: "relative" }}>
      {/* Gradient mesh backdrop */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(55% 40% at 80% 0%, var(--color-accent-subtle) 0%, transparent 60%),
            radial-gradient(45% 30% at 10% 10%, rgba(29,78,216,0.07) 0%, transparent 60%)
          `,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          maxWidth: "var(--container-wide)",
          margin: "0 auto",
          padding: "clamp(40px,6vw,72px) var(--container-padding) 96px",
          display: "flex",
          flexDirection: "column",
          gap: "clamp(40px,5vw,56px)",
        }}
      >
        {/* ─── HERO ─────────────────────────────────────────────── */}
        <motion.header {...fadeUp} transition={smooth}>
          {/* Chip empresa */}
          {fornecedorNome && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 14px 8px 10px",
                borderRadius: "var(--radius-pill)",
                background: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border)",
                marginBottom: "24px",
                boxShadow: "0 1px 2px rgba(15,17,21,0.04)",
              }}
            >
              <div
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg,#047857 0%,#10B981 50%,#34D399 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Building2 size={11} style={{ color: "#fff" }} />
              </div>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "var(--weight-medium)",
                  color: "var(--color-text)",
                }}
              >
                {fornecedorNome}
              </span>
              <span
                style={{
                  width: "1px",
                  height: "12px",
                  background: "var(--color-border)",
                }}
              />
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: "var(--weight-semibold)",
                  color: isGerente ? "var(--color-accent)" : "var(--color-text-tertiary)",
                  letterSpacing: "var(--tracking-widest)",
                  textTransform: "uppercase",
                }}
              >
                {role ?? "—"}
              </span>
            </motion.div>
          )}

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: "32px",
            }}
          >
            <div style={{ maxWidth: "720px" }}>
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-headline)",
                  fontWeight: "var(--weight-semibold)",
                  lineHeight: "var(--leading-tight)",
                  letterSpacing: "var(--tracking-tighter)",
                  color: "var(--color-text)",
                  marginBottom: "14px",
                }}
              >
                {greeting},{" "}
                <span style={{ color: "var(--color-accent)" }}>{firstName || "você"}</span>.
              </h1>
              <p
                style={{
                  fontSize: "var(--text-body-lg)",
                  lineHeight: "var(--leading-relaxed)",
                  color: "var(--color-text-secondary)",
                }}
              >
                Aqui está um panorama do seu negócio hoje.
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
              <Link to={`/empresas/${id}/painel/usuarios`} className="btn btn-ghost">
                <Users size={16} /> Usuários
              </Link>
              <Link to={`/empresas/${id}/painel/estoque`} className="btn btn-primary">
                <Package size={16} /> Ver estoque
              </Link>
            </div>
          </div>
        </motion.header>

        {/* ─── STATS ────────────────────────────────────────────── */}
        <section>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "20px",
            }}
          >
            <StatCard
              title="Receita estimada"
              value={isLoading ? "—" : formatCurrency(totalRevenue)}
              change={12.5}
              icon={<DollarSign size={20} />}
              accent="emerald"
              delay={0.05}
            />
            <StatCard
              title="Produtos em estoque"
              value={isLoading ? "—" : products.length}
              change={8.2}
              icon={<Package size={20} />}
              accent="blue"
              delay={0.1}
            />
            <StatCard
              title="Marcas ativas"
              value={isLoading ? "—" : brandData.length}
              change={5.1}
              icon={<TrendingUp size={20} />}
              accent="amber"
              delay={0.15}
            />
          </div>
        </section>

        {/* ─── GRID PRINCIPAL ──────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "24px",
          }}
        >
          {/* ── Distribuição por marca ────────────────────── */}
          <motion.div
            {...fadeUp}
            transition={{ ...smooth, delay: 0.2 }}
            className="card"
            style={{
              padding: "28px",
              borderRadius: "var(--radius-2xl)",
              background: "var(--color-bg-card)",
              border: "1px solid var(--color-border)",
              boxShadow: "0 1px 2px rgba(15,17,21,0.04)",
            }}
          >
            <SectionTitle
              eyebrow="Portfolio"
              title="Distribuição por marca"
              action={
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "var(--weight-semibold)",
                    color: "var(--color-text-tertiary)",
                    letterSpacing: "var(--tracking-widest)",
                    textTransform: "uppercase",
                  }}
                >
                  {brandData.length} {brandData.length === 1 ? "marca" : "marcas"}
                </span>
              }
            />

            {brandData.length === 0 ? (
              <div
                style={{
                  padding: "48px 0",
                  textAlign: "center",
                  color: "var(--color-text-tertiary)",
                  fontSize: "13px",
                }}
              >
                <Package size={28} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
                <p>Nenhum produto cadastrado ainda.</p>
              </div>
            ) : (
              <>
                <div style={{ position: "relative" }}>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={brandData}
                        cx="50%"
                        cy="50%"
                        innerRadius={62}
                        outerRadius={92}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="var(--color-bg-card)"
                        strokeWidth={3}
                      >
                        {brandData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "var(--color-bg-elevated)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "var(--radius-md)",
                          color: "var(--color-text)",
                          fontSize: "12px",
                          boxShadow: "0 20px 40px -12px rgba(15,17,21,0.2)",
                          padding: "8px 12px",
                        }}
                        formatter={(v) => [`${v} produto(s)`, ""]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Centro do donut: total */}
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%,-50%)",
                      textAlign: "center",
                      pointerEvents: "none",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "28px",
                        fontWeight: "var(--weight-semibold)",
                        color: "var(--color-text)",
                        lineHeight: 1,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {products.length}
                    </div>
                    <div
                      style={{
                        fontSize: "9px",
                        color: "var(--color-text-tertiary)",
                        letterSpacing: "var(--tracking-widest)",
                        textTransform: "uppercase",
                        marginTop: "4px",
                      }}
                    >
                      Produtos
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    marginTop: "20px",
                    paddingTop: "20px",
                    borderTop: "1px solid var(--color-border)",
                  }}
                >
                  {brandData.slice(0, 5).map((b) => {
                    const pct = ((b.value / products.length) * 100).toFixed(0);
                    return (
                      <div
                        key={b.name}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "12px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            minWidth: 0,
                            flex: 1,
                          }}
                        >
                          <span
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              background: b.color,
                              flexShrink: 0,
                            }}
                          />
                          <span
                            className="truncate"
                            style={{
                              fontSize: "13px",
                              color: "var(--color-text-secondary)",
                            }}
                          >
                            {b.name}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "11px",
                              color: "var(--color-text-tertiary)",
                            }}
                          >
                            {pct}%
                          </span>
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: "var(--weight-semibold)",
                              color: "var(--color-text)",
                              minWidth: "20px",
                              textAlign: "right",
                            }}
                          >
                            {b.value}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </motion.div>

          {/* ── Produtos em destaque ───────────────────────── */}
          <motion.div
            {...fadeUp}
            transition={{ ...smooth, delay: 0.25 }}
            className="card"
            style={{
              padding: "28px",
              borderRadius: "var(--radius-2xl)",
              background: "var(--color-bg-card)",
              border: "1px solid var(--color-border)",
              boxShadow: "0 1px 2px rgba(15,17,21,0.04)",
            }}
          >
            <SectionTitle
              eyebrow="Top picks"
              title="Produtos em destaque"
              action={
                <Link
                  to={`/empresas/${id}/painel/estoque`}
                  style={{
                    fontSize: "12px",
                    fontWeight: "var(--weight-medium)",
                    color: "var(--color-accent)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    textDecoration: "none",
                  }}
                >
                  Ver todos <ArrowRight size={13} />
                </Link>
              }
            />

            {topProducts.length === 0 ? (
              <div
                style={{
                  padding: "48px 0",
                  textAlign: "center",
                  color: "var(--color-text-tertiary)",
                  fontSize: "13px",
                }}
              >
                <Package size={28} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
                <p>Nenhum produto ainda.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {topProducts.map((p, i) => {
                  const meta = p.marca ? BRAND_META[p.marca] : null;
                  return (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.05, duration: 0.4 }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        padding: "12px 10px",
                        borderRadius: "var(--radius-md)",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "var(--color-bg-secondary)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <div
                        style={{
                          width: "42px",
                          height: "42px",
                          borderRadius: "var(--radius-md)",
                          background: meta?.bg || "var(--color-bg-secondary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Dumbbell
                          size={18}
                          style={{ color: meta?.color || "var(--color-text-tertiary)" }}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          className="truncate"
                          style={{
                            fontSize: "13px",
                            fontWeight: "var(--weight-medium)",
                            color: "var(--color-text)",
                          }}
                        >
                          {p.descricao}
                        </p>
                        <p
                          style={{
                            fontSize: "11px",
                            color: "var(--color-text-tertiary)",
                            letterSpacing: "var(--tracking-wide)",
                            marginTop: "2px",
                          }}
                        >
                          {meta?.label ?? p.marca ?? "Sem marca"}
                        </p>
                      </div>
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: "var(--weight-semibold)",
                          color: "var(--color-text)",
                          fontVariantNumeric: "tabular-nums",
                          fontFamily: "var(--font-display)",
                        }}
                      >
                        {formatCurrency(getProductPrice(p))}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* ── Atividade recente ──────────────────────────── */}
          <motion.div
            {...fadeUp}
            transition={{ ...smooth, delay: 0.3 }}
            className="card"
            style={{
              padding: "28px",
              borderRadius: "var(--radius-2xl)",
              background: "var(--color-bg-card)",
              border: "1px solid var(--color-border)",
              boxShadow: "0 1px 2px rgba(15,17,21,0.04)",
            }}
          >
            <SectionTitle
              eyebrow="Timeline"
              title="Atividade recente"
              action={<Activity size={16} style={{ color: "var(--color-accent)" }} />}
            />

            <div
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              {/* Linha vertical */}
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  left: "18px",
                  top: "12px",
                  bottom: "12px",
                  width: "1px",
                  background: "var(--color-border)",
                }}
              />
              {recentActivity.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.05, duration: 0.4 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    padding: "10px 0",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: "var(--color-bg-card)",
                      border: "1px solid var(--color-border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--color-text-tertiary)",
                      flexShrink: 0,
                      zIndex: 1,
                    }}
                  >
                    {item.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      className="truncate"
                      style={{
                        fontSize: "13px",
                        color: "var(--color-text)",
                        fontWeight: "var(--weight-medium)",
                      }}
                    >
                      {item.title}
                    </p>
                    <p
                      style={{
                        fontSize: "11px",
                        color: "var(--color-text-tertiary)",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        marginTop: "2px",
                      }}
                    >
                      <Clock size={11} /> {item.timestamp}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ─── QUICK ACTIONS ────────────────────────────────────── */}
        <section>
          <SectionTitle eyebrow="Atalhos" title="Ações rápidas" />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "16px",
            }}
          >
            {[
              {
                icon: <Package size={20} />,
                label: "Gerenciar estoque",
                desc: "Produtos, marcas e preços",
                to: `/empresas/${id}/painel/estoque`,
              },
              {
                icon: <Users size={20} />,
                label: "Usuários da empresa",
                desc: "Gerentes e funcionários",
                to: `/empresas/${id}/painel/usuarios`,
              },
              {
                icon: <ShoppingBag size={20} />,
                label: "Perfil da empresa",
                desc: "Dados e informações",
                to: `/empresas/${id}/painel/perfil`,
              },
              {
                icon: <Building2 size={20} />,
                label: "Trocar de empresa",
                desc: "Voltar para a lista",
                to: "/empresas",
              },
            ].map((action, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ ...smooth, delay: 0.35 + i * 0.05 }}
                whileHover={{ y: -3 }}
              >
                <Link
                  to={action.to}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    padding: "20px",
                    borderRadius: "var(--radius-xl)",
                    background: "var(--color-bg-card)",
                    border: "1px solid var(--color-border)",
                    boxShadow: "0 1px 2px rgba(15,17,21,0.04)",
                    textDecoration: "none",
                    transition: "border-color 0.25s ease, box-shadow 0.25s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--color-accent-muted)";
                    e.currentTarget.style.boxShadow =
                      "0 16px 32px -16px rgba(15,17,21,0.14)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--color-border)";
                    e.currentTarget.style.boxShadow = "0 1px 2px rgba(15,17,21,0.04)";
                  }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "var(--radius-lg)",
                      background: "var(--color-accent-subtle)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--color-accent)",
                      flexShrink: 0,
                    }}
                  >
                    {action.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: "var(--weight-semibold)",
                        color: "var(--color-text)",
                        letterSpacing: "var(--tracking-tight)",
                      }}
                    >
                      {action.label}
                    </p>
                    <p
                      style={{
                        fontSize: "11px",
                        color: "var(--color-text-tertiary)",
                        marginTop: "2px",
                      }}
                    >
                      {action.desc}
                    </p>
                  </div>
                  <ArrowRight
                    size={16}
                    style={{ color: "var(--color-text-tertiary)", flexShrink: 0 }}
                  />
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
