import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Eye, EyeOff, Lock, User, ArrowRight, Dumbbell, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../auth/AuthContext";

/* ═══════════════════════════════════════════════════════════════════════════════
 * LOGIN PAGE - Apple Style
 * 
 * Features:
 * - Clean split layout
 * - Minimal form with subtle animations
 * - Soft gradients and rounded corners
 * ═══════════════════════════════════════════════════════════════════════════════
 */
export function LoginPage() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [loginVal, setLoginVal] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fromRegister = (location.state as { fromRegister?: boolean } | null)?.fromRegister;

  useEffect(() => {
    if (!loading && user) {
      navigate("/empresas", { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const result = await login(loginVal, password);

    if (!result.ok) {
      setError(result.message);
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)] flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[var(--color-bg-primary)] relative overflow-hidden items-center justify-center">
        <div className="relative z-10 px-12 xl:px-20 max-w-lg">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 rounded-2xl bg-[var(--color-accent)] flex items-center justify-center">
              <Dumbbell size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-[var(--color-text-primary)] tracking-tight">
                AL-TACADÃO
              </h1>
              <p className="text-[11px] text-[var(--color-text-tertiary)] tracking-wider uppercase">
                Suplementos Premium
              </p>
            </div>
          </div>

          {/* Headline */}
          <h2 className="text-5xl xl:text-6xl font-semibold text-[var(--color-text-primary)] mb-6 leading-[1.1] tracking-tight">
            Potencialize
            <br />
            <span className="text-[var(--color-accent)]">seus resultados</span>
          </h2>
          <p className="text-[var(--color-text-secondary)] text-lg mb-12 leading-relaxed">
            A plataforma B2B líder em distribuição de suplementos esportivos de alta performance.
          </p>

          {/* Features */}
          <div className="space-y-5">
            {[
              "Catálogo exclusivo de marcas premium",
              "Gestão completa de pedidos",
              "Preços especiais para distribuidores",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-7 h-7 rounded-lg bg-[var(--color-accent-subtle)] flex items-center justify-center">
                  <Check size={16} className="text-[var(--color-accent)]" />
                </div>
                <span className="text-[15px] text-[var(--color-text-secondary)]">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="flex items-center justify-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)] flex items-center justify-center">
              <Dumbbell size={20} className="text-white" />
            </div>
            <span className="text-xl font-semibold text-[var(--color-text-primary)]">AL-TACADÃO</span>
          </div>

          <div className="auth-card">
            <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-2 text-center">
              Bem-vindo de volta
            </h2>
            <p className="text-[15px] text-[var(--color-text-tertiary)] mb-8 text-center">
              Entre na sua conta para continuar
            </p>

            {/* Success Message */}
            {fromRegister && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl bg-[var(--color-success-bg)] flex items-center gap-3"
              >
                <div className="w-5 h-5 rounded-full bg-[var(--color-success)] flex items-center justify-center flex-shrink-0">
                  <Check size={12} className="text-white" />
                </div>
                <span className="text-[14px] text-[var(--color-success)]">
                  Conta criada com sucesso! Faça login para continuar.
                </span>
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl bg-[var(--color-error-bg)] flex items-center gap-3"
              >
                <span className="w-2 h-2 rounded-full bg-[var(--color-error)] flex-shrink-0" />
                <span className="text-[14px] text-[var(--color-error)]">{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username */}
              <div className="input-group">
                <label className="input-label">Usuário</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-quaternary)]" />
                  <input
                    type="text"
                    className="input-field pl-12"
                    placeholder="seu.usuario"
                    value={loginVal}
                    onChange={(e) => setLoginVal(e.target.value)}
                    autoFocus
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="input-group">
                <label className="input-label">Senha</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-quaternary)]" />
                  <input
                    type={showPass ? "text" : "password"}
                    className="input-field pl-12 pr-12"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((s) => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-quaternary)] hover:text-[var(--color-text-secondary)] transition-colors"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting || !loginVal || !password}
                className="btn btn-primary w-full mt-6"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Entrando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Entrar
                    <ArrowRight size={18} />
                  </span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--color-divider)]" />
              </div>
              <div className="relative flex justify-center text-[13px]">
                <span className="px-4 bg-[var(--color-bg-elevated)] text-[var(--color-text-quaternary)]">
                  ou
                </span>
              </div>
            </div>

            {/* Register Link */}
            <p className="text-center text-[15px] text-[var(--color-text-secondary)]">
              Não tem uma conta?{" "}
              <Link 
                to="/cadastro" 
                className="text-[var(--color-accent)] hover:underline font-medium"
              >
                Criar conta
              </Link>
            </p>
          </div>

          {/* Footer */}
          <p className="text-center text-[13px] text-[var(--color-text-quaternary)] mt-8">
            © {new Date().getFullYear()} AL-TACADÃO. Todos os direitos reservados.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
