# NUCLEUS - Frontend Al Tacadão

Sistema de gestão para a loja Al Tacadão. Interface moderna construída com React 19, TypeScript e Tailwind CSS v4.

---

## 🚀 Início Rápido

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

**Pré-requisitos:**
- Node.js 18+
- Backend rodando na porta 8080

---

## 📁 Estrutura do Projeto

```
src/
├── api/
│   └── client.ts           # Todas as chamadas HTTP para o backend
├── auth/
│   ├── AuthContext.tsx     # Contexto de autenticação (login/logout/sessão)
│   └── ProtectedRoute.tsx  # Proteção de rotas + redirecionamentos
├── components/
│   ├── layout/             # Layouts (AdminLayout, StoreLayout, Sidebar)
│   └── ui/                 # Componentes reutilizáveis (Modal, Button, RegisterWizard)
├── hooks/                  # Hooks customizados (useCart, etc)
├── lib/
│   └── utils.ts            # Funções auxiliares + constantes
├── pages/                  # Páginas do sistema
│   ├── RegisterPage.tsx    # Cadastro (wizard empresa + usuário)
│   ├── LoginPage.tsx       # Login
│   ├── DashboardPage.tsx   # Dashboard principal
│   ├── UsersPage.tsx       # Gestão de usuários (admin)
│   ├── SuppliersPage.tsx   # Gestão de fornecedores
│   ├── InventoryPage.tsx   # Gestão de estoque
│   └── ...
├── App.tsx                 # Definição de rotas
└── main.tsx                # Ponto de entrada
```

---

## 🔐 Fluxo de Autenticação

### Cadastro (Empresa → Usuário)

O sistema exige que a **empresa seja cadastrada antes do usuário**.

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUXO DE CADASTRO                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  /cadastro                                                  │
│      │                                                      │
│      ▼                                                      │
│  ┌─────────────────────┐                                    │
│  │   ESCOLHER TIPO     │                                    │
│  └──────────┬──────────┘                                    │
│             │                                               │
│      ┌──────┴──────┐                                        │
│      │             │                                        │
│      ▼             ▼                                        │
│  ┌────────┐   ┌───────────┐                                 │
│  │  NOVA  │   │ EXISTENTE │                                 │
│  │EMPRESA │   │  (CNPJ)   │                                 │
│  └───┬────┘   └─────┬─────┘                                 │
│      │              │                                       │
│      ▼              ▼                                       │
│  ┌───────────────────────┐                                  │
│  │   DADOS DO USUÁRIO    │                                  │
│  └───────────┬───────────┘                                  │
│              │                                              │
│       ┌──────┴──────┐                                       │
│       │             │                                       │
│       ▼             ▼                                       │
│  ┌─────────┐   ┌──────────────┐                             │
│  │ GERENTE │   │  AGUARDANDO  │                             │
│  │ ACESSO  │   │  APROVAÇÃO   │                             │
│  │  TOTAL  │   │              │                             │
│  └─────────┘   └──────┬───────┘                             │
│                       │                                     │
│                       ▼                                     │
│               ┌───────────────┐                             │
│               │    GERENTE    │                             │
│               │    APROVA     │────▶ ACESSO LIBERADO        │
│               └───────────────┘                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Estados do Usuário

| Estado | `fornecedorId` | Acesso |
|--------|----------------|--------|
| Pendente | `null` | Apenas `/aguardando-empresa` |
| Aprovado | `uuid` | Acesso total |
| Gerente | `uuid` + role GERENTE | Acesso admin |

---

## 🔌 Integração com Backend (API)

### Endpoints Obrigatórios

O frontend espera os seguintes endpoints no backend:

#### Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/login` | Login (retorna JWT) |
| GET | `/api/auth/me` | Dados do usuário logado |
| POST | `/api/logout` | Logout |

