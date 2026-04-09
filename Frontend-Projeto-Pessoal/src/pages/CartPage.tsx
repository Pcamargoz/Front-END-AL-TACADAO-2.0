import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Trash2, Minus, Plus, ArrowRight, Package, Dumbbell, Tag, Truck, ShieldCheck } from "lucide-react";
import { useCart } from "../hooks/useCart";
import { BRAND_META, formatCurrency } from "../lib/utils";

export function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="page-wrapper" style={{ minHeight: "100vh", background: "var(--color-bg-primary)" }}>
        <div className="container" style={{ maxWidth: "32rem", paddingTop: "5rem", paddingBottom: "5rem", margin: "0 auto", textAlign: "center" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}>
            <div style={{ width: "80px", height: "80px", margin: "0 auto 24px", borderRadius: "16px", background: "var(--color-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShoppingBag size={36} style={{ color: "var(--color-text-tertiary)" }} />
            </div>
            <h1 className="text-headline" style={{ marginBottom: "12px", color: "var(--color-text-primary)" }}>Seu carrinho está vazio</h1>
            <p className="text-body" style={{ color: "var(--color-text-secondary)", marginBottom: "32px" }}>Explore nosso catálogo e encontre os melhores suplementos para você.</p>
            <Link to="/produtos" className="btn btn-primary" style={{ display: "inline-flex" }}>
              <Package size={18} /> Explorar produtos
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper" style={{ minHeight: "100vh", background: "var(--color-bg-primary)" }}>
      {/* Header */}
      <div style={{ background: "var(--color-bg-secondary)", borderBottom: "1px solid var(--color-border)" }}>
        <div className="container" style={{ paddingTop: "48px", paddingBottom: "48px", maxWidth: "var(--container-wide)", margin: "0 auto", paddingLeft: "var(--container-padding)", paddingRight: "var(--container-padding)" }}>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}>
            <span style={{ fontSize: "12px", fontWeight: "var(--font-weight-medium)", color: "var(--color-accent)", letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", marginBottom: "8px", display: "block" }}>
              Carrinho
            </span>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h1 className="text-headline" style={{ color: "var(--color-text-primary)" }}>Seu Pedido</h1>
              <button onClick={clearCart} style={{ fontSize: "14px", color: "var(--color-text-secondary)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-error)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--color-text-secondary)"}>
                <Trash2 size={16} /> Limpar tudo
              </button>
            </div>
            <p className="text-body" style={{ color: "var(--color-text-secondary)", marginTop: "8px" }}>
              {totalItems} {totalItems === 1 ? "item" : "itens"} no carrinho
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container" style={{ maxWidth: "var(--container-wide)", margin: "0 auto", paddingTop: "clamp(32px, 5vw, 48px)", paddingBottom: "clamp(32px, 5vw, 48px)", paddingLeft: "var(--container-padding)", paddingRight: "var(--container-padding)" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(32px, 5vw, 48px)" }}>
          {/* Cart Items */}
          <div style={{ flex: "1 1 60%", display: "flex", flexDirection: "column", gap: "16px" }}>
            <AnimatePresence mode="popLayout">
              {items.map((item, index) => {
                const meta = item.product.marca ? BRAND_META[item.product.marca] : null;
                return (
                  <motion.div key={item.product.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20, height: 0 }} transition={{ duration: 0.4, delay: index * 0.05, ease: [0.25, 0.1, 0.25, 1] }} className="card" style={{ padding: "20px", display: "flex", gap: "20px" }}>
                    {/* Image */}
                    <Link to={`/produtos/${item.product.id}`} style={{ width: "96px", height: "96px", borderRadius: "12px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-bg-secondary)", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-bg-tertiary)"} onMouseLeave={(e) => e.currentTarget.style.background = "var(--color-bg-secondary)"}>
                      <Dumbbell size={32} style={{ color: "var(--color-text-tertiary)" }} />
                    </Link>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
                        <div>
                          {meta && <span style={{ fontSize: "12px", fontWeight: "var(--font-weight-medium)", color: "var(--color-accent)", marginBottom: "4px", display: "block" }}>{meta.label}</span>}
                          <Link to={`/produtos/${item.product.id}`} style={{ textDecoration: "none" }}>
                            <h3 className="line-clamp-2" style={{ fontSize: "16px", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-primary)", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-accent)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--color-text-primary)"}>{item.product.descricao}</h3>
                          </Link>
                          {item.product.medida && <p style={{ fontSize: "12px", color: "var(--color-text-tertiary)", marginTop: "4px" }}>{item.product.medida}g</p>}
                        </div>
                        <button onClick={() => removeItem(item.product.id)} style={{ color: "var(--color-text-tertiary)", background: "none", border: "none", cursor: "pointer", padding: "6px", borderRadius: "8px", transition: "all 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-error)"; e.currentTarget.style.background = "var(--color-bg-secondary)"; }} onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-text-tertiary)"; e.currentTarget.style.background = "none"; }} aria-label="Remover item">
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "space-between", marginTop: "16px" }}>
                        {/* Quantity */}
                        <div style={{ display: "flex", alignItems: "center", background: "var(--color-bg-secondary)", borderRadius: "12px" }}>
                          <button onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))} style={{ width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-secondary)", background: "none", border: "none", cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-text-primary)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--color-text-secondary)"} aria-label="Diminuir quantidade"><Minus size={16} /></button>
                          <span style={{ width: "40px", textAlign: "center", fontSize: "16px", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-primary)" }}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} style={{ width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-secondary)", background: "none", border: "none", cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-text-primary)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--color-text-secondary)"} aria-label="Aumentar quantidade"><Plus size={16} /></button>
                        </div>
                        {/* Price */}
                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontSize: "18px", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)", display: "block" }}>{formatCurrency(item.price * item.quantity)}</span>
                          {item.quantity > 1 && <p style={{ fontSize: "12px", color: "var(--color-text-tertiary)" }}>{item.quantity}x {formatCurrency(item.price)}</p>}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div style={{ flex: "1 1 30%", minWidth: "300px" }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="card" style={{ padding: "24px", position: "sticky", top: "96px" }}>
              <h2 className="text-title" style={{ color: "var(--color-text-primary)", marginBottom: "24px" }}>Resumo do Pedido</h2>

              {/* Coupon */}
              <div style={{ marginBottom: "24px" }}>
                <label className="input-label" style={{ marginBottom: "8px", display: "block" }}>Cupom de desconto</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <div style={{ position: "relative", flex: 1 }}>
                    <Tag size={16} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-tertiary)" }} />
                    <input type="text" placeholder="CODIGO10" className="input-field" style={{ paddingLeft: "44px", fontSize: "14px" }} />
                  </div>
                  <button className="btn btn-secondary btn-sm" style={{ padding: "0 16px" }}>Aplicar</button>
                </div>
              </div>

              {/* Price Breakdown */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                  <span style={{ color: "var(--color-text-secondary)" }}>Subtotal ({totalItems} itens)</span>
                  <span style={{ color: "var(--color-text-primary)", fontWeight: "var(--font-weight-medium)" }}>{formatCurrency(totalPrice)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                  <span style={{ color: "var(--color-text-secondary)" }}>Frete</span>
                  <span style={{ color: "var(--color-success)", fontWeight: "var(--font-weight-medium)" }}>Grátis</span>
                </div>
                <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "16px", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "16px", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-primary)" }}>Total</span>
                  <span className="text-title" style={{ color: "var(--color-accent)", fontWeight: "var(--font-weight-semibold)" }}>{formatCurrency(totalPrice)}</span>
                </div>
              </div>

              <Link to="/checkout" className="btn btn-primary" style={{ width: "100%", marginBottom: "12px" }}>
                Finalizar Pedido <ArrowRight size={18} />
              </Link>

              <Link to="/produtos" className="btn btn-ghost" style={{ width: "100%" }}>
                Continuar comprando
              </Link>

              {/* Badges */}
              <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid var(--color-border)", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(34, 197, 94, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Truck size={18} style={{ color: "rgb(34, 197, 94)" }} />
                  </div>
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-primary)" }}>Frete Grátis</p>
                    <p style={{ fontSize: "12px", color: "var(--color-text-tertiary)" }}>Para compras acima de R$ 199</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(59, 130, 246, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ShieldCheck size={18} style={{ color: "rgb(59, 130, 246)" }} />
                  </div>
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-primary)" }}>Compra Segura</p>
                    <p style={{ fontSize: "12px", color: "var(--color-text-tertiary)" }}>Seus dados estão protegidos</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
