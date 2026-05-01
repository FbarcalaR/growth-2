"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";

import { cn } from "@/client/lib/cn";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** When true, clicking the backdrop or pressing Esc does not close the modal. */
  dismissable?: boolean;
  className?: string;
};

export function Modal({
  open,
  onClose,
  title,
  children,
  dismissable = true,
  className,
}: ModalProps) {
  useEffect(() => {
    if (!open || !dismissable) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, dismissable, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="bg-brand-700/40 absolute inset-0"
        onClick={dismissable ? onClose : undefined}
      />
      <div
        className={cn(
          "bg-surface-card text-brand-700 relative w-full max-w-md rounded-lg p-6 shadow-xl",
          className,
        )}
      >
        {title && <h2 className="mb-3 text-lg font-bold">{title}</h2>}
        {children}
      </div>
    </div>
  );
}
