"use client";

import { useSyncExternalStore } from "react";

/**
 * Tiny pub-sub for toasts. Any component can publish via `toast.success(...)`
 * etc.; the `<Toaster>` mounted in the root layout subscribes via
 * `useToastStore()`. We keep this single-store rather than threading a context
 * through providers — toasts are a pure leaf surface.
 *
 * No Zustand: a single subscriber + tiny payload. If toast complexity grows,
 * promote to a real store under `src/client/store/`.
 */

export type ToastVariant = "success" | "error" | "info";

export type Toast = {
  id: number;
  variant: ToastVariant;
  message: string;
  durationMs: number;
};

type Listener = () => void;

let nextId = 1;
let toasts: Toast[] = [];
const listeners = new Set<Listener>();

function emit(): void {
  for (const listener of listeners) listener();
}

function add(variant: ToastVariant, message: string, durationMs = 4000): number {
  const id = nextId;
  nextId += 1;
  toasts = [...toasts, { id, variant, message, durationMs }];
  emit();
  if (durationMs > 0 && typeof window !== "undefined") {
    window.setTimeout(() => dismiss(id), durationMs);
  }
  return id;
}

export function dismiss(id: number): void {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export function clearAll(): void {
  toasts = [];
  emit();
}

/**
 * Imperative API. Use from event handlers, mutation callbacks, etc.:
 *
 * ```ts
 * onSuccess: () => toast.success("Saved");
 * onError:   (err) => toast.error(err.message);
 * ```
 */
export const toast = {
  success: (message: string, durationMs?: number) => add("success", message, durationMs),
  error: (message: string, durationMs?: number) => add("error", message, durationMs),
  info: (message: string, durationMs?: number) => add("info", message, durationMs),
};

/** Reactive snapshot of the current toast list. Used by `<Toaster>`. */
export function useToastStore(): Toast[] {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => toasts,
    () => toasts,
  );
}