#### Cadastro

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/cadastro` | Cadastro de usuário (com `fornecedorId` opcional) |
| POST | `/cadastro/empresa-usuario` | **NOVO** - Cria empresa + usuário em transação única |
| GET | `/cadastro` | Lista usuários (paginado) |
| PUT | `/cadastro/{id}` | Atualiza usuário |
| DELETE | `/cadastro/{id}` | Remove usuário |
| PUT | `/cadastro/{id}/roles` | Altera roles do usuário |
| PUT | `/cadastro/{id}/aprovar` | **NOVO** - Aprova usuário pendente |
| PUT | `/cadastro/{id}/rejeitar` | **NOVO** - Rejeita usuário pendente |
| PUT | `/cadastro/{id}/vincular-empresa` | Vincula usuário a empresa |

#### Fornecedores (Empresas)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/fornecedor` | Lista fornecedores (paginado) |
| GET | `/fornecedor/{id}` | Busca fornecedor por ID |
| GET | `/fornecedor/buscar?cnpj=X` | **NOVO** - Busca fornecedor por CNPJ |
| POST | `/fornecedor` | Cria fornecedor |
| PUT | `/fornecedor/{id}` | Atualiza fornecedor |
| DELETE | `/fornecedor/{id}` | Remove fornecedor |

