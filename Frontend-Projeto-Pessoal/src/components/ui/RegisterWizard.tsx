import { createContext, useContext, useState, useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Building2, 
  User, 
  Search, 
  Plus,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  FileText,
  Loader2
} from "lucide-react";

// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════

export type RegisterType = "new-company" | "existing-company";

export type RegisterStep = 
  | "select-type"
  | "company-form"
  | "company-search"
  | "user-form"
  | "submitting"
  | "success";

export interface EmpresaData {
  id?: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string;
  email: string;
  telefone?: string;
}

export interface UsuarioData {
  nome?: string;
  login: string;
  email: string;
  senha: string;
}

interface RegisterState {
  step: RegisterStep;
  type: RegisterType | null;
  empresa: EmpresaData | null;
  usuario: UsuarioData | null;
  error: string | null;
  fieldErrors: Record<string, string>;
}

interface RegisterContextValue extends RegisterState {
  setStep: (step: RegisterStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  setType: (type: RegisterType) => void;
  setEmpresa: (data: EmpresaData) => void;
  setUsuario: (data: UsuarioData) => void;
  setError: (error: string | null) => void;
  setFieldErrors: (errors: Record<string, string>) => void;
  clearErrors: () => void;
  reset: () => void;
  isNewCompany: boolean;
  canGoBack: boolean;
  progressPercent: number;
  stepNumber: number;
  totalSteps: number;
}

const initialState: RegisterState = {
  step: "select-type",
  type: null,
  empresa: null,
  usuario: null,
  error: null,
  fieldErrors: {},
};

const RegisterContext = createContext<RegisterContextValue | null>(null);

// ══════════════════════════════════════════════════════════════════════════════
// CONTEXT PROVIDER
// ══════════════════════════════════════════════════════════════════════════════

export function RegisterProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<RegisterState>(initialState);

  const setStep = useCallback((step: RegisterStep) => {
    setState((s) => ({ ...s, step, error: null, fieldErrors: {} }));
  }, []);

  const nextStep = useCallback(() => {
    setState((s) => {
      const { step, type } = s;
      let next: RegisterStep = step;
      
      switch (step) {
        case "select-type":
          next = type === "new-company" ? "company-form" : "company-search";
          break;
        case "company-form":
        case "company-search":
          next = "user-form";
          break;
        case "user-form":
          next = "submitting";
          break;
        case "submitting":
          next = "success";
          break;
      }
      
      return { ...s, step: next, error: null, fieldErrors: {} };
    });
  }, []);

  const prevStep = useCallback(() => {
    setState((s) => {
      const { step, type } = s;
      let prev: RegisterStep = step;
      
      switch (step) {
        case "company-form":
        case "company-search":
          prev = "select-type";
          break;
        case "user-form":
          prev = type === "new-company" ? "company-form" : "company-search";
          break;
      }
      
      return { ...s, step: prev, error: null, fieldErrors: {} };
    });
  }, []);

  const setType = useCallback((type: RegisterType) => {
    setState((s) => ({ ...s, type }));
  }, []);

  const setEmpresa = useCallback((empresa: EmpresaData) => {
    setState((s) => ({ ...s, empresa }));
  }, []);

