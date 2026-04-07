import { AlertTriangle } from "lucide-react";
import { Modal } from "./Modal";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Confirmar ação",
  description = "Essa ação não pode ser desfeita.",
  confirmText = "Confirmar",
  loading,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div style={{ textAlign: "center", padding: "var(--space-4) 0" }}>
        <div
          style={{
            width: "56px",
            height: "56px",
            margin: "0 auto var(--space-5)",
            borderRadius: "var(--radius-xl)",
            background: "var(--color-error-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AlertTriangle size={28} style={{ color: "var(--color-error)" }} />
        </div>

        <h3
          style={{
            fontSize: "var(--text-title-sm)",
            fontWeight: "var(--font-weight-semibold)",
            color: "var(--color-text-primary)",
            marginBottom: "var(--space-2)",
          }}
        >
          {title}
        </h3>

        <p
          style={{
            fontSize: "var(--text-body-sm)",
            color: "var(--color-text-tertiary)",
            marginBottom: "var(--space-8)",
            lineHeight: "1.6",
          }}
        >
          {description}
        </p>

        <div style={{ display: "flex", gap: "var(--space-3)" }}>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ flex: 1 }}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="btn btn-danger"
            style={{ flex: 1 }}
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }} />
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
