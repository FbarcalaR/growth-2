"use client";

import { cn } from "@/client/lib/cn";

type CheckboxProps = {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
  className?: string;
  /**
   * Optional CSS color for the checked fill + border (e.g. `var(--color-area-health)`).
   * Defaults to brand green. CSS value rather than Tailwind class to support
   * dynamic per-area tinting without hitting Tailwind's static-class limitation.
   */
  tint?: string;
};

export function Checkbox({
  checked,
  onCheckedChange,
  label,
  disabled,
  className,
  tint,
}: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "inline-flex h-6 w-6 items-center justify-center rounded-sm border-2 transition-colors",
        "focus-visible:ring-brand-700 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "text-white" : "bg-surface-card border-brand-muted",
        className,
      )}
      style={
        checked
          ? {
              background: tint ?? "var(--color-brand-700)",
              borderColor: tint ?? "var(--color-brand-700)",
            }
          : undefined
      }
    >
      {checked && (
        <svg
          aria-hidden
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="2,7 6,11 12,3" />
        </svg>
      )}
    </button>
  );
}
