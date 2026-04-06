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
 * - Apple-style dark theme with bg-white/5 or bg-slate-800/50 with backdrop-blur
 * - Subtle borders with border-slate-700/50 and rounded-xl corners
 * - Soft shadows with shadow-lg shadow-black/10
 * - Smooth hover states with subtle elevation and scale-[1.02]
 * - Duration-200 ease-out transitions for all animations
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
        // Apple-style base card styling
        "bg-white/5 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-lg shadow-black/10",
        "transition-all duration-200 ease-out",
        // Hover effects for Apple-style elevation
        hover && "hover:shadow-xl hover:scale-[1.02] hover:border-slate-600/60 cursor-pointer",
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
 * Product card with Apple-style hover effects
 * Used for displaying products in grid with elevated hover states
 */
export function ProductCard({ children, className, onClick }: ProductCardProps) {
  return (
    <div 
      className={cn(
        // Apple-style product card with enhanced interactions
        "bg-white/5 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-lg shadow-black/10",
        "transition-all duration-200 ease-out cursor-pointer group",
        // Premium hover effects with scale and elevation
        "hover:shadow-xl hover:scale-[1.02] hover:border-emerald-500/40",
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
 * Stat card for displaying metrics with Apple-style design
 * Features clear hierarchy, subtle accents, and emerald color scheme
 */
export function StatCard({ icon, label, value, description, trend = "neutral" }: StatCardProps) {
  const trendColors = {
    up: "text-emerald-400",
    down: "text-red-400", 
    neutral: "text-slate-400",
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-lg shadow-black/10 p-6 transition-all duration-200 ease-out hover:shadow-xl hover:border-slate-600/60">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-slate-800/50 flex items-center justify-center border border-slate-700/30">
          <span className="text-emerald-400">{icon}</span>
        </div>
        {description && (
          <span className={cn("text-xs font-medium", trendColors[trend])}>
            {description}
          </span>
        )}
      </div>

      {/* Value */}
      <p className="text-2xl font-semibold text-slate-100 mb-1">{value}</p>
      
      {/* Label */}
      <p className="text-sm text-slate-300">{label}</p>
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
 * Feature card for highlighting features/benefits with Apple-style dark theme
 * Centered layout with icon, title, and description
 */
export function FeatureCard({ icon, title, description, className }: FeatureCardProps) {
  return (
    <div className={cn(
      "bg-white/5 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-lg shadow-black/10 p-8 text-center",
      "transition-all duration-200 ease-out hover:shadow-xl hover:scale-[1.02] hover:border-slate-600/60",
      className
    )}>
      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
        <span className="text-emerald-400">{icon}</span>
      </div>
      <h3 className="text-lg font-semibold text-slate-100 mb-2">{title}</h3>
      <p className="text-sm text-slate-300">{description}</p>
    </div>
  );
}
