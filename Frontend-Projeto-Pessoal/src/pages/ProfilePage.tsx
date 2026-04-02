import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Mail, Lock, Eye, EyeOff, Building2, Shield, Save } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "../auth/AuthContext";
import { apiUpdateUsuario } from "../api/client";

const profileSchema = z.object({
  nome: z.string().optional(),
  login: z.string().min(1, "Usuário é obrigatório"),
  email: z.string().email("E-mail inválido"),
});

const passwordSchema = z.object({
  senhaAtual: z.string().min(1, "Senha atual é obrigatória"),
  novaSenha: z.string().min(6, "Mínimo 6 caracteres"),
  confirmarSenha: z.string().min(1, "Confirme a nova senha"),
}).refine((data) => data.novaSenha === data.confirmarSenha, {
  message: "As senhas não coincidem",
  path: ["confirmarSenha"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

function roleBadge(role?: string) {
  if (role === "GERENTE") return { bg: "rgba(0,255,135,0.10)", color: "#00FF87", label: "Gerente" };
  return { bg: "rgba(0,229,255,0.10)", color: "#00E5FF", label: "Usuário" };
}

export function ProfilePage() {
  const { user, refresh } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nome: user?.nome ?? "",
      login: user?.login ?? "",
      email: user?.email ?? "",
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      senhaAtual: "",
      novaSenha: "",
      confirmarSenha: "",
    },
  });

  const onProfileSubmit = async (values: ProfileFormValues) => {
    if (!user?.id) return;
    setSavingProfile(true);
    try {
      const res = await apiUpdateUsuario(user.id, {
        nome: values.nome?.trim() || undefined,
        login: values.login,
        email: values.email,
      });
      if (res.ok) {
        toast.success("Perfil atualizado com sucesso!");
        await refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.message || "Erro ao atualizar perfil");
      }
    } catch {
      toast.error("Erro ao atualizar perfil");
    } finally {
      setSavingProfile(false);
    }
  };

  const onPasswordSubmit = async (values: PasswordFormValues) => {
    if (!user?.id) return;
    setSavingPassword(true);
    try {
      const res = await apiUpdateUsuario(user.id, {
        senha: values.novaSenha,
      });
      if (res.ok) {
        toast.success("Senha alterada com sucesso!");
        passwordForm.reset();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.message || "Erro ao alterar senha");
      }
    } catch {
      toast.error("Erro ao alterar senha");
    } finally {
      setSavingPassword(false);
    }
  };

  const badge = roleBadge(user?.roles?.[0]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
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
          Gerencie suas informações pessoais
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
              {user?.fornecedorId ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-sm bg-[#10B981]/10 text-[#10B981]">
                  <Building2 size={12} />
                  Vinculado à empresa
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-sm bg-[#F59E0B]/10 text-[#F59E0B]">
                  <Building2 size={12} />
                  Sem empresa
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

          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
            <div>
              <label className="input-label mb-2 block">Nome completo</label>
              <input
                {...profileForm.register("nome")}
                className="input-field"
                placeholder="Seu nome"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="input-label mb-2 block">Usuário</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
                  <input
                    {...profileForm.register("login")}
                    className={`input-field pl-10 ${profileForm.formState.errors.login ? "border-[#EF4444]" : ""}`}
                    placeholder="usuario"
                  />
                </div>
                {profileForm.formState.errors.login && (
                  <span className="text-xs text-[#EF4444] mt-1 block">
                    {profileForm.formState.errors.login.message}
                  </span>
                )}
              </div>

              <div>
                <label className="input-label mb-2 block">E-mail</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
                  <input
                    {...profileForm.register("email")}
                    type="email"
                    className={`input-field pl-10 ${profileForm.formState.errors.email ? "border-[#EF4444]" : ""}`}
                    placeholder="email@empresa.com"
                  />
                </div>
                {profileForm.formState.errors.email && (
                  <span className="text-xs text-[#EF4444] mt-1 block">
                    {profileForm.formState.errors.email.message}
                  </span>
                )}
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                {savingProfile ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-[#090B10]/30 border-t-[#090B10] animate-spin" />
                    Salvando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save size={16} />
                    Salvar alterações
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>

      {/* Password Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-6"
      >
        <h3 className="text-sm font-medium text-[#F5F5F5] mb-4 flex items-center gap-2">
          <Lock size={16} className="text-[#00E5FF]" />
          Alterar Senha
        </h3>

        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
          <div>
            <label className="input-label mb-2 block">Senha atual</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
              <input
                {...passwordForm.register("senhaAtual")}
                type={showPassword ? "text" : "password"}
                className={`input-field pl-10 pr-10 ${passwordForm.formState.errors.senhaAtual ? "border-[#EF4444]" : ""}`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4B5563] hover:text-[#9CA3AF] transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {passwordForm.formState.errors.senhaAtual && (
              <span className="text-xs text-[#EF4444] mt-1 block">
                {passwordForm.formState.errors.senhaAtual.message}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label mb-2 block">Nova senha</label>
              <input
                {...passwordForm.register("novaSenha")}
                type={showPassword ? "text" : "password"}
                className={`input-field ${passwordForm.formState.errors.novaSenha ? "border-[#EF4444]" : ""}`}
                placeholder="••••••••"
              />
              {passwordForm.formState.errors.novaSenha && (
                <span className="text-xs text-[#EF4444] mt-1 block">
                  {passwordForm.formState.errors.novaSenha.message}
                </span>
              )}
            </div>

            <div>
              <label className="input-label mb-2 block">Confirmar nova senha</label>
              <input
                {...passwordForm.register("confirmarSenha")}
                type={showPassword ? "text" : "password"}
                className={`input-field ${passwordForm.formState.errors.confirmarSenha ? "border-[#EF4444]" : ""}`}
                placeholder="••••••••"
              />
              {passwordForm.formState.errors.confirmarSenha && (
                <span className="text-xs text-[#EF4444] mt-1 block">
                  {passwordForm.formState.errors.confirmarSenha.message}
                </span>
              )}
            </div>
          </div>

          <div className="pt-2">
            <button type="submit" className="btn btn-secondary" disabled={savingPassword}>
              {savingPassword ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-[#F5F5F5]/30 border-t-[#F5F5F5] animate-spin" />
                  Alterando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Lock size={16} />
                  Alterar senha
                </span>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
