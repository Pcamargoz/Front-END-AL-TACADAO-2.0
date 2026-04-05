# 📊 Análise Completa de UX/UI - AL-TACADÃO Frontend

> **Data:** Abril 2026  
> **Projeto:** AL-TACADÃO - Plataforma B2B de Suplementos  
> **Tipo:** Análise de Especialista Frontend UX/UI  

---

## Sumário

1. [Visão Geral do Frontend](#1-visão-geral-do-frontend)
2. [Estrutura de Componentes](#2-estrutura-de-componentes)
3. [Problemas de UX/UI](#3-problemas-de-uxui)
4. [Fluxos de Tela](#4-fluxos-de-tela)
5. [Tratamento de Estados](#5-tratamento-de-estados)
6. [Sugestões de Melhoria](#6-sugestões-de-melhoria)
7. [Componentes Reutilizáveis](#7-componentes-reutilizáveis)

---

## 1. Visão Geral do Frontend

### 1.1 Stack Tecnológica

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **React** | 19.0.0 | Framework principal |
| **TypeScript** | 5.7.2 | Tipagem estática |
| **Vite** | 6.0.7 | Build tool e dev server |
| **TailwindCSS** | 4.0.0 | Estilização utility-first |
| **TanStack Query** | 5.64.1 | Gerenciamento de estado server |
| **React Hook Form** | 7.54.2 | Formulários |
| **Zod** | 3.24.1 | Validação de schemas |
| **Framer Motion** | 12.0.0 | Animações |
| **Recharts** | 2.15.0 | Gráficos e visualizações |
| **Sonner** | 1.7.4 | Sistema de toasts |
| **Lucide React** | 0.474.0 | Biblioteca de ícones |

### 1.2 Sistema de Design

O projeto utiliza um **tema dark neon** consistente:

```css
/* Paleta de Cores */
--primary: #00FF87      /* Verde neon - ações principais */
--secondary: #00E5FF    /* Ciano neon - destaques */
--background: #090B10   /* Fundo principal escuro */
--surface: #111318      /* Cards e superfícies */
--border: #1A1D24       /* Bordas sutis */
--text-primary: #F5F5F5 /* Texto principal */
--text-secondary: #9CA3AF /* Texto secundário */
--text-muted: #4B5563   /* Texto desabilitado */
--error: #EF4444        /* Erros */
--success: #10B981      /* Sucesso */
--warning: #F59E0B      /* Alertas */
```

### 1.3 Arquitetura de Autenticação

O sistema implementa **dupla autenticação**:

1. **Autenticação de Usuário (JWT)**
   - Gerenciado por `AuthContext`
   - Token armazenado no `localStorage`
   - Protegido por `ProtectedRoute`

2. **Autenticação de Empresa/Fornecedor**
   - Gerenciado por `FornecedorContext`
   - Token armazenado no `sessionStorage`
   - Protegido por `ProtectedFornecedorRoute`
   - Diferencia entre `GERENTE` e `FUNCIONÁRIO`

### 1.4 Estrutura de Diretórios

```
src/
├── api/
│   └── client.ts          # Cliente HTTP centralizado (424 linhas)
├── auth/
│   ├── AuthContext.tsx    # Contexto de autenticação
│   └── ProtectedRoute.tsx # Guards de rota
├── components/
│   ├── layout/            # Layouts da aplicação
│   │   ├── AdminLayout.tsx
│   │   ├── StoreLayout.tsx
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   └── ui/                # Componentes de interface
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── Table.tsx
│       └── RegisterWizard.tsx (1035 linhas)
├── context/
│   └── FornecedorContext.tsx
├── hooks/
│   ├── useCart.tsx        # Carrinho de compras
│   └── useIsMobile.ts     # Detecção de dispositivo
├── lib/
│   └── utils.ts           # Helpers e constantes
├── pages/                 # 16 páginas
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── ProductsPage.tsx
│   ├── ProductDetailPage.tsx
│   ├── CartPage.tsx
│   ├── EmpresasPage.tsx
│   ├── DashboardPage.tsx
│   ├── InventoryPage.tsx
│   └── ...
├── App.tsx                # Rotas principais
├── main.tsx               # Entry point
└── index.css              # Sistema de design (748 linhas)
```

---

## 2. Estrutura de Componentes

### 2.1 Layouts Disponíveis

#### StoreLayout (Loja Pública)
```
┌─────────────────────────────────────┐
│            Navbar                   │
├─────────────────────────────────────┤
│                                     │
│           Content Area              │
│         (min-height)                │
│                                     │
├─────────────────────────────────────┤
│            Footer                   │
└─────────────────────────────────────┘
```

**Usado em:** HomePage, ProductsPage, ProductDetailPage, CartPage, LoginPage, RegisterPage

#### AdminLayout (Painel Administrativo)
```
Desktop:
┌──────────┬──────────────────────────┐
│          │        Header            │
│  Sidebar ├──────────────────────────┤
│  (240px) │                          │
│          │      Content Area        │
│          │                          │
└──────────┴──────────────────────────┘

Mobile:
┌─────────────────────────────────────┐
│            Header                   │
├─────────────────────────────────────┤
│                                     │
│           Content Area              │
│                                     │
├─────────────────────────────────────┤
│         Bottom Navigation           │
└─────────────────────────────────────┘
```

**Usado em:** DashboardPage, InventoryPage, EmpresaUsuariosPage, ProfilePage

### 2.2 Componentes UI Criados

| Componente | Linhas | Descrição | Qualidade |
|------------|--------|-----------|-----------|
| `RegisterWizard` | 1035 | Wizard de cadastro multi-step | ⚠️ Muito grande |
| `Modal` | ~80 | Modal com overlay e animações | ✅ Bom |
| `ConfirmDialog` | ~60 | Diálogo de confirmação | ✅ Bom |
| `Button` | ~50 | Botão com variantes | ✅ Bom |
| `Card` | ~30 | Container estilizado | ✅ Bom |
| `Input` | ~40 | Campo de texto | ✅ Bom |
| `Table` | ~100 | Tabela responsiva | ✅ Bom |
| `Spinner` | ~20 | Indicador de loading | ✅ Bom |
| `AnimatedCounter` | ~30 | Contador animado | ✅ Bom |

### 2.3 Hierarquia de Componentes por Página

```
HomePage
├── StoreLayout
│   ├── Navbar
│   │   ├── Logo
│   │   ├── SearchBar
│   │   └── CartButton (AnimatedCounter)
│   ├── HeroSection
│   ├── CategoryFilters
│   ├── ProductGrid
│   │   └── ProductCard[]
│   └── Footer

DashboardPage
├── AdminLayout
│   ├── Sidebar (desktop) / BottomNav (mobile)
│   ├── Header
│   └── Content
│       ├── EmpresaInfoHeader
│       ├── WelcomeHeader
│       ├── StatCards[]
│       ├── BrandChart (PieChart)
│       ├── TopProducts
│       ├── RecentActivity
│       └── QuickActions

InventoryPage
├── AdminLayout
│   └── Content
│       ├── Header (title + view toggle + add button)
│       ├── Filters (search + brand pills)
│       ├── ProductGrid | ProductTable
│       │   └── ProductCard[] | ProductRow[]
│       ├── Modal (ProductForm)
│       └── ConfirmDialog
```

---

## 3. Problemas de UX/UI

### 3.1 Problemas Críticos

#### P1. RegisterWizard Monolítico (1035 linhas)
**Arquivo:** `src/components/ui/RegisterWizard.tsx`

**Problema:** Componente único gerenciando 4 steps, validação, múltiplos formulários e animações. Viola o princípio de responsabilidade única.

**Impacto:**
- Difícil manutenção
- Performance degradada (re-renders desnecessários)
- Difícil testar unitariamente
- Código duplicado em validações

**Solução:**
```
RegisterWizard/
├── index.tsx              # Orquestrador
├── RegisterContext.tsx    # Estado compartilhado
├── steps/
│   ├── UserInfoStep.tsx   # Step 1: Dados pessoais
│   ├── AddressStep.tsx    # Step 2: Endereço (com ViaCEP)
│   ├── SecurityStep.tsx   # Step 3: Senha
│   └── ReviewStep.tsx     # Step 4: Revisão
├── components/
│   ├── StepIndicator.tsx
│   └── StepNavigation.tsx
└── hooks/
    └── useRegisterForm.ts
```

---

#### P2. Ausência de Feedback Visual em Ações Assíncronas
**Arquivos:** Múltiplas páginas

**Problema:** Alguns botões não mostram loading state durante operações.

**Exemplo em `EmpresasPage.tsx`:**
```tsx
// Atual - sem feedback durante validação de senha
<button onClick={() => handleValidate(empresa)}>
  Acessar Painel
</button>

// Deveria ser:
<button onClick={() => handleValidate(empresa)} disabled={validating === empresa.id}>
  {validating === empresa.id ? <Spinner /> : "Acessar Painel"}
</button>
```

---

#### P3. "Lembrar de mim" e "Esqueceu a senha?" Não Funcionais
**Arquivo:** `src/pages/LoginPage.tsx` (linhas 181-187)

**Problema:** Checkbox "Lembrar de mim" e link "Esqueceu a senha?" são apenas visuais, sem funcionalidade implementada.

**Impacto:** Usuário frustrado ao tentar recuperar senha ou manter sessão.

**Solução:** Implementar ou remover completamente (não deixar elementos não funcionais).

---

#### P4. Dados Mockados no Dashboard
**Arquivo:** `src/pages/DashboardPage.tsx` (linhas 121-126)

**Problema:** Atividade recente usa dados hardcoded mock.

```tsx
const recentActivity: RecentActivityItem[] = [
  { id: "1", type: "product", title: "Novo produto cadastrado: Whey Protein", timestamp: "Há 2 horas", icon: <Package size={14} /> },
  // ... mais dados falsos
];
```

**Impacto:** Dashboard não reflete realidade do negócio.

---

#### P5. Métricas de "Variação" Falsas
**Arquivo:** `src/pages/DashboardPage.tsx` (linhas 184-205)

**Problema:** Os percentuais de variação (+12.5%, +8.2%, +5.1%) são valores fixos hardcoded, não calculados.

```tsx
<StatCard
  title="Receita Estimada"
  change={12.5}  // ← Valor falso
  // ...
/>
```

**Impacto:** Métricas enganosas, perda de confiança do usuário.

---

### 3.2 Problemas Moderados

#### P6. Navegação Inconsistente entre Contextos
**Arquivos:** `App.tsx`, múltiplas páginas

**Problema:** Após logout ou troca de empresa, o usuário pode ficar em estado inconsistente.

**Cenário:**
1. Usuário está no `/empresas/1/painel/estoque`
2. Usuário faz logout
3. Rota protegida redireciona para `/login`
4. Após novo login, não retorna à página anterior

---

#### P7. Falta de Breadcrumbs no Painel Admin
**Arquivos:** Páginas do AdminLayout

**Problema:** Usuário perde contexto de navegação em níveis profundos.

**Solução:**
```
Dashboard > Estoque > Editar Produto
└── Clicável para voltar
```

---

#### P8. Filtros Não Persistidos
**Arquivo:** `src/pages/InventoryPage.tsx`

**Problema:** Filtros de busca e marca são resetados ao navegar e voltar.

**Solução:** Persistir filtros na URL (query params) ou usar `sessionStorage`.

---

#### P9. Tabela Esconde Informações em Mobile
**Arquivo:** `src/pages/InventoryPage.tsx` (linhas 466-472)

**Problema:** Colunas importantes são escondidas com `hidden sm:table-cell`, `hidden md:table-cell`, etc.

```tsx
<th className="px-6 py-4 hidden sm:table-cell">Marca</th>
<th className="px-6 py-4 hidden md:table-cell">Peso</th>
<th className="px-6 py-4 hidden lg:table-cell">Preço</th>  // ← Preço escondido em < lg
```

**Impacto:** Em tablets, usuário não vê o preço na listagem.

**Solução:** Usar card layout em mobile ao invés de tabela, ou mostrar informações essenciais sempre.

---

#### P10. Ausência de Paginação
**Arquivos:** `InventoryPage.tsx`, `ProductsPage.tsx`, `EmpresasPage.tsx`

**Problema:** Listas carregam todos os itens de uma vez. API retorna `content` de objeto paginado mas paginação não é utilizada.

```tsx
const products: Produto[] = productsData?.content ?? [];
// totalPages, totalElements, number são ignorados
```

**Impacto:** Performance degradada com muitos itens, scroll infinito não implementado.

---

### 3.3 Problemas Menores

#### P11. Emoji no Código
**Arquivo:** `src/pages/DashboardPage.tsx` (linha 169)

```tsx
{greeting}, {user?.nome || user?.login}! 👋
```

**Problema:** Emojis podem não renderizar consistentemente em todos os sistemas.

---

#### P12. Ano Hardcoded no Footer
**Arquivo:** `src/pages/LoginPage.tsx` (linha 227)

```tsx
© 2024 AL-TACADÃO. Todos os direitos reservados.
```

**Solução:** `© {new Date().getFullYear()} AL-TACADÃO`

---

#### P13. Console.log em Produção
**Arquivo:** Múltiplos arquivos

**Problema:** Logs de debug deixados no código podem expor informações sensíveis.

---

#### P14. Textos Sem Internacionalização
**Problema:** Todo texto está hardcoded em português. Impossível traduzir sem refatoração completa.

**Solução Futura:** Implementar i18n com `react-intl` ou `i18next`.

---

## 4. Fluxos de Tela

### 4.1 Fluxo Principal - Loja Pública

```
┌─────────────┐
│  HomePage   │
│  (catálogo) │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│                    Usuário escolhe:                      │
├────────────────┬────────────────┬───────────────────────┤
│   Ver Produtos │  Ver Detalhes  │    Ir ao Carrinho     │
└───────┬────────┴───────┬────────┴───────────┬───────────┘
        │                │                    │
        ▼                ▼                    ▼
┌──────────────┐  ┌─────────────────┐  ┌─────────────┐
│ ProductsPage │  │ProductDetailPage│  │  CartPage   │
│  (listagem)  │  │   (detalhes)    │  │ (carrinho)  │
└──────────────┘  └────────┬────────┘  └──────┬──────┘
                           │                  │
                           ▼                  │
                    ┌─────────────┐           │
                    │ Adicionar   │           │
                    │ ao Carrinho │───────────┘
                    └─────────────┘
```

### 4.2 Fluxo de Autenticação

```
┌─────────────┐     ┌─────────────┐
│  LoginPage  │◄────│ RegisterPage│
│             │────►│  (cadastro) │
└──────┬──────┘     └─────────────┘
       │ ✓ Login OK
       ▼
┌─────────────┐
│EmpresasPage │  Lista de empresas do usuário
│             │
└──────┬──────┘
       │ Seleciona empresa
       ▼
┌─────────────────────────────────┐
│  Modal: Validar Senha Empresa   │
│  (se empresa tem senha)         │
└──────┬──────────────────────────┘
       │ ✓ Senha OK
       ▼
┌─────────────┐
│DashboardPage│  Painel administrativo
│             │
└─────────────┘
```

### 4.3 Fluxo do Painel Administrativo

```
┌─────────────────────────────────────────────────────────────────┐
│                        AdminLayout                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐       │
│  │  Dashboard  │────►│   Estoque   │────►│  Usuários   │       │
│  │  (resumo)   │     │  (CRUD)     │     │ (se gerente)│       │
│  └─────────────┘     └──────┬──────┘     └─────────────┘       │
│                             │                                    │
│                             ▼                                    │
│                    ┌─────────────────┐                          │
│                    │ Modal: Novo/    │                          │
│                    │ Editar Produto  │                          │
│                    └─────────────────┘                          │
│                                                                  │
│  ┌─────────────┐                                                │
│  │   Perfil    │  Dados do usuário logado                      │
│  └─────────────┘                                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.4 Fluxo de Cadastro (RegisterWizard)

```
Step 1: Dados Pessoais          Step 2: Endereço
┌─────────────────────┐         ┌─────────────────────┐
│ • Nome completo     │         │ • CEP (busca auto)  │
│ • CPF (validação)   │ ──────► │ • Logradouro        │
│ • Email             │         │ • Número            │
│ • Telefone          │         │ • Cidade/Estado     │
└─────────────────────┘         └──────────┬──────────┘
                                           │
Step 4: Revisão                 Step 3: Segurança
┌─────────────────────┐         ┌─────────────────────┐
│ • Resumo dos dados  │ ◄────── │ • Login (username)  │
│ • Checkbox termos   │         │ • Senha             │
│ • Botão finalizar   │         │ • Confirmar senha   │
└─────────────────────┘         │ • Força da senha    │
                                └─────────────────────┘
```

### 4.5 Mapa de Rotas Completo

```
/                           → HomePage (StoreLayout)
/produtos                   → ProductsPage (StoreLayout)
/produtos/:productId        → ProductDetailPage (StoreLayout)
/carrinho                   → CartPage (StoreLayout)
/login                      → LoginPage (standalone)
/cadastro                   → RegisterPage (standalone)
/empresas                   → EmpresasPage (standalone, protegida)
/empresas/cadastrar         → EmpresaCadastrarPage (standalone, protegida)
/empresas/:id/painel        → DashboardPage (AdminLayout, protegida dupla)
/empresas/:id/painel/estoque → InventoryPage (AdminLayout, protegida dupla)
/empresas/:id/painel/usuarios → EmpresaUsuariosPage (AdminLayout, protegida dupla)
/empresas/:id/painel/perfil  → ProfilePage (AdminLayout, protegida dupla)
```

---

## 5. Tratamento de Estados

### 5.1 Matriz de Estados por Página

| Página | Loading | Erro | Vazio | Sucesso |
|--------|---------|------|-------|---------|
| HomePage | ✅ Skeleton | ❌ Não trata | ✅ "Nenhum produto" | ✅ Grid |
| ProductsPage | ✅ Skeleton | ❌ Não trata | ✅ Mensagem | ✅ Grid |
| ProductDetailPage | ✅ Skeleton | ❌ Não trata | ❌ Não aplica | ✅ Detalhe |
| CartPage | ❌ Não aplica | ❌ Não aplica | ✅ "Carrinho vazio" | ✅ Lista |
| LoginPage | ✅ Botão | ✅ Toast/Banner | ❌ Não aplica | ✅ Redirect |
| RegisterPage | ✅ Botão | ✅ Toast | ❌ Não aplica | ✅ Redirect |
| EmpresasPage | ✅ Skeleton | ✅ Banner | ✅ "Nenhuma empresa" | ✅ Grid |
| DashboardPage | ⚠️ Parcial | ❌ Não trata | ✅ Cards vazios | ✅ Cards |
| InventoryPage | ✅ Skeleton | ✅ Banner | ✅ "Estoque vazio" | ✅ Grid/Table |
| EmpresaUsuariosPage | ✅ Skeleton | ✅ Banner | ✅ Mensagem | ✅ Lista |
| ProfilePage | ✅ Skeleton | ✅ Toast | ❌ Não aplica | ✅ Form |

### 5.2 Padrões de Loading Utilizados

#### Skeleton Loading (Recomendado)
```tsx
// InventoryPage.tsx - BOM exemplo
{isLoading ? (
  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
    {[...Array(8)].map((_, i) => (
      <div 
        key={i} 
        className="skeleton" 
        style={{ height: 200, animationDelay: `${i * 0.06}s` }} 
      />
    ))}
  </div>
) : (
  // conteúdo real
)}
```

#### Button Loading
```tsx
// LoginPage.tsx - BOM exemplo
<button type="submit" disabled={submitting}>
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
```

### 5.3 Padrões de Erro Utilizados

#### Banner de Erro
```tsx
// InventoryPage.tsx - BOM exemplo
{error && (
  <div className="p-3 rounded-sm bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-center gap-2">
    <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
    <span className="text-sm text-[#EF4444]">Falha ao carregar produtos: {String(error)}</span>
  </div>
)}
```

#### Toast de Erro (Sonner)
```tsx
// InventoryPage.tsx - Mutations
onError: (err: any) => {
  toast.error(err?.message ?? "Erro de conexão ao criar produto. Tente novamente.");
},
```

### 5.4 Padrões de Estado Vazio

#### Com CTA (Call to Action)
```tsx
// InventoryPage.tsx - BOM exemplo
<div className="card text-center py-12">
  <Package size={48} className="mx-auto text-[#4B5563] mb-3" />
  <p className="text-[#9CA3AF] mb-4">
    {search || brandFilter ? "Nenhum produto encontrado" : "Estoque vazio"}
  </p>
  {!search && !brandFilter && (
    <button onClick={() => setModalOpen(true)} className="btn btn-primary">
      <Plus size={16} /> Adicionar produto
    </button>
  )}
</div>
```

### 5.5 Estados Ausentes (Problemas)

#### Erro de Rede Global
**Problema:** Não há tratamento global para falhas de conexão.

**Solução:**
```tsx
// Criar ErrorBoundary e offline detector
<QueryClientProvider client={queryClient}>
  <ErrorBoundary fallback={<GlobalErrorPage />}>
    <OfflineIndicator />
    <App />
  </ErrorBoundary>
</QueryClientProvider>
```

#### Timeout de Sessão
**Problema:** Se o JWT expirar durante uso, não há feedback visual.

**Solução:** Interceptor no cliente HTTP que detecta 401 e mostra modal de re-login.

---

## 6. Sugestões de Melhoria

### 6.1 Melhorias de Alta Prioridade

#### M1. Refatorar RegisterWizard
**Esforço:** Alto | **Impacto:** Alto

Dividir em componentes menores com contexto compartilhado:

```tsx
// RegisterContext.tsx
const RegisterContext = createContext<RegisterContextType>(null);

export function RegisterProvider({ children }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<RegisterFormData>({});
  
  return (
    <RegisterContext.Provider value={{ step, setStep, formData, updateFormData }}>
      {children}
    </RegisterContext.Provider>
  );
}

// RegisterWizard/index.tsx
export function RegisterWizard() {
  const { step } = useRegister();
  
  return (
    <RegisterProvider>
      <StepIndicator />
      <AnimatePresence mode="wait">
        {step === 1 && <UserInfoStep />}
        {step === 2 && <AddressStep />}
        {step === 3 && <SecurityStep />}
        {step === 4 && <ReviewStep />}
      </AnimatePresence>
      <StepNavigation />
    </RegisterProvider>
  );
}
```

---

#### M2. Implementar Sistema de Notificações Real
**Esforço:** Médio | **Impacto:** Alto

Substituir dados mock do dashboard por dados reais:

```tsx
// hooks/useNotifications.ts
export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: apiGetNotifications,
    refetchInterval: 30000, // Poll a cada 30s
  });
}

// Ou usar WebSocket para real-time
export function useNotificationsSocket() {
  const [notifications, setNotifications] = useState([]);
  
  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    ws.onmessage = (event) => {
      setNotifications(prev => [JSON.parse(event.data), ...prev]);
    };
    return () => ws.close();
  }, []);
  
  return notifications;
}
```

---

#### M3. Adicionar Paginação nas Listagens
**Esforço:** Médio | **Impacto:** Alto

```tsx
// hooks/usePaginatedQuery.ts
export function usePaginatedQuery<T>(
  queryKey: string[],
  fetcher: (page: number, size: number) => Promise<PaginatedResponse<T>>,
  pageSize = 20
) {
  const [page, setPage] = useState(0);
  
  const query = useQuery({
    queryKey: [...queryKey, page, pageSize],
    queryFn: () => fetcher(page, pageSize),
  });
  
  return {
    ...query,
    page,
    setPage,
    hasNextPage: query.data ? page < query.data.totalPages - 1 : false,
    hasPrevPage: page > 0,
  };
}

// Uso
const { data, page, setPage, hasNextPage } = usePaginatedQuery(
  ['estoque'],
  (page, size) => apiListEstoque(page, size)
);
```

---

#### M4. Implementar Error Boundary Global
**Esforço:** Baixo | **Impacto:** Alto

```tsx
// components/ErrorBoundary.tsx
class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Enviar para serviço de monitoramento (Sentry, etc)
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#090B10]">
          <div className="card p-8 text-center max-w-md">
            <AlertTriangle size={48} className="mx-auto text-[#EF4444] mb-4" />
            <h1 className="text-xl font-bold text-[#F5F5F5] mb-2">
              Ops! Algo deu errado
            </h1>
            <p className="text-[#9CA3AF] mb-4">
              Ocorreu um erro inesperado. Por favor, recarregue a página.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              Recarregar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

### 6.2 Melhorias de Média Prioridade

#### M5. Adicionar Breadcrumbs no Admin
**Esforço:** Baixo | **Impacto:** Médio

```tsx
// components/ui/Breadcrumbs.tsx
interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-2 text-sm mb-4">
      {items.map((item, i) => (
        <Fragment key={i}>
          {i > 0 && <ChevronRight size={14} className="text-[#4B5563]" />}
          {item.href ? (
            <Link to={item.href} className="text-[#9CA3AF] hover:text-[#00FF87]">
              {item.label}
            </Link>
          ) : (
            <span className="text-[#F5F5F5]">{item.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}

// Uso
<Breadcrumbs items={[
  { label: 'Dashboard', href: `/empresas/${id}/painel` },
  { label: 'Estoque', href: `/empresas/${id}/painel/estoque` },
  { label: 'Editar Produto' },
]} />
```

---

#### M6. Persistir Filtros na URL
**Esforço:** Baixo | **Impacto:** Médio

```tsx
// hooks/useURLFilters.ts
export function useURLFilters<T extends Record<string, string>>() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const filters = useMemo(() => {
    const obj: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      obj[key] = value;
    });
    return obj as T;
  }, [searchParams]);
  
  const setFilter = (key: keyof T, value: string | null) => {
    setSearchParams(prev => {
      if (value === null || value === '') {
        prev.delete(key as string);
      } else {
        prev.set(key as string, value);
      }
      return prev;
    });
  };
  
  return { filters, setFilter };
}

// Uso em InventoryPage
const { filters, setFilter } = useURLFilters<{ search: string; brand: string }>();
// URL: /estoque?search=whey&brand=GROWTH
```

---

#### M7. Melhorar Responsividade da Tabela
**Esforço:** Médio | **Impacto:** Médio

```tsx
// Usar card em mobile ao invés de esconder colunas
function ResponsiveProductList({ products, view }) {
  const isMobile = useIsMobile();
  
  // Forçar card view em mobile
  const effectiveView = isMobile ? 'grid' : view;
  
  if (effectiveView === 'grid') {
    return <ProductGrid products={products} />;
  }
  
  return <ProductTable products={products} />;
}
```

---

#### M8. Adicionar Confirmação de Saída com Alterações
**Esforço:** Baixo | **Impacto:** Médio

```tsx
// hooks/useUnsavedChanges.ts
export function useUnsavedChanges(hasChanges: boolean) {
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasChanges]);
}

// Uso em formulários
const { formState: { isDirty } } = useForm();
useUnsavedChanges(isDirty);
```

---

### 6.3 Melhorias de Baixa Prioridade

#### M9. Adicionar Tema Claro (Light Mode)
**Esforço:** Alto | **Impacto:** Baixo

O sistema de design atual é totalmente dark. Implementar toggle de tema requer:
- CSS variables para todas as cores
- Context para preferência do usuário
- Persistência no localStorage

---

#### M10. Implementar Atalhos de Teclado
**Esforço:** Médio | **Impacto:** Baixo

```tsx
// hooks/useKeyboardShortcuts.ts
export function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = [
        e.ctrlKey && 'ctrl',
        e.shiftKey && 'shift',
        e.key.toLowerCase(),
      ].filter(Boolean).join('+');
      
      if (shortcuts[key]) {
        e.preventDefault();
        shortcuts[key]();
      }
    };
    
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcuts]);
}

// Uso
useKeyboardShortcuts({
  'ctrl+k': () => openSearch(),
  'ctrl+n': () => openNewProduct(),
  'escape': () => closeModal(),
});
```

---

#### M11. Adicionar Animações de Transição entre Rotas
**Esforço:** Baixo | **Impacto:** Baixo

```tsx
// components/PageTransition.tsx
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

// App.tsx
<AnimatePresence mode="wait">
  <Routes location={location} key={location.pathname}>
    <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
    ...
  </Routes>
</AnimatePresence>
```

---

## 7. Componentes Reutilizáveis

### 7.1 Componentes Existentes para Manter

| Componente | Status | Recomendação |
|------------|--------|--------------|
| `Modal` | ✅ Bom | Manter como está |
| `ConfirmDialog` | ✅ Bom | Manter como está |
| `Button` | ✅ Bom | Manter como está |
| `Card` | ✅ Bom | Manter como está |
| `Input` | ✅ Bom | Manter como está |
| `Spinner` | ✅ Bom | Manter como está |
| `AnimatedCounter` | ✅ Bom | Manter como está |

### 7.2 Componentes para Criar/Abstrair

#### C1. EmptyState (Genérico)
**Baseado em:** Padrão repetido em múltiplas páginas

```tsx
// components/ui/EmptyState.tsx
interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="card text-center py-12">
      {icon && (
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#1A1D24] flex items-center justify-center">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-[#F5F5F5] mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-[#9CA3AF] mb-4 max-w-sm mx-auto">{description}</p>
      )}
      {action && (
        <button onClick={action.onClick} className="btn btn-primary">
          {action.label}
        </button>
      )}
    </div>
  );
}
```

---

#### C2. StatCard (Extrair do Dashboard)
**Baseado em:** `DashboardPage.tsx` linhas 19-46

```tsx
// components/ui/StatCard.tsx
interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: ReactNode;
  color: string;
  loading?: boolean;
}

export function StatCard({ title, value, change, icon, color, loading }: StatCardProps) {
  if (loading) {
    return <div className="card p-6 skeleton h-32" />;
  }
  
  const isPositive = change && change > 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div 
          className="w-12 h-12 rounded-sm flex items-center justify-center"
          style={{ background: `${color}15` }}
        >
          <div style={{ color }}>{icon}</div>
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${
            isPositive ? "text-[#10B981]" : "text-[#EF4444]"
          }`}>
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <h3 className="text-2xl font-display font-bold text-[#F5F5F5] mb-1">{value}</h3>
      <p className="text-sm text-[#4B5563]">{title}</p>
    </motion.div>
  );
}
```

---

#### C3. SearchInput (Com Debounce)
**Baseado em:** Padrão repetido em InventoryPage, ProductsPage

```tsx
// components/ui/SearchInput.tsx
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export function SearchInput({ 
  value, 
  onChange, 
  placeholder = "Buscar...",
  debounceMs = 300 
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, debounceMs);
    
    return () => clearTimeout(timer);
  }, [localValue, debounceMs, onChange]);
  
  return (
    <div className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
      <input
        type="text"
        className="input-field pl-10"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
      />
      {localValue && (
        <button
          onClick={() => setLocalValue('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4B5563] hover:text-[#9CA3AF]"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
```

---

#### C4. FilterPills (Filtros por Categoria/Marca)
**Baseado em:** InventoryPage linhas 390-420, HomePage

```tsx
// components/ui/FilterPills.tsx
interface FilterPillsProps<T extends string> {
  options: Array<{ value: T; label: string; color?: string }>;
  selected: T | null;
  onChange: (value: T | null) => void;
  allLabel?: string;
}

export function FilterPills<T extends string>({ 
  options, 
  selected, 
  onChange,
  allLabel = "Todas"
}: FilterPillsProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={`px-3 py-1.5 rounded-sm text-xs font-medium transition-colors ${
          !selected
            ? "bg-[#00FF87]/10 text-[#00FF87] border border-[#00FF87]/25"
            : "text-[#4B5563] border border-[#1A1D24] hover:border-[#4B5563]"
        }`}
      >
        {allLabel}
      </button>
      {options.map((option) => {
        const active = selected === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(active ? null : option.value)}
            className={`px-3 py-1.5 rounded-sm text-xs font-medium transition-colors ${
              active
                ? "border"
                : "text-[#4B5563] border border-[#1A1D24] hover:border-[#4B5563]"
            }`}
            style={active && option.color ? { 
              background: `${option.color}15`, 
              color: option.color, 
              borderColor: `${option.color}44` 
            } : undefined}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
```

---

#### C5. PageHeader (Título + Ações)
**Baseado em:** Padrão repetido em todas as páginas

```tsx
// components/ui/PageHeader.tsx
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  actions?: ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function PageHeader({ title, subtitle, badge, actions, breadcrumbs }: PageHeaderProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -8 }} 
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2 mb-6"
    >
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          {badge && (
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#00E5FF] mb-1 block">
              {badge}
            </span>
          )}
          <h1 className="text-2xl font-display font-bold text-[#F5F5F5]">{title}</h1>
          {subtitle && <p className="text-sm text-[#9CA3AF]">{subtitle}</p>}
        </div>
        
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </motion.div>
  );
}
```

---

#### C6. DataTable (Genérica com Ordenação)
**Baseado em:** InventoryPage, EmpresaUsuariosPage

```tsx
// components/ui/DataTable.tsx
interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => ReactNode;
  sortable?: boolean;
  hideBelow?: 'sm' | 'md' | 'lg' | 'xl';
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  loading?: boolean;
  emptyState?: ReactNode;
}

export function DataTable<T>({ 
  data, 
  columns, 
  keyExtractor,
  onRowClick,
  loading,
  emptyState
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  
  // ... implementação com ordenação, animações, etc.
}
```

---

#### C7. PasswordInput (Com Toggle e Força)
**Baseado em:** LoginPage, RegisterWizard

```tsx
// components/ui/PasswordInput.tsx
interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  showStrength?: boolean;
  label?: string;
  error?: string;
}

export function PasswordInput({ showStrength, label, error, ...props }: PasswordInputProps) {
  const [show, setShow] = useState(false);
  const strength = showStrength ? calculateStrength(props.value as string) : null;
  
  return (
    <div>
      {label && <label className="input-label mb-2 block">{label}</label>}
      <div className="relative">
        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
        <input
          type={show ? "text" : "password"}
          className={`input-field pl-10 pr-10 ${error ? "border-[#EF4444]" : ""}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4B5563] hover:text-[#9CA3AF]"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {showStrength && strength && (
        <div className="mt-2">
          <div className="flex gap-1">
            {[1, 2, 3, 4].map(i => (
              <div 
                key={i}
                className="h-1 flex-1 rounded-full"
                style={{ background: i <= strength.level ? strength.color : '#1A1D24' }}
              />
            ))}
          </div>
          <p className="text-xs mt-1" style={{ color: strength.color }}>
            {strength.label}
          </p>
        </div>
      )}
      {error && <span className="text-xs text-[#EF4444] mt-1 block">{error}</span>}
    </div>
  );
}
```

---

### 7.3 Hooks Reutilizáveis para Criar

#### H1. useDebounce
```tsx
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
}
```

#### H2. useLocalStorage
```tsx
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });
  
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  
  return [value, setValue] as const;
}
```

#### H3. useOnClickOutside
```tsx
export function useOnClickOutside(ref: RefObject<HTMLElement>, handler: () => void) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      handler();
    };
    
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}
```

---

## Conclusão

### Pontos Fortes do Projeto

1. **Stack moderna e bem escolhida** - React 19, TypeScript, Vite, TailwindCSS
2. **Sistema de design consistente** - Tema dark neon aplicado uniformemente
3. **Uso adequado de React Query** - Cache e invalidação bem implementados
4. **Formulários bem validados** - React Hook Form + Zod
5. **Animações suaves** - Framer Motion aplicado consistentemente
6. **Componentização básica** - UI components bem organizados

### Pontos a Melhorar

1. **RegisterWizard monolítico** - Precisa ser dividido urgentemente
2. **Dados mockados** - Dashboard com informações falsas
3. **Funcionalidades fake** - "Lembrar de mim", "Esqueci senha"
4. **Paginação ausente** - Performance comprometida com muitos dados
5. **Error handling inconsistente** - Algumas páginas não tratam erros
6. **Acessibilidade** - Não foi avaliada, provavelmente precisa melhorar

### Próximos Passos Recomendados

1. **Imediato:** Refatorar RegisterWizard
2. **Curto prazo:** Implementar paginação, remover/implementar funcionalidades fake
3. **Médio prazo:** Extrair componentes reutilizáveis, criar design system documentado
4. **Longo prazo:** Implementar i18n, tema claro, testes automatizados

---

> **Documento gerado por análise automatizada de código**  
> **Última atualização:** Abril 2026
