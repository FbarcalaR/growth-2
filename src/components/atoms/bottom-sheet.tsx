"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";

import { cn } from "@/client/lib/cn";

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  /** Accessible label, also surfaced via aria-label on the dialog. */
  title: string;
  /** When false, backdrop click and Escape key do nothing. Defaults to true. */
  dismissable?: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * Bottom-anchored sheet with a blurred backdrop. Used for surfaces that ask
 * the user to commit to something (Set Priorities, "Pick a goal to plant",
 * Replant a dead plant) — the bottom-sheet placement reads as "this matters,
 * commit to it" more than the centered Modal.
 */
export function BottomSheet({
  open,
  onClose,
  title,
  dismissable = true,
  className,
  children,
}: BottomSheetProps) {
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
      className="fixed inset-0 z-50 flex items-end justify-center"
    >
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: "rgba(28,43,32,0.55)" }}
        onClick={dismissable ? onClose : undefined}
      />
      <div
        className={cn(
          "bg-surface-app text-ink-strong relative flex max-h-[92%] w-full flex-col overflow-hidden",
          "rounded-t-xl shadow-[0_-8px_24px_rgba(0,0,0,0.18)]",
          className,
        )}
      >
        {/* Drag handle */}
        <div className="bg-brand-track rounded-pill mx-auto mt-3 mb-1 h-1 w-9" aria-hidden />
        {children}
      </div>
    </div>
  );
}
