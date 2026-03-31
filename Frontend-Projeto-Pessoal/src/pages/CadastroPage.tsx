import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Zap, Mail, User, Lock, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { apiCadastro, type ErroResposta } from "../api/client";

const ROLES = [
  { value: "GERENTE", label: "Gerente" },
  { value: "FUNCIONARIO", label: "Funcionário" },
  { value: "ESTAGIARIO", label: "Estagiário" },
];

export function CadastroPage() {
  const navigate = useNavigate();

  const [nome, setNome]       = useState("");
  const [loginV, setLoginV]   = useState("");
  const [email, setEmail]     = useState("");
  const [senha, setSenha]     = useState("");
  const [showPass, setShowPass] = useState(false);
  const [role, setRole]       = useState("FUNCIONARIO");
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [globalErr, setGlobalErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGlobalErr("");
    setSubmitting(true);

    const payload = { nome: nome.trim() || undefined, login: loginV, email, senha, roles: [role] };
    const res = await apiCadastro(payload);
    if (res.status === 201) {
      navigate("/login", { state: { fromCadastro: true } });
      return;
    }
    if (res.status === 422) {
      const body = (await res.json()) as ErroResposta;
      const fieldErrors: Record<string, string> = {};
      body.erros?.forEach((e) => { fieldErrors[e.campo] = e.message; });
      setErrors(fieldErrors);
    } else if (res.status === 409) {
      setGlobalErr("Login ou e-mail já cadastrado.");
    } else {
      setGlobalErr("Erro inesperado. Tente novamente.");
    }
    setSubmitting(false);
  };

  const strengthScore = [
    senha.length >= 8,
    /[A-Z]/.test(senha),
    /[0-9]/.test(senha),
    /[^A-Za-z0-9]/.test(senha),
  ].filter(Boolean).length;

  const strengthColor = ["#f43f5e", "#f59e0b", "#10b981", "#00f0ff"][strengthScore - 1] ?? "#334155";

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
        transition={{ duration: 0.4 }}
        className="auth-card glass neon-border-violet"
        style={{ maxWidth: 460 }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/login" className="btn btn-ghost btn-icon text-slate-500">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h2 className="text-lg font-semibold text-slate-200">Criar conta</h2>
            <p className="text-xs text-slate-600">Preencha os dados para acessar o sistema</p>
          </div>
          <div className="ml-auto w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#6d28d9,#00c8d4)" }}>
            <Zap size={18} className="text-white" />
          </div>
        </div>

        {globalErr && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-xl text-sm text-rose-400 flex items-center gap-2"
            style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)" }}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400 flex-shrink-0" />
            {globalErr}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div className="input-group">
            <label className="input-label">Nome completo</label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
              <input
                className={`input-field pl-9 ${errors.nome ? "error" : ""}`}
                placeholder="Seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>
            {errors.nome && <span className="input-error">{errors.nome}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Login */}
            <div className="input-group">
              <label className="input-label">Login</label>
              <input
                className={`input-field ${errors.login ? "error" : ""}`}
                placeholder="usuario"
                value={loginV}
                onChange={(e) => setLoginV(e.target.value)}
                required
              />
              {errors.login && <span className="input-error">{errors.login}</span>}
            </div>

            {/* Email */}
            <div className="input-group">
              <label className="input-label">E-mail</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                <input
                  className={`input-field pl-9 ${errors.email ? "error" : ""}`}
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {errors.email && <span className="input-error">{errors.email}</span>}
            </div>
          </div>

          {/* Senha */}
          <div className="input-group">
            <label className="input-label">Senha</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
              <input
                className={`input-field pl-9 pr-10 ${errors.senha ? "error" : ""}`}
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
              <button type="button" onClick={() => setShowPass((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors">
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {/* Strength bar */}
            {senha && (
              <div className="flex gap-1 mt-1.5">
                {[1,2,3,4].map((s) => (
                  <div key={s} className="flex-1 h-1 rounded-full transition-all duration-300"
                    style={{ background: strengthScore >= s ? strengthColor : "rgba(255,255,255,0.06)" }} />
                ))}
              </div>
            )}
            {errors.senha && <span className="input-error">{errors.senha}</span>}
          </div>

          {/* Roles */}
          <div className="input-group">
            <label className="input-label">Perfil de acesso</label>
            <select
              className="input-field"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary w-full mt-1"
            style={{ background: "linear-gradient(135deg,#6d28d9,#00c8d4)" }}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Criando conta...
              </span>
            ) : (
              "Criar conta"
            )}
          </button>
        </form>

        <div className="divider" />

        <p className="text-center text-sm text-slate-600">
          Já tem conta?{" "}
          <Link to="/login" className="text-violet-400 hover:text-violet-300 transition-colors font-medium">
            Fazer login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
