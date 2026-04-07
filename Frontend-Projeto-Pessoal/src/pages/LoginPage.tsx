import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Eye, EyeOff, Lock, User, ArrowRight, Dumbbell, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../auth/AuthContext";

export function LoginPage() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState(() => ({ loginVal: "", password: "" }));
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fromRegister = (location.state as { fromRegister?: boolean } | null)?.fromRegister;

  useEffect(() => {
    if (!loading && user) navigate("/empresas", { replace: true });
  }, [user, loading, navigate]);

  const handleInputChange = useCallback((field: "loginVal" | "password") => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  }, []);

  const toggleShowPassword = useCallback(() => setShowPass((p) => !p), []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError("");
    setSubmitting(true);
    const result = await login(formData.loginVal, formData.password);
    if (!result.ok) setError(result.message);
    setSubmitting(false);
  }, [login, formData.loginVal, formData.password, submitting]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg-secondary)", display: "flex" }}>
      {/* Left - Branding */}
      <div
        style={{
          display: "none",
          width: "50%",
          background: "var(--color-bg-primary)",
          position: "relative",
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
        }}
        className="lg\:flex"
      >
        <div style={{ position: "relative", zIndex: 1, padding: "0 clamp(48px, 5vw, 80px)", maxWidth: "520px" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-16)" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "var(--radius-lg)", background: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Dumbbell size={24} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: "20px", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)", letterSpacing: "var(--tracking-tight)" }}>
                AL-TACADÃO
              </h1>
              <p style={{ fontSize: "11px", color: "var(--color-text-tertiary)", letterSpacing: "var(--tracking-wider)", textTransform: "uppercase" }}>
                Suplementos Premium
              </p>
            </div>
          </div>

          {/* Headline */}
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(40px, 5vw, 64px)",
            fontWeight: "var(--font-weight-semibold)",
            color: "var(--color-text-primary)",
            lineHeight: 1.1,
            letterSpacing: "var(--tracking-tight)",
            marginBottom: "var(--space-6)",
          }}>
            Potencialize<br />
            <span style={{ color: "var(--color-accent)" }}>seus resultados</span>
          </h2>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "18px", lineHeight: 1.6, marginBottom: "var(--space-12)" }}>
            A plataforma B2B líder em distribuição de suplementos esportivos de alta performance.
          </p>

          {/* Features */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
            {["Catálogo exclusivo de marcas premium", "Gestão completa de pedidos", "Preços especiais para distribuidores"].map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "var(--radius-sm)", background: "var(--color-accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Check size={16} style={{ color: "var(--color-accent)" }} />
                </div>
                <span style={{ fontSize: "15px", color: "var(--color-text-secondary)" }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "var(--space-6) var(--space-6) var(--space-12)" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ width: "100%", maxWidth: "420px" }}
        >
          {/* Mobile Logo */}
          <div className="lg\:hidden" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "var(--space-3)", marginBottom: "var(--space-10)" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "var(--radius-md)", background: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Dumbbell size={20} color="#fff" />
            </div>
            <span style={{ fontSize: "20px", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)" }}>AL-TACADÃO</span>
          </div>

          <div className="auth-card">
            <h2 style={{ fontSize: "var(--text-title-sm)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-primary)", marginBottom: "var(--space-2)", textAlign: "center" }}>
              Bem-vindo de volta
            </h2>
            <p style={{ fontSize: "15px", color: "var(--color-text-tertiary)", marginBottom: "var(--space-8)", textAlign: "center" }}>
              Entre na sua conta para continuar
            </p>

            {/* Success */}
            {fromRegister && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: "var(--space-6)", padding: "var(--space-4)", borderRadius: "var(--radius-md)", background: "var(--color-success-bg)", display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                <div style={{ width: "20px", height: "20px", borderRadius: "var(--radius-full)", background: "var(--color-success)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Check size={12} color="#fff" />
                </div>
                <span style={{ fontSize: "14px", color: "var(--color-success)" }}>Conta criada com sucesso! Faça login para continuar.</span>
              </motion.div>
            )}

            {/* Error */}
            {error && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: "var(--space-6)", padding: "var(--space-4)", borderRadius: "var(--radius-md)", background: "var(--color-error-bg)", display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "var(--radius-full)", background: "var(--color-error)", flexShrink: 0 }} />
                <span style={{ fontSize: "14px", color: "var(--color-error)" }}>{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
              <div className="input-group">
                <label className="input-label">Usuário</label>
                <div style={{ position: "relative" }}>
                  <User size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-quaternary)" }} />
                  <input ref={usernameRef} type="text" className="input-field" style={{ paddingLeft: "44px" }}
                    placeholder="seu.usuario" value={formData.loginVal} onChange={handleInputChange("loginVal")} autoFocus autoComplete="username" required />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Senha</label>
                <div style={{ position: "relative" }}>
                  <Lock size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-quaternary)" }} />
                  <input ref={passwordRef} type={showPass ? "text" : "password"} className="input-field" style={{ paddingLeft: "44px", paddingRight: "44px" }}
                    placeholder="••••••••" value={formData.password} onChange={handleInputChange("password")} autoComplete="current-password" required />
                  <button type="button" onClick={toggleShowPassword} tabIndex={-1}
                    style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-quaternary)", transition: "color var(--duration-fast)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={submitting || !formData.loginVal || !formData.password} className="btn btn-primary w-full" style={{ marginTop: "var(--space-2)" }}>
                {submitting ? (
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className="spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }} />
                    Entrando...
                  </span>
                ) : (
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>Entrar <ArrowRight size={18} /></span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div style={{ position: "relative", margin: "var(--space-8) 0" }}>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center" }}>
                <div style={{ width: "100%", height: "1px", background: "var(--color-divider)" }} />
              </div>
              <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
                <span style={{ padding: "0 var(--space-4)", background: "var(--color-bg-elevated)", fontSize: "13px", color: "var(--color-text-quaternary)" }}>ou</span>
              </div>
            </div>

            {/* Register */}
            <p style={{ textAlign: "center", fontSize: "15px", color: "var(--color-text-secondary)" }}>
              Não tem uma conta?{" "}
              <Link to="/cadastro" style={{ color: "var(--color-accent)", fontWeight: "var(--font-weight-medium)" }}>Criar conta</Link>
            </p>
          </div>

          <p style={{ textAlign: "center", fontSize: "13px", color: "var(--color-text-quaternary)", marginTop: "var(--space-8)" }}>
            © {new Date().getFullYear()} AL-TACADÃO. Todos os direitos reservados.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
