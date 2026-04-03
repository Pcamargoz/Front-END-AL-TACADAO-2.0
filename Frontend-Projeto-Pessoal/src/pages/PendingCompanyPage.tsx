import { useNavigate } from "react-router-dom";
import { Building2, Clock, LogOut, RefreshCw, CheckCircle2, UserCheck, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../auth/AuthContext";
import { useState } from "react";

export function PendingCompanyPage() {
  const navigate = useNavigate();
  const { user, logout, refresh, hasCompany, empresaNome } = useAuth();
  const [checking, setChecking] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const handleRefresh = async () => {
    setChecking(true);
    try {
      await refresh();
      // Se após refresh tiver empresa aprovada, redireciona para dashboard
      // (o useEffect no ProtectedRoute fará isso automaticamente)
    } finally {
      setChecking(false);
    }
  };

  // Se já tem empresa, redireciona
  if (hasCompany) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-[#090B10] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md text-center"
      >
        <div className="card p-8">
          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#F59E0B]/10 flex items-center justify-center">
            <Clock size={40} className="text-[#F59E0B]" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-display font-bold text-[#F5F5F5] mb-2">
            Aguardando Aprovação
          </h1>
          
          <p className="text-[#9CA3AF] mb-6">
            Olá{user?.nome ? `, ${user.nome}` : ""}! Sua solicitação de acesso 
            {empresaNome && (
              <> para a empresa <span className="text-[#00E5FF] font-medium">{empresaNome}</span></>
            )} foi enviada e está aguardando aprovação do gerente.
          </p>

          {/* Status Steps */}
          <div className="bg-[#1A1D24] rounded-sm p-4 mb-6 text-left">
            <div className="space-y-4">
              {/* Step 1 - Done */}
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#00FF87]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 size={14} className="text-[#00FF87]" />
                </div>
                <div>
                  <p className="text-sm text-[#F5F5F5] font-medium">Conta criada</p>
                  <p className="text-xs text-[#4B5563]">Seus dados foram cadastrados com sucesso</p>
                </div>
              </div>

              {/* Step 2 - Done */}
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#00FF87]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 size={14} className="text-[#00FF87]" />
                </div>
                <div>
                  <p className="text-sm text-[#F5F5F5] font-medium">Solicitação enviada</p>
                  <p className="text-xs text-[#4B5563]">Pedido de acesso enviado para a empresa</p>
                </div>
              </div>

              {/* Step 3 - Pending */}
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#F59E0B]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <UserCheck size={14} className="text-[#F59E0B]" />
                </div>
                <div>
                  <p className="text-sm text-[#F59E0B] font-medium">Aguardando aprovação</p>
                  <p className="text-xs text-[#4B5563]">O gerente da empresa precisa aprovar seu acesso</p>
                </div>
              </div>
            </div>
          </div>

          {/* Info about user */}
          <div className="bg-[#0A0C10] rounded-sm p-3 mb-6 text-sm">
            <div className="flex items-center justify-between text-[#4B5563]">
              <span>Usuário:</span>
              <span className="text-[#F5F5F5]">@{user?.login}</span>
            </div>
            <div className="flex items-center justify-between text-[#4B5563] mt-1">
              <span>E-mail:</span>
              <span className="text-[#F5F5F5]">{user?.email}</span>
            </div>
            {empresaNome && (
              <div className="flex items-center justify-between text-[#4B5563] mt-1">
                <span>Empresa:</span>
                <span className="text-[#00E5FF]">{empresaNome}</span>
              </div>
            )}
          </div>

          {/* Help text */}
          <div className="p-3 rounded-sm bg-[#00E5FF]/10 border border-[#00E5FF]/20 mb-6">
            <div className="flex items-start gap-2">
              <Building2 size={16} className="text-[#00E5FF] mt-0.5 flex-shrink-0" />
              <p className="text-xs text-[#00E5FF] text-left">
                Entre em contato com o gerente da empresa para acelerar o processo de aprovação.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={checking}
              className="btn btn-secondary flex-1"
            >
              {checking ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}
              Verificar status
            </button>
            <button
              onClick={handleLogout}
              className="btn btn-ghost flex-1"
            >
              <LogOut size={16} />
              Sair
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-[#4B5563] mt-6">
          Precisa criar uma nova empresa?{" "}
          <button 
            onClick={() => {
              logout();
              navigate("/cadastro");
            }}
            className="text-[#00FF87] hover:text-[#00E5FF] transition-colors"
          >
            Cadastre-se como gerente
          </button>
        </p>
      </motion.div>
    </div>
  );
}
