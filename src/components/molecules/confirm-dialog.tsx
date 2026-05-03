"use client";

import type { ReactNode } from "react";

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
  /** Optionally lock the confirm button until an external check is met
   *  (e.g. the user typed "RESET" in a follow-up gate). */
  confirmDisabled?: boolean;
  /** Optional extra UI rendered between the message and the action row.
   *  Used by `DataPanel` to add a "type RESET to confirm" gate. */
  children?: ReactNode;
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
  confirmDisabled,
  children,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="text-brand-muted mb-3 text-sm">{message}</p>
      {children && <div className="mb-4">{children}</div>}
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button variant={variant} onClick={onConfirm} disabled={busy || confirmDisabled}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
