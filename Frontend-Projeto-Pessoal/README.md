# NUCLEUS - Frontend Al Tacadao

Bem-vindo ao projeto **NUCLEUS**! Este guia foi feito especialmente para voce que esta comecando. Leia com calma, siga os passos, e qualquer duvida releia a secao correspondente.

---

## O que e este projeto?

Este e o **frontend** (a parte visual) de um sistema de gestao chamado **NUCLEUS** para a loja Al Tacadao. Ele permite:

- **Login e Cadastro** de usuarios
- **Dashboard** com visao geral do sistema (contadores, graficos, listagens)
- **Gestao de Fornecedores** (criar, editar, excluir, buscar)
- **Gestao de Estoque/Produtos** (criar, editar, excluir, buscar, filtrar por marca)

O frontend se comunica com um **backend Java/Spring Boot** que roda separadamente na porta `8080`. Ou seja: este projeto e **so a tela**, os dados vem do backend.

---

## Tecnologias usadas

Antes de mexer no codigo, e bom saber o basico de cada tecnologia. Nao precisa dominar tudo — va aprendendo conforme a necessidade.

| Tecnologia | Pra que serve | Onde aprender |
|---|---|---|
| **React 19** | Biblioteca principal — constroi a interface com "componentes" | [react.dev](https://react.dev) |
| **TypeScript** | JavaScript com tipos (te avisa de erros antes de rodar) | [typescriptlang.org](https://www.typescriptlang.org/docs/) |
| **Vite** | Servidor de desenvolvimento super rapido | [vitejs.dev](https://vitejs.dev) |
| **Tailwind CSS v4** | Estilizacao direto no HTML com classes utilitarias | [tailwindcss.com](https://tailwindcss.com) |
| **React Router v7** | Navegacao entre paginas (tipo trocar de tela) | [reactrouter.com](https://reactrouter.com) |
| **TanStack React Query** | Buscar e cachear dados da API automaticamente | [tanstack.com/query](https://tanstack.com/query) |
| **React Hook Form + Zod** | Formularios com validacao (campo obrigatorio, email valido, etc) | [react-hook-form.com](https://react-hook-form.com) |
| **Framer Motion** | Animacoes suaves (fade in, slide, etc) | [motion.dev](https://motion.dev) |
| **Lucide React** | Biblioteca de icones bonitos | [lucide.dev](https://lucide.dev) |
| **Recharts** | Graficos (grafico de pizza no Dashboard) | [recharts.org](https://recharts.org) |
| **Sonner** | Notificacoes toast (aquelas mensagens que aparecem no canto) | [sonner.emilkowal.dev](https://sonner.emilkowal.dev) |

---

## Como rodar o projeto (passo a passo)

### Pre-requisitos

Voce precisa ter instalado:
- **Node.js** (versao 18 ou superior) — [nodejs.org](https://nodejs.org)
- **npm** (ja vem junto com o Node.js)
- **Git** — [git-scm.com](https://git-scm.com)

Para verificar se ja tem instalado, abra o terminal e digite:
```bash
node --version
npm --version
git --version
```

### Passo 1 — Clonar o repositorio

```bash
git clone https://github.com/Americanoooo/Frontend-Al_Tacadao.git
cd Frontend-Al_Tacadao/Frontend-Projeto-Pessoal
```

### Passo 2 — Instalar as dependencias

```bash
npm install
```

> Isso le o arquivo `package.json` e baixa todas as bibliotecas que o projeto usa. So precisa rodar de novo se o `package.json` mudar.

### Passo 3 — Rodar o servidor de desenvolvimento

```bash
npm run dev
```

O terminal vai mostrar algo como:
```
  VITE v6.x.x  ready in XXXms

  ➜  Local:   http://localhost:3000/
```

Abra **http://localhost:3000** no navegador.

### IMPORTANTE

O **backend** precisa estar rodando na porta **8080** para o frontend funcionar. Sem o backend, voce vai ver erros nas chamadas de API. Para subir o backend:

```bash
# Na pasta do projeto backend (Maven/Spring Boot)
./mvnw spring-boot:run
```

---

## Estrutura de pastas (o mapa do projeto)

Aqui esta onde cada coisa fica. **Essa e a secao mais importante** — sempre volte aqui quando estiver perdido.

```
Frontend-Projeto-Pessoal/
│
├── index.html                ← HTML principal (voce quase nunca mexe aqui)
├── package.json              ← Lista de dependencias e scripts
├── vite.config.ts            ← Configuracao do Vite (porta, proxy)
├── tsconfig.json             ← Configuracao do TypeScript
│
└── src/                      ← ** TODO O CODIGO FICA AQUI **
    │
    ├── main.tsx              ← Ponto de entrada — configura React Query, Router, Toasts
    ├── App.tsx               ← Define TODAS as rotas (quais URLs levam a quais paginas)
    ├── index.css             ← Estilos globais (Tailwind + classes customizadas)
    │
    ├── api/
    │   └── client.ts         ← ** TODAS as chamadas HTTP para o backend **
    │                           (se precisar conectar com a API, e aqui que mexe)
    │
    ├── auth/
    │   └── AuthContext.tsx    ← Controle de login/logout/sessao
    │                           (quem esta logado? tem permissao?)
    │
    ├── components/
    │   ├── layout/
    │   │   ├── AppLayout.tsx  ← Layout principal (sidebar + area de conteudo)
    │   │   └── Sidebar.tsx    ← Menu lateral (desktop) e barra inferior (mobile)
    │   │
    │   └── ui/
    │       ├── Modal.tsx          ← Componente de janela flutuante (reutilizavel)
    │       ├── ConfirmDialog.tsx  ← Janela de "tem certeza?" para exclusoes
    │       └── AnimatedCounter.tsx ← Numero que anima de 0 ate o valor final
    │
    ├── lib/
    │   └── utils.ts          ← Funcoes auxiliares + mapa de MARCAS (cores e nomes)
    │
    └── pages/                ← ** AS TELAS DO SISTEMA **
        ├── LoginPage.tsx         ← Tela de login
        ├── CadastroPage.tsx      ← Tela de criar conta
        ├── DashboardPage.tsx     ← Tela inicial (graficos e contadores)
        ├── FornecedoresPage.tsx   ← Tela de gerenciar fornecedores (CRUD completo)
        └── EstoquePage.tsx        ← Tela de gerenciar produtos (CRUD completo)
```

---

## Como o app funciona (fluxo completo)

Imagine que voce acabou de abrir o site. Aqui esta o que acontece por baixo dos panos:

### 1. Inicializacao (`main.tsx`)

O React inicia e configura 3 coisas globais:
- **QueryClientProvider** → sistema de cache para dados da API
- **BrowserRouter** → sistema de navegacao por URLs
- **Toaster** → notificacoes de sucesso/erro no canto da tela

### 2. Rotas (`App.tsx`)

O `App.tsx` define qual pagina aparece para cada URL:

```
/login      → LoginPage      (qualquer um pode acessar)
/cadastro   → CadastroPage   (qualquer um pode acessar)
/           → DashboardPage  (precisa estar logado)
/fornecedores → FornecedoresPage (precisa estar logado)
/estoque    → EstoquePage    (precisa estar logado)
```

As rotas protegidas ficam dentro do `<AppLayout />`, que verifica se o usuario esta logado.

### 3. Protecao de rotas (`AppLayout.tsx`)

Quando voce tenta acessar `/`, `/fornecedores` ou `/estoque`:
- O `AppLayout` chama `useAuth()` para verificar se tem usuario logado
- Se **NAO** tem → redireciona para `/login`
- Se **tem** → mostra a Sidebar + o conteudo da pagina

### 4. Autenticacao (`AuthContext.tsx`)

O `AuthContext` e o "cerebro" do login. Ele:
- Ao carregar, chama `GET /api/auth/me` para ver se ja tem sessao ativa
- Expoe funcoes `login()`, `logout()`, `refresh()` para qualquer componente usar
- Qualquer pagina pode fazer `const { user } = useAuth()` para saber quem esta logado

### 5. Chamadas para o backend (`api/client.ts`)

Toda comunicacao com o servidor esta centralizada neste arquivo. Quando uma pagina precisa de dados:
1. Chama uma funcao como `apiListFornecedores()`
2. Essa funcao faz um `fetch()` para a URL da API
3. O Vite intercepta e redireciona para `localhost:8080` (proxy configurado no `vite.config.ts`)

---

## Comunicacao com o Backend (API)

Todas as chamadas HTTP estao em `src/api/client.ts`. Aqui esta a lista completa:

### Autenticacao

| Funcao | Metodo | URL | O que faz |
|---|---|---|---|
| `apiLogin` | POST | `/api/login` | Faz login (envia usuario e senha) |
| `apiMe` | GET | `/api/auth/me` | Retorna dados do usuario logado |
| `apiLogout` | POST | `/api/logout` | Encerra a sessao |

### Usuarios

| Funcao | Metodo | URL | O que faz |
|---|---|---|---|
| `apiCadastro` | POST | `/cadastro` | Cria um novo usuario |
| `apiListUsuarios` | GET | `/cadastro?tamanha-pagina=1000` | Lista todos os usuarios |

### Fornecedores

| Funcao | Metodo | URL | O que faz |
|---|---|---|---|
| `apiListFornecedores` | GET | `/fornecedor?tamanha-pagina=1000` | Lista todos |
| `apiCreateFornecedor` | POST | `/fornecedor` | Cria novo |
| `apiUpdateFornecedor` | PUT | `/fornecedor/{id}` | Atualiza existente |
| `apiDeleteFornecedor` | DELETE | `/fornecedor/{id}` | Remove |

### Estoque (Produtos)

| Funcao | Metodo | URL | O que faz |
|---|---|---|---|
| `apiListEstoque` | GET | `/api/estoque?tamanha-pagina=1000` | Lista todos |
| `apiCreateProduto` | POST | `/api/estoque` | Cria novo |
| `apiUpdateProduto` | PUT | `/api/estoque/{id}` | Atualiza existente |
| `apiDeleteProduto` | DELETE | `/api/estoque/{id}` | Remove |

### Como o proxy funciona

No `vite.config.ts`, temos:
```typescript
proxy: {
  "/api":        { target: "http://localhost:8080" },
  "/cadastro":   { target: "http://localhost:8080" },
  "/fornecedor": { target: "http://localhost:8080" },
}
```

Isso significa: quando o frontend faz `fetch("/api/estoque")`, o Vite redireciona essa chamada para `http://localhost:8080/api/estoque`. Assim o frontend e o backend podem rodar em portas diferentes sem problemas.

---

## Permissoes por perfil (quem pode fazer o que)

O sistema tem 3 perfis de usuario:

| Perfil | Pode criar | Pode editar | Pode excluir |
|---|---|---|---|
| **GERENTE** | Sim | Sim | Sim |
| **FUNCIONARIO** | Nao | Sim | Nao |
| **ESTAGIARIO** | Nao | Sim | Nao |

No codigo, a verificacao e feita assim (em `EstoquePage.tsx` e `FornecedoresPage.tsx`):

```typescript
const isGerente = user?.roles?.includes("GERENTE") ?? false;
```

Os botoes de "Novo Produto" e "Excluir" so aparecem na tela se `isGerente` for `true`.

---

## Guia pratico: "Como eu faco para..."

### Adicionar uma nova pagina

**Exemplo:** quero criar uma pagina de "Relatorios" em `/relatorios`.

**Passo 1** — Crie o arquivo `src/pages/RelatoriosPage.tsx`:
```tsx
export function RelatoriosPage() {
  return (
    <div className="page-container min-h-screen">
      <h1 className="text-2xl font-bold text-slate-100">Relatorios</h1>
      <p className="text-slate-500">Em breve...</p>
    </div>
  );
}
```

**Passo 2** — Adicione a rota em `src/App.tsx`:
```tsx
import { RelatoriosPage } from "./pages/RelatoriosPage";

// Dentro do <Route element={<AppLayout />}>, adicione:
<Route path="/relatorios" element={<RelatoriosPage />} />
```

**Passo 3** — Adicione o link no menu em `src/components/layout/Sidebar.tsx`:
```tsx
import { FileText } from "lucide-react"; // escolha um icone

// No array NAV, adicione:
{ to: "/relatorios", icon: FileText, label: "Relatorios" },
```

Pronto! A nova pagina ja aparece no menu e funciona.

---

### Adicionar um novo campo em Fornecedor

**Exemplo:** quero adicionar o campo "endereco".

**Passo 1** — Atualize os tipos em `src/api/client.ts`:
```typescript
export type Fornecedor = {
  // ... campos existentes ...
  endereco?: string;  // novo campo
};

export type FornecedorPayload = Omit<Fornecedor, "id" | "dataDeCadastro">;
```

**Passo 2** — Atualize o schema e formulario em `src/pages/FornecedoresPage.tsx`:
```typescript
// No schema Zod:
const schema = z.object({
  // ... campos existentes ...
  endereco: z.string().optional(),
});

// No formulario (FornecedorForm), adicione mais um Field:
<Field name="endereco" label="Endereco" icon={MapPin} placeholder="Rua, numero, cidade" />
```

**Passo 3** — Adicione a coluna na tabela (tambem em `FornecedoresPage.tsx`):
```tsx
// No <thead>:
<th>Endereco</th>

// No <tbody>:
<td>{f.endereco || "—"}</td>
```

---

### Adicionar uma nova marca de produto

Va em `src/lib/utils.ts` e adicione no objeto `BRAND_META`:

```typescript
export const BRAND_META = {
  // ... marcas existentes ...
  NOVA_MARCA: {
    label: "Nome Bonito da Marca",
    color: "#hex_da_cor",
    bg: "rgba(r, g, b, 0.12)"
  },
};
```

A marca vai aparecer automaticamente nos filtros, graficos e cards.

---

### Alterar estilos (cores, fontes, espacamento)

- **Tailwind CSS** → a maioria dos estilos esta direto no JSX como classes:
  - `text-slate-100` = cor do texto
  - `bg-white/5` = fundo com transparencia
  - `p-4` = padding de 16px
  - `rounded-2xl` = bordas arredondadas
  - `mb-4` = margem inferior de 16px

- **CSS customizado** → estilos especiais (como `.glass`, `.sidebar-item`, `.btn-primary`) estao em `src/index.css`

Para aprender Tailwind, consulte: [tailwindcss.com/docs](https://tailwindcss.com/docs)

---

## Padroes do codigo (como as coisas sao feitas aqui)

### 1. Buscar dados da API → React Query

```typescript
// Buscar lista de fornecedores (automatico, com cache)
const { data: fornecedores = [], isLoading } = useQuery({
  queryKey: ["fornecedores"],         // chave unica para o cache
  queryFn: apiListFornecedores,       // funcao que busca os dados
});
```

### 2. Criar/Editar/Deletar → useMutation

```typescript
const createMut = useMutation({
  mutationFn: (payload) => apiCreateFornecedor(payload),
  onSuccess: async (res) => {
    if (res.ok) {
      toast.success("Fornecedor criado!");                        // notificacao
      await qc.invalidateQueries({ queryKey: ["fornecedores"] }); // atualiza a lista
      setModalOpen(false);                                         // fecha o modal
    }
  },
});

// Para usar:
createMut.mutate(dadosDoFormulario);
```

### 3. Formularios → React Hook Form + Zod

```typescript
// 1. Define o schema (regras de validacao)
const schema = z.object({
  nome: z.string().min(2, "Nome obrigatorio"),
  email: z.string().email("Email invalido"),
});

// 2. Usa no formulario
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
});

// 3. No JSX
<input {...register("nome")} />
{errors.nome && <span>{errors.nome.message}</span>}
```

### 4. Modais

```typescript
const [modalOpen, setModalOpen] = useState(false);

// Abrir:
<button onClick={() => setModalOpen(true)}>Abrir</button>

// Modal:
<Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Titulo">
  <p>Conteudo aqui dentro</p>
</Modal>
```

### 5. Animacoes → Framer Motion

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}   // estado inicial (invisivel, 20px abaixo)
  animate={{ opacity: 1, y: 0 }}     // estado final (visivel, posicao normal)
  transition={{ duration: 0.3 }}      // duracao da animacao
>
  Conteudo animado
</motion.div>
```

---

## Comandos Git para o dia a dia

```bash
# Ver o que mudou nos seus arquivos
git status

# Ver as diferencas linha por linha
git diff

# Adicionar TODOS os arquivos modificados
git add .

# Criar um commit (salvar um "checkpoint")
git commit -m "descricao curta do que voce fez"

# Enviar seus commits para o GitHub
git push

# Pegar atualizacoes que outra pessoa enviou
git pull

# Desfazer TUDO que voce mudou (volta ao ultimo commit) — CUIDADO!
git checkout .
```

### Fluxo recomendado de trabalho

1. `git pull` — sempre comece pegando as atualizacoes
2. Faca suas mudancas no codigo
3. `git status` — veja o que mudou
4. `git add .` — adicione tudo
5. `git commit -m "o que eu fiz"` — salve
6. `git push` — envie para o GitHub

---

## Dicas para iniciantes

1. **Mantenha `npm run dev` rodando** — o Vite atualiza o navegador automaticamente quando voce salva um arquivo.

2. **Use o DevTools do navegador** (F12):
   - Aba **Console** → erros de JavaScript aparecem aqui
   - Aba **Network** → mostra todas as chamadas para a API (util para debugar)

3. **Erros de TypeScript** → leia a mensagem com calma. Geralmente diz exatamente o que esta faltando ou errado.

4. **Nao tenha medo de experimentar** → voce sempre pode desfazer com `git checkout .` ou voltar para um commit anterior.

5. **Pesquise no Google/ChatGPT** → se nao souber algo, copie a mensagem de erro e pesquise. E assim que todo desenvolvedor aprende.

6. **Comece pelas coisas pequenas** → mude uma cor, um texto, adicione um campo. Va ganhando confianca aos poucos.

---

## Producao (deploy)

Quando o projeto estiver pronto para ir ao ar:

```bash
npm run build
```

Isso gera a pasta `dist/` com os arquivos otimizados. Esses arquivos podem ser servidos pelo Spring Boot como arquivos estaticos ou por um servidor como Nginx.

---

## Observacao de portas

- **Frontend (Vite):** porta `3000`
- **Backend (Spring Boot):** porta `8080`
- O proxy do Vite redireciona chamadas `/api`, `/cadastro` e `/fornecedor` automaticamente para o backend

---

*Feito com carinho para facilitar sua jornada no projeto. Bom codigo!*
