import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, User, Mail, Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { apiSolicitarCadastro, type ErroResposta } from "../api/client";

const schema = z.object({
  nome: z.string().min(2, "Nome é obrigatório"),
  login: z.string().min(3, "Usuário deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmarSenha: z.string().min(1, "Confirme a senha"),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: "As senhas não coincidem",
  path: ["confirmarSenha"],
});

type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    setGlobalError("");
    setSubmitting(true);

    try {
      const res = await apiSolicitarCadastro({
        nome: values.nome.trim(),
        login: values.login,
        email: values.email,
        senha: values.senha,
      });

      if (res.ok) {
        navigate("/login", { state: { fromRegister: true } });
        return;
      }

      if (res.status === 422) {
        const body = (await res.json()) as ErroResposta;
        const msg = body.erros?.map(e => e.message).join(", ") || body.message;
        setGlobalError(msg || "Dados inválidos");
      } else if (res.status === 409) {
        setGlobalError("Usuário ou e-mail já cadastrado");
      } else {
        setGlobalError("Erro ao criar conta. Tente novamente.");
      }
    } catch {
      setGlobalError("Erro de conexão. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const benefits = [
    "Acesso a preços exclusivos B2B",
    "Catálogo completo de suplementos",
    "Rastreamento de pedidos em tempo real",
    "Suporte dedicado para empresas",
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--color-bg-primary)" }}>
      {/* Left side - Benefits (hidden on mobile) */}
      <div className="lg\:flex" style={{ display: "none", width: "50%", background: "var(--color-bg-secondary)", alignItems: "center", justifyContent: "center", padding: "var(--space-16)" }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }} style={{ maxWidth: "440px" }}>
          <div style={{ marginBottom: "var(--space-12)" }}>
            <h2 className="text-display-sm" style={{ marginBottom: "var(--space-2)" }}>AL-TACADÃO</h2>
            <p className="text-body" style={{ color: "var(--color-text-secondary)" }}>Plataforma B2B de suplementos esportivos</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
            <h3 className="text-title-md">Por que criar uma conta?</h3>
            <ul style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              {benefits.map((benefit, index) => (
                <motion.li key={benefit} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 + index * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                  style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-3)" }}>
                  <CheckCircle2 size={20} style={{ color: "var(--color-accent)", flexShrink: 0, marginTop: "2px" }} />
                  <span className="text-body" style={{ color: "var(--color-text-secondary)" }}>{benefit}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ marginTop: "var(--space-16)", paddingTop: "var(--space-8)", borderTop: "1px solid var(--color-border)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--space-8)" }}>
              <div>
                <p className="text-display-xs" style={{ color: "var(--color-text-primary)" }}>500+</p>
                <p className="text-caption" style={{ color: "var(--color-text-tertiary)" }}>Produtos</p>
              </div>
              <div>
                <p className="text-display-xs" style={{ color: "var(--color-text-primary)" }}>1.2k</p>
                <p className="text-caption" style={{ color: "var(--color-text-tertiary)" }}>Empresas</p>
              </div>
              <div>
                <p className="text-display-xs" style={{ color: "var(--color-text-primary)" }}>98%</p>
                <p className="text-caption" style={{ color: "var(--color-text-tertiary)" }}>Satisfação</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Right side - Form */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(32px, 5vw, 64px)" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }} style={{ width: "100%", maxWidth: "440px" }}>
          
          <div style={{ marginBottom: "var(--space-10)" }}>
            <Link to="/login" style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)", fontSize: "14px", color: "var(--color-text-secondary)", marginBottom: "var(--space-8)", transition: "color var(--duration-fast)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text-primary)")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-secondary)")}>
              <ArrowLeft size={16} /> Voltar para login
            </Link>
            <h1 className="text-display-sm" style={{ marginBottom: "var(--space-2)" }}>Criar conta</h1>
            <p className="text-body" style={{ color: "var(--color-text-secondary)" }}>Preencha os dados abaixo para solicitar seu cadastro</p>
          </div>

          {globalError && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
              style={{ marginBottom: "var(--space-6)", padding: "var(--space-4)", borderRadius: "var(--radius-lg)", background: "var(--color-error-bg)", border: "1px solid var(--color-error)" }}>
              <p style={{ fontSize: "14px", color: "var(--color-error)" }}>{globalError}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="input-group">
              <label className="input-label">Nome completo</label>
              <div style={{ position: "relative" }}>
                <User size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-tertiary)" }} />
                <input {...register("nome")} className={`input-field pl-11 ${errors.nome ? "error" : ""}`} placeholder="Seu nome completo" autoComplete="name" style={{ paddingLeft: "42px" }} />
              </div>
              {errors.nome && <span style={{ fontSize: "12px", color: "var(--color-error)", marginTop: "4px", display: "block" }}>{errors.nome.message}</span>}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
              <div className="input-group">
                <label className="input-label">Usuário</label>
                <div style={{ position: "relative" }}>
                  <User size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-tertiary)" }} />
                  <input {...register("login")} className={`input-field pl-11 ${errors.login ? "error" : ""}`} placeholder="seu.usuario" autoComplete="username" style={{ paddingLeft: "42px" }} />
                </div>
                {errors.login && <span style={{ fontSize: "12px", color: "var(--color-error)", marginTop: "4px", display: "block" }}>{errors.login.message}</span>}
              </div>

              <div className="input-group">
                <label className="input-label">E-mail</label>
                <div style={{ position: "relative" }}>
                  <Mail size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-tertiary)" }} />
                  <input {...register("email")} type="email" className={`input-field pl-11 ${errors.email ? "error" : ""}`} placeholder="email@empresa.com" autoComplete="email" style={{ paddingLeft: "42px" }} />
                </div>
                {errors.email && <span style={{ fontSize: "12px", color: "var(--color-error)", marginTop: "4px", display: "block" }}>{errors.email.message}</span>}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
              <div className="input-group">
                <label className="input-label">Senha</label>
                <div style={{ position: "relative" }}>
                  <Lock size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-tertiary)" }} />
                  <input {...register("senha")} type={showPass ? "text" : "password"} className={`input-field pl-11 pr-11 ${errors.senha ? "error" : ""}`} placeholder="Min. 6 caracteres" autoComplete="new-password" style={{ paddingLeft: "42px", paddingRight: "42px" }} />
                  <button type="button" onClick={() => setShowPass((s) => !s)} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-tertiary)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.senha && <span style={{ fontSize: "12px", color: "var(--color-error)", marginTop: "4px", display: "block" }}>{errors.senha.message}</span>}
              </div>

              <div className="input-group">
                <label className="input-label">Confirmar senha</label>
                <div style={{ position: "relative" }}>
                  <Lock size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-tertiary)" }} />
                  <input {...register("confirmarSenha")} type={showPass ? "text" : "password"} className={`input-field pl-11 ${errors.confirmarSenha ? "error" : ""}`} placeholder="Repita a senha" autoComplete="new-password" style={{ paddingLeft: "42px" }} />
                </div>
                {errors.confirmarSenha && <span style={{ fontSize: "12px", color: "var(--color-error)", marginTop: "4px", display: "block" }}>{errors.confirmarSenha.message}</span>}
              </div>
            </div>

            <div style={{ paddingTop: "var(--space-2)" }}>
              <button type="submit" disabled={submitting} className="btn btn-primary w-full">
                {submitting ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    <span className="spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }} /> Criando conta...
                  </span>
                ) : "Criar conta"}
              </button>
            </div>
          </form>

          <div style={{ marginTop: "var(--space-8)", paddingTop: "var(--space-8)", borderTop: "1px solid var(--color-border)" }}>
            <p style={{ textAlign: "center", fontSize: "14px", color: "var(--color-text-secondary)" }}>
              Já tem uma conta? <Link to="/login" style={{ color: "var(--color-accent)", fontWeight: "var(--font-weight-medium)" }}>Entrar</Link>
            </p>
          </div>

          <p style={{ textAlign: "center", fontSize: "12px", color: "var(--color-text-tertiary)", marginTop: "var(--space-6)" }}>
            Ao criar uma conta, você concorda com nossos{" "}
            <button style={{ color: "var(--color-text-secondary)", transition: "color var(--duration-fast)" }} onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text-primary)")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-secondary)")}>Termos de Uso</button>
            {" "}e{" "}
            <button style={{ color: "var(--color-text-secondary)", transition: "color var(--duration-fast)" }} onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text-primary)")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-secondary)")}>Política de Privacidade</button>
          </p>

        </motion.div>
      </div>
    </div>
  );
}