  const setUsuario = useCallback((usuario: UsuarioData) => {
    setState((s) => ({ ...s, usuario }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((s) => ({ ...s, error }));
  }, []);

  const setFieldErrors = useCallback((fieldErrors: Record<string, string>) => {
    setState((s) => ({ ...s, fieldErrors }));
  }, []);

  const clearErrors = useCallback(() => {
    setState((s) => ({ ...s, error: null, fieldErrors: {} }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  const isNewCompany = state.type === "new-company";
  const canGoBack = ["company-form", "company-search", "user-form"].includes(state.step);
  
  const { stepNumber, totalSteps, progressPercent } = useMemo(() => {
    const stepsMap: Record<RegisterStep, number> = {
      "select-type": 1,
      "company-form": 2,
      "company-search": 2,
      "user-form": 3,
      "submitting": 3,
      "success": 3,
    };
    const current = stepsMap[state.step];
    const total = 3;
    return { 
      stepNumber: current, 
      totalSteps: total,
      progressPercent: Math.round((current / total) * 100)
    };
  }, [state.step]);

  const value: RegisterContextValue = {
    ...state,
    setStep,
    nextStep,
    prevStep,
    setType,
    setEmpresa,
    setUsuario,
    setError,
    setFieldErrors,
    clearErrors,
    reset,
    isNewCompany,
    canGoBack,
    progressPercent,
    stepNumber,
    totalSteps,
  };

  return (
    <RegisterContext.Provider value={value}>
      {children}
    </RegisterContext.Provider>
  );
}

export function useRegister(): RegisterContextValue {
  const ctx = useContext(RegisterContext);
  if (!ctx) throw new Error("useRegister deve estar dentro de RegisterProvider");
  return ctx;
}

// ══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════════════

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

// ══════════════════════════════════════════════════════════════════════════════
// STEP 1: SELECT TYPE
// ══════════════════════════════════════════════════════════════════════════════

export function StepTypeSelection() {
  const { type, setType, nextStep } = useRegister();

  const handleSelect = (selectedType: RegisterType) => {
    setType(selectedType);
  };

  const handleContinue = () => {
    if (type) nextStep();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-xl font-display font-bold text-[#F5F5F5] mb-2">
          Como deseja se cadastrar?
        </h2>
        <p className="text-sm text-[#9CA3AF]">
          Escolha uma opção para continuar
        </p>
      </div>

      <div className="grid gap-4">
        {/* Nova Empresa */}
        <button
          type="button"
          onClick={() => handleSelect("new-company")}
          className={`p-6 rounded-sm border-2 text-left transition-all ${
            type === "new-company"
              ? "border-[#00FF87] bg-[#00FF87]/5"
              : "border-[#1A1D24] hover:border-[#4B5563]"
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-sm flex items-center justify-center ${
              type === "new-company" ? "bg-[#00FF87]/10" : "bg-[#1A1D24]"
            }`}>
              <Plus size={24} className={type === "new-company" ? "text-[#00FF87]" : "text-[#4B5563]"} />
            </div>
            <div className="flex-1">
              <span className={`font-medium block mb-1 ${
                type === "new-company" ? "text-[#00FF87]" : "text-[#F5F5F5]"
              }`}>
                Criar nova empresa
              </span>
              <span className="text-sm text-[#9CA3AF]">
                Cadastre sua empresa e torne-se o gerente responsável
              </span>
            </div>
            {type === "new-company" && (
              <Check size={20} className="text-[#00FF87]" />
            )}
          </div>
        </button>

        {/* Empresa Existente */}
        <button
          type="button"
          onClick={() => handleSelect("existing-company")}
          className={`p-6 rounded-sm border-2 text-left transition-all ${
            type === "existing-company"
              ? "border-[#00E5FF] bg-[#00E5FF]/5"
              : "border-[#1A1D24] hover:border-[#4B5563]"
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-sm flex items-center justify-center ${
              type === "existing-company" ? "bg-[#00E5FF]/10" : "bg-[#1A1D24]"
            }`}>
              <Search size={24} className={type === "existing-company" ? "text-[#00E5FF]" : "text-[#4B5563]"} />
            </div>
            <div className="flex-1">
              <span className={`font-medium block mb-1 ${
                type === "existing-company" ? "text-[#00E5FF]" : "text-[#F5F5F5]"
              }`}>
                Entrar em empresa existente
              </span>
              <span className="text-sm text-[#9CA3AF]">
                Solicite acesso a uma empresa já cadastrada (requer aprovação)
              </span>
            </div>
            {type === "existing-company" && (
              <Check size={20} className="text-[#00E5FF]" />
            )}
          </div>
        </button>
      </div>

      <button
        type="button"
        onClick={handleContinue}
        disabled={!type}
        className="btn btn-primary w-full mt-6"
      >
        Continuar
      </button>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// STEP 2A: COMPANY FORM (Nova Empresa)
// ══════════════════════════════════════════════════════════════════════════════

export function StepCompanyForm() {
  const { empresa, setEmpresa, nextStep, prevStep, fieldErrors, setFieldErrors } = useRegister();
  
  const [formData, setFormData] = useState<EmpresaData>({
    cnpj: empresa?.cnpj || "",
    razaoSocial: empresa?.razaoSocial || "",
    nomeFantasia: empresa?.nomeFantasia || "",
    email: empresa?.email || "",
    telefone: empresa?.telefone || "",
  });

  const updateField = (field: keyof EmpresaData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.razaoSocial.trim()) {
      errors.razaoSocial = "Razão social é obrigatória";
    }
    
    const cnpjNumbers = formData.cnpj.replace(/\D/g, "");
    if (!cnpjNumbers || cnpjNumbers.length !== 14) {
      errors.cnpj = "CNPJ deve ter 14 dígitos";
    }
    
    if (!formData.email.trim() || !formData.email.includes("@")) {
      errors.email = "E-mail inválido";
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setEmpresa(formData);
      nextStep();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-sm bg-[#00FF87]/10 flex items-center justify-center">
          <Building2 size={20} className="text-[#00FF87]" />
        </div>
        <div>
          <h2 className="font-medium text-[#F5F5F5]">Dados da Empresa</h2>
          <p className="text-xs text-[#4B5563]">Informações do seu negócio</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Razão Social */}
        <div>
          <label className="input-label mb-2 block">Razão Social *</label>
          <input
            type="text"
            className={`input-field ${fieldErrors.razaoSocial ? "border-[#EF4444]" : ""}`}
            placeholder="Nome legal da empresa"
            value={formData.razaoSocial}
            onChange={(e) => updateField("razaoSocial", e.target.value)}
          />
          {fieldErrors.razaoSocial && (
            <span className="text-xs text-[#EF4444] mt-1 block">{fieldErrors.razaoSocial}</span>
          )}
        </div>

        {/* Nome Fantasia */}
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
          {/* CNPJ */}
          <div>
            <label className="input-label mb-2 block">CNPJ *</label>
            <div className="relative">
              <FileText size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
              <input
                type="text"
                className={`input-field pl-10 ${fieldErrors.cnpj ? "border-[#EF4444]" : ""}`}
                placeholder="00.000.000/0000-00"
                value={formData.cnpj}
                onChange={(e) => updateField("cnpj", formatCNPJ(e.target.value))}
              />
            </div>
            {fieldErrors.cnpj && (
              <span className="text-xs text-[#EF4444] mt-1 block">{fieldErrors.cnpj}</span>
            )}
          </div>

          {/* Telefone */}
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

        {/* Email da Empresa */}
        <div>
          <label className="input-label mb-2 block">E-mail da Empresa *</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
            <input
              type="email"
              className={`input-field pl-10 ${fieldErrors.email ? "border-[#EF4444]" : ""}`}
              placeholder="contato@empresa.com"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
          </div>
          {fieldErrors.email && (
            <span className="text-xs text-[#EF4444] mt-1 block">{fieldErrors.email}</span>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button type="button" onClick={prevStep} className="btn btn-secondary flex-1">
            <ArrowLeft size={16} />
            Voltar
          </button>
          <button type="submit" className="btn btn-primary flex-1">
            Continuar
          </button>
        </div>
      </form>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// STEP 2B: COMPANY SEARCH (Empresa Existente)
// ══════════════════════════════════════════════════════════════════════════════

interface StepCompanySearchProps {
  onSearch: (cnpj: string) => Promise<EmpresaData | null>;
}

export function StepCompanySearch({ onSearch }: StepCompanySearchProps) {
  const { empresa, setEmpresa, nextStep, prevStep, error, setError } = useRegister();
  
  const [cnpj, setCnpj] = useState(empresa?.cnpj || "");
  const [searching, setSearching] = useState(false);
  const [foundCompany, setFoundCompany] = useState<EmpresaData | null>(empresa || null);

  const handleSearch = async () => {
    const cnpjNumbers = cnpj.replace(/\D/g, "");
    if (cnpjNumbers.length !== 14) {
      setError("CNPJ deve ter 14 dígitos");
      return;
    }

    setSearching(true);
    setError(null);
    
    try {
      const result = await onSearch(cnpjNumbers);
      if (result) {
        setFoundCompany(result);
        setEmpresa(result);
      } else {
        setError("Empresa não encontrada. Verifique o CNPJ ou crie uma nova empresa.");
        setFoundCompany(null);
      }
    } catch {
      setError("Erro ao buscar empresa. Tente novamente.");
    } finally {
      setSearching(false);
    }
  };

  const handleContinue = () => {
    if (foundCompany) {
      nextStep();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-sm bg-[#00E5FF]/10 flex items-center justify-center">
          <Search size={20} className="text-[#00E5FF]" />
        </div>
        <div>
          <h2 className="font-medium text-[#F5F5F5]">Buscar Empresa</h2>
          <p className="text-xs text-[#4B5563]">Encontre a empresa pelo CNPJ</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* CNPJ Search */}
        <div>
          <label className="input-label mb-2 block">CNPJ da Empresa *</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <FileText size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
              <input
                type="text"
                className="input-field pl-10"
                placeholder="00.000.000/0000-00"
                value={cnpj}
                onChange={(e) => {
                  setCnpj(formatCNPJ(e.target.value));
                  setFoundCompany(null);
                }}
              />
            </div>
            <button
              type="button"
              onClick={handleSearch}
              disabled={searching || cnpj.replace(/\D/g, "").length !== 14}
              className="btn btn-secondary"
            >
              {searching ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Search size={16} />
              )}
              Buscar
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-sm bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-center gap-2"
          >
            <AlertCircle size={16} className="text-[#EF4444]" />
            <span className="text-sm text-[#EF4444]">{error}</span>
          </motion.div>
        )}

        {/* Found Company */}
        {foundCompany && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-sm bg-[#00E5FF]/5 border border-[#00E5FF]/20"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-sm bg-[#00E5FF]/10 flex items-center justify-center flex-shrink-0">
                <Building2 size={20} className="text-[#00E5FF]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[#F5F5F5] truncate">
                  {foundCompany.nomeFantasia || foundCompany.razaoSocial}
                </p>
                <p className="text-sm text-[#9CA3AF]">{foundCompany.razaoSocial}</p>
                <p className="text-xs text-[#4B5563] mt-1">CNPJ: {formatCNPJ(foundCompany.cnpj)}</p>
              </div>
              <Check size={20} className="text-[#00E5FF] flex-shrink-0" />
            </div>
          </motion.div>
        )}

        {/* Info */}
        <div className="p-3 rounded-sm bg-[#F59E0B]/10 border border-[#F59E0B]/20">
          <p className="text-xs text-[#F59E0B]">
            Após o cadastro, o gerente da empresa precisará aprovar seu acesso ao sistema.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button type="button" onClick={prevStep} className="btn btn-secondary flex-1">
            <ArrowLeft size={16} />
            Voltar
          </button>
          <button
            type="button"
            onClick={handleContinue}
            disabled={!foundCompany}
            className="btn btn-primary flex-1"
          >
            Continuar
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// STEP 3: USER FORM
// ══════════════════════════════════════════════════════════════════════════════

export function StepUserForm() {
  const { 
    usuario, setUsuario, empresa, isNewCompany,
    prevStep, fieldErrors, setFieldErrors
  } = useRegister();
  
  const [formData, setFormData] = useState<UsuarioData & { confirmSenha: string }>({
    nome: usuario?.nome || "",
    login: usuario?.login || "",
    email: usuario?.email || "",
    senha: usuario?.senha || "",
    confirmSenha: "",
  });
  const [showPass, setShowPass] = useState(false);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.login.trim()) {
      errors.login = "Usuário é obrigatório";
    }
    
    if (!formData.email.trim() || !formData.email.includes("@")) {
      errors.email = "E-mail inválido";
    }
    
    if (formData.senha.length < 6) {
      errors.senha = "A senha deve ter no mínimo 6 caracteres";
    }
    
    if (formData.senha !== formData.confirmSenha) {
      errors.confirmSenha = "As senhas não coincidem";
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setUsuario({
        nome: formData.nome || undefined,
        login: formData.login,
        email: formData.email,
        senha: formData.senha,
      });
    }
  };

  // Password strength
  const strengthScore = [
    formData.senha.length >= 8,
    /[A-Z]/.test(formData.senha),
    /[0-9]/.test(formData.senha),
    /[^A-Za-z0-9]/.test(formData.senha),
  ].filter(Boolean).length;

  const strengthLabels = ["Fraca", "Regular", "Boa", "Forte"];
  const strengthColors = ["#EF4444", "#F59E0B", "#00E5FF", "#00FF87"];
  const strengthColor = strengthColors[strengthScore - 1] ?? "#1A1D24";
  const strengthLabel = strengthScore > 0 ? strengthLabels[strengthScore - 1] : "";

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-sm bg-[#00FF87]/10 flex items-center justify-center">
          <User size={20} className="text-[#00FF87]" />
        </div>
        <div>
          <h2 className="font-medium text-[#F5F5F5]">Seus Dados</h2>
          <p className="text-xs text-[#4B5563]">
            {isNewCompany 
              ? "Você será o gerente da empresa" 
              : `Solicitando acesso a ${empresa?.nomeFantasia || empresa?.razaoSocial}`
            }
          </p>
        </div>
      </div>

      {/* Company Summary */}
      {empresa && (
        <div className="p-3 rounded-sm bg-[#1A1D24] mb-6">
          <div className="flex items-center gap-2 text-xs">
            <Building2 size={14} className="text-[#00E5FF]" />
            <span className="text-[#9CA3AF]">Empresa:</span>
            <span className="text-[#F5F5F5] font-medium">
              {empresa.nomeFantasia || empresa.razaoSocial}
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nome */}
        <div>
          <label className="input-label mb-2 block">Nome completo</label>
          <div className="relative">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
            <input
              type="text"
              className="input-field pl-10"
              placeholder="Seu nome"
              value={formData.nome}
              onChange={(e) => updateField("nome", e.target.value)}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Login */}
          <div>
            <label className="input-label mb-2 block">Usuário *</label>
            <input
              type="text"
              className={`input-field ${fieldErrors.login ? "border-[#EF4444]" : ""}`}
              placeholder="seu.usuario"
              value={formData.login}
              onChange={(e) => updateField("login", e.target.value)}
            />
            {fieldErrors.login && (
              <span className="text-xs text-[#EF4444] mt-1 block">{fieldErrors.login}</span>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="input-label mb-2 block">E-mail *</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
              <input
                type="email"
                className={`input-field pl-10 ${fieldErrors.email ? "border-[#EF4444]" : ""}`}
                placeholder="voce@email.com"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
              />
            </div>
            {fieldErrors.email && (
              <span className="text-xs text-[#EF4444] mt-1 block">{fieldErrors.email}</span>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Senha */}
          <div>
            <label className="input-label mb-2 block">Senha *</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
              <input
                type={showPass ? "text" : "password"}
                className={`input-field pl-10 pr-10 ${fieldErrors.senha ? "border-[#EF4444]" : ""}`}
                placeholder="••••••••"
                value={formData.senha}
                onChange={(e) => updateField("senha", e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4B5563] hover:text-[#9CA3AF] transition-colors"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {formData.senha && (
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
            {fieldErrors.senha && (
              <span className="text-xs text-[#EF4444] mt-1 block">{fieldErrors.senha}</span>
            )}
          </div>

          {/* Confirmar Senha */}
          <div>
            <label className="input-label mb-2 block">Confirmar senha *</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
              <input
                type={showPass ? "text" : "password"}
                className={`input-field pl-10 ${fieldErrors.confirmSenha ? "border-[#EF4444]" : ""}`}
                placeholder="••••••••"
                value={formData.confirmSenha}
                onChange={(e) => updateField("confirmSenha", e.target.value)}
              />
              {formData.confirmSenha && formData.senha === formData.confirmSenha && (
                <Check size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00FF87]" />
              )}
            </div>
            {fieldErrors.confirmSenha && (
              <span className="text-xs text-[#EF4444] mt-1 block">{fieldErrors.confirmSenha}</span>
            )}
          </div>
        </div>

        {/* Role Info */}
        {isNewCompany && (
          <div className="p-3 rounded-sm bg-[#00FF87]/10 border border-[#00FF87]/20">
            <p className="text-xs text-[#00FF87]">
              Você será cadastrado como <strong>Gerente</strong> da empresa e terá acesso total ao sistema.
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button type="button" onClick={prevStep} className="btn btn-secondary flex-1">
            <ArrowLeft size={16} />
            Voltar
          </button>
          <button type="submit" className="btn btn-primary flex-1">
            {isNewCompany ? "Criar Conta e Empresa" : "Solicitar Acesso"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// STEP SUBMITTING
// ══════════════════════════════════════════════════════════════════════════════

export function StepSubmitting() {
  const { isNewCompany } = useRegister();
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-12"
    >
      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#00FF87]/10 flex items-center justify-center">
        <Loader2 size={32} className="text-[#00FF87] animate-spin" />
      </div>
      <h2 className="text-xl font-display font-bold text-[#F5F5F5] mb-2">
        {isNewCompany ? "Criando sua empresa..." : "Enviando solicitação..."}
      </h2>
      <p className="text-sm text-[#9CA3AF]">
        Aguarde enquanto processamos seu cadastro
      </p>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PROGRESS BAR
// ══════════════════════════════════════════════════════════════════════════════

export function RegisterProgress() {
  const { stepNumber, totalSteps } = useRegister();
  
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
        <div key={s} className="flex-1 flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              stepNumber >= s
                ? "bg-[#00FF87] text-[#090B10]"
                : "bg-[#1A1D24] text-[#4B5563]"
            }`}
          >
            {stepNumber > s ? <Check size={16} /> : s}
          </div>
          {s < totalSteps && (
            <div
              className={`flex-1 h-0.5 transition-colors ${
                stepNumber > s ? "bg-[#00FF87]" : "bg-[#1A1D24]"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN WIZARD
// ══════════════════════════════════════════════════════════════════════════════

interface RegisterWizardProps {
  onComplete: (data: { empresa: EmpresaData; usuario: UsuarioData; isNewCompany: boolean }) => Promise<void>;
  onSearchCompany: (cnpj: string) => Promise<EmpresaData | null>;
}

export function RegisterWizard({ onComplete, onSearchCompany }: RegisterWizardProps) {
  const { 
    step, empresa, usuario, isNewCompany, 
    setStep, setError, nextStep 
  } = useRegister();

  // Quando o usuário preenche o form, dispara o submit
  const handleUserFormComplete = async () => {
    if (!empresa || !usuario) return;
    
    setStep("submitting");
    
    try {
      await onComplete({ empresa, usuario, isNewCompany });
      nextStep(); // vai para success
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar cadastro");
      setStep("user-form");
    }
  };

  // Detecta quando usuario é setado e dispara submit
  const prevUsuarioRef = React.useRef(usuario);
  React.useEffect(() => {
    if (usuario && !prevUsuarioRef.current && step === "user-form") {
      handleUserFormComplete();
    }
    prevUsuarioRef.current = usuario;
  }, [usuario]);

  return (
    <div className="w-full max-w-lg mx-auto">
      {step !== "submitting" && step !== "success" && <RegisterProgress />}
      
      <div className="card p-8">
        <AnimatePresence mode="wait">
          {step === "select-type" && <StepTypeSelection key="type" />}
          {step === "company-form" && <StepCompanyForm key="company-form" />}
          {step === "company-search" && <StepCompanySearch key="company-search" onSearch={onSearchCompany} />}
          {step === "user-form" && <StepUserForm key="user-form" />}
          {step === "submitting" && <StepSubmitting key="submitting" />}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Need React import for useRef/useEffect
import * as React from "react";
