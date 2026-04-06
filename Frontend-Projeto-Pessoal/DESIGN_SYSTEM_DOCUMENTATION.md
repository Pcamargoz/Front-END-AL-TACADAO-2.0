# AL-TACADÃO Design System

> **Plataforma B2B de distribuição de suplementos premium**
> 
> Stack: React 19 + TailwindCSS + TypeScript  
> Identidade: Apple-style com tema dark e cor emerald (#10b981)

---

## 📖 Índice

1. [Foundation](#foundation)
   - [Brand & Identity](#brand--identity)
   - [Color System](#color-system)
   - [Typography](#typography)
   - [Spacing & Layout](#spacing--layout)
   - [Elevation & Shadows](#elevation--shadows)

2. [Components](#components)
   - [Buttons](#buttons)
   - [Forms & Inputs](#forms--inputs)
   - [Cards](#cards)
   - [Navigation](#navigation)
   - [Modals & Overlays](#modals--overlays)

3. [Patterns](#patterns)
   - [Layout Patterns](#layout-patterns)
   - [Responsive Behavior](#responsive-behavior)
   - [Interaction States](#interaction-states)
   - [Animation Guidelines](#animation-guidelines)
   - [Accessibility Standards](#accessibility-standards)

---

## Foundation

### Brand & Identity

**AL-TACADÃO** é uma plataforma B2B premium para distribuição de suplementos, com identidade visual inspirada no design system da Apple.

#### Princípios de Design
- **Humanized**: Cores acolhedoras que transmitem confiança
- **Warm**: Tons quentes que criam conexão emocional
- **Professional**: Interface sofisticada para negócios B2B
- **Welcoming**: Design acessível e intuitivo

#### Filosofia Visual
- Minimalismo sofisticado
- Espaço em branco generoso
- Hierarquia visual clara
- Micro-interações sutis

---

### Color System

O sistema de cores é baseado em tons quentes com o verde esmeralda como cor primária, transmitindo crescimento, saúde e energia.

#### Primary Colors

```css
/* Emerald Green - Cor principal */
--color-accent: #10b981;
--color-accent-hover: #059669;
--color-accent-active: #047857;
--color-accent-subtle: rgba(16, 185, 129, 0.10);
--color-accent-muted: rgba(16, 185, 129, 0.12);
```

#### Secondary Accents

```css
/* Âmbar Dourado - Premium, confiança, energia */
--color-accent-gold: #D97706;
--color-accent-gold-hover: #B45309;
--color-accent-gold-subtle: rgba(217, 119, 6, 0.10);

/* Terracota - Humanizado, acolhedor */
--color-accent-warm: #DC6843;
--color-accent-warm-subtle: rgba(220, 104, 67, 0.10);
```

#### Background Colors (Light Mode)

```css
--color-bg-primary: #FDFCFA;    /* Warm off-white */
--color-bg-secondary: #F7F5F2;  /* Cremoso suave */
--color-bg-tertiary: #EEEBE6;   /* Tom mais escuro */
--color-bg-elevated: #FFFFFF;   /* Cards e elementos elevados */
```

#### Background Colors (Dark Mode)

```css
--color-bg-primary: #141210;    /* Escuro quente, não preto puro */
--color-bg-secondary: #1E1B18;  /* Segundo plano */
--color-bg-tertiary: #282420;   /* Terceiro plano */
--color-bg-elevated: #1E1B18;   /* Cards em dark mode */
```

#### Text Colors

```css
/* Light Mode */
--color-text-primary: #1A1715;    /* Quase preto quente */
--color-text-secondary: #5C554D;  /* Cinza-marrom médio */
--color-text-tertiary: #8A817A;   /* Cinza-marrom claro */
--color-text-quaternary: #B5ADA5; /* Muito claro */

/* Dark Mode */
--color-text-primary: #F5F2EE;    /* Cremoso claro */
--color-text-secondary: #B8B2AA;  /* Cremoso médio */
--color-text-tertiary: #8A847C;   /* Cremoso escuro */
--color-text-quaternary: #5C5850; /* Mais escuro */
```

#### Status Colors

```css
--color-success: #16A34A;
--color-warning: #EA580C;
--color-error: #DC2626;
--color-info: #0891B2;
```

#### Usage Guidelines

**✅ Do:**
- Use o verde esmeralda (#10b981) para ações primárias
- Aplique tons quentes para criar ambiente acolhedor
- Mantenha contraste adequado para legibilidade
- Use cores de status consistentemente

**❌ Don't:**
- Não use preto puro (#000000) em dark mode
- Evite cores muito saturadas para texto
- Não misture tons frios com a paleta quente
- Não use mais de 3 cores accent simultaneamente

---

### Typography

Sistema tipográfico baseado na fonte **Inter** com escala fluida e hierarquia clara.

#### Font Stack

```css
--font-sans: "Inter", -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif;
--font-mono: "SF Mono", "JetBrains Mono", monospace;
```

#### Type Scale

| Classe | Size | Weight | Line Height | Letter Spacing | Uso |
|--------|------|--------|-------------|----------------|-----|
| `.text-display` | 48-96px | 700 | 1.0 | -0.03em | Hero headlines |
| `.text-headline` | 32-64px | 600 | 1.1 | -0.02em | Section titles |
| `.text-title` | 24-40px | 500 | 1.2 | -0.01em | Card titles |
| `.text-title-sm` | 20-28px | 500 | 1.25 | 0 | Subsections |
| `.text-body-lg` | 19px | 400 | 1.6 | 0 | Lead paragraphs |
| `.text-body` | 17px | 400 | 1.65 | 0 | Standard text |
| `.text-body-sm` | 15px | 400 | 1.6 | 0 | Secondary text |
| `.text-caption` | 12px | 400 | 1.4 | 0.05em | Labels, metadata |
| `.text-eyebrow` | 12px | 600 | 1.4 | 0.08em | Category labels |

#### Typography Examples

```html
<!-- Hero Title -->
<h1 class="text-display">AL-TACADÃO</h1>

<!-- Section Title -->
<h2 class="text-headline">Nossos Produtos</h2>

<!-- Page Title -->
<h3 class="text-title">Dashboard Vendas</h3>

<!-- Body Text -->
<p class="text-body">Distribuição premium de suplementos para sua empresa.</p>

<!-- Eyebrow Label -->
<span class="text-eyebrow">Categoria</span>
```

#### Usage Guidelines

**✅ Do:**
- Use máximo 68 caracteres por linha para legibilidade
- Mantenha hierarquia visual consistente
- Aplique letter-spacing negativo em headlines
- Use font-smoothing para qualidade visual

**❌ Don't:**
- Não use mais de 3 níveis hierárquicos por página
- Evite texto muito pequeno (< 12px)
- Não misture pesos de fonte inconsistentes
- Evite linhas muito longas de texto

---

### Spacing & Layout

Sistema de espaçamento baseado em escala de 4px com containers responsivos.

#### Spacing Scale

```css
--space-1: 4px;    /* Micro espaçamentos */
--space-2: 8px;    /* Pequenos gaps */
--space-3: 12px;   /* Padding interno */
--space-4: 16px;   /* Spacing padrão */
--space-5: 20px;   /* Médio */
--space-6: 24px;   /* Layout interno */
--space-8: 32px;   /* Seções */
--space-10: 40px;  /* Entre blocos */
--space-12: 48px;  /* Grande */
--space-16: 64px;  /* Muito grande */
--space-20: 80px;  /* Seções importantes */
--space-24: 96px;  /* Seção hero */
--space-32: 128px; /* Separação máxima */
```

#### Container System

```css
--container-max: 980px;        /* Container padrão */
--container-wide: 1200px;      /* Container largo */
--container-narrow: 692px;     /* Container estreito */
--container-padding: 22px;     /* Padding horizontal */
```

#### Layout Classes

```html
<!-- Container padrão -->
<div class="container">Content</div>

<!-- Container largo -->
<div class="container container-wide">Wide content</div>

<!-- Container estreito (para texto) -->
<div class="container container-narrow">Article content</div>

<!-- Seção com padding vertical -->
<section class="section">Section content</section>
```

#### Grid System

```css
.grid { display: grid; gap: var(--grid-gap); }
.grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
```

#### Responsive Breakpoints

- **Mobile**: < 734px
- **Tablet**: 734px - 1068px  
- **Desktop**: > 1068px

#### Usage Guidelines

**✅ Do:**
- Use múltiplos de 4px para espaçamento
- Mantenha consistência de containers
- Aplique padding responsivo
- Use grid system para layouts

**❌ Don't:**
- Não use valores de spacing arbitrários
- Evite containers muito estreitos em mobile
- Não quebre o grid system
- Evite espaçamentos excessivos

---

### Elevation & Shadows

Sistema de elevação com sombras suaves e naturais.

#### Shadow Tokens

```css
--shadow-sm: 0 1px 2px rgba(26, 23, 21, 0.06);      /* Sutil */
--shadow-md: 0 4px 16px rgba(26, 23, 21, 0.08);     /* Cards */
--shadow-lg: 0 12px 40px rgba(26, 23, 21, 0.12);    /* Hover states */
--shadow-xl: 0 24px 64px rgba(26, 23, 21, 0.16);    /* Modals */
```

#### Border Radius

```css
--radius-sm: 8px;      /* Pequenos elementos */
--radius-md: 12px;     /* Padrão */
--radius-lg: 18px;     /* Cards principais */
--radius-xl: 24px;     /* Cards grandes */
--radius-pill: 980px;  /* Botões pill */
--radius-full: 9999px; /* Círculos */
```

#### Usage Examples

```html
<!-- Card com sombra média -->
<div class="card" style="box-shadow: var(--shadow-md);">

<!-- Card com hover -->
<div class="card-hover">  <!-- Aplica shadow-lg no hover -->

<!-- Elemento com radius grande -->
<div style="border-radius: var(--radius-xl);">
```

#### Usage Guidelines

**✅ Do:**
- Use sombras sutis para profundidade
- Aplique radius consistente
- Varie elevação para hierarquia
- Use cores quentes nas sombras

**❌ Don't:**
- Não use sombras muito intensas
- Evite radius muito pequeno (< 8px)
- Não misture estilos de elevação
- Evite sombras pretas puras

---

## Components

### Buttons

Sistema de botões com estados visuais claros e feedback tátil.

#### Button Variants

**Primary Button**
```html
<button class="btn btn-primary">Ação Principal</button>
```
```css
.btn-primary {
  background: var(--color-accent);
  color: #FFFFFF;
  box-shadow: 0 1px 2px rgba(var(--color-accent-rgb), 0.1);
}

.btn-primary:hover {
  background: var(--color-accent-hover);
  transform: translateY(-1px) scale(1.02);
  box-shadow: 0 4px 12px rgba(var(--color-accent-rgb), 0.15);
}
```

**Secondary Button**
```html
<button class="btn btn-secondary">Ação Secundária</button>
```

**Outline Button**
```html
<button class="btn btn-outline">Outline</button>
```

**Ghost Button**
```html
<button class="btn btn-ghost">Ghost</button>
```

**Danger Button**
```html
<button class="btn btn-danger">Deletar</button>
```

#### Button Sizes

```html
<!-- Pequeno -->
<button class="btn btn-primary btn-sm">Small</button>

<!-- Padrão -->
<button class="btn btn-primary">Default</button>

<!-- Grande -->
<button class="btn btn-primary btn-lg">Large</button>

<!-- Extra Grande -->
<button class="btn btn-primary btn-xl">Extra Large</button>

<!-- Apenas Ícone -->
<button class="btn btn-primary btn-icon">
  <Icon name="plus" />
</button>
```

#### Button States

```html
<!-- Loading -->
<button class="btn btn-primary btn-loading" disabled>
  Carregando...
</button>

<!-- Disabled -->
<button class="btn btn-primary" disabled>
  Desabilitado
</button>

<!-- Com seta -->
<button class="btn btn-primary btn-arrow">
  Continuar
</button>
```

#### Usage Guidelines

**✅ Do:**
- Use btn-primary para ação principal da página
- Mantenha máximo 1 primary button por seção  
- Aplique estados de loading durante processamento
- Use btn-arrow para fluxos sequenciais

**❌ Don't:**
- Não use múltiplos botões primary juntos
- Evite textos muito longos em botões
- Não remova estados de hover/focus
- Evite botões menores que 40px de altura

---

### Forms & Inputs

Sistema de formulários com validação visual e acessibilidade.

#### Input Field

```html
<div class="input-group">
  <label class="input-label" for="email">Email</label>
  <input 
    type="email" 
    id="email"
    class="input-field" 
    placeholder="seu@email.com"
  />
</div>
```

```css
.input-field {
  width: 100%;
  padding: 14px 18px;
  font-size: var(--text-body);
  color: var(--color-text-primary);
  background: var(--color-bg-elevated);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition: all var(--duration-fast) ease;
}

.input-field:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 4px var(--color-accent-subtle);
  background: var(--color-bg-primary);
}
```

#### Input States

```html
<!-- Campo com erro -->
<div class="input-group">
  <label class="input-label" for="password">Senha</label>
  <input 
    type="password" 
    id="password"
    class="input-field error" 
    placeholder="Digite sua senha"
  />
  <span class="input-error">Senha deve ter ao menos 8 caracteres</span>
</div>

<!-- Campo de seleção -->
<div class="input-group">
  <label class="input-label" for="category">Categoria</label>
  <select id="category" class="input-field">
    <option>Selecione uma categoria</option>
    <option>Proteínas</option>
    <option>Vitaminas</option>
  </select>
</div>
```

#### Search Bar

```html
<div class="search-bar">
  <input 
    type="search" 
    class="input-field" 
    placeholder="Buscar produtos..."
  />
  <Icon name="search" class="search-icon" />
</div>
```

#### Form Layout

```html
<form class="space-y-6">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="input-group">
      <label class="input-label">Nome</label>
      <input type="text" class="input-field" />
    </div>
    <div class="input-group">
      <label class="input-label">Sobrenome</label>
      <input type="text" class="input-field" />
    </div>
  </div>
  
  <div class="input-group">
    <label class="input-label">Email</label>
    <input type="email" class="input-field" />
  </div>
  
  <button type="submit" class="btn btn-primary w-full">
    Cadastrar
  </button>
</form>
```

#### Usage Guidelines

**✅ Do:**
- Use labels claros e descritivos
- Aplique validação em tempo real
- Mantenha placeholders úteis
- Forneça feedback visual de estados

**❌ Don't:**
- Não remova labels dos inputs
- Evite validação excessivamente rigorosa
- Não use placeholder como label
- Evite inputs muito pequenos

---

### Cards

Componentes card para organizar conteúdo com hierarquia visual clara.

#### Basic Card

```html
<div class="card">
  <div class="card-body">
    <h3 class="text-title-sm">Título do Card</h3>
    <p class="text-body">Conteúdo do card...</p>
  </div>
</div>
```

#### Product Card

```html
<div class="product-card">
  <div class="product-card-image">
    <img src="produto.jpg" alt="Produto" />
  </div>
  <div class="product-card-body">
    <span class="product-card-brand">MARCA</span>
    <h4 class="product-card-title">Nome do Produto</h4>
    <div class="product-card-price">
      R$ 89,90
      <span class="product-card-price-old">R$ 120,00</span>
    </div>
  </div>
</div>
```

#### Category Card

```html
<a href="/categoria" class="category-card">
  <div class="category-card-icon">
    <Icon name="supplement" size={32} />
  </div>
  <h4 class="category-card-title">Proteínas</h4>
</a>
```

#### Stat Card

```html
<div class="stat-card">
  <div class="stat-card-icon">
    <Icon name="trending-up" />
  </div>
  <div class="stat-value">R$ 45.890</div>
  <div class="stat-card-label">
    Vendas do mês
    <span class="stat-card-change positive">+12%</span>
  </div>
</div>
```

#### Card Variants

```html
<!-- Card com hover -->
<div class="card card-hover">

<!-- Card com borda -->
<div class="card card-bordered">

<!-- Card elevado -->
<div class="card card-elevated">
```

#### Usage Guidelines

**✅ Do:**
- Use cards para agrupar informações relacionadas
- Mantenha padding consistente
- Aplique hover states sutis
- Organize cards em grids responsivos

**❌ Don't:**
- Não sobrecarregue cards com muita informação
- Evite cards muito pequenos
- Não misture estilos de card
- Evite muitas variações de card

---

### Navigation

Sistema de navegação com glassmorphism e acessibilidade.

#### Navbar

```html
<nav class="navbar">
  <div class="container">
    <a href="/" class="navbar-logo">AL-TACADÃO</a>
    
    <div class="navbar-nav md:flex hidden">
      <a href="/produtos" class="nav-link">Produtos</a>
      <a href="/categorias" class="nav-link">Categorias</a>
      <a href="/sobre" class="nav-link active">Sobre</a>
    </div>
    
    <button class="btn btn-primary">Entrar</button>
  </div>
</nav>
```

```css
.navbar {
  position: fixed;
  top: 0;
  height: var(--navbar-height);
  background: var(--navbar-bg);
  backdrop-filter: blur(24px) saturate(180%);
  border-bottom: 1px solid var(--navbar-border);
  z-index: 100;
}
```

#### Sidebar

```html
<aside class="sidebar">
  <div class="sidebar-header">
    <h2 class="text-title-sm">AL-TACADÃO</h2>
  </div>
  
  <nav class="sidebar-nav">
    <a href="/dashboard" class="sidebar-item active">
      <Icon name="dashboard" />
      Dashboard
    </a>
    <a href="/produtos" class="sidebar-item">
      <Icon name="box" />
      Produtos
    </a>
    <a href="/pedidos" class="sidebar-item">
      <Icon name="shopping-cart" />
      Pedidos
    </a>
  </nav>
</aside>
```

#### Bottom Navigation (Mobile)

```html
<nav class="bottom-nav md:hidden">
  <a href="/home" class="bottom-nav-item active">
    <Icon name="home" />
    <span>Home</span>
  </a>
  <a href="/produtos" class="bottom-nav-item">
    <Icon name="box" />
    <span>Produtos</span>
  </a>
  <a href="/carrinho" class="bottom-nav-item">
    <Icon name="shopping-cart" />
    <span>Carrinho</span>
    <span class="cart-badge">3</span>
  </a>
  <a href="/perfil" class="bottom-nav-item">
    <Icon name="user" />
    <span>Perfil</span>
  </a>
</nav>
```

#### Usage Guidelines

**✅ Do:**
- Use glassmorphism para navbar fixed
- Mantenha navegação consistente
- Aplique estados ativos claros
- Otimize para mobile com bottom nav

**❌ Don't:**
- Não sobrecarregue navegação com muitos itens
- Evite navbar muito alta
- Não remova backdrop-filter
- Evite muitos níveis de navegação

---

### Modals & Overlays

Sistema de modais com backdrop blur e animações suaves.

#### Modal Structure

```html
<div class="modal-overlay" onclick="closeModal()">
  <div class="modal-content" onclick="event.stopPropagation()">
    <header class="modal-header">
      <h3 class="modal-title">Título do Modal</h3>
      <button class="btn btn-ghost btn-icon" onclick="closeModal()">
        <Icon name="x" />
      </button>
    </header>
    
    <div class="modal-body">
      <p class="text-body">Conteúdo do modal...</p>
    </div>
    
    <footer class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">
        Cancelar
      </button>
      <button class="btn btn-primary">
        Confirmar
      </button>
    </footer>
  </div>
</div>
```

#### Confirm Dialog

```html
<div class="modal-overlay">
  <div class="modal-content">
    <div class="modal-body text-center">
      <div class="mb-4">
        <Icon name="alert-triangle" size={48} class="text-warning" />
      </div>
      <h3 class="text-title-sm mb-2">Confirmar exclusão</h3>
      <p class="text-body">Esta ação não pode ser desfeita.</p>
    </div>
    
    <div class="modal-footer">
      <button class="btn btn-ghost">Cancelar</button>
      <button class="btn btn-danger">Excluir</button>
    </div>
  </div>
</div>
```

#### Modal Animations

```css
.modal-overlay {
  animation: fadeIn var(--duration-fast) ease;
}

.modal-content {
  animation: scaleIn var(--duration-normal) var(--ease-default);
}

@media (max-width: 734px) {
  .modal-content {
    animation: slideUp var(--duration-normal) var(--ease-default);
  }
}
```

#### Usage Guidelines

**✅ Do:**
- Use modais para ações importantes
- Aplique backdrop-filter blur
- Mantenha conteúdo focado
- Implemente animações de entrada/saída

**❌ Don't:**
- Não use modais para conteúdo extenso
- Evite modais aninhados
- Não remova opção de fechar
- Evite modais muito pequenos

---

## Patterns

### Layout Patterns

Padrões de layout responsivos e flexíveis.

#### App Layout

```html
<div class="app-layout">
  <!-- Sidebar (desktop) -->
  <aside class="sidebar lg:flex hidden">
    <!-- Navegação -->
  </aside>
  
  <!-- Conteúdo principal -->
  <main class="main-content">
    <!-- Navbar -->
    <nav class="navbar">
      <!-- Navegação superior -->
    </nav>
    
    <!-- Container da página -->
    <div class="page-container">
      <!-- Cabeçalho da página -->
      <header class="page-header">
        <div>
          <h1 class="page-title">Dashboard</h1>
          <p class="page-subtitle">Visão geral das vendas</p>
        </div>
        <button class="btn btn-primary">Nova venda</button>
      </header>
      
      <!-- Conteúdo -->
      <div class="page-content">
        <!-- Conteúdo da página -->
      </div>
    </div>
  </main>
  
  <!-- Bottom nav (mobile) -->
  <nav class="bottom-nav lg:hidden">
    <!-- Navegação inferior -->
  </nav>
</div>
```

#### Hero Section

```html
<section class="hero">
  <div class="hero-content container">
    <span class="hero-eyebrow">Suplementos Premium</span>
    
    <h1 class="hero-title">
      Distribua produtos de 
      <span class="hero-title-accent">qualidade</span>
    </h1>
    
    <p class="hero-subtitle">
      Plataforma B2B completa para distribuidores de suplementos 
      com os melhores preços do mercado.
    </p>
    
    <div class="hero-actions">
      <button class="btn btn-primary btn-lg">Começar agora</button>
      <button class="btn btn-outline btn-lg">Ver catálogo</button>
    </div>
  </div>
  
  <div class="hero-scroll-indicator">
    <div class="scroll-indicator">
      <div class="scroll-indicator-dot"></div>
    </div>
  </div>
</section>
```

#### Feature Section

```html
<section class="feature-section">
  <div class="container">
    <div class="feature-grid">
      <div class="feature-content">
        <span class="feature-eyebrow">Gestão Completa</span>
        <h2 class="feature-title">
          Controle total do seu negócio
        </h2>
        <p class="feature-description">
          Dashboard intuitivo com métricas em tempo real, 
          controle de estoque e relatórios detalhados.
        </p>
        <button class="btn btn-primary btn-arrow">
          Saber mais
        </button>
      </div>
      <div class="feature-image">
        <img src="dashboard.png" alt="Dashboard" />
      </div>
    </div>
  </div>
</section>
```

#### Product Grid

```html
<section class="container">
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    <!-- Product cards -->
    <div class="product-card">
      <!-- Produto -->
    </div>
  </div>
</section>
```

---

### Responsive Behavior

Comportamento responsivo para diferentes tamanhos de tela.

#### Breakpoints

```css
/* Mobile First Approach */

/* Small devices (landscape phones, 734px and up) */
@media (min-width: 734px) {
  .md\:flex { display: flex; }
  .md\:grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
}

/* Medium devices (tablets, 1068px and up) */
@media (min-width: 1068px) {
  .lg\:flex { display: flex; }
  .lg\:grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
}
```

#### Responsive Containers

```css
@media (max-width: 734px) {
  :root {
    --container-padding: 18px;
    --section-padding-y: 70px;
    --navbar-height: 52px;
  }
}

@media (min-width: 735px) and (max-width: 1068px) {
  :root {
    --container-padding: 20px;
    --section-padding-y: 80px;
  }
}
```

#### Mobile Adaptations

```html
<!-- Navegação -->
<nav class="navbar lg:h-14 h-12">
  <div class="navbar-nav lg:flex hidden">
    <!-- Desktop nav -->
  </div>
  
  <button class="lg:hidden btn btn-ghost btn-icon">
    <Icon name="menu" />
  </button>
</nav>

<!-- Bottom nav para mobile -->
<nav class="bottom-nav lg:hidden">
  <!-- Mobile navigation -->
</nav>

<!-- Layout responsivo -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <!-- Cards -->
</div>
```

#### Touch Targets

```css
/* Mínimo 44px para elementos tocáveis */
.btn {
  min-height: 44px;
  min-width: 44px;
}

.bottom-nav-item {
  min-height: 64px;
  padding-bottom: env(safe-area-inset-bottom);
}
```

---

### Interaction States

Estados de interação consistentes para todos os componentes.

#### Hover States

```css
/* Elevação sutil */
.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

/* Escala micro */
.btn-primary:hover {
  transform: translateY(-1px) scale(1.02);
}

/* Mudança de cor */
.nav-link:hover {
  color: var(--color-text-primary);
  background: var(--color-accent-subtle);
}
```

#### Focus States

```css
.btn:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.input-field:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 4px var(--color-accent-subtle);
}
```

#### Active States

```css
.btn-primary:active {
  transform: translateY(0) scale(0.98);
}

.nav-link.active {
  color: var(--color-accent);
  background: var(--color-accent-subtle);
}
```

#### Loading States

```css
.btn-loading {
  opacity: 0.75;
  cursor: not-allowed;
  pointer-events: none;
}

.skeleton {
  animation: shimmer 1.5s infinite;
  background: linear-gradient(
    90deg,
    var(--color-bg-secondary) 25%,
    var(--color-bg-tertiary) 50%,
    var(--color-bg-secondary) 75%
  );
  background-size: 200% 100%;
}
```

#### Disabled States

```css
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  pointer-events: none;
}
```

---

### Animation Guidelines

Princípios de animação baseados no design Apple.

#### Duration & Easing

```css
:root {
  /* Durações */
  --duration-fast: 200ms;     /* Micro-interações */
  --duration-normal: 300ms;   /* Estados hover */
  --duration-slow: 400ms;     /* Transições de entrada */
  
  /* Curvas de animação */
  --ease-default: cubic-bezier(0.25, 0.1, 0.25, 1); /* Natural */
  --ease-out: cubic-bezier(0, 0, 0.2, 1);           /* Saídas */
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);     /* Suave */
}
```

#### Animation Types

**Fade In**
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fade-in {
  animation: fadeIn var(--duration-normal) var(--ease-default);
}
```

**Fade Up**
```css
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Scale In**
```css
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

#### Stagger Animations

```css
.stagger > * {
  opacity: 0;
  animation: fadeUp var(--duration-slow) var(--ease-default) forwards;
}

.stagger > *:nth-child(1) { animation-delay: 0ms; }
.stagger > *:nth-child(2) { animation-delay: 80ms; }
.stagger > *:nth-child(3) { animation-delay: 160ms; }
/* ... */
```

```html
<div class="stagger">
  <div class="card">Card 1</div>
  <div class="card">Card 2</div>
  <div class="card">Card 3</div>
</div>
```

#### Performance Guidelines

**✅ Do:**
- Use `transform` e `opacity` para animações
- Aplique `will-change` em elementos animados
- Mantenha durações entre 200ms-400ms
- Use GPU acceleration (`translateZ(0)`)

**❌ Don't:**
- Não anime propriedades de layout (`width`, `height`)
- Evite animações muito longas (> 600ms)
- Não abuse de efeitos parallax
- Respeite `prefers-reduced-motion`

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

### Accessibility Standards

Padrões de acessibilidade implementados no design system.

#### Contraste de Cores

**Requisitos WCAG AA:**
- Texto normal: 4.5:1
- Texto grande (18px+): 3:1
- Elementos UI: 3:1

```css
/* Cores verificadas para contraste */
--color-text-primary: #1A1715;    /* 16.8:1 com bg branco */
--color-text-secondary: #5C554D;  /* 8.2:1 com bg branco */
--color-accent: #10b981;          /* 3.4:1 com bg branco */
```

#### Focus Management

```css
/* Foco visível para navegação por teclado */
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

/* Focus trap em modais */
.modal-content {
  /* Implementar com JavaScript */
}
```

#### Semantic HTML

```html
<!-- Estrutura semântica -->
<header role="banner">
  <nav role="navigation" aria-label="Menu principal">
    <ul role="menubar">
      <li role="none">
        <a role="menuitem" href="/produtos">Produtos</a>
      </li>
    </ul>
  </nav>
</header>

<main role="main">
  <h1>Título da página</h1>
  <!-- Conteúdo principal -->
</main>

<aside role="complementary" aria-label="Filtros">
  <!-- Conteúdo complementar -->
</aside>
```

#### ARIA Labels

```html
<!-- Botões com ícones -->
<button class="btn btn-icon" aria-label="Adicionar ao carrinho">
  <Icon name="plus" aria-hidden="true" />
</button>

<!-- Estados dinâmicos -->
<button 
  class="btn btn-primary" 
  aria-expanded="false"
  aria-controls="dropdown-menu"
>
  Menu
</button>

<!-- Loading states -->
<button class="btn btn-loading" aria-busy="true">
  Salvando...
</button>
```

#### Screen Reader Support

```html
<!-- Skip links -->
<a class="skip-link" href="#main-content">
  Pular para conteúdo principal
</a>

<!-- Conteúdo apenas para screen readers -->
<span class="sr-only">
  (abre em nova janela)
</span>

<!-- Landmarks -->
<nav aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li aria-current="page">Produtos</li>
  </ol>
</nav>
```

#### Keyboard Navigation

```css
/* Ordem de foco lógica */
.modal-content {
  /* Tab order: header → body → footer */
}

/* Navegação por setas em menus */
.dropdown-menu[role="menu"] {
  /* Implementar com JavaScript */
}
```

#### Guidelines

**✅ Do:**
- Use HTML semântico sempre
- Implemente foco visível
- Teste com screen readers
- Forneça alternativas textuais
- Mantenha ordem de foco lógica

**❌ Don't:**
- Não remova outlines de foco
- Evite confiar apenas em cor para informação
- Não use `tabindex` positivo
- Não implemente controles customizados desnecessários

---

## Quick Reference

### Design Tokens Resumo

```css
/* Cores principais */
--color-accent: #10b981;
--color-bg-primary: #FDFCFA;
--color-text-primary: #1A1715;

/* Espaçamento */
--space-4: 16px;  /* Padrão */
--space-8: 32px;  /* Seções */

/* Tipografia */
--text-body: 17px;
--text-title: clamp(24px, 3vw, 40px);

/* Layout */
--container-max: 980px;
--radius-lg: 18px;
--shadow-md: 0 4px 16px rgba(26, 23, 21, 0.08);
```

### Component Classes

```css
/* Botões */
.btn-primary     /* Ação principal */
.btn-secondary   /* Ação secundária */
.btn-outline     /* Contorno */
.btn-ghost       /* Transparente */

/* Cards */
.card           /* Card básico */
.product-card   /* Card de produto */
.stat-card      /* Card de estatística */

/* Layout */
.container      /* Container responsivo */
.navbar         /* Navegação superior */
.sidebar        /* Navegação lateral */
```

### Utility Classes

```css
/* Tipografia */
.text-display, .text-headline, .text-title
.text-body, .text-body-sm, .text-caption

/* Cores */
.text-primary, .text-secondary, .text-accent
.bg-primary, .bg-secondary, .bg-elevated

/* Layout */
.flex, .grid, .container
.gap-4, .p-6, .m-0
```

---

## Implementação

### Instalação

```bash
# Dependências principais
npm install tailwindcss inter-ui

# Importar CSS principal
import './src/index.css'
```

### Estrutura de Arquivos

```
src/
├── styles/
│   ├── index.css              # Design tokens principais
│   ├── apple-design-system.css # Extensões Apple-style
│   ├── forms-enhanced.css     # Melhorias de formulário
│   └── input-focus-fix.css    # Correções de foco
├── components/
│   ├── ui/                    # Componentes base
│   └── layout/                # Componentes de layout
```

### Customização

Para customizar o design system, edite as CSS custom properties em `src/index.css`:

```css
:root {
  /* Personalizar cores */
  --color-accent: #your-brand-color;
  
  /* Personalizar espaçamento */
  --container-max: 1200px;
  
  /* Personalizar tipografia */
  --font-sans: "Your Font", Inter, sans-serif;
}
```

---

**Documentação criada para AL-TACADÃO Design System v1.0**  
*Última atualização: 2026*
