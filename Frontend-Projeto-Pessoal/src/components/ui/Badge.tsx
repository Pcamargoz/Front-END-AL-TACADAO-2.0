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
      background: "var(--color-bg-tertiary)",
      color: "var(--color-text-secondary)",
      border: "1px solid var(--color-border)",
    },
    neon: {
      background: "var(--color-accent-subtle)",
      color: "var(--color-accent)",
      border: "1px solid var(--color-accent)",
    },
    cyan: {
      background: "var(--color-accent-blue-subtle)",
      color: "var(--color-accent-blue)",
      border: "1px solid var(--color-accent-blue)",
    },
    danger: {
      background: "var(--color-error-bg)",
      color: "var(--color-error)",
      border: "1px solid var(--color-error)",
    },
    success: {
      background: "var(--color-success-bg)",
      color: "var(--color-success)",
      border: "1px solid var(--color-success)",
    },
    warning: {
      background: "var(--color-warning-bg)",
      color: "var(--color-warning)",
      border: "1px solid var(--color-warning)",
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
