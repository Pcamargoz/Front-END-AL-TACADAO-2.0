import { type ReactNode } from "react";
import { cn } from "../../lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

/**
 * Card component following Apple-style design system
 * - Clean white/dark background
 * - Subtle border
 * - 18px border-radius
 * - Optional hover effect
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
        "card",
        hover && "card-hover cursor-pointer",
        paddingClasses[padding],
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
 * Product card with hover effects
 * Used for displaying products in grid
 */
export function ProductCard({ children, className, onClick }: ProductCardProps) {
  return (
    <div 
      className={cn(
        "card card-hover cursor-pointer group",
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
 * Stat card for displaying metrics
 * Apple-style with clean typography and subtle accents
 */
export function StatCard({ icon, label, value, description, trend = "neutral" }: StatCardProps) {
  const trendColors = {
    up: "text-green-600 dark:text-green-400",
    down: "text-red-600 dark:text-red-400",
    neutral: "text-tertiary",
  };

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-surface-secondary flex items-center justify-center">
          <span className="text-accent">{icon}</span>
        </div>
        {description && (
          <span className={cn("text-caption font-medium", trendColors[trend])}>
            {description}
          </span>
        )}
      </div>

      {/* Value */}
      <p className="text-display-xs text-primary mb-1">{value}</p>
      
      {/* Label */}
      <p className="text-body-sm text-secondary">{label}</p>
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
 * Feature card for highlighting features/benefits
 * Centered layout with icon, title, and description
 */
export function FeatureCard({ icon, title, description, className }: FeatureCardProps) {
  return (
    <div className={cn("card p-8 text-center", className)}>
      <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
        <span className="text-accent">{icon}</span>
      </div>
      <h3 className="text-title-sm text-primary mb-2">{title}</h3>
      <p className="text-body-sm text-secondary">{description}</p>
    </div>
  );
}
