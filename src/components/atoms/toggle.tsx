"use client";

import { cn } from "@/client/lib/cn";

type ToggleProps = {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
  className?: string;
};

export function Toggle({ checked, onCheckedChange, label, disabled, className }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "rounded-pill relative inline-flex h-6 w-11 items-center transition-colors",
        "focus-visible:ring-brand-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-brand-700" : "bg-surface-muted",
        className,
      )}
    >
      <span
        className={cn(
          "rounded-pill bg-surface-card inline-block h-5 w-5 transform shadow transition-transform",
          checked ? "translate-x-5" : "translate-x-0.5",
        )}
      />
    </button>
  );
}
