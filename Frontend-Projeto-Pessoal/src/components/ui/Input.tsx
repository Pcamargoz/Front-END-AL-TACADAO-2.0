import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  rightIcon?: ReactNode;
}

/**
 * Input component following Apple-style design system
 * - Clean borders with subtle radius
 * - Smooth focus transitions
 * - Optional icon support
 * - Error state styling
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, icon, rightIcon, type = "text", ...props }, ref) => {
    return (
      <div className="input-group">
        {label && <label className="input-label">{label}</label>}
        <div className="relative">
          {icon && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-tertiary">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            type={type}
            className={cn(
              "input-field",
              icon && "pl-11",
              rightIcon && "pr-11",
              error && "error",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-tertiary">
              {rightIcon}
            </span>
          )}
        </div>
        {error && <span className="input-error">{error}</span>}
        {hint && !error && <span className="input-hint">{hint}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

/**
 * Textarea component with same styling as Input
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, ...props }, ref) => {
    return (
      <div className="input-group">
        {label && <label className="input-label">{label}</label>}
        <textarea
          ref={ref}
          className={cn(
            "input-field min-h-[120px] resize-y py-3",
            error && "error",
            className
          )}
          {...props}
        />
        {error && <span className="input-error">{error}</span>}
        {hint && !error && <span className="input-hint">{hint}</span>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

/**
 * Select component with same styling as Input
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, options, placeholder, ...props }, ref) => {
    return (
      <div className="input-group">
        {label && <label className="input-label">{label}</label>}
        <select
          ref={ref}
          className={cn(
            "input-field appearance-none cursor-pointer",
            "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20fill%3D%22%236e6e73%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20d%3D%22M8%2011L3%206h10l-5%205z%22%2F%3E%3C%2Fsvg%3E')]",
            "bg-no-repeat bg-[right_1rem_center]",
            "pr-10",
            error && "error",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="input-error">{error}</span>}
        {hint && !error && <span className="input-hint">{hint}</span>}
      </div>
    );
  }
);

Select.displayName = "Select";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
}

/**
 * Checkbox component with custom styling
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex items-start gap-3">
        <input
          ref={ref}
          type="checkbox"
          className={cn(
            "w-5 h-5 rounded-md border-2 border-border",
            "checked:bg-accent checked:border-accent",
            "focus:ring-2 focus:ring-accent/20 focus:ring-offset-0",
            "transition-all duration-200",
            "cursor-pointer",
            className
          )}
          {...props}
        />
        <div className="flex-1">
          <label className="text-body-sm text-primary cursor-pointer">
            {label}
          </label>
          {error && <span className="input-error block mt-1">{error}</span>}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