#### Estoque

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/estoque` | Lista produtos (paginado) |
| GET | `/api/estoque/{id}` | Busca produto por ID |
| POST | `/api/estoque` | Cria produto |
| PUT | `/api/estoque/{id}` | Atualiza produto |
| DELETE | `/api/estoque/{id}` | Remove produto |

---

### Contratos de Dados

#### POST `/cadastro/empresa-usuario`

Cria empresa e usuário em uma única transação. O usuário criado será **GERENTE** da empresa.

**Request:**
```json
{
  "empresa": {
    "cnpj": "12345678000199",
    "razaoSocial": "Empresa LTDA",
    "nomeFantasia": "Nome Fantasia",
    "email": "empresa@email.com",
    "telefone": "11999999999"
  },
  "usuario": {
    "nome": "João Silva",
    "login": "joao.silva",
    "email": "joao@email.com",
    "senha": "senha123"
  }
}
```

**Response (201):**
```json
{
  "empresa": {
    "id": "uuid",
    "cnpj": "12345678000199",
    "razaoSocial": "Empresa LTDA"
  },
  "usuario": {
    "id": "uuid",
    "login": "joao.silva",
    "roles": ["GERENTE"],
    "fornecedorId": "uuid"
  },
  "token": "jwt_token"
}
```

---

#### POST `/cadastro` (com empresa existente)

Cadastra usuário vinculado a uma empresa existente. O usuário fica **PENDENTE** até aprovação.

**Request:**
```json
{
  "nome": "Maria Santos",
  "login": "maria.santos",
  "email": "maria@email.com",
  "senha": "senha123",
  "fornecedorId": "uuid-da-empresa"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "login": "maria.santos",
  "roles": ["USER"],
  "fornecedorId": "uuid-da-empresa"
}
```

---

#### GET `/fornecedor/buscar?cnpj=12345678000199`

Busca empresa por CNPJ (para o fluxo de "entrar em empresa existente").

**Response (200):**
```json
{
  "id": "uuid",
  "cnpj": "12345678000199",
  "razaoSocial": "Empresa LTDA",
  "nomeFantasia": "Nome Fantasia",
  "email": "empresa@email.com"
}
```

**Response (404):**
```json
{
  "message": "Empresa não encontrada"
}
```

---

#### PUT `/cadastro/{id}/aprovar`

Gerente aprova usuário pendente da sua empresa.

**Response (200):**
```json
{
  "id": "uuid",
  "login": "maria.santos",
  "fornecedorId": "uuid"
}
```

---

#### GET `/api/auth/me`

Retorna dados do usuário logado. **Importante:** deve incluir `fornecedorId`.

**Response:**
```json
{
  "id": "uuid",
  "nome": "João Silva",
  "login": "joao.silva",
  "email": "joao@email.com",
  "roles": ["GERENTE"],
  "fornecedorId": "uuid-ou-null"
}
```

> **Nota:** Se `fornecedorId` for `null`, o usuário está **pendente** e será redirecionado para `/aguardando-empresa`.

---

### Códigos de Erro

| Código | Situação |
|--------|----------|
| 200 | OK |
| 201 | Criado com sucesso |
| 400 | Dados inválidos |
| 401 | Não autenticado |
| 403 | Sem permissão |
| 404 | Não encontrado |
| 409 | Conflito (CNPJ/email/login já existe) |
| 422 | Erro de validação |

**Formato de erro 422:**
```json
{
  "status": 422,
  "message": "Erro de validação",
  "erros": [
    { "campo": "email", "message": "E-mail inválido" },
    { "campo": "cnpj", "message": "CNPJ já cadastrado" }
  ]
}
```

---

## 🛣️ Rotas da Aplicação

### Públicas
| Rota | Página | Descrição |
|------|--------|-----------|
| `/` | HomePage | Página inicial da loja |
| `/produtos` | ProductsPage | Lista de produtos |
| `/produtos/:id` | ProductDetailPage | Detalhe do produto |
| `/carrinho` | CartPage | Carrinho de compras |
| `/login` | LoginPage | Login |
| `/cadastro` | RegisterPage | Cadastro (wizard) |

### Protegidas (requer login + empresa aprovada)
| Rota | Página | Descrição |
|------|--------|-----------|
| `/dashboard` | DashboardPage | Dashboard principal |
| `/perfil` | ProfilePage | Perfil do usuário |
| `/estoque` | InventoryPage | Gestão de estoque |
| `/fornecedores` | SuppliersPage | Gestão de fornecedores |

### Admin (requer GERENTE)
| Rota | Página | Descrição |
|------|--------|-----------|
| `/admin` | DashboardPage | Dashboard admin |
| `/admin/usuarios` | UsersPage | Gestão de usuários (aprovar/rejeitar) |
| `/admin/produtos` | InventoryPage | Produtos (visão admin) |
| `/admin/fornecedores` | SuppliersPage | Fornecedores (visão admin) |

### Especiais
| Rota | Página | Descrição |
|------|--------|-----------|
| `/aguardando-empresa` | PendingCompanyPage | Usuário pendente aguardando aprovação |

---

## 🛠️ Tecnologias

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| React | 19 | UI Library |
| TypeScript | 5.7 | Type Safety |
| Vite | 6 | Build Tool |
| Tailwind CSS | 4 | Styling |
| React Router | 7 | Routing |
| TanStack Query | 5 | Data Fetching |
| React Hook Form | 7 | Forms |
| Zod | 4 | Validation |
| Framer Motion | 12 | Animations |
| Lucide React | 1 | Icons |
| Recharts | 3 | Charts |
| Sonner | 2 | Toasts |

---

## 📝 Scripts

```bash
npm run dev      # Servidor de desenvolvimento (porta 3000)
npm run build    # Build para produção
npm run preview  # Preview do build
```

---

## ⚙️ Configuração de Proxy

O `vite.config.ts` configura proxy para o backend:

```typescript
proxy: {
  "/api": { target: "http://localhost:8080" },
  "/cadastro": { target: "http://localhost:8080" },
  "/fornecedor": { target: "http://localhost:8080" },
}
```

---

## 👥 Permissões

| Role | Dashboard | Usuários | Estoque | Fornecedores | Aprovar Usuários |
|------|-----------|----------|---------|--------------|------------------|
| USER | ✅ | ❌ | ✅ (ver/criar) | ✅ | ❌ |
| GERENTE | ✅ | ✅ | ✅ (total) | ✅ | ✅ |

---

## 🔧 Desenvolvimento

### Adicionar nova página

1. Crie `src/pages/NovaPagina.tsx`
2. Adicione rota em `src/App.tsx`
3. Adicione link no menu em `src/components/layout/Sidebar.tsx`

### Adicionar novo endpoint

1. Adicione função em `src/api/client.ts`
2. Use `useQuery` ou `useMutation` na página

---

## 📦 Deploy

```bash
npm run build
```

A pasta `dist/` contém os arquivos estáticos para deploy (Vercel, Nginx, etc).

---

*Desenvolvido para Al Tacadão - Sistema NUCLEUS*
