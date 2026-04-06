import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, 
  Trash2, 
  Minus, 
  Plus, 
  ArrowRight, 
  Package,
  Dumbbell,
  Tag,
  Truck,
  ShieldCheck
} from "lucide-react";
import { useCart } from "../hooks/useCart";
import { BRAND_META, formatCurrency } from "../lib/utils";

export function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="page-wrapper">
        <div className="container max-w-lg py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[var(--color-bg-secondary)] flex items-center justify-center">
              <ShoppingBag size={36} className="text-tertiary" />
            </div>
            <h1 className="text-headline text-primary mb-3">
              Seu carrinho está vazio
            </h1>
            <p className="text-body text-secondary mb-8">
              Explore nosso catálogo e encontre os melhores suplementos para você.
            </p>
            <Link to="/produtos" className="btn btn-primary">
              <Package size={18} />
              Explorar produtos
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="bg-[var(--color-bg-secondary)] border-b border-border">
        <div className="container py-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <span className="text-caption font-medium text-accent tracking-wide uppercase mb-2 block">
              Carrinho
            </span>
            <div className="flex items-center justify-between">
              <h1 className="text-headline text-primary">Seu Pedido</h1>
              <button
                onClick={clearCart}
                className="text-body-sm text-secondary hover:text-red-500 transition-colors flex items-center gap-1.5"
              >
                <Trash2 size={16} />
                Limpar tudo
              </button>
            </div>
            <p className="text-body text-secondary mt-2">
              {totalItems} {totalItems === 1 ? "item" : "itens"} no carrinho
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container py-8 lg:py-12">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="popLayout">
              {items.map((item, index) => {
                const meta = item.product.marca ? BRAND_META[item.product.marca] : null;
                return (
                  <motion.div
                    key={item.product.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20, height: 0 }}
                    transition={{ 
                      duration: 0.4, 
                      delay: index * 0.05,
                      ease: [0.25, 0.1, 0.25, 1] 
                    }}
                    className="bg-white/5 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-lg shadow-black/10 p-5 flex gap-5 transition-all duration-200 ease-out hover:shadow-xl hover:border-slate-600/60"
                  >
                    {/* Product Image */}
                    <Link 
                      to={`/produtos/${item.product.id}`}
                      className="w-24 h-24 rounded-xl flex-shrink-0 flex items-center justify-center bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
                    >
                      <Dumbbell size={32} className="text-tertiary" />
                    </Link>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          {meta && (
                            <span className="text-caption font-medium text-accent mb-1 block">
                              {meta.label}
                            </span>
                          )}
                          <Link 
                            to={`/produtos/${item.product.id}`}
                            className="text-body font-medium text-primary hover:text-accent transition-colors block line-clamp-2"
                          >
                            {item.product.descricao}
                          </Link>
                          {item.product.medida && (
                            <p className="text-caption text-tertiary mt-1">
                              {item.product.medida}g
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="text-tertiary hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-[var(--color-bg-secondary)]"
                          aria-label="Remover item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        {/* Quantity Control */}
                        <div className="flex items-center bg-[var(--color-bg-secondary)] rounded-xl">
                          <button
                            onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                            className="w-10 h-10 flex items-center justify-center text-secondary hover:text-primary transition-colors"
                            aria-label="Diminuir quantidade"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-10 text-center text-body font-medium text-primary">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-10 h-10 flex items-center justify-center text-secondary hover:text-primary transition-colors"
                            aria-label="Aumentar quantidade"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <span className="text-title-sm text-primary font-semibold">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                          {item.quantity > 1 && (
                            <p className="text-caption text-tertiary">
                              {item.quantity}x {formatCurrency(item.price)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="bg-white/5 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-lg shadow-black/10 p-6 sticky top-24 transition-all duration-200 ease-out hover:shadow-xl hover:border-slate-600/60"
            >
              <h2 className="text-title text-primary mb-6">Resumo do Pedido</h2>

              {/* Coupon */}
              <div className="mb-6">
                <label className="input-label mb-2 block">Cupom de desconto</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-tertiary" />
                    <input
                      type="text"
                      placeholder="CODIGO10"
                      className="input-field pl-11 text-body-sm"
                    />
                  </div>
                  <button className="btn btn-secondary btn-sm">Aplicar</button>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-body-sm">
                  <span className="text-secondary">Subtotal ({totalItems} itens)</span>
                  <span className="text-primary font-medium">{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-body-sm">
                  <span className="text-secondary">Frete</span>
                  <span className="text-[var(--color-success)] font-medium">Grátis</span>
                </div>
                <div className="border-t border-border pt-4 flex justify-between">
                  <span className="text-body font-medium text-primary">Total</span>
                  <span className="text-title text-accent font-semibold">{formatCurrency(totalPrice)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button className="btn btn-primary w-full mb-3">
                Finalizar Pedido
                <ArrowRight size={18} />
              </button>

              {/* Continue Shopping */}
              <Link 
                to="/produtos" 
                className="btn btn-ghost w-full"
              >
                Continuar comprando
              </Link>

              {/* Trust badges */}
              <div className="mt-6 pt-6 border-t border-border space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-success-bg)] flex items-center justify-center">
                    <Truck size={18} className="text-[var(--color-success)]" />
                  </div>
                  <div>
                    <p className="text-body-sm text-primary font-medium">Frete Grátis</p>
                    <p className="text-caption text-tertiary">Para compras acima de R$ 199</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-info-bg)] flex items-center justify-center">
                    <ShieldCheck size={18} className="text-[var(--color-info)]" />
                  </div>
                  <div>
                    <p className="text-body-sm text-primary font-medium">Compra Segura</p>
                    <p className="text-caption text-tertiary">Seus dados estão protegidos</p>
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
