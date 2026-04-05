import { cn } from "../../lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "accent" | "blue" | "muted";
  className?: string;
}

export function Spinner({ size = "md", color = "accent", className }: SpinnerProps) {
  const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-2",
    lg: "w-12 h-12 border-3",
  };

  const colors = {
    accent: {
      border: "var(--color-accent-subtle)",
      borderTop: "var(--color-accent)",
    },
    blue: {
      border: "var(--color-accent-blue-subtle)",
      borderTop: "var(--color-accent-blue)",
    },
    muted: {
      border: "var(--color-border-strong)",
      borderTop: "var(--color-text-tertiary)",
    },
  };

  const colorStyle = colors[color];

  return (
    <div
      className={cn("rounded-full animate-spin", sizes[size], className)}
      style={{
        borderColor: colorStyle.border,
        borderTopColor: colorStyle.borderTop,
      }}
    />
  );
}

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "Carregando..." }: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface">
      <Spinner size="lg" />
      <p className="mt-4 text-sm text-tertiary">{message}</p>
    </div>
  );
}

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message }: LoadingOverlayProps) {
  return (
    <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
      <Spinner size="md" />
      {message && <p className="mt-3 text-sm text-secondary">{message}</p>}
    </div>
  );
}
