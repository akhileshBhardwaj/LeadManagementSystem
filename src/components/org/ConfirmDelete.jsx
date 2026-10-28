import { TriangleAlert } from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";

export default function ConfirmDelete({
  open,
  title = "Delete",
  description,
  details = null,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      size="sm"
      title={title}
      description={description}
    >
      <div className="space-y-4">
        {details && (
          <div className="flex items-start gap-3 rounded-xl border border-border bg-danger-soft px-4 py-3 text-sm text-danger">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="min-w-0">{details}</div>
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
