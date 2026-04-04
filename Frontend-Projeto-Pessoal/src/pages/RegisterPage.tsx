import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Dumbbell, User, Mail, Lock, Eye, EyeOff } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-[#090B10] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/login" className="btn btn-ghost btn-icon">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-display font-bold text-[#F5F5F5]">Criar conta</h1>
            <p className="text-sm text-[#9CA3AF]">
              Preencha seus dados para se registrar
            </p>
          </div>
          <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-[#00FF87] to-[#00E5FF] flex items-center justify-center">
            <Dumbbell size={20} className="text-[#090B10]" />
          </div>
        </div>

        <div className="card p-8">
          {globalError && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 rounded-sm bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
              <span className="text-sm text-[#EF4444]">{globalError}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="input-label mb-2 block">Nome completo *</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
                <input
                  {...register("nome")}
                  className={`input-field pl-10 ${errors.nome ? "border-[#EF4444]" : ""}`}
                  placeholder="Seu nome completo"
                />
              </div>
              {errors.nome && (
                <span className="text-xs text-[#EF4444] mt-1 block">{errors.nome.message}</span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="input-label mb-2 block">Usuário *</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
                  <input
                    {...register("login")}
                    className={`input-field pl-10 ${errors.login ? "border-[#EF4444]" : ""}`}
                    placeholder="seu.usuario"
                  />
                </div>
                {errors.login && (
                  <span className="text-xs text-[#EF4444] mt-1 block">{errors.login.message}</span>
                )}
              </div>

              <div>
                <label className="input-label mb-2 block">E-mail *</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
                  <input
                    {...register("email")}
                    type="email"
                    className={`input-field pl-10 ${errors.email ? "border-[#EF4444]" : ""}`}
                    placeholder="email@exemplo.com"
                  />
                </div>
                {errors.email && (
                  <span className="text-xs text-[#EF4444] mt-1 block">{errors.email.message}</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="input-label mb-2 block">Senha *</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
                  <input
                    {...register("senha")}
                    type={showPass ? "text" : "password"}
                    className={`input-field pl-10 pr-10 ${errors.senha ? "border-[#EF4444]" : ""}`}
                    placeholder="Min. 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4B5563] hover:text-[#9CA3AF] transition-colors"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.senha && (
                  <span className="text-xs text-[#EF4444] mt-1 block">{errors.senha.message}</span>
                )}
              </div>

              <div>
                <label className="input-label mb-2 block">Confirmar Senha *</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
                  <input
                    {...register("confirmarSenha")}
                    type={showPass ? "text" : "password"}
                    className={`input-field pl-10 ${errors.confirmarSenha ? "border-[#EF4444]" : ""}`}
                    placeholder="Repita a senha"
                  />
                </div>
                {errors.confirmarSenha && (
                  <span className="text-xs text-[#EF4444] mt-1 block">{errors.confirmarSenha.message}</span>
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary w-full"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-[#090B10]/30 border-t-[#090B10] animate-spin" />
                    Criando conta...
                  </span>
                ) : (
                  "Criar conta"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6">
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#1A1D24]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-[#090B10] text-[#4B5563]">ou</span>
            </div>
          </div>

          <p className="text-center text-sm text-[#9CA3AF]">
            Já tem uma conta?{" "}
            <Link to="/login" className="text-[#00FF87] hover:text-[#00E5FF] transition-colors font-medium">
              Entrar
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-[#4B5563] mt-6">
          Ao criar uma conta, você concorda com nossos{" "}
          <button className="text-[#9CA3AF] hover:text-[#00FF87] transition-colors">Termos de Uso</button>
          {" "}e{" "}
          <button className="text-[#9CA3AF] hover:text-[#00FF87] transition-colors">Política de Privacidade</button>
        </p>
      </motion.div>
    </div>
  );
}
