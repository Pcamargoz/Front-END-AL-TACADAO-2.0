import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Eye, EyeOff, Lock, User, ArrowRight, Dumbbell, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../auth/AuthContext";

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
    // Se ok, o useEffect fará o redirect
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#090B10] flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#090B10] via-[#111318] to-[#0A0C10] relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00FF87]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#00E5FF]/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-14 h-14 rounded-sm bg-gradient-to-br from-[#00FF87] to-[#00E5FF] flex items-center justify-center">
              <Dumbbell size={28} className="text-[#090B10]" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-[#F5F5F5] tracking-wider">
                AL-TACADÃO
              </h1>
              <p className="text-[10px] text-[#4B5563] tracking-[0.2em] uppercase">
                Suplementos Premium
              </p>
            </div>
          </div>

          <h2 className="text-4xl xl:text-5xl font-display font-bold text-[#F5F5F5] mb-4 leading-tight">
            POTENCIALIZE
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF87] to-[#00E5FF]">
              SEUS RESULTADOS
            </span>
          </h2>
          <p className="text-[#9CA3AF] text-lg mb-8 max-w-md">
            A plataforma B2B líder em distribuição de suplementos esportivos de alta performance.
          </p>

          {/* Features */}
          <div className="space-y-4">
            {[
              "Catálogo exclusivo de marcas premium",
              "Gestão completa de pedidos",
              "Preços especiais para distribuidores",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-sm bg-[#00FF87]/10 flex items-center justify-center">
                  <Zap size={14} className="text-[#00FF87]" />
                </div>
                <span className="text-sm text-[#9CA3AF]">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-[#00FF87] to-[#00E5FF] flex items-center justify-center">
              <Dumbbell size={20} className="text-[#090B10]" />
            </div>
            <span className="font-display text-xl font-bold text-[#F5F5F5]">AL-TACADÃO</span>
          </div>

          <div className="card p-8">
            <h2 className="text-xl font-display font-bold text-[#F5F5F5] mb-1">
              Bem-vindo de volta
            </h2>
            <p className="text-sm text-[#9CA3AF] mb-6">
              Entre na sua conta para continuar
            </p>

            {fromRegister && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-sm bg-[#10B981]/10 border border-[#10B981]/20 flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span className="text-sm text-[#10B981]">Conta criada com sucesso! Faça login para continuar.</span>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-sm bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                <span className="text-sm text-[#EF4444]">{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="input-label mb-2 block">Usuário</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
                  <input
                    type="text"
                    className="input-field pl-10"
                    placeholder="seu.usuario"
                    value={loginVal}
                    onChange={(e) => setLoginVal(e.target.value)}
                    autoFocus
                    required
                  />
                </div>
              </div>

              <div>
                <label className="input-label mb-2 block">Senha</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
                  <input
                    type={showPass ? "text" : "password"}
                    className="input-field pl-10 pr-10"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded-sm border-[#1A1D24] bg-[#111318] text-[#00FF87] focus:ring-[#00FF87]/20" />
                  <span className="text-sm text-[#9CA3AF]">Lembrar de mim</span>
                </label>
                <button type="button" className="text-sm text-[#00FF87] hover:text-[#00E5FF] transition-colors">
                  Esqueceu a senha?
                </button>
              </div>

              <button
                type="submit"
                disabled={submitting || !loginVal || !password}
                className="btn btn-primary w-full"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-[#090B10]/30 border-t-[#090B10] animate-spin" />
                    Entrando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Entrar <ArrowRight size={16} />
                  </span>
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
              Não tem uma conta?{" "}
              <Link to="/cadastro" className="text-[#00FF87] hover:text-[#00E5FF] transition-colors font-medium">
                Criar conta
              </Link>
            </p>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-[#4B5563] mt-6">
            © 2024 AL-TACADÃO. Todos os direitos reservados.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
