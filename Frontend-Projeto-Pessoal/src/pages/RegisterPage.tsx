import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Dumbbell, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { 
  RegisterProvider, 
  RegisterWizard, 
  useRegister,
  type EmpresaData, 
  type UsuarioData 
} from "../components/ui/RegisterWizard";
import { 
  apiRegistrarEmpresa,
  apiSolicitarEntrada,
  apiBuscarEmpresaPorCNPJ,
  type ErroResposta 
} from "../api/client";

// Tela de sucesso após cadastro
function SuccessScreen({ isNewCompany }: { isNewCompany: boolean }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-8"
    >
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#00FF87]/10 flex items-center justify-center">
        <CheckCircle2 size={40} className="text-[#00FF87]" />
      </div>
      
      <h2 className="text-2xl font-display font-bold text-[#F5F5F5] mb-2">
        {isNewCompany ? "Empresa criada com sucesso!" : "Solicitação enviada!"}
      </h2>
      
      <p className="text-[#9CA3AF] mb-6">
        {isNewCompany 
          ? "Sua empresa e conta foram criadas. Você já pode acessar o painel administrativo."
          : "Sua solicitação foi enviada para o gerente da empresa. Aguarde a aprovação para acessar o sistema."
        }
      </p>

      <button
        onClick={() => navigate(isNewCompany ? "/admin" : "/aguardando-empresa")}
        className="btn btn-primary"
      >
        {isNewCompany ? "Ir para o Painel" : "Acompanhar Solicitação"}
      </button>
    </motion.div>
  );
}

// Conteúdo principal do cadastro
function RegisterContent() {
  const { step, isNewCompany, canGoBack, prevStep, error } = useRegister();

  // Handler para buscar empresa por CNPJ
  const handleSearchCompany = async (cnpj: string): Promise<EmpresaData | null> => {
    const result = await apiBuscarEmpresaPorCNPJ(cnpj);
    if (!result) return null;
    
    return {
      id: result.id,
      cnpj: result.cnpj,
      razaoSocial: result.razaoSocial,
      nomeFantasia: result.nomeFantasia,
      email: result.email,
      telefone: result.telefone,
    };
  };

  // Handler para completar o cadastro
  const handleComplete = async (data: { 
    empresa: EmpresaData; 
    usuario: UsuarioData; 
    isNewCompany: boolean 
  }) => {
    if (data.isNewCompany) {
      // Fluxo: Nova empresa + usuário (será GERENTE)
      // POST /api/empresa/registrar
      const res = await apiRegistrarEmpresa({
        cnpj: data.empresa.cnpj.replace(/\D/g, ""),
        razaoSocial: data.empresa.razaoSocial,
        nomeFantasia: data.empresa.nomeFantasia,
        email: data.empresa.email,
        telefone: data.empresa.telefone?.replace(/\D/g, ""),
        nomeUsuario: data.usuario.nome,
        loginUsuario: data.usuario.login,
        emailUsuario: data.usuario.email,
        senhaUsuario: data.usuario.senha,
      });

      if (!res.ok) {
        if (res.status === 422) {
          const body = (await res.json()) as ErroResposta;
          const msg = body.erros?.map(e => e.message).join(", ") || body.message;
          throw new Error(msg || "Dados inválidos");
        } else if (res.status === 409) {
          throw new Error("CNPJ, usuário ou e-mail já cadastrado");
        }
        throw new Error("Erro ao criar cadastro. Tente novamente.");
      }

      // Salva token - usuário já está autenticado como GERENTE
      const result = await res.json();
      if (result.token) {
        localStorage.setItem("jwt_token", result.token);
      }
    } else {
      // Fluxo: Entrar em empresa existente (status PENDENTE)
      // POST /cadastro/solicitar
      if (!data.empresa.id) {
        throw new Error("Empresa não selecionada");
      }

      const res = await apiSolicitarEntrada({
        nome: data.usuario.nome,
        login: data.usuario.login,
        email: data.usuario.email,
        senha: data.usuario.senha,
        empresaId: data.empresa.id,
      });

      if (!res.ok) {
        if (res.status === 422) {
          const body = (await res.json()) as ErroResposta;
          const msg = body.erros?.map(e => e.message).join(", ") || body.message;
          throw new Error(msg || "Dados inválidos");
        } else if (res.status === 409) {
          throw new Error("Usuário ou e-mail já cadastrado");
        }
        throw new Error("Erro ao enviar solicitação. Tente novamente.");
      }

      // Salva token se retornado (para acessar página de aguardando)
      const result = await res.json();
      if (result.token) {
        localStorage.setItem("jwt_token", result.token);
      }
    }
  };

  // Renderiza tela de sucesso
  if (step === "success") {
    return (
      <div className="card p-8">
        <SuccessScreen isNewCompany={isNewCompany} />
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        {canGoBack ? (
          <button onClick={prevStep} className="btn btn-ghost btn-icon">
            <ArrowLeft size={18} />
          </button>
        ) : (
          <Link to="/login" className="btn btn-ghost btn-icon">
            <ArrowLeft size={18} />
          </Link>
        )}
        <div className="flex-1">
          <h1 className="text-xl font-display font-bold text-[#F5F5F5]">Criar conta</h1>
          <p className="text-sm text-[#9CA3AF]">
            {step === "select-type" && "Escolha como deseja se cadastrar"}
            {step === "company-form" && "Cadastre os dados da sua empresa"}
            {step === "company-search" && "Encontre sua empresa"}
            {step === "user-form" && "Preencha seus dados pessoais"}
            {step === "submitting" && "Processando..."}
          </p>
        </div>
        <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-[#00FF87] to-[#00E5FF] flex items-center justify-center">
          <Dumbbell size={20} className="text-[#090B10]" />
        </div>
      </div>

      {/* Error global */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-3 rounded-sm bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
          <span className="text-sm text-[#EF4444]">{error}</span>
        </motion.div>
      )}

      {/* Wizard */}
      <RegisterWizard 
        onComplete={handleComplete}
        onSearchCompany={handleSearchCompany}
      />

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

      {/* Terms */}
      <p className="text-center text-xs text-[#4B5563] mt-6">
        Ao criar uma conta, você concorda com nossos{" "}
        <button className="text-[#9CA3AF] hover:text-[#00FF87] transition-colors">Termos de Uso</button>
        {" "}e{" "}
        <button className="text-[#9CA3AF] hover:text-[#00FF87] transition-colors">Política de Privacidade</button>
      </p>
    </>
  );
}

// Página principal com Provider
export function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#090B10] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        <RegisterProvider>
          <RegisterContent />
        </RegisterProvider>
      </motion.div>
    </div>
  );
}
