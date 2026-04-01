import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Mail, User, Lock, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { apiCadastro, type ErroResposta } from "../api/client";

const ROLES = [
  { value: "GERENTE",    label: "Manager"  },
  { value: "FUNCIONARIO", label: "Employee" },
  { value: "ESTAGIARIO", label: "Intern"   },
];

export function RegisterPage() {
  const navigate = useNavigate();

  const [nome,        setNome]       = useState("");
  const [loginV,      setLoginV]     = useState("");
  const [email,       setEmail]      = useState("");
  const [senha,       setSenha]      = useState("");
  const [showPass,    setShowPass]   = useState(false);
  const [role,        setRole]       = useState("FUNCIONARIO");
  const [errors,      setErrors]     = useState<Record<string, string>>({});
  const [globalErr,   setGlobalErr]  = useState("");
  const [submitting,  setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGlobalErr("");
    setSubmitting(true);

    const payload = { nome: nome.trim() || undefined, login: loginV, email, senha, roles: [role] };
    const res = await apiCadastro(payload);

    if (res.status === 201) {
      navigate("/login", { state: { fromRegister: true } });
      return;
    }
    if (res.status === 422) {
      const body = (await res.json()) as ErroResposta;
      const fieldErrors: Record<string, string> = {};
      body.erros?.forEach((e) => { fieldErrors[e.campo] = e.message; });
      setErrors(fieldErrors);
    } else if (res.status === 409) {
      setGlobalErr("Username or email already registered.");
    } else {
      setGlobalErr("Unexpected error. Please try again.");
    }
    setSubmitting(false);
  };

  const strengthScore = [
    senha.length >= 8,
    /[A-Z]/.test(senha),
    /[0-9]/.test(senha),
    /[^A-Za-z0-9]/.test(senha),
  ].filter(Boolean).length;

  const strengthColors = ["#E5484D", "#F59E0B", "#22C55E", "#E8A020"];
  const strengthColor  = strengthColors[strengthScore - 1] ?? "#232328";

  return (
    <div className="auth-container">
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        className="auth-card"
        style={{ maxWidth: 460 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/login" className="btn btn-ghost btn-icon">
            <ArrowLeft size={15} />
          </Link>
          <div>
            <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#EFEFEF" }}>Create account</h2>
            <p style={{ fontSize: "0.78rem", color: "#52525B" }}>Fill in your details to access the system</p>
          </div>
          <div className="ml-auto w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "#E8A020" }}>
            <span style={{
              fontFamily: "'Barlow Condensed', system-ui, sans-serif",
              fontWeight: 700, fontSize: "0.75rem", color: "#0E0E10",
            }}>AT</span>
          </div>
        </div>

        {globalErr && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="alert alert-error mb-4"
          >
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#E5484D" }} />
            {globalErr}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full name */}
          <div className="input-group">
            <label className="input-label">Full name</label>
            <div className="relative">
              <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#3C3C44" }} />
              <input
                className={`input-field pl-9 ${errors.nome ? "error" : ""}`}
                placeholder="Your name"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>
            {errors.nome && <span className="input-error">{errors.nome}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Username */}
            <div className="input-group">
              <label className="input-label">Username</label>
              <input
                className={`input-field ${errors.login ? "error" : ""}`}
                placeholder="username"
                value={loginV}
                onChange={(e) => setLoginV(e.target.value)}
                required
              />
              {errors.login && <span className="input-error">{errors.login}</span>}
            </div>

            {/* Email */}
            <div className="input-group">
              <label className="input-label">Email</label>
              <div className="relative">
                <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#3C3C44" }} />
                <input
                  className={`input-field pl-9 ${errors.email ? "error" : ""}`}
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {errors.email && <span className="input-error">{errors.email}</span>}
            </div>
          </div>

          {/* Password */}
          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="relative">
              <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#3C3C44" }} />
              <input
                className={`input-field pl-9 pr-10 ${errors.senha ? "error" : ""}`}
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: "#3C3C44" }}
              >
                {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
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

          {/* Role */}
          <div className="input-group">
            <label className="input-label">Access role</label>
            <select className="input-field" value={role} onChange={(e) => setRole(e.target.value)}>
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <button type="submit" disabled={submitting} className="btn btn-primary w-full mt-1">
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 animate-spin"
                  style={{ borderColor: "rgba(14,14,16,0.3)", borderTopColor: "#0E0E10" }} />
                Creating account...
              </span>
            ) : (
              "Create account"
            )}
          </button>
        </form>

        <div className="divider" />

        <p className="text-center" style={{ fontSize: "0.875rem", color: "#52525B" }}>
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold transition-colors"
            style={{ color: "#E8A020" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#F0AB28")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#E8A020")}
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
