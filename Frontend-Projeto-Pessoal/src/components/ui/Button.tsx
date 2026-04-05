import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
  children: ReactNode;
}

/**
 * Button component following Apple-style design system
 * - Primary: Accent color with white text
 * - Secondary: Border only with transparent background
 * - Ghost: No border, subtle hover
 * - Danger: Red accent for destructive actions
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    const baseClasses = "btn";
    
    const variantClasses = {
      primary: "btn-primary",
      secondary: "btn-secondary",
      ghost: "btn-ghost",
      danger: "btn-danger",
    };

    const sizeClasses = {
      sm: "btn-sm",
      md: "",
      lg: "btn-lg",
      icon: "btn-icon",
    };

    return (
      <button
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span 
              className={cn(
                "w-4 h-4 border-2 rounded-full animate-spin",
                variant === "primary" 
                  ? "border-white/30 border-t-white" 
                  : "border-current/30 border-t-current"
              )}
            />
            {typeof children === "string" ? children : "Carregando..."}
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
