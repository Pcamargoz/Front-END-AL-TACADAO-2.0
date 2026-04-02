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
  Truck
} from "lucide-react";
import { useCart } from "../hooks/useCart";
import { BRAND_META, formatCurrency } from "../lib/utils";

export function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen py-16">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#111318] flex items-center justify-center">
              <ShoppingBag size={40} className="text-[#4B5563]" />
            </div>
            <h1 className="text-2xl font-display font-bold text-[#F5F5F5] mb-2">
              Seu carrinho está vazio
            </h1>
            <p className="text-[#9CA3AF] mb-8 max-w-md mx-auto">
              Parece que você ainda não adicionou nenhum produto. 
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
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#00FF87] mb-2 block">
            Carrinho
          </span>
          <div className="flex items-center justify-between">
            <h1 className="page-title">SEU PEDIDO</h1>
            <button
              onClick={clearCart}
              className="text-sm text-[#9CA3AF] hover:text-[#EF4444] transition-colors flex items-center gap-1"
            >
              <Trash2 size={14} />
              Limpar tudo
            </button>
          </div>
          <p className="text-[#9CA3AF] mt-2">
            {totalItems} {totalItems === 1 ? "item" : "itens"} no carrinho
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="popLayout">
              {items.map((item) => {
                const meta = item.product.marca ? BRAND_META[item.product.marca] : null;
                return (
                  <motion.div
                    key={item.product.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    className="card p-4 flex gap-4"
                  >
                    {/* Product Image */}
                    <Link 
                      to={`/produtos/${item.product.id}`}
                      className="w-24 h-24 rounded-sm flex-shrink-0 flex items-center justify-center"
                      style={{ background: meta?.bg || "#1A1D24" }}
                    >
                      <Dumbbell size={32} style={{ color: meta?.color || "#4B5563" }} />
                    </Link>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          {meta && (
                            <span 
                              className="inline-block text-[9px] font-bold tracking-wider uppercase mb-1 px-1.5 py-0.5 rounded-sm"
                              style={{ background: meta.bg, color: meta.color }}
                            >
                              {meta.label}
                            </span>
                          )}
                          <Link 
                            to={`/produtos/${item.product.id}`}
                            className="text-[#F5F5F5] hover:text-[#00FF87] transition-colors block line-clamp-2"
                          >
                            {item.product.descricao}
                          </Link>
                          {item.product.medida && (
                            <p className="text-xs text-[#4B5563] font-mono mt-1">
                              {item.product.medida}g
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="text-[#4B5563] hover:text-[#EF4444] transition-colors p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        {/* Quantity Control */}
                        <div className="flex items-center bg-[#0A0C10] rounded-sm">
                          <button
                            onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                            className="w-8 h-8 flex items-center justify-center text-[#9CA3AF] hover:text-[#F5F5F5] transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-sm font-mono text-[#F5F5F5]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-[#9CA3AF] hover:text-[#F5F5F5] transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <span className="price">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                          {item.quantity > 1 && (
                            <p className="text-xs text-[#4B5563] font-mono">
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
              transition={{ delay: 0.1 }}
              className="card p-6 sticky top-24"
            >
              <h2 className="text-lg font-medium text-[#F5F5F5] mb-6">Resumo do Pedido</h2>

              {/* Coupon */}
              <div className="mb-6">
                <label className="input-label mb-2 block">Cupom de desconto</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
                    <input
                      type="text"
                      placeholder="CODIGO10"
                      className="input-field pl-9 text-sm"
                    />
                  </div>
                  <button className="btn btn-secondary btn-sm">Aplicar</button>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-[#9CA3AF]">Subtotal ({totalItems} itens)</span>
                  <span className="text-[#F5F5F5] font-mono">{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#9CA3AF]">Frete</span>
                  <span className="text-[#10B981] font-mono">Grátis</span>
                </div>
                <div className="border-t border-[#1A1D24] pt-3 flex justify-between">
                  <span className="font-medium text-[#F5F5F5]">Total</span>
                  <span className="price text-xl">{formatCurrency(totalPrice)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button className="btn btn-primary w-full mb-4">
                Finalizar Pedido
                <ArrowRight size={18} />
              </button>

              {/* Continue Shopping */}
              <Link 
                to="/produtos" 
                className="btn btn-ghost w-full text-sm"
              >
                Continuar comprando
              </Link>

              {/* Shipping Info */}
              <div className="mt-6 p-4 bg-[#0A0C10] rounded-sm">
                <div className="flex items-center gap-3 text-sm">
                  <Truck size={18} className="text-[#00E5FF]" />
                  <div>
                    <p className="text-[#F5F5F5] font-medium">Frete Grátis</p>
                    <p className="text-xs text-[#4B5563]">Para compras acima de R$ 199</p>
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
