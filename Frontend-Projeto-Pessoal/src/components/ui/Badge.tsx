import { type ReactNode } from "react";
import { cn } from "../../lib/utils";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "neon" | "cyan" | "danger" | "success" | "warning";
  className?: string;
  dot?: boolean;
}

export function Badge({ children, variant = "default", className, dot }: BadgeProps) {
  const variantStyles = {
    default: {
      background: "rgba(255,255,255,0.08)",
      color: "#9CA3AF",
      border: "1px solid rgba(255,255,255,0.1)",
    },
    neon: {
      background: "rgba(0,255,135,0.12)",
      color: "#00FF87",
      border: "1px solid rgba(0,255,135,0.25)",
    },
    cyan: {
      background: "rgba(0,229,255,0.12)",
      color: "#00E5FF",
      border: "1px solid rgba(0,229,255,0.25)",
    },
    danger: {
      background: "rgba(239,68,68,0.12)",
      color: "#EF4444",
      border: "1px solid rgba(239,68,68,0.25)",
    },
    success: {
      background: "rgba(16,185,129,0.12)",
      color: "#10B981",
      border: "1px solid rgba(16,185,129,0.25)",
    },
    warning: {
      background: "rgba(245,158,11,0.12)",
      color: "#F59E0B",
      border: "1px solid rgba(245,158,11,0.25)",
    },
  };

  const styles = variantStyles[variant];

  return (
    <span className={cn("badge", className)} style={styles}>
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: styles.color }}
        />
      )}
      {children}
    </span>
  );
}

interface RoleBadgeProps {
  role: string;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const config: Record<string, { variant: BadgeProps["variant"]; label: string }> = {
    GERENTE: { variant: "neon", label: "Gerente" },
    FUNCIONARIO: { variant: "cyan", label: "Funcionário" },
    ESTAGIARIO: { variant: "default", label: "Estagiário" },
  };

  const { variant, label } = config[role] || { variant: "default", label: role };

  return <Badge variant={variant}>{label}</Badge>;
}
