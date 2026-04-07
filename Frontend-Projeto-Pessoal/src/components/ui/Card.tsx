import { cn } from "../../lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export function Card({ children, className, hover, style, onClick }: CardProps) {
  return (
    <div
      className={cn("card", hover && "card-hover", className)}
      style={{ padding: "var(--space-6)", ...style }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}
