import { type ReactNode } from "react";
import { cn } from "../../lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

/**
 * Card Component - Apple-Style Design System
 * 
 * Uses CSS variables for theming:
 * - --color-bg-elevated: Card background
 * - --color-border: Subtle border
 * - --color-accent: Accent color on hover
 * - --shadow-md/lg: Elevation shadows
 * 
 * Props:
 * - hover: Enable hover animation (translateY + shadow)
 * - padding: none | sm (16px) | md (24px) | lg (32px)
 */
export function Card({ children, className, hover = false, padding = "md" }: CardProps) {
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={cn(
        // Base card using CSS variables
        "card",
        paddingClasses[padding],
        // Hover effects using CSS class
        hover && "card-hover cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

interface ProductCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * Product Card - Premium hover effects with accent border
 */
export function ProductCard({ children, className, onClick }: ProductCardProps) {
  return (
    <div 
      className={cn(
        "product-card group",
        className
      )} 
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  description?: string;
  trend?: "up" | "down" | "neutral";
}

/**
 * Stat Card - Dashboard metrics with trend indicator
 */
export function StatCard({ icon, label, value, description, trend = "neutral" }: StatCardProps) {
  const trendClasses = {
    up: "text-[var(--color-success)]",
    down: "text-[var(--color-error)]", 
    neutral: "text-[var(--color-text-tertiary)]",
  };

  return (
    <div className="stat-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-subtle)] flex items-center justify-center">
          <span className="text-[var(--color-accent)]">{icon}</span>
        </div>
        {description && (
          <span className={cn("text-xs font-medium", trendClasses[trend])}>
            {description}
          </span>
        )}
      </div>

      {/* Value */}
      <p className="stat-value mb-1">{value}</p>
      
      {/* Label */}
      <p className="text-sm text-[var(--color-text-secondary)]">{label}</p>
    </div>
  );
}

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
}

/**
 * Feature Card - Centered layout for benefits/features
 */
export function FeatureCard({ icon, title, description, className }: FeatureCardProps) {
  return (
    <div className={cn(
      "category-card",
      className
    )}>
      <div className="w-12 h-12 rounded-2xl bg-[var(--color-accent-subtle)] border border-[var(--color-accent)]/20 flex items-center justify-center mx-auto mb-4">
        <span className="text-[var(--color-accent)]">{icon}</span>
      </div>
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">{title}</h3>
      <p className="text-sm text-[var(--color-text-secondary)]">{description}</p>
    </div>
  );
}
