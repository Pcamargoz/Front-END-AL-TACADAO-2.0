import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function formatCNPJ(cnpj: string) {
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}

export const BRAND_META: Record<string, { label: string; color: string; bg: string }> = {
  GROWTH_SUPPLEMENTS:  { label: "Growth",           color: "#00f0ff", bg: "rgba(0,240,255,0.12)"   },
  MAX_TITANIUM:        { label: "Max Titanium",      color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
  INTEGRAL_MEDICA:     { label: "Integral Médica",   color: "#10b981", bg: "rgba(16,185,129,0.12)"  },
  PROBIOTICA:          { label: "Probiótica",        color: "#f59e0b", bg: "rgba(245,158,11,0.12)"  },
  DUX_NUTRITION:       { label: "Dux Nutrition",     color: "#ef4444", bg: "rgba(239,68,68,0.12)"   },
  ATLHETICA_NUTRITION: { label: "Atlhetica",         color: "#3b82f6", bg: "rgba(59,130,246,0.12)"  },
  BLACK_SKULL:         { label: "Black Skull",       color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
  VITAFOR:             { label: "Vitafor",           color: "#ec4899", bg: "rgba(236,72,153,0.12)"  },
  OPTIMUM_NUTRITION:   { label: "Optimum",           color: "#f97316", bg: "rgba(249,115,22,0.12)"  },
  MYPROTEIN:           { label: "Myprotein",         color: "#84cc16", bg: "rgba(132,204,22,0.12)"  },
  UNIVERSAL_NUTRITION: { label: "Universal",         color: "#06b6d4", bg: "rgba(6,182,212,0.12)"   },
  BSN:                 { label: "BSN",               color: "#8b5cf6", bg: "rgba(139,92,246,0.12)"  },
};

export const ALL_BRANDS = Object.keys(BRAND_META);
