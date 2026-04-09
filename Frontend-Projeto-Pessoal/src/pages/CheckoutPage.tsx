import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Plus,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Lock,
  Tag,
  Sparkles,
  X,
} from "lucide-react";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../auth/AuthContext";
import { formatCurrency } from "../lib/utils";
import {
  apiCartaoListar,
  apiCartaoCriar,
  apiCartaoRemover,
  apiCartaoValidar,
  type CartaoListItem,
  type Bandeira,
  type CupomCode,
} from "../api/client";

// ── Cupons (usados apenas para feedback visual no checkout) ──────────────
const CUPONS: Record<CupomCode, { label: string; desconto: number; tipo: "percent" | "flat" }> = {
  EMPORIOJJ:       { label: "EmporioJJ -10%",     desconto: 0.10, tipo: "percent" },
  NAMORACOMIGO:    { label: "Namora Comigo -15%", desconto: 0.15, tipo: "percent" },
  BLACKFRIDAY:     { label: "Black Friday -25%",  desconto: 0.25, tipo: "percent" },
  PRIMEIRACOMPRA:  { label: "Primeira Compra -20%", desconto: 0.20, tipo: "percent" },
  FRETEGRATIS:     { label: "Frete Grátis",       desconto: 0,    tipo: "flat"    },
};

const BANDEIRAS: Bandeira[] = ["VISA", "MASTERCARD", "ELO", "AMEX", "HIPERCARD"];

const BANDEIRA_META: Record<Bandeira, { label: string; grad: string }> = {
  VISA:       { label: "Visa",       grad: "linear-gradient(135deg,#1a1f71 0%,#4b5cc4 100%)" },
  MASTERCARD: { label: "Mastercard", grad: "linear-gradient(135deg,#eb001b 0%,#f79e1b 100%)" },
  ELO:        { label: "Elo",        grad: "linear-gradient(135deg,#000 0%,#ffcb05 100%)" },
  AMEX:       { label: "Amex",       grad: "linear-gradient(135deg,#2e77bb 0%,#6cb4ee 100%)" },
  HIPERCARD:  { label: "Hipercard",  grad: "linear-gradient(135deg,#8b0000 0%,#ff3b30 100%)" },
};

