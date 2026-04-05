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

  // Benefits list
  const benefits = [
    "Acesso a preços exclusivos B2B",
    "Catálogo completo de suplementos",
    "Rastreamento de pedidos em tempo real",
    "Suporte dedicado para empresas",
  ];

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Left side - Benefits (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-surface-secondary items-center justify-center p-16">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="max-w-md"
        >
          {/* Brand */}
          <div className="mb-12">
            <h2 className="text-display-sm text-primary mb-2">AL-TACADÃO</h2>
            <p className="text-body text-secondary">
              Plataforma B2B de suplementos esportivos
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-6">
            <h3 className="text-title-md text-primary">
              Por que criar uma conta?
            </h3>
            <ul className="space-y-4">
              {benefits.map((benefit, index) => (
                <motion.li
                  key={benefit}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: 0.2 + index * 0.1,
                    ease: [0.25, 0.1, 0.25, 1] 
                  }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 size={20} className="text-accent shrink-0 mt-0.5" />
                  <span className="text-body text-secondary">{benefit}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="mt-16 pt-8 border-t border-border"
          >
            <div className="grid grid-cols-3 gap-8">
              <div>
                <p className="text-display-xs text-primary">500+</p>
                <p className="text-caption text-tertiary">Produtos</p>
              </div>
              <div>
                <p className="text-display-xs text-primary">1.2k</p>
                <p className="text-caption text-tertiary">Empresas</p>
              </div>
              <div>
                <p className="text-display-xs text-primary">98%</p>
                <p className="text-caption text-tertiary">Satisfação</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="mb-10">
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 text-body-sm text-secondary hover:text-primary transition-colors mb-8"
            >
              <ArrowLeft size={16} />
              Voltar para login
            </Link>
            <h1 className="text-display-sm text-primary mb-2">
              Criar conta
            </h1>
            <p className="text-body text-secondary">
              Preencha os dados abaixo para solicitar seu cadastro
            </p>
          </div>

          {/* Error Alert */}
          {globalError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30"
            >
              <p className="text-body-sm text-red-600 dark:text-red-400">{globalError}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Nome */}
            <div className="input-group">
              <label className="input-label">Nome completo</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-tertiary" />
                <input
                  {...register("nome")}
                  className={`input-field pl-11 ${errors.nome ? "error" : ""}`}
                  placeholder="Seu nome completo"
                  autoComplete="name"
                />
              </div>
              {errors.nome && (
                <span className="input-error">{errors.nome.message}</span>
              )}
            </div>

            {/* Login e Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="input-group">
                <label className="input-label">Usuário</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-tertiary" />
                  <input
                    {...register("login")}
                    className={`input-field pl-11 ${errors.login ? "error" : ""}`}
                    placeholder="seu.usuario"
                    autoComplete="username"
                  />
                </div>
                {errors.login && (
                  <span className="input-error">{errors.login.message}</span>
                )}
              </div>

              <div className="input-group">
                <label className="input-label">E-mail</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-tertiary" />
                  <input
                    {...register("email")}
                    type="email"
                    className={`input-field pl-11 ${errors.email ? "error" : ""}`}
                    placeholder="email@empresa.com"
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <span className="input-error">{errors.email.message}</span>
                )}
              </div>
            </div>

            {/* Senhas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="input-group">
                <label className="input-label">Senha</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-tertiary" />
                  <input
                    {...register("senha")}
                    type={showPass ? "text" : "password"}
                    className={`input-field pl-11 pr-11 ${errors.senha ? "error" : ""}`}
                    placeholder="Min. 6 caracteres"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((s) => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-tertiary hover:text-secondary transition-colors"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.senha && (
                  <span className="input-error">{errors.senha.message}</span>
                )}
              </div>

              <div className="input-group">
                <label className="input-label">Confirmar senha</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-tertiary" />
                  <input
                    {...register("confirmarSenha")}
                    type={showPass ? "text" : "password"}
                    className={`input-field pl-11 ${errors.confirmarSenha ? "error" : ""}`}
                    placeholder="Repita a senha"
                    autoComplete="new-password"
                  />
                </div>
                {errors.confirmarSenha && (
                  <span className="input-error">{errors.confirmarSenha.message}</span>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary w-full"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Criando conta...
                  </span>
                ) : (
                  "Criar conta"
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-8 border-t border-border">
            <p className="text-center text-body-sm text-secondary">
              Já tem uma conta?{" "}
              <Link 
                to="/login" 
                className="text-accent hover:text-accent-hover transition-colors font-medium"
              >
                Entrar
              </Link>
            </p>
          </div>

          {/* Terms */}
          <p className="text-center text-caption text-tertiary mt-6">
            Ao criar uma conta, você concorda com nossos{" "}
            <button className="text-secondary hover:text-primary transition-colors">
              Termos de Uso
            </button>
            {" "}e{" "}
            <button className="text-secondary hover:text-primary transition-colors">
              Política de Privacidade
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
