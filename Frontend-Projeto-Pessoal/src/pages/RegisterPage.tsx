import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Mail, User, Lock, ArrowLeft, Dumbbell, Check } from "lucide-react";
import { motion } from "framer-motion";
import { apiCadastro, type ErroResposta } from "../api/client";

export function RegisterPage() {
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [loginV, setLoginV] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalErr, setGlobalErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGlobalErr("");

    // Client-side validation
    if (senha !== confirmSenha) {
      setErrors({ confirmSenha: "As senhas não coincidem" });
      return;
    }

    if (senha.length < 6) {
      setErrors({ senha: "A senha deve ter no mínimo 6 caracteres" });
      return;
    }

    setSubmitting(true);

    // Cadastro público - sempre cria com role=USER, sem empresa
    const payload = { nome: nome.trim() || undefined, login: loginV, email, senha };
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
      setGlobalErr("Usuário ou e-mail já cadastrado.");
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

  const strengthLabels = ["Fraca", "Regular", "Boa", "Forte"];
  const strengthColors = ["#EF4444", "#F59E0B", "#00E5FF", "#00FF87"];
  const strengthColor = strengthColors[strengthScore - 1] ?? "#1A1D24";
  const strengthLabel = strengthScore > 0 ? strengthLabels[strengthScore - 1] : "";

  return (
    <div className="min-h-screen bg-[#090B10] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/login" className="btn btn-ghost btn-icon">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-display font-bold text-[#F5F5F5]">Criar conta</h1>
            <p className="text-sm text-[#9CA3AF]">Preencha seus dados para começar</p>
          </div>
          <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-[#00FF87] to-[#00E5FF] flex items-center justify-center">
            <Dumbbell size={20} className="text-[#090B10]" />
          </div>
        </div>

        <div className="card p-8">
          {globalErr && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 rounded-sm bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
              <span className="text-sm text-[#EF4444]">{globalErr}</span>
            </motion.div>
          )}

          {/* Info about registration flow */}
          <div className="mb-6 p-3 rounded-sm bg-[#00E5FF]/10 border border-[#00E5FF]/20">
            <p className="text-xs text-[#00E5FF]">
              Após o cadastro, um gerente precisará vincular você a uma empresa para acesso completo ao sistema.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="input-label mb-2 block">Nome completo</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
                <input
                  type="text"
                  className={`input-field pl-10 ${errors.nome ? "border-[#EF4444]" : ""}`}
                  placeholder="Seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>
              {errors.nome && <span className="text-xs text-[#EF4444] mt-1 block">{errors.nome}</span>}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Username */}
              <div>
                <label className="input-label mb-2 block">Usuário *</label>
                <input
                  type="text"
                  className={`input-field ${errors.login ? "border-[#EF4444]" : ""}`}
                  placeholder="seu.usuario"
                  value={loginV}
                  onChange={(e) => setLoginV(e.target.value)}
                  required
                />
                {errors.login && <span className="text-xs text-[#EF4444] mt-1 block">{errors.login}</span>}
              </div>

              {/* Email */}
              <div>
                <label className="input-label mb-2 block">E-mail *</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
                  <input
                    type="email"
                    className={`input-field pl-10 ${errors.email ? "border-[#EF4444]" : ""}`}
                    placeholder="voce@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                {errors.email && <span className="text-xs text-[#EF4444] mt-1 block">{errors.email}</span>}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Password */}
              <div>
                <label className="input-label mb-2 block">Senha *</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
                  <input
                    type={showPass ? "text" : "password"}
                    className={`input-field pl-10 pr-10 ${errors.senha ? "border-[#EF4444]" : ""}`}
                    placeholder="••••••••"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4B5563] hover:text-[#9CA3AF] transition-colors"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {senha && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((s) => (
                        <div
                          key={s}
                          className="flex-1 h-1 rounded-full transition-all duration-300"
                          style={{ background: strengthScore >= s ? strengthColor : "#1A1D24" }}
                        />
                      ))}
                    </div>
                    <p className="text-xs mt-1" style={{ color: strengthColor }}>{strengthLabel}</p>
                  </div>
                )}
                {errors.senha && <span className="text-xs text-[#EF4444] mt-1 block">{errors.senha}</span>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="input-label mb-2 block">Confirmar senha *</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
                  <input
                    type={showPass ? "text" : "password"}
                    className={`input-field pl-10 ${errors.confirmSenha ? "border-[#EF4444]" : ""}`}
                    placeholder="••••••••"
                    value={confirmSenha}
                    onChange={(e) => setConfirmSenha(e.target.value)}
                    required
                  />
                  {confirmSenha && senha === confirmSenha && (
                    <Check size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00FF87]" />
                  )}
                </div>
                {errors.confirmSenha && <span className="text-xs text-[#EF4444] mt-1 block">{errors.confirmSenha}</span>}
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn btn-primary w-full">
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-[#090B10]/30 border-t-[#090B10] animate-spin" />
                  Criando conta...
                </span>
              ) : (
                "Criar conta"
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#1A1D24]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-[#111318] text-[#4B5563]">ou</span>
            </div>
          </div>

          <p className="text-center text-sm text-[#9CA3AF]">
            Já tem uma conta?{" "}
            <Link to="/login" className="text-[#00FF87] hover:text-[#00E5FF] transition-colors font-medium">
              Entrar
            </Link>
          </p>
        </div>

        {/* Footer */}
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
