import { cn } from "../../lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "neon" | "cyan" | "white";
  className?: string;
}

export function Spinner({ size = "md", color = "neon", className }: SpinnerProps) {
  const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-2",
    lg: "w-12 h-12 border-3",
  };

  const colors = {
    neon: {
      border: "rgba(0,255,135,0.2)",
      borderTop: "#00FF87",
    },
    cyan: {
      border: "rgba(0,229,255,0.2)",
      borderTop: "#00E5FF",
    },
    white: {
      border: "rgba(255,255,255,0.2)",
      borderTop: "#F5F5F5",
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#090B10]">
      <Spinner size="lg" />
      <p className="mt-4 text-sm text-[#4B5563]">{message}</p>
    </div>
  );
}

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message }: LoadingOverlayProps) {
  return (
    <div className="absolute inset-0 bg-[#090B10]/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
      <Spinner size="md" />
      {message && <p className="mt-3 text-sm text-[#9CA3AF]">{message}</p>}
    </div>
  );
}
