import { useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizeWidths = {
  sm: "420px",
  md: "520px",
  lg: "640px",
};

export function Modal({ open, onClose, title, children, size = "md" }: ModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, handleEscape]);

  return (
    <AnimatePresence>
      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "var(--space-6)",
          }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: "absolute",
              inset: 0,
              background: "var(--color-overlay)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: sizeWidths[size],
              maxHeight: "90vh",
              overflowY: "auto",
              background: "var(--color-bg-elevated)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-xl)",
              boxShadow: "var(--shadow-xl)",
            }}
          >
            {/* Header */}
            {title && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "var(--space-6) var(--space-6) 0",
                }}
              >
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "var(--text-title-sm)",
                    fontWeight: "var(--font-weight-semibold)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="btn btn-ghost btn-icon btn-sm"
                  aria-label="Fechar"
                  style={{ borderRadius: "var(--radius-full)" }}
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {/* Content */}
            <div style={{ padding: "var(--space-6)" }}>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
