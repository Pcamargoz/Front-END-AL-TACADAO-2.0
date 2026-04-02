import { type ReactNode } from "react";
import { cn } from "../../lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

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

export function ProductCard({ children, className, onClick }: ProductCardProps) {
  return (
    <div className={cn("product-card", className)} onClick={onClick}>
      {children}
    </div>
  );
}

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  description?: string;
  tint?: string;
  color?: string;
}

export function StatCard({ icon, label, value, description, tint, color }: StatCardProps) {
  return (
    <div
      className="stat-card card"
      style={{ "--card-tint": tint || "rgba(0,255,135,0.04)" } as React.CSSProperties}
    >
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div
          className="w-10 h-10 rounded-sm flex items-center justify-center"
          style={{ 
            background: tint || "rgba(0,255,135,0.10)", 
            border: `1px solid ${color || "#00FF87"}25` 
          }}
        >
          <span style={{ color: color || "#00FF87" }}>{icon}</span>
        </div>
        <span
          className="badge"
          style={{ 
            background: `${color || "#00FF87"}12`, 
            color: color || "#00FF87",
            border: `1px solid ${color || "#00FF87"}25`
          }}
        >
          live
        </span>
      </div>
      <p className="stat-value mb-1 relative z-10">{value}</p>
      <p className="text-sm text-[#9CA3AF] relative z-10">
        {label} <span style={{ color: color || "#00FF87" }}>{description}</span>
      </p>
    </div>
  );
}