// ── Skeleton (Apple-style shimmer) ───────────────────────────────────────
function CardSkeleton() {
  return (
    <div
      className="card"
      style={{
        padding: "24px",
        height: "180px",
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(110deg, var(--color-bg-secondary) 30%, var(--color-bg-tertiary) 50%, var(--color-bg-secondary) 70%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.6s ease-in-out infinite",
      }}
    />
  );
}

// ── Validação ──────────────────────────────────────────────────────────
function formatCardNumber(v: string): string {
  const digits = v.replace(/\D/g, "").slice(0, 19);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}
function formatValidade(v: string): string {
  const digits = v.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const { user } = useAuth();

  const [cartoes, setCartoes] = useState<CartaoListItem[]>([]);
  const [loadingCartoes, setLoadingCartoes] = useState(true);
  const [errorCartoes, setErrorCartoes] = useState<string | null>(null);
  const [selectedCartaoId, setSelectedCartaoId] = useState<string | null>(null);

  const [showNewCardModal, setShowNewCardModal] = useState(false);
  const [salvandoCartao, setSalvandoCartao] = useState(false);
  const [erroForm, setErroForm] = useState<string | null>(null);

  const [novo, setNovo] = useState({
    nomeTitular: "",
    numeroCartao: "",
    validade: "",
    bandeira: "VISA" as Bandeira,
  });

  const [cupomInput, setCupomInput] = useState("");
  const [cupomAplicado, setCupomAplicado] = useState<CupomCode | null>(null);
  const [cupomErro, setCupomErro] = useState<string | null>(null);

  const [processando, setProcessando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  // Carrega cartões
  useEffect(() => {
    let alive = true;
    setLoadingCartoes(true);
    apiCartaoListar()
      .then((list) => {
        if (!alive) return;
        setCartoes(list);
        if (list.length > 0) setSelectedCartaoId(list[0].id);
      })
      .catch(() => alive && setErrorCartoes("Não foi possível carregar seus cartões."))
      .finally(() => alive && setLoadingCartoes(false));
    return () => {
      alive = false;
    };
  }, []);

  // Redireciona se carrinho vazio (exceto após sucesso)
  useEffect(() => {
    if (!sucesso && items.length === 0) {
      navigate("/carrinho", { replace: true });
    }
  }, [items.length, sucesso, navigate]);

  const desconto = useMemo(() => {
    if (!cupomAplicado) return 0;
    const c = CUPONS[cupomAplicado];
    return c.tipo === "percent" ? totalPrice * c.desconto : 0;
  }, [cupomAplicado, totalPrice]);

  const totalFinal = Math.max(0, totalPrice - desconto);

  async function handleSalvarCartao(e: React.FormEvent) {
    e.preventDefault();
    setErroForm(null);

    const numero = novo.numeroCartao.replace(/\s/g, "");
    if (!novo.nomeTitular.trim()) return setErroForm("Informe o nome do titular.");
    if (numero.length < 13 || numero.length > 19) return setErroForm("Número de cartão inválido.");
    if (!/^\d{2}\/\d{2}$/.test(novo.validade)) return setErroForm("Validade deve estar no formato MM/AA.");

    setSalvandoCartao(true);
    try {
      const payload = {
        nomeTitular: novo.nomeTitular.trim(),
        numeroCartao: numero,
        validade: novo.validade,
        bandeira: novo.bandeira,
      };

      // Validação no backend antes de salvar
      const validacao = await apiCartaoValidar(payload);
      if (!validacao.valido) {
        setErroForm(validacao.mensagem ?? "Cartão inválido.");
        return;
      }

      const criado = await apiCartaoCriar(payload);

      // Recarrega lista
      const list = await apiCartaoListar();
      setCartoes(list);
      setSelectedCartaoId(criado.id);
      setShowNewCardModal(false);
      setNovo({ nomeTitular: "", numeroCartao: "", validade: "", bandeira: "VISA" });
    } catch (err) {
      setErroForm(err instanceof Error ? err.message : "Erro ao salvar cartão.");
    } finally {
      setSalvandoCartao(false);
    }
  }

  async function handleRemoverCartao(id: string) {
    try {
      await apiCartaoRemover(id);
      setCartoes((prev) => prev.filter((c) => c.id !== id));
      if (selectedCartaoId === id) {
        setSelectedCartaoId(null);
      }
    } catch {
      // silencioso - poderia adicionar toast
    }
  }

  function handleAplicarCupom() {
    setCupomErro(null);
    const code = cupomInput.trim().toUpperCase() as CupomCode;
    if (!CUPONS[code]) {
      setCupomErro("Cupom inválido ou expirado.");
      return;
    }
    setCupomAplicado(code);
  }

  async function handleFinalizar() {
    if (!selectedCartaoId) return;
    setProcessando(true);
    // Simulação de processamento do pedido (o MS-4 atual não expõe endpoint de pedido)
    await new Promise((r) => setTimeout(r, 1400));
    setProcessando(false);
    setSucesso(true);
    clearCart();
  }

  // ── Tela de sucesso ────────────────────────────────────────────────────
  if (sucesso) {
    return (
      <div
        className="page-wrapper"
        style={{
          minHeight: "100vh",
          background: "var(--color-bg-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="card"
          style={{ padding: "48px 40px", maxWidth: "480px", textAlign: "center" }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
            style={{
              width: "88px",
              height: "88px",
              borderRadius: "50%",
              background: "rgba(34,197,94,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}
          >
            <CheckCircle2 size={48} style={{ color: "rgb(34,197,94)" }} />
          </motion.div>
          <h1 className="text-headline" style={{ color: "var(--color-text-primary)", marginBottom: "12px" }}>
            Pedido confirmado!
          </h1>
          <p className="text-body" style={{ color: "var(--color-text-secondary)", marginBottom: "32px" }}>
            Obrigado pela preferência{user?.nome ? `, ${user.nome.split(" ")[0]}` : ""}. Você receberá
            um e-mail com os detalhes da sua compra.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <Link to="/produtos" className="btn btn-primary">
              Continuar comprando
            </Link>
            <Link to="/" className="btn btn-ghost">
              Ir para o início
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="page-wrapper" style={{ minHeight: "100vh", background: "var(--color-bg-primary)" }}>
      {/* Header */}
      <div style={{ background: "var(--color-bg-secondary)", borderBottom: "1px solid var(--color-border)" }}>
        <div
          className="container"
          style={{
            paddingTop: "40px",
            paddingBottom: "40px",
            maxWidth: "var(--container-wide)",
            margin: "0 auto",
            paddingLeft: "var(--container-padding)",
            paddingRight: "var(--container-padding)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <Link
              to="/carrinho"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                color: "var(--color-text-secondary)",
                textDecoration: "none",
                marginBottom: "12px",
              }}
            >
              <ArrowLeft size={14} /> Voltar ao carrinho
            </Link>
            <span
              style={{
                fontSize: "12px",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--color-accent)",
                letterSpacing: "var(--tracking-wide)",
                textTransform: "uppercase",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Finalizar compra
            </span>
            <h1 className="text-headline" style={{ color: "var(--color-text-primary)" }}>
              Checkout
            </h1>
          </motion.div>
        </div>
      </div>

      <div
        className="container"
        style={{
          maxWidth: "var(--container-wide)",
          margin: "0 auto",
          paddingTop: "clamp(32px, 5vw, 48px)",
          paddingBottom: "clamp(32px, 5vw, 48px)",
          paddingLeft: "var(--container-padding)",
          paddingRight: "var(--container-padding)",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(32px,5vw,48px)" }}>
          {/* Coluna esquerda - Pagamento */}
          <div style={{ flex: "1 1 60%", minWidth: "320px", display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Pagamento */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="card"
              style={{ padding: "28px" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <div>
                  <h2 className="text-title" style={{ color: "var(--color-text-primary)", marginBottom: "4px" }}>
                    Forma de pagamento
                  </h2>
                  <p style={{ fontSize: "13px", color: "var(--color-text-tertiary)" }}>
                    Selecione um cartão ou adicione um novo.
                  </p>
                </div>
                <button
                  onClick={() => setShowNewCardModal(true)}
                  className="btn btn-secondary btn-sm"
                  style={{ whiteSpace: "nowrap" }}
                >
                  <Plus size={16} /> Novo cartão
                </button>
              </div>

              {loadingCartoes ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "16px" }}>
                  <CardSkeleton />
                  <CardSkeleton />
                </div>
              ) : errorCartoes ? (
                <div
                  style={{
                    padding: "20px",
                    borderRadius: "12px",
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    color: "var(--color-error)",
                    fontSize: "14px",
                  }}
                >
                  {errorCartoes}
                </div>
              ) : cartoes.length === 0 ? (
                <button
                  onClick={() => setShowNewCardModal(true)}
                  style={{
                    width: "100%",
                    padding: "40px 24px",
                    borderRadius: "16px",
                    border: "2px dashed var(--color-border)",
                    background: "var(--color-bg-secondary)",
                    color: "var(--color-text-secondary)",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "10px",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--color-accent)";
                    e.currentTarget.style.color = "var(--color-accent)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--color-border)";
                    e.currentTarget.style.color = "var(--color-text-secondary)";
                  }}
                >
                  <CreditCard size={32} />
                  <span style={{ fontSize: "15px", fontWeight: "var(--font-weight-medium)" }}>
                    Adicionar seu primeiro cartão
                  </span>
                </button>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "16px" }}>
                  <AnimatePresence mode="popLayout">
                    {cartoes.map((c) => {
                      const selected = selectedCartaoId === c.id;
                      const meta = BANDEIRA_META[c.bandeira];
                      return (
                        <motion.button
                          key={c.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          whileHover={{ y: -3 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedCartaoId(c.id)}
                          style={{
                            position: "relative",
                            padding: "0",
                            border: "none",
                            cursor: "pointer",
                            background: "transparent",
                            textAlign: "left",
                            borderRadius: "18px",
                            outline: selected
                              ? "2px solid var(--color-accent)"
                              : "2px solid transparent",
                            outlineOffset: "3px",
                            transition: "outline 0.25s ease",
                          }}
                        >
                          <div
                            style={{
                              position: "relative",
                              height: "170px",
                              borderRadius: "18px",
                              padding: "22px",
                              color: "#fff",
                              background: meta.grad,
                              boxShadow: "0 20px 40px -20px rgba(0,0,0,0.4)",
                              overflow: "hidden",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                            }}
                          >
                            {/* Decorativo */}
                            <div
                              aria-hidden
                              style={{
                                position: "absolute",
                                right: "-40px",
                                top: "-40px",
                                width: "160px",
                                height: "160px",
                                borderRadius: "50%",
                                background: "rgba(255,255,255,0.08)",
                              }}
                            />
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <span
                                style={{
                                  fontSize: "11px",
                                  letterSpacing: "var(--tracking-widest)",
                                  textTransform: "uppercase",
                                  opacity: 0.85,
                                }}
                              >
                                {meta.label}
                              </span>
                              <CreditCard size={20} style={{ opacity: 0.9 }} />
                            </div>
                            <div>
                              <div
                                style={{
                                  fontSize: "18px",
                                  letterSpacing: "0.15em",
                                  fontVariantNumeric: "tabular-nums",
                                  marginBottom: "12px",
                                }}
                              >
                                {c.numeroCartaoMascarado}
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", opacity: 0.85 }}>
                                <div>
                                  <div style={{ opacity: 0.7, fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                    Titular
                                  </div>
                                  <div style={{ fontWeight: 500, marginTop: "2px" }}>{c.nomeTitular}</div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                  <div style={{ opacity: 0.7, fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                    Valid.
                                  </div>
                                  <div style={{ fontWeight: 500, marginTop: "2px" }}>{c.validade}</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Ações */}
                          <div
                            style={{
                              position: "absolute",
                              top: "10px",
                              right: "10px",
                              display: "flex",
                              gap: "6px",
                            }}
                          >
                            {selected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                style={{
                                  width: "26px",
                                  height: "26px",
                                  borderRadius: "50%",
                                  background: "#fff",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                                }}
                              >
                                <CheckCircle2 size={18} style={{ color: "var(--color-accent)" }} />
                              </motion.div>
                            )}
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoverCartao(c.id);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.stopPropagation();
                                  handleRemoverCartao(c.id);
                                }
                              }}
                              aria-label="Remover cartão"
                              style={{
                                width: "26px",
                                height: "26px",
                                borderRadius: "50%",
                                background: "rgba(0,0,0,0.35)",
                                backdropFilter: "blur(10px)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                color: "#fff",
                              }}
                            >
                              <Trash2 size={13} />
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </motion.section>

            {/* Segurança */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              style={{
                display: "flex",
                gap: "16px",
                padding: "16px 20px",
                borderRadius: "14px",
                background: "var(--color-bg-secondary)",
                border: "1px solid var(--color-border)",
              }}
            >
              <Lock size={18} style={{ color: "var(--color-accent)", flexShrink: 0, marginTop: "2px" }} />
              <div style={{ fontSize: "13px", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
                Seus dados são criptografados ponta a ponta. Nunca armazenamos o código de segurança.
              </div>
            </motion.div>
          </div>

          {/* Coluna direita - Resumo */}
          <div style={{ flex: "1 1 30%", minWidth: "300px" }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="card"
              style={{ padding: "28px", position: "sticky", top: "96px" }}
            >
              <h2 className="text-title" style={{ color: "var(--color-text-primary)", marginBottom: "20px" }}>
                Resumo
              </h2>

              {/* Itens */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                {items.slice(0, 3).map((it) => (
                  <div
                    key={it.product.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "10px",
                      fontSize: "13px",
                    }}
                  >
                    <span
                      className="line-clamp-1"
                      style={{ color: "var(--color-text-secondary)", flex: 1 }}
                    >
                      {it.quantity}× {it.product.descricao}
                    </span>
                    <span style={{ color: "var(--color-text-primary)", fontVariantNumeric: "tabular-nums" }}>
                      {formatCurrency(it.price * it.quantity)}
                    </span>
                  </div>
                ))}
                {items.length > 3 && (
                  <div style={{ fontSize: "12px", color: "var(--color-text-tertiary)" }}>
                    + {items.length - 3} outros itens
                  </div>
                )}
              </div>

              {/* Cupom */}
              <div style={{ marginBottom: "20px" }}>
                <label className="input-label" style={{ marginBottom: "8px", display: "block" }}>
                  Cupom
                </label>
                {cupomAplicado ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      background: "rgba(34,197,94,0.1)",
                      border: "1px solid rgba(34,197,94,0.3)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                      <Sparkles size={14} style={{ color: "rgb(34,197,94)" }} />
                      <span style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>
                        {CUPONS[cupomAplicado].label}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setCupomAplicado(null);
                        setCupomInput("");
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--color-text-tertiary)",
                        cursor: "pointer",
                        padding: "2px",
                      }}
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                ) : (
                  <>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <div style={{ position: "relative", flex: 1 }}>
                        <Tag
                          size={14}
                          style={{
                            position: "absolute",
                            left: "14px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "var(--color-text-tertiary)",
                          }}
                        />
                        <input
                          type="text"
                          value={cupomInput}
                          onChange={(e) => setCupomInput(e.target.value)}
                          placeholder="EMPORIOJJ"
                          className="input-field"
                          style={{ paddingLeft: "38px", fontSize: "13px", textTransform: "uppercase" }}
                        />
                      </div>
                      <button
                        onClick={handleAplicarCupom}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: "0 14px" }}
                      >
                        Usar
                      </button>
                    </div>
                    {cupomErro && (
                      <div style={{ fontSize: "12px", color: "var(--color-error)", marginTop: "6px" }}>
                        {cupomErro}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Totais */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span style={{ color: "var(--color-text-secondary)" }}>Subtotal ({totalItems})</span>
                  <span style={{ color: "var(--color-text-primary)", fontVariantNumeric: "tabular-nums" }}>
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
                {desconto > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span style={{ color: "var(--color-text-secondary)" }}>Desconto</span>
                    <span style={{ color: "rgb(34,197,94)", fontVariantNumeric: "tabular-nums" }}>
                      −{formatCurrency(desconto)}
                    </span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span style={{ color: "var(--color-text-secondary)" }}>Frete</span>
                  <span style={{ color: "var(--color-success)" }}>Grátis</span>
                </div>
                <div
                  style={{
                    borderTop: "1px solid var(--color-border)",
                    paddingTop: "14px",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ fontSize: "15px", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-primary)" }}>
                    Total
                  </span>
                  <span
                    className="text-title"
                    style={{
                      color: "var(--color-accent)",
                      fontWeight: "var(--font-weight-semibold)",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {formatCurrency(totalFinal)}
                  </span>
                </div>
              </div>

              <motion.button
                onClick={handleFinalizar}
                disabled={!selectedCartaoId || processando}
                whileHover={{ scale: selectedCartaoId ? 1.01 : 1 }}
                whileTap={{ scale: selectedCartaoId ? 0.98 : 1 }}
                className="btn btn-primary"
                style={{ width: "100%", marginBottom: "10px" }}
              >
                {processando ? (
                  <>
                    <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                    Processando...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} /> Pagar {formatCurrency(totalFinal)}
                  </>
                )}
              </motion.button>
              {!selectedCartaoId && !loadingCartoes && (
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--color-text-tertiary)",
                    textAlign: "center",
                    marginTop: "6px",
                  }}
                >
                  Selecione um cartão para continuar
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modal de novo cartão */}
      <AnimatePresence>
        {showNewCardModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !salvandoCartao && setShowNewCardModal(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
              zIndex: 100,
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="card"
              style={{ padding: "32px", maxWidth: "460px", width: "100%" }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "8px" }}>
                <div>
                  <h3 className="text-title" style={{ color: "var(--color-text-primary)" }}>
                    Novo cartão
                  </h3>
                  <p style={{ fontSize: "13px", color: "var(--color-text-tertiary)", marginTop: "4px" }}>
                    Adicione um cartão fictício para concluir a simulação.
                  </p>
                </div>
                <button
                  onClick={() => !salvandoCartao && setShowNewCardModal(false)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--color-text-tertiary)",
                    cursor: "pointer",
                    padding: "4px",
                    borderRadius: "6px",
                  }}
                  aria-label="Fechar"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Preview */}
              <div
                style={{
                  marginTop: "20px",
                  marginBottom: "24px",
                  padding: "22px",
                  height: "170px",
                  borderRadius: "18px",
                  color: "#fff",
                  background: BANDEIRA_META[novo.bandeira].grad,
                  boxShadow: "0 20px 40px -20px rgba(0,0,0,0.4)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    right: "-40px",
                    top: "-40px",
                    width: "160px",
                    height: "160px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.08)",
                  }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: "var(--tracking-widest)",
                      opacity: 0.85,
                    }}
                  >
                    {BANDEIRA_META[novo.bandeira].label}
                  </span>
                  <CreditCard size={20} style={{ opacity: 0.9 }} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "18px",
                      letterSpacing: "0.15em",
                      fontVariantNumeric: "tabular-nums",
                      marginBottom: "12px",
                      minHeight: "22px",
                    }}
                  >
                    {novo.numeroCartao || "•••• •••• •••• ••••"}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", opacity: 0.85 }}>
                    <div>
                      <div style={{ opacity: 0.7, fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                        Titular
                      </div>
                      <div style={{ fontWeight: 500, marginTop: "2px", textTransform: "uppercase" }}>
                        {novo.nomeTitular || "NOME SOBRENOME"}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ opacity: 0.7, fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                        Valid.
                      </div>
                      <div style={{ fontWeight: 500, marginTop: "2px" }}>{novo.validade || "MM/AA"}</div>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSalvarCartao} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div className="input-group">
                  <label className="input-label">Nome do titular</label>
                  <input
                    className="input-field"
                    value={novo.nomeTitular}
                    onChange={(e) => setNovo({ ...novo, nomeTitular: e.target.value })}
                    placeholder="Como está impresso no cartão"
                    maxLength={50}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Número do cartão</label>
                  <input
                    className="input-field"
                    value={novo.numeroCartao}
                    onChange={(e) => setNovo({ ...novo, numeroCartao: formatCardNumber(e.target.value) })}
                    placeholder="0000 0000 0000 0000"
                    inputMode="numeric"
                  />
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label className="input-label">Validade</label>
                    <input
                      className="input-field"
                      value={novo.validade}
                      onChange={(e) => setNovo({ ...novo, validade: formatValidade(e.target.value) })}
                      placeholder="MM/AA"
                      inputMode="numeric"
                    />
                  </div>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label className="input-label">Bandeira</label>
                    <select
                      className="input-field"
                      value={novo.bandeira}
                      onChange={(e) => setNovo({ ...novo, bandeira: e.target.value as Bandeira })}
                    >
                      {BANDEIRAS.map((b) => (
                        <option key={b} value={b}>
                          {BANDEIRA_META[b].label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {erroForm && (
                  <div
                    style={{
                      padding: "10px 12px",
                      borderRadius: "10px",
                      background: "rgba(239,68,68,0.08)",
                      border: "1px solid rgba(239,68,68,0.2)",
                      color: "var(--color-error)",
                      fontSize: "13px",
                    }}
                  >
                    {erroForm}
                  </div>
                )}

                <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                  <button
                    type="button"
                    onClick={() => setShowNewCardModal(false)}
                    className="btn btn-ghost"
                    disabled={salvandoCartao}
                    style={{ flex: 1 }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={salvandoCartao}
                    style={{ flex: 1 }}
                  >
                    {salvandoCartao ? (
                      <>
                        <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                        Salvando
                      </>
                    ) : (
                      "Salvar cartão"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shimmer keyframes (inline para não tocar CSS global) */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
