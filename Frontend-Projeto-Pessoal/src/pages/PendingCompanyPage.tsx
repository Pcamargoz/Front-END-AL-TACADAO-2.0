import { useNavigate } from "react-router-dom";
import { Building2, Clock, LogOut, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../auth/AuthContext";

export function PendingCompanyPage() {
  const navigate = useNavigate();
  const { user, logout, refresh } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const handleRefresh = async () => {
    await refresh();
    // Se após refresh tiver empresa, redireciona
    // O ProtectedRoute vai cuidar disso automaticamente
  };

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
            Aguardando Vinculação
          </h1>
          
          <p className="text-[#9CA3AF] mb-6">
            Olá{user?.nome ? `, ${user.nome}` : ""}! Sua conta foi criada com sucesso, 
            mas você ainda não está vinculado a nenhuma empresa.
          </p>

          {/* Info Box */}
          <div className="bg-[#1A1D24] rounded-sm p-4 mb-6 text-left">
            <div className="flex items-start gap-3">
              <Building2 size={20} className="text-[#00E5FF] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-[#F5F5F5] font-medium mb-1">
                  O que acontece agora?
                </p>
                <ul className="text-xs text-[#9CA3AF] space-y-1">
                  <li>• Um gerente da sua empresa precisa vincular você</li>
                  <li>• Após a vinculação, faça login novamente</li>
                  <li>• Você terá acesso completo ao sistema</li>
                </ul>
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
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              className="btn btn-secondary flex-1"
            >
              <RefreshCw size={16} />
              Verificar novamente
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
          Se você é um gerente e precisa criar uma empresa,{" "}
          <button 
            onClick={() => navigate("/fornecedores")}
            className="text-[#00FF87] hover:text-[#00E5FF] transition-colors"
          >
            clique aqui
          </button>
        </p>
      </motion.div>
    </div>
  );
}
