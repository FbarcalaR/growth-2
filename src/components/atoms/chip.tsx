import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/client/lib/cn";

export type ChipTone =
  | "neutral"
  | "brand"
  | "health"
  | "career"
  | "finances"
  | "relationships"
  | "personal"
  | "fun"
  | "spirituality";

type ChipProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: ChipTone;
  leadingIcon?: ReactNode;
};

const TONE_CLASSES: Record<ChipTone, string> = {
  neutral: "bg-surface-muted text-brand-700",
  brand: "bg-brand-100 text-brand-700",
  health: "bg-area-health/15 text-area-health",
  career: "bg-area-career/15 text-area-career",
  finances: "bg-area-finances/15 text-area-finances",
  relationships: "bg-area-relationships/15 text-area-relationships",
  personal: "bg-area-personal/15 text-area-personal",
  fun: "bg-area-fun/15 text-area-fun",
  spirituality: "bg-area-spirituality/15 text-area-spirituality",
};

export function Chip({ tone = "neutral", leadingIcon, className, children, ...props }: ChipProps) {
  return (
    <span
      className={cn(
        "rounded-pill inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold",
        TONE_CLASSES[tone],
        className,
      )}
      {...props}
    >
      {leadingIcon && <span aria-hidden>{leadingIcon}</span>}
      {children}
    </span>
  );
}
