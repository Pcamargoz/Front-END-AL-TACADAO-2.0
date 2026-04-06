import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "xl" | "icon";
  loading?: boolean;
  children: ReactNode;
}

/**
 * Button component following Apple-style design system with emerald green theming
 * - Primary: Emerald background with white text
 * - Secondary: Slate background with light text
 * - Outline: Transparent with emerald border
 * - Ghost: Transparent with subtle hover
 * - Danger: Red background for destructive actions
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    // Base classes for all buttons
    const baseClasses = cn(
      // Layout & positioning
      "inline-flex items-center justify-center gap-2",
      // Typography
      "font-medium text-sm leading-none",
      "whitespace-nowrap",
      // Interaction
      "cursor-pointer select-none",
      "outline-none focus-visible:outline-none",
      // Transitions
      "transition-all duration-150 ease-out",
      // Disabled state
      "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
      // Remove default button styles
      "border-0 bg-transparent"
    );
    
    // Variant-specific classes
    const variantClasses = {
      primary: cn(
        "bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700",
        "text-white font-medium",
        "shadow-sm hover:shadow-md",
        "hover:scale-[1.02] active:scale-95",
        "focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
      ),
      secondary: cn(
        "bg-slate-700 hover:bg-slate-600 active:bg-slate-500",
        "text-slate-100 font-medium",
        "border border-slate-600 hover:border-slate-500",
        "shadow-sm hover:shadow-md",
        "hover:scale-[1.02] active:scale-95",
        "focus-visible:ring-2 focus-visible:ring-slate-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
      ),
      outline: cn(
        "bg-transparent hover:bg-emerald-500/10 active:bg-emerald-500/20",
        "text-emerald-400 hover:text-emerald-300 font-medium",
        "border border-emerald-500/50 hover:border-emerald-400",
        "hover:scale-[1.02] active:scale-95",
        "focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
      ),
      ghost: cn(
        "bg-transparent hover:bg-slate-800/50 active:bg-slate-700/50",
        "text-slate-300 hover:text-slate-100 font-medium",
        "hover:scale-[1.02] active:scale-95",
        "focus-visible:ring-2 focus-visible:ring-slate-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
      ),
      danger: cn(
        "bg-red-500 hover:bg-red-600 active:bg-red-700",
        "text-white font-medium",
        "shadow-sm hover:shadow-md",
        "hover:scale-[1.02] active:scale-95",
        "focus-visible:ring-2 focus-visible:ring-red-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
      ),
    };

    // Size-specific classes
    const sizeClasses = {
      sm: "px-3 py-1.5 text-sm rounded-lg min-h-[32px]",
      md: "px-4 py-2 text-sm rounded-lg min-h-[40px]",
      lg: "px-6 py-3 text-base rounded-lg min-h-[48px]", 
      xl: "px-8 py-4 text-lg rounded-lg min-h-[56px]",
      icon: "p-2 rounded-lg min-h-[40px] min-w-[40px]",
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses, 
          variantClasses[variant], 
          sizeClasses[size], 
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
                variant === "primary" || variant === "danger"
                  ? "border-white/30 border-t-white" 
                  : variant === "secondary"
                  ? "border-slate-100/30 border-t-slate-100"
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
