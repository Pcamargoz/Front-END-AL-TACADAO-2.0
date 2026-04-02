import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Building2, 
  Phone, 
  Mail, 
  FileText, 
  MapPin,
  Upload,
  Check,
  AlertCircle,
  Dumbbell
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiCriarFornecedor, type Fornecedor } from "../api/client";
import { useAuth } from "../auth/AuthContext";

interface FormData {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  categorias: string[];
}

const ESTADOS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

const CATEGORIAS = [
  { id: "proteinas", label: "Proteínas", icon: "💪" },
  { id: "pre-treino", label: "Pré-treino", icon: "⚡" },
  { id: "vitaminas", label: "Vitaminas", icon: "💊" },
  { id: "aminoacidos", label: "Aminoácidos", icon: "🧬" },
  { id: "creatina", label: "Creatina", icon: "🔥" },
  { id: "termogenicos", label: "Termogênicos", icon: "🌡️" },
  { id: "carboidratos", label: "Carboidratos", icon: "🍞" },
  { id: "outros", label: "Outros", icon: "📦" },
];

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

function formatCEP(value: string): string {
  const numbers = value.replace(/\D/g, "").slice(0, 8);
  return numbers.replace(/^(\d{5})(\d)/, "$1-$2");
}

export function SupplierRegisterPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<FormData>({
    razaoSocial: "",
    nomeFantasia: "",
    cnpj: "",
    email: user?.email || "",
    telefone: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    categorias: [],
  });

  const mutation = useMutation({
    mutationFn: async (data: Partial<Fornecedor>) => {
      const res = await apiCriarFornecedor(data);
      if (!res.ok) {
        throw new Error("Erro ao criar fornecedor");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fornecedores"] });
      navigate("/admin", { state: { supplierCreated: true } });
    },
    onError: (error) => {
      setErrors({ global: error.message });
    },
  });

  const updateField = (field: keyof FormData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const toggleCategoria = (catId: string) => {
    setFormData((prev) => ({
      ...prev,
      categorias: prev.categorias.includes(catId)
        ? prev.categorias.filter((c) => c !== catId)
        : [...prev.categorias, catId],
    }));
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.razaoSocial.trim()) newErrors.razaoSocial = "Razão social é obrigatória";
    if (!formData.cnpj.replace(/\D/g, "") || formData.cnpj.replace(/\D/g, "").length !== 14) {
      newErrors.cnpj = "CNPJ inválido";
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      newErrors.email = "E-mail inválido";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.endereco.trim()) newErrors.endereco = "Endereço é obrigatório";
    if (!formData.cidade.trim()) newErrors.cidade = "Cidade é obrigatória";
    if (!formData.estado) newErrors.estado = "Estado é obrigatório";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleSubmit = () => {
    if (formData.categorias.length === 0) {
      setErrors({ categorias: "Selecione ao menos uma categoria" });
      return;
    }

    mutation.mutate({
      razaoSocial: formData.razaoSocial,
      nomeFantasia: formData.nomeFantasia || undefined,
      cnpj: formData.cnpj.replace(/\D/g, ""),
      email: formData.email,
      telefone: formData.telefone.replace(/\D/g, "") || undefined,
      // TODO: API não suporta endereço e categorias ainda
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
          <Link to="/produtos" className="btn btn-ghost btn-icon">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-display font-bold text-[#F5F5F5]">
              Cadastrar Empresa
            </h1>
            <p className="text-sm text-[#9CA3AF]">
              Configure sua empresa para começar a vender
            </p>
          </div>
          <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-[#00FF87] to-[#00E5FF] flex items-center justify-center">
            <Dumbbell size={20} className="text-[#090B10]" />
          </div>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step >= s
                    ? "bg-[#00FF87] text-[#090B10]"
                    : "bg-[#1A1D24] text-[#4B5563]"
                }`}
              >
                {step > s ? <Check size={16} /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`flex-1 h-0.5 transition-colors ${
                    step > s ? "bg-[#00FF87]" : "bg-[#1A1D24]"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="card p-8">
          {errors.global && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 rounded-sm bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-center gap-2"
            >
              <AlertCircle size={16} className="text-[#EF4444]" />
              <span className="text-sm text-[#EF4444]">{errors.global}</span>
            </motion.div>
          )}

          {/* Step 1: Company Info */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-sm bg-[#00FF87]/10 flex items-center justify-center">
                  <Building2 size={20} className="text-[#00FF87]" />
                </div>
                <div>
                  <h2 className="font-medium text-[#F5F5F5]">Dados da Empresa</h2>
                  <p className="text-xs text-[#4B5563]">Informações principais</p>
                </div>
              </div>

              <div>
                <label className="input-label mb-2 block">Razão Social *</label>
                <input
                  type="text"
                  className={`input-field ${errors.razaoSocial ? "border-[#EF4444]" : ""}`}
                  placeholder="Empresa LTDA"
                  value={formData.razaoSocial}
                  onChange={(e) => updateField("razaoSocial", e.target.value)}
                />
                {errors.razaoSocial && (
                  <span className="text-xs text-[#EF4444] mt-1 block">{errors.razaoSocial}</span>
                )}
              </div>

              <div>
                <label className="input-label mb-2 block">Nome Fantasia</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Nome comercial (opcional)"
                  value={formData.nomeFantasia}
                  onChange={(e) => updateField("nomeFantasia", e.target.value)}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="input-label mb-2 block">CNPJ *</label>
                  <div className="relative">
                    <FileText size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
                    <input
                      type="text"
                      className={`input-field pl-10 ${errors.cnpj ? "border-[#EF4444]" : ""}`}
                      placeholder="00.000.000/0000-00"
                      value={formData.cnpj}
                      onChange={(e) => updateField("cnpj", formatCNPJ(e.target.value))}
                    />
                  </div>
                  {errors.cnpj && (
                    <span className="text-xs text-[#EF4444] mt-1 block">{errors.cnpj}</span>
                  )}
                </div>

                <div>
                  <label className="input-label mb-2 block">Telefone</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
                    <input
                      type="text"
                      className="input-field pl-10"
                      placeholder="(00) 00000-0000"
                      value={formData.telefone}
                      onChange={(e) => updateField("telefone", formatPhone(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="input-label mb-2 block">E-mail Comercial *</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
                  <input
                    type="email"
                    className={`input-field pl-10 ${errors.email ? "border-[#EF4444]" : ""}`}
                    placeholder="contato@empresa.com"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                  />
                </div>
                {errors.email && (
                  <span className="text-xs text-[#EF4444] mt-1 block">{errors.email}</span>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 2: Address */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-sm bg-[#00E5FF]/10 flex items-center justify-center">
                  <MapPin size={20} className="text-[#00E5FF]" />
                </div>
                <div>
                  <h2 className="font-medium text-[#F5F5F5]">Endereço</h2>
                  <p className="text-xs text-[#4B5563]">Localização da empresa</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="input-label mb-2 block">Endereço *</label>
                  <input
                    type="text"
                    className={`input-field ${errors.endereco ? "border-[#EF4444]" : ""}`}
                    placeholder="Rua, número, complemento"
                    value={formData.endereco}
                    onChange={(e) => updateField("endereco", e.target.value)}
                  />
                  {errors.endereco && (
                    <span className="text-xs text-[#EF4444] mt-1 block">{errors.endereco}</span>
                  )}
                </div>
                <div>
                  <label className="input-label mb-2 block">CEP</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="00000-000"
                    value={formData.cep}
                    onChange={(e) => updateField("cep", formatCEP(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="input-label mb-2 block">Cidade *</label>
                  <input
                    type="text"
                    className={`input-field ${errors.cidade ? "border-[#EF4444]" : ""}`}
                    placeholder="Sua cidade"
                    value={formData.cidade}
                    onChange={(e) => updateField("cidade", e.target.value)}
                  />
                  {errors.cidade && (
                    <span className="text-xs text-[#EF4444] mt-1 block">{errors.cidade}</span>
                  )}
                </div>
                <div>
                  <label className="input-label mb-2 block">Estado *</label>
                  <select
                    className={`input-field ${errors.estado ? "border-[#EF4444]" : ""}`}
                    value={formData.estado}
                    onChange={(e) => updateField("estado", e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {ESTADOS.map((uf) => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                  {errors.estado && (
                    <span className="text-xs text-[#EF4444] mt-1 block">{errors.estado}</span>
                  )}
                </div>
              </div>

              {/* Logo Upload (visual only) */}
              <div>
                <label className="input-label mb-2 block">Logotipo</label>
                <div className="border-2 border-dashed border-[#1A1D24] rounded-sm p-8 text-center hover:border-[#00FF87]/50 transition-colors cursor-pointer">
                  <Upload size={32} className="mx-auto text-[#4B5563] mb-3" />
                  <p className="text-sm text-[#9CA3AF] mb-1">Arraste ou clique para enviar</p>
                  <p className="text-xs text-[#4B5563]">PNG, JPG ou SVG (máx. 2MB)</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Categories */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-sm bg-[#F59E0B]/10 flex items-center justify-center">
                  <span className="text-xl">📦</span>
                </div>
                <div>
                  <h2 className="font-medium text-[#F5F5F5]">Categorias de Produtos</h2>
                  <p className="text-xs text-[#4B5563]">Selecione os tipos de produtos que você fornece</p>
                </div>
              </div>

              {errors.categorias && (
                <div className="p-3 rounded-sm bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-center gap-2">
                  <AlertCircle size={16} className="text-[#EF4444]" />
                  <span className="text-sm text-[#EF4444]">{errors.categorias}</span>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {CATEGORIAS.map((cat) => {
                  const selected = formData.categorias.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategoria(cat.id)}
                      className={`p-4 rounded-sm border-2 text-center transition-all ${
                        selected
                          ? "border-[#00FF87] bg-[#00FF87]/5"
                          : "border-[#1A1D24] hover:border-[#4B5563]"
                      }`}
                    >
                      <span className="text-2xl block mb-2">{cat.icon}</span>
                      <span className={`text-sm font-medium ${selected ? "text-[#00FF87]" : "text-[#F5F5F5]"}`}>
                        {cat.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Summary */}
              <div className="mt-8 p-4 bg-[#0A0C10] rounded-sm">
                <h3 className="text-sm font-medium text-[#F5F5F5] mb-3">Resumo do cadastro</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#4B5563]">Empresa:</span>
                    <span className="text-[#9CA3AF]">{formData.razaoSocial}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#4B5563]">CNPJ:</span>
                    <span className="text-[#9CA3AF] font-mono">{formData.cnpj}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#4B5563]">E-mail:</span>
                    <span className="text-[#9CA3AF]">{formData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#4B5563]">Local:</span>
                    <span className="text-[#9CA3AF]">{formData.cidade}, {formData.estado}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="btn btn-secondary"
              >
                Voltar
              </button>
            )}
            <div className="flex-1" />
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="btn btn-primary"
              >
                Continuar
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={mutation.isPending}
                className="btn btn-primary"
              >
                {mutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-[#090B10]/30 border-t-[#090B10] animate-spin" />
                    Cadastrando...
                  </span>
                ) : (
                  "Finalizar cadastro"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
