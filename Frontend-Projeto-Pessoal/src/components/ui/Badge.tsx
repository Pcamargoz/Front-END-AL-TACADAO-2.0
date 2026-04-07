import { cn } from "../../lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "accent" | "success" | "warning" | "error" | "neutral";
  className?: string;
  style?: React.CSSProperties;
}

export function Badge({ children, variant = "accent", className, style }: BadgeProps) {
  return (
    <span className={cn("badge", `badge-${variant}`, className)} style={style}>
      {children}
    </span>
  );
}
