import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

import { cn } from "@/client/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid, className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        "bg-surface-card text-brand-700 placeholder:text-brand-muted h-11 w-full rounded-md px-3 text-sm",
        "border-surface-muted border",
        "focus:border-brand-700 focus:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        invalid && "border-health-critical focus:border-health-critical",
        className,
      )}
      {...props}
    />
  );
});
