import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  Hash,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Dumbbell,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiCreateFornecedor, type FornecedorPayload } from "../api/client";
import { Modal } from "../components/ui/Modal";

const schema = z.object({
  razaoSocial: z.string().min(2, "Razão social é obrigatória"),
  nomeFantasia: z.string().optional(),
  cnpj: z.string().min(14, "CNPJ inválido"),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().optional(),
  senhaAcesso: z.string().min(4, "Senha de acesso deve ter pelo menos 4 caracteres"),
  confirmarSenha: z.string().min(1, "Confirme a senha de acesso"),
}).refine((data) => data.senhaAcesso === data.confirmarSenha, {
  message: "As senhas não coincidem",
  path: ["confirmarSenha"],
});

type FormValues = z.infer<typeof schema>;

function formatCNPJ(value: string): string {
  const numbers = value.replace(/\D/g, "").slice(0, 14);
  return numbers
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function formatPhone(value: string): string {
  const numbers = value.replace(/\D/g, "").slice(0, 11);
  if (numbers.length <= 10) {
    return numbers
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  return numbers
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

export function EmpresaCadastrarPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showSenha, setShowSenha] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      razaoSocial: "",
      nomeFantasia: "",
      cnpj: "",
      email: "",
      telefone: "",
      senhaAcesso: "",
      confirmarSenha: "",
    },
  });

  const [globalError, setGlobalError] = useState("");

  const mutation = useMutation({
    mutationFn: async (data: FornecedorPayload) => {
      const res = await apiCreateFornecedor(data);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Erro ao cadastrar empresa");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fornecedores"] });
      setSuccessModal(true);
    },
    onError: (error: Error) => {
      setGlobalError(error.message);
    },
  });

  const onSubmit = (values: FormValues) => {
    setGlobalError("");
    mutation.mutate({
      razaoSocial: values.razaoSocial,
      nomeFantasia: values.nomeFantasia || undefined,
      cnpj: values.cnpj.replace(/\D/g, ""),
      email: values.email,
      telefone: values.telefone?.replace(/\D/g, "") || undefined,
      senhaAcesso: values.senhaAcesso,
    });
  };

  return (
    <div className="min-h-screen bg-[#090B10] py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Link to="/empresas" className="btn btn-ghost btn-icon">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-display font-bold text-[#F5F5F5]">
              Cadastrar Empresa
            </h1>
            <p className="text-sm text-[#9CA3AF]">
              Preencha os dados para criar uma nova empresa
            </p>
          </div>
          <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-[#00FF87] to-[#00E5FF] flex items-center justify-center">
            <Dumbbell size={20} className="text-[#090B10]" />
          </div>
        </motion.div>

        <div className="bg-white/5 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-lg shadow-black/10 p-8 transition-all duration-200 ease-out hover:shadow-xl hover:border-slate-600/60">
          {globalError && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 rounded-sm bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-center gap-2"
            >
              <AlertCircle size={16} className="text-[#EF4444]" />
              <span className="text-sm text-[#EF4444]">{globalError}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Company data section */}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-sm bg-[#00FF87]/10 flex items-center justify-center">
                <Building2 size={20} className="text-[#00FF87]" />
              </div>
              <div>
                <h2 className="font-medium text-[#F5F5F5]">Dados da Empresa</h2>
                <p className="text-xs text-[#4B5563]">Informações do fornecedor</p>
              </div>
            </div>

            <div>
              <label className="input-label mb-2 block">Razão Social *</label>
              <input
                {...register("razaoSocial")}
                className={`input-field ${errors.razaoSocial ? "border-[#EF4444]" : ""}`}
                placeholder="Nome legal da empresa"
              />
              {errors.razaoSocial && (
                <span className="text-xs text-[#EF4444] mt-1 block">{errors.razaoSocial.message}</span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="input-label mb-2 block">Nome Fantasia</label>
                <div className="relative">
                  <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
                  <input
                    {...register("nomeFantasia")}
                    className="input-field pl-10"
                    placeholder="Nome comercial"
                  />
                </div>
              </div>
              <div>
                <label className="input-label mb-2 block">CNPJ *</label>
                <div className="relative">
                  <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
                  <input
                    {...register("cnpj")}
                    onChange={(e) => setValue("cnpj", formatCNPJ(e.target.value))}
                    className={`input-field pl-10 font-mono ${errors.cnpj ? "border-[#EF4444]" : ""}`}
                    placeholder="00.000.000/0001-00"
                  />
                </div>
                {errors.cnpj && (
                  <span className="text-xs text-[#EF4444] mt-1 block">{errors.cnpj.message}</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="input-label mb-2 block">E-mail *</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
                  <input
                    {...register("email")}
                    type="email"
                    className={`input-field pl-10 ${errors.email ? "border-[#EF4444]" : ""}`}
                    placeholder="contato@empresa.com"
                  />
                </div>
                {errors.email && (
                  <span className="text-xs text-[#EF4444] mt-1 block">{errors.email.message}</span>
                )}
              </div>
              <div>
                <label className="input-label mb-2 block">Telefone</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
                  <input
                    {...register("telefone")}
                    onChange={(e) => setValue("telefone", formatPhone(e.target.value))}
                    className="input-field pl-10"
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>
            </div>

            {/* Password section */}
            <div className="border-t border-[#1A1D24] pt-5 mt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-sm bg-[#F59E0B]/10 flex items-center justify-center">
                  <ShieldAlert size={20} className="text-[#F59E0B]" />
                </div>
                <div>
                  <h2 className="font-medium text-[#F5F5F5]">Senha de Acesso</h2>
                  <p className="text-xs text-[#4B5563]">
                    Esta senha será usada para acessar o painel da empresa
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-sm bg-[#F59E0B]/10 border border-[#F59E0B]/20 mb-4">
                <p className="text-xs text-[#F59E0B]">
                  Defina uma senha de acesso que será compartilhada com os membros autorizados da empresa.
                  Qualquer pessoa com esta senha poderá acessar o painel.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="input-label mb-2 block">Senha de Acesso *</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
                    <input
                      {...register("senhaAcesso")}
                      type={showSenha ? "text" : "password"}
                      className={`input-field pl-10 pr-10 ${errors.senhaAcesso ? "border-[#EF4444]" : ""}`}
                      placeholder="Defina uma senha"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSenha((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4B5563] hover:text-[#9CA3AF] transition-colors"
                    >
                      {showSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.senhaAcesso && (
                    <span className="text-xs text-[#EF4444] mt-1 block">{errors.senhaAcesso.message}</span>
                  )}
                </div>
                <div>
                  <label className="input-label mb-2 block">Confirmar Senha *</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
                    <input
                      {...register("confirmarSenha")}
                      type={showSenha ? "text" : "password"}
                      className={`input-field pl-10 ${errors.confirmarSenha ? "border-[#EF4444]" : ""}`}
                      placeholder="Repita a senha"
                    />
                  </div>
                  {errors.confirmarSenha && (
                    <span className="text-xs text-[#EF4444] mt-1 block">{errors.confirmarSenha.message}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={mutation.isPending}
                className="btn btn-primary w-full"
              >
                {mutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-[#090B10]/30 border-t-[#090B10] animate-spin" />
                    Cadastrando...
                  </span>
                ) : (
                  "Cadastrar Empresa"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      <Modal open={successModal} onClose={() => { setSuccessModal(false); navigate("/empresas"); }} title="Empresa Cadastrada" size="sm">
        <div className="text-center py-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#00FF87]/10 flex items-center justify-center">
            <CheckCircle2 size={32} className="text-[#00FF87]" />
          </div>
          <h3 className="text-lg font-medium text-[#F5F5F5] mb-2">
            Empresa cadastrada com sucesso!
          </h3>
          <p className="text-sm text-[#9CA3AF] mb-4">
            A senha de acesso definida é sua chave para o painel de administração.
            Guarde-a com segurança.
          </p>
          <div className="p-3 rounded-sm bg-[#F59E0B]/10 border border-[#F59E0B]/20 mb-6">
            <p className="text-xs text-[#F59E0B]">
              Compartilhe a senha apenas com pessoas autorizadas. Você pode alterar a senha a qualquer momento no painel da empresa.
            </p>
          </div>
          <button
            onClick={() => { setSuccessModal(false); navigate("/empresas"); }}
            className="btn btn-primary w-full"
          >
            Ir para Lista de Empresas
          </button>
        </div>
      </Modal>
    </div>
  );
}
