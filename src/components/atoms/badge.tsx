import type { HTMLAttributes } from "react";

import { cn } from "@/client/lib/cn";

export type BadgeTone = "healthy" | "wilting" | "ill" | "critical" | "dead" | "neutral";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

const TONE_CLASSES: Record<BadgeTone, string> = {
  healthy: "bg-health-healthy-bg text-health-healthy",
  wilting: "bg-health-wilting-bg text-health-wilting",
  ill: "bg-health-ill-bg text-health-ill",
  critical: "bg-health-critical-bg text-health-critical",
  dead: "bg-health-dead-bg text-health-dead",
  neutral: "bg-surface-muted text-brand-700",
};

export function Badge({ tone = "neutral", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-bold",
        TONE_CLASSES[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
