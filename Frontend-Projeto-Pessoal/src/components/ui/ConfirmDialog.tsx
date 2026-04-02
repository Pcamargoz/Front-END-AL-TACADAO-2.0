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
          className="w-14 h-14 rounded-sm flex items-center justify-center mx-auto mb-5"
          style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)" }}
        >
          <AlertTriangle size={24} className="text-[#EF4444]" />
        </div>
        <h3 className="text-lg font-semibold text-[#F5F5F5] mb-2">{title}</h3>
        <p className="text-sm text-[#9CA3AF] mb-6 max-w-[280px] mx-auto">{description}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onClose} className="btn btn-secondary flex-1" disabled={loading}>
            Cancelar
          </button>
          <button onClick={onConfirm} className="btn btn-danger flex-1" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-[#EF4444]/30 border-t-[#EF4444] rounded-full animate-spin" />
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
