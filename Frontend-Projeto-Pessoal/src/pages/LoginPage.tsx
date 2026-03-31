import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Eye, EyeOff, Zap, Lock, User, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../auth/AuthContext";

export function LoginPage() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [loginVal, setLoginVal]     = useState("");
  const [password, setPassword]     = useState("");
  const [showPass, setShowPass]     = useState(false);
  const [error, setError]           = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fromCadastro = (location.state as { fromCadastro?: boolean } | null)?.fromCadastro;

  useEffect(() => {
    if (!loading && user) navigate("/home", { replace: true });
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await login(loginVal, password);
    if (result.ok) {
      navigate("/home");
    } else {
      setError(result.message);
    }
    setSubmitting(false);
  };

  return (
    <div className="auth-container">
      <div className="nucleus-bg">
        <div className="nucleus-grid" />
        <div className="nucleus-orb nucleus-orb-1" />
        <div className="nucleus-orb nucleus-orb-2" />
        <div className="nucleus-orb nucleus-orb-3" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="auth-card glass neon-border-cyan"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 animate-pulse-glow"
            style={{ background: "linear-gradient(135deg,#00c8d4,#6d28d9)" }}
          >
            <Zap size={26} className="text-white" />
          </div>
          <h1 className="text-xl font-bold gradient-text-cyan">NUCLEUS</h1>
          <p className="text-xs text-slate-600 mt-0.5 tracking-widest uppercase">Control Center</p>
        </div>

        <h2 className="text-lg font-semibold text-slate-200 mb-1">Bem-vindo de volta</h2>
        <p className="text-sm text-slate-600 mb-6">Acesse sua conta para continuar</p>

        {fromCadastro && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-xl text-sm text-emerald-400 flex items-center gap-2"
            style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
            Conta criada! Faça login para continuar.
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-xl text-sm text-rose-400 flex items-center gap-2"
            style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)" }}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400 flex-shrink-0" />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="input-group">
            <label className="input-label">Login</label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
              <input
                className="input-field pl-9"
                placeholder="seu.login"
                value={loginVal}
                onChange={(e) => setLoginVal(e.target.value)}
                autoFocus
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Senha</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
              <input
                className="input-field pl-9 pr-10"
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
              >
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !loginVal || !password}
            className="btn btn-primary w-full mt-2"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Entrando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Entrar <ArrowRight size={15} />
              </span>
            )}
          </button>
        </form>

        <div className="divider" />

        <p className="text-center text-sm text-slate-600">
          Não tem conta?{" "}
          <Link to="/cadastro" className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
            Criar conta
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
