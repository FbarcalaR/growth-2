"use client";

import { Button, Modal } from "@/components/atoms";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  /** Body copy. Plain string keeps tone consistent across confirmations. */
  message: string;
  /** Label for the destructive action. Defaults to "Delete". */
  confirmLabel?: string;
  /** Visual emphasis for the confirm button. Defaults to "destructive". */
  variant?: "destructive" | "primary";
  onCancel: () => void;
  onConfirm: () => void;
  busy?: boolean;
};

/** Two-button confirmation dialog used for destructive actions. */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  variant = "destructive",
  onCancel,
  onConfirm,
  busy,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="text-brand-muted mb-5 text-sm">{message}</p>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button variant={variant} onClick={onConfirm} disabled={busy}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
