import { User, Mail, Building2, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../auth/AuthContext";
import { useFornecedor } from "../context/FornecedorContext";

function roleBadge(role?: string) {
  if (role === "GERENTE") return { bg: "rgba(0,255,135,0.10)", color: "#00FF87", label: "Gerente" };
  return { bg: "rgba(0,229,255,0.10)", color: "#00E5FF", label: "Funcionário" };
}

export function ProfilePage() {
  const { user } = useAuth();
  const { nome: fornecedorNome, role, isGerente } = useFornecedor();

  const badge = roleBadge(role ?? undefined);

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#00FF87] mb-1 block">
          Configurações
        </span>
        <h1 className="text-2xl font-display font-bold text-[#F5F5F5]">
          Meu Perfil
        </h1>
        <p className="text-sm text-[#9CA3AF]">
          Suas informações pessoais
        </p>
      </motion.div>

      {/* User Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-sm bg-gradient-to-br from-[#00FF87] to-[#00E5FF] flex items-center justify-center text-2xl font-bold text-[#090B10]">
            {(user?.nome || user?.login || "U").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-medium text-[#F5F5F5]">
              {user?.nome || user?.login}
            </h2>
            <p className="text-sm text-[#9CA3AF]">@{user?.login}</p>
            <div className="flex items-center gap-2 mt-2">
              <span
                className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-sm"
                style={{ background: badge.bg, color: badge.color }}
              >
                <Shield size={12} />
                {badge.label}
              </span>
              {fornecedorNome && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-sm bg-[#10B981]/10 text-[#10B981]">
                  <Building2 size={12} />
                  {fornecedorNome}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-[#1A1D24] pt-6">
          <h3 className="text-sm font-medium text-[#F5F5F5] mb-4 flex items-center gap-2">
            <User size={16} className="text-[#00FF87]" />
            Informações Pessoais
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="input-label mb-2 block">Nome</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
                  <input
                    type="text"
                    value={user?.nome || ""}
                    readOnly
                    className="input-field pl-10 bg-[#0A0C10] cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="input-label mb-2 block">Usuário</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
                  <input
                    type="text"
                    value={user?.login || ""}
                    readOnly
                    className="input-field pl-10 bg-[#0A0C10] cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="input-label mb-2 block">E-mail</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
                <input
                  type="email"
                  value={user?.email || ""}
                  readOnly
                  className="input-field pl-10 bg-[#0A0C10] cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Empresa Info */}
      {fornecedorNome && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <h3 className="text-sm font-medium text-[#F5F5F5] mb-4 flex items-center gap-2">
            <Building2 size={16} className="text-[#00E5FF]" />
            Empresa Atual
          </h3>

          <div className="flex items-center gap-4 p-4 rounded-sm bg-[#0A0C10]">
            <div
              className="w-12 h-12 rounded-sm flex items-center justify-center text-lg font-bold"
              style={{ background: "rgba(0,255,135,0.1)", color: "#00FF87" }}
            >
              {fornecedorNome.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-medium text-[#F5F5F5]">{fornecedorNome}</p>
              <p className="text-sm text-[#9CA3AF]">
                Seu papel: <span className="text-[#00FF87]">{isGerente ? "Gerente" : "Funcionário"}</span>
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
