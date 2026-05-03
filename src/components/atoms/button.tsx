import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/client/lib/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "destructive"
  | "outline"
  | "outline-destructive"
  | "warning";
export type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-brand-700 text-white hover:bg-brand-500 active:bg-brand-700/90",
  secondary: "bg-brand-100 text-brand-700 hover:bg-surface-muted border border-surface-muted",
  ghost: "bg-transparent text-brand-700 hover:bg-brand-100",
  destructive: "bg-health-critical text-white hover:bg-health-critical/90",
  // Outlined variants used by the Goal detail-sheet's footer action row.
  // White fill, coloured 1.5px border, coloured text + icon.
  outline: "bg-surface-card text-brand-700 border-[1.5px] border-input-border hover:bg-brand-100",
  "outline-destructive":
    "bg-surface-card text-health-critical border-[1.5px] border-health-critical/40 hover:bg-health-critical/10",
  // Warm-gold solid CTA, used for the "Mark goal as complete" trophy button.
  warning: "bg-accent-warm text-white hover:bg-accent-warm/90 shadow-sm",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-xs gap-1.5",
  md: "h-11 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", leadingIcon, trailingIcon, className, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        "rounded-pill inline-flex items-center justify-center font-semibold transition-colors",
        "focus-visible:ring-brand-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      {...props}
    >
      {leadingIcon && <span aria-hidden>{leadingIcon}</span>}
      {children}
      {trailingIcon && <span aria-hidden>{trailingIcon}</span>}
    </button>
  );
});
