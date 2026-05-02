"use client";

import { CircleAlert, CircleCheck, Info, X } from "lucide-react";

import { dismiss, useToastStore, type ToastVariant } from "@/client/hooks/use-toast";
import { cn } from "@/client/lib/cn";

const VARIANT_CLASSES: Record<ToastVariant, string> = {
  success: "bg-health-healthy-bg text-health-healthy",
  error: "bg-health-critical-bg text-health-critical",
  info: "bg-brand-100 text-brand-700",
};

const VARIANT_ICONS: Record<ToastVariant, typeof CircleCheck> = {
  success: CircleCheck,
  error: CircleAlert,
  info: Info,
};

/**
 * Renders the active toast list. Mount once in `app/layout.tsx`. Anything in
 * the tree can publish via `toast.success(...)` from `use-toast`.
 *
 * Visual polish (animations, swipe-to-dismiss, stacking limits) is deferred
 * to Epic 8 — Story 8.2. This is the deliberate stub the Epic 1 review asked
 * for so Epic 2's mutations have somewhere to surface success and failure.
 */
export function Toaster() {
  const toasts = useToastStore();
  if (toasts.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="Notifications"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4"
    >
      {toasts.map((t) => {
        const Icon = VARIANT_ICONS[t.variant];
        return (
          <div
            key={t.id}
            role={t.variant === "error" ? "alert" : "status"}
            className={cn(
              "pointer-events-auto flex w-full max-w-sm items-center gap-2.5 rounded-md px-3 py-2 shadow-md",
              VARIANT_CLASSES[t.variant],
            )}
          >
            <Icon size={18} strokeWidth={2.2} aria-hidden />
            <span className="flex-1 text-sm font-semibold">{t.message}</span>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="rounded-pill p-0.5 transition-colors hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-current focus-visible:outline-none"
            >
              <X size={16} strokeWidth={2.2} aria-hidden />
            </button>
          </div>
        );
      })}
    </div>
  );
}
