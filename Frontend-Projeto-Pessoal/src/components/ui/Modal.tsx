import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  showClose?: boolean;
}

/**
 * Modal component following Apple-style design system
 * - Clean, centered design
 * - Backdrop blur
 * - Smooth animations
 * - Keyboard accessible (Escape to close)
 */
export function Modal({ 
  open, 
  onClose, 
  title, 
  description,
  children, 
  size = "md",
  showClose = true 
}: Props) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    // Handle escape key
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    // Prevent body scroll
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    // Focus trap - focus modal on open
    modalRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ 
              duration: 0.3, 
              ease: [0.25, 0.1, 0.25, 1] 
            }}
            className={cn(
              "relative w-full mx-4",
              "bg-surface border border-border rounded-2xl shadow-2xl",
              "focus:outline-none",
              maxWidthClasses[size]
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
            aria-describedby={description ? "modal-description" : undefined}
            tabIndex={-1}
          >
            {/* Header */}
            {(title || showClose) && (
              <div className="flex items-start justify-between p-6 pb-0">
                <div className="flex-1">
                  {title && (
                    <h2 
                      id="modal-title"
                      className="text-title-md text-primary"
                    >
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p 
                      id="modal-description"
                      className="text-body-sm text-secondary mt-1"
                    >
                      {description}
                    </p>
                  )}
                </div>
                {showClose && (
                  <button
                    onClick={onClose}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      "text-tertiary hover:text-primary",
                      "bg-surface-secondary hover:bg-surface-tertiary",
                      "transition-all duration-200",
                      "focus:outline-none focus:ring-2 focus:ring-accent/20"
                    )}
                    aria-label="Fechar modal"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

interface ModalFooterProps {
  children: ReactNode;
  className?: string;
}

/**
 * Modal footer for action buttons
 */
export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div className={cn(
      "flex items-center justify-end gap-3 pt-4 mt-2",
      "border-t border-border",
      className
    )}>
      {children}
    </div>
  );
}

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "danger";
  loading?: boolean;
}

/**
 * Confirmation modal for destructive or important actions
 */
export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "default",
  loading = false,
}: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose} size="sm" showClose={false}>
      <div className="text-center">
        {/* Icon */}
        <div className={cn(
          "w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center",
          variant === "danger" 
            ? "bg-red-100 dark:bg-red-950/30" 
            : "bg-accent/10"
        )}>
          <span className={cn(
            "text-2xl",
            variant === "danger" ? "text-red-600 dark:text-red-400" : "text-accent"
          )}>
            {variant === "danger" ? "!" : "?"}
          </span>
        </div>

        {/* Content */}
        <h3 className="text-title-sm text-primary mb-2">{title}</h3>
        {description && (
          <p className="text-body-sm text-secondary mb-6">{description}</p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="btn btn-secondary flex-1"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              "btn flex-1",
              variant === "danger" ? "btn-danger" : "btn-primary"
            )}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Processando...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
