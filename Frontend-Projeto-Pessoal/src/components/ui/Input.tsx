import { forwardRef } from "react";
import { cn } from "../../lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, style, ...props }, ref) => {
    return (
      <div className="input-group">
        {label && <label className="input-label">{label}</label>}
        <div style={{ position: "relative" }}>
          {icon && (
            <span
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--color-text-quaternary)",
                display: "flex",
              }}
            >
              {icon}
            </span>
          )}
          <input
            ref={ref}
            className={cn("input-field", error && "border-error", className)}
            style={{ paddingLeft: icon ? "42px" : undefined, ...style }}
            {...props}
          />
        </div>
        {error && (
          <span style={{ fontSize: "12px", color: "var(--color-error)", marginTop: "4px" }}>
            {error}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
