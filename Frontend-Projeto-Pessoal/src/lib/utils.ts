/** Simple class name joiner (no Tailwind merging needed) */
export function cn(...args: (string | boolean | undefined | null)[]): string {
  return args.filter(Boolean).join(" ");
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatCNPJ(cnpj: string) {
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}

export function formatPhone(phone: string) {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
}

// Categorias de suplementos (usadas como filtros)
export const CATEGORIES = [
  { id: "proteinas", label: "Proteínas", icon: "💪" },
  { id: "pre-treino", label: "Pré-Treino", icon: "⚡" },
  { id: "creatina", label: "Creatina", icon: "🔥" },
  { id: "vitaminas", label: "Vitaminas", icon: "💊" },
  { id: "aminoacidos", label: "Aminoácidos", icon: "🧬" },
  { id: "emagrecedores", label: "Emagrecedores", icon: "🏃" },
  { id: "hipercaloricos", label: "Hipercalóricos", icon: "📈" },
  { id: "barras", label: "Barras e Snacks", icon: "🍫" },
] as const;

// Paleta de cores para as marcas (tema neon)
export const BRAND_META: Record<string, { label: string; color: string; bg: string }> = {
  GROWTH_SUPPLEMENTS:  { label: "Growth",           color: "#00FF87", bg: "rgba(0,255,135,0.12)"   },
  MAX_TITANIUM:        { label: "Max Titanium",      color: "#00E5FF", bg: "rgba(0,229,255,0.12)" },
  INTEGRAL_MEDICA:     { label: "Integral Médica",   color: "#10B981", bg: "rgba(16,185,129,0.12)"  },
  PROBIOTICA:          { label: "Probiótica",        color: "#F59E0B", bg: "rgba(245,158,11,0.12)"  },
  DUX_NUTRITION:       { label: "Dux Nutrition",     color: "#EF4444", bg: "rgba(239,68,68,0.12)"   },
  ATLHETICA_NUTRITION: { label: "Atlhetica",         color: "#3B82F6", bg: "rgba(59,130,246,0.12)"  },
  BLACK_SKULL:         { label: "Black Skull",       color: "#9CA3AF", bg: "rgba(156,163,175,0.12)" },
  VITAFOR:             { label: "Vitafor",           color: "#EC4899", bg: "rgba(236,72,153,0.12)"  },
  OPTIMUM_NUTRITION:   { label: "Optimum",           color: "#F97316", bg: "rgba(249,115,22,0.12)"  },
  MYPROTEIN:           { label: "Myprotein",         color: "#84CC16", bg: "rgba(132,204,22,0.12)"  },
  UNIVERSAL_NUTRITION: { label: "Universal",         color: "#06B6D4", bg: "rgba(6,182,212,0.12)"   },
  BSN:                 { label: "BSN",               color: "#8B5CF6", bg: "rgba(139,92,246,0.12)"  },
  DARKNESS:            { label: "Darkness",          color: "#6366F1", bg: "rgba(99,102,241,0.12)"  },
  ESSENTIAL_NUTRITION: { label: "Essential",         color: "#14B8A6", bg: "rgba(20,184,166,0.12)"  },
};

export const ALL_BRANDS = Object.keys(BRAND_META);

// Gera um preço mockado baseado no ID do produto (para consistência)
export function getMockPrice(productId: string): number {
  // Hash simples do ID para gerar preço consistente
  let hash = 0;
  for (let i = 0; i < productId.length; i++) {
    hash = ((hash << 5) - hash) + productId.charCodeAt(i);
    hash = hash & hash;
  }
  // Preço entre 49.90 e 299.90
  return Math.abs(hash % 250) + 49.90;
}

// Trunca texto com ellipsis
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}
