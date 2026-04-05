import { AlertTriangle } from "lucide-react";
import { Modal } from "./Modal";

interface Props {
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
  title = "Confirmar exclusão",
  description = "Esta ação não pode ser desfeita.",
  confirmText = "Excluir",
  loading,
}: Props) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="text-center py-4">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-5"
          style={{ 
            background: "var(--color-error-bg)", 
            border: "1px solid var(--color-error)" 
          }}
        >
          <AlertTriangle size={24} className="text-error" style={{ color: "var(--color-error)" }} />
        </div>
        <h3 className="text-lg font-semibold text-primary mb-2">{title}</h3>
        <p className="text-sm text-secondary mb-6 max-w-[280px] mx-auto">{description}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onClose} className="btn btn-secondary flex-1" disabled={loading}>
            Cancelar
          </button>
          <button onClick={onConfirm} className="btn btn-danger flex-1" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span 
                  className="w-4 h-4 rounded-full border-2 animate-spin"
                  style={{ 
                    borderColor: "var(--color-error-bg)", 
                    borderTopColor: "var(--color-error)" 
                  }}
                />
                Excluindo...
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
