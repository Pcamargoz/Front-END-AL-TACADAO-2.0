import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  loading,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const variantClass = `btn-${variant}`;
  const sizeClass = size !== "md" ? `btn-${size}` : "";

  return (
    <button
      className={cn("btn", variantClass, sizeClass, className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span
          className="spinner"
          style={{ width: "16px", height: "16px", borderWidth: "2px" }}
        />
      )}
      {children}
    </button>
  );
}
