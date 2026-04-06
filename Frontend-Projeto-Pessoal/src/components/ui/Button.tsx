import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "warm";
  size?: "sm" | "md" | "lg" | "xl" | "icon";
  loading?: boolean;
  children: ReactNode;
}

/**
 * Button Component - Apple-Style Design System
 * 
 * Uses CSS variables for theming (see index.css):
 * - --color-accent: Primary emerald green (#10b981)
 * - --color-accent-hover: Hover state
 * - --color-accent-subtle: Subtle backgrounds
 * 
 * Variants:
 * - primary: Filled accent background
 * - secondary: Surface with accent border
 * - outline: Transparent with accent border
 * - ghost: Transparent with subtle hover
 * - danger: Red for destructive actions
 * - warm: Gold accent for special CTAs
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base - using CSS class from index.css
          "btn",
          // Variant classes from design system
          variant === "primary" && "btn-primary",
          variant === "secondary" && "btn-secondary",
          variant === "outline" && "btn-outline",
          variant === "ghost" && "btn-ghost",
          variant === "danger" && "btn-danger",
          variant === "warm" && "btn-warm",
          // Size classes
          size === "sm" && "btn-sm",
          size === "lg" && "btn-lg",
          size === "xl" && "btn-xl",
          size === "icon" && "btn-icon",
          // Loading state
          loading && "btn-loading",
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span 
              className={cn(
                "w-4 h-4 border-2 rounded-full animate-spin",
                variant === "primary" || variant === "danger" || variant === "warm"
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
