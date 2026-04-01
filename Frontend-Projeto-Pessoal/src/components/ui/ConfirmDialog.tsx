import { AlertTriangle } from "lucide-react";
import { Modal } from "./Modal";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Confirm deletion",
  description = "This action cannot be undone.",
  loading,
}: Props) {
  return (
    <Modal open={open} onClose={onClose} title="">
      <div className="text-center py-2">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: "rgba(229,72,77,0.10)", border: "1px solid rgba(229,72,77,0.22)" }}
        >
          <AlertTriangle size={20} style={{ color: "#E5484D" }} />
        </div>
        <h3 style={{ fontSize: "0.95rem", fontWeight: 600, color: "#EFEFEF", marginBottom: "0.5rem" }}>
          {title}
        </h3>
        <p style={{ fontSize: "0.875rem", color: "#52525B", marginBottom: "1.5rem" }}>
          {description}
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={onClose} className="btn btn-secondary" disabled={loading}>
            Cancel
          </button>
          <button onClick={onConfirm} className="btn btn-danger" disabled={loading}>
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
