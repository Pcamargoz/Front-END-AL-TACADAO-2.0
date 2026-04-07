import { cn } from "../../lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { width: "16px", height: "16px", borderWidth: "2px" },
  md: { width: "24px", height: "24px", borderWidth: "2px" },
  lg: { width: "40px", height: "40px", borderWidth: "3px" },
};

export function Spinner({ size = "md", className }: SpinnerProps) {
  const s = sizeMap[size];
  return (
    <div
      className={cn("spinner", className)}
      style={{ width: s.width, height: s.height, borderWidth: s.borderWidth }}
      role="status"
      aria-label="Carregando"
    />
  );
}

export function LoadingScreen({ message = "Carregando..." }: { message?: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        gap: "var(--space-4)",
        background: "var(--color-bg-primary)",
      }}
    >
      <Spinner size="lg" />
      <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-text-tertiary)" }}>
        {message}
      </p>
    </div>
  );
}
