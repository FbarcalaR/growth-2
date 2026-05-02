import type { ReactNode } from "react";

import { cn } from "@/client/lib/cn";

type AccentPillProps = {
  /** Optional leading icon. Decorative — the pill's content owns the label. */
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
};

/**
 * Warm-gold pill (coins, streaks, trophies). Reads from the
 * `--color-accent-warm-*` token group so any surface that adopts the look
 * stays consistent.
 */
export function AccentPill({ icon, children, className }: AccentPillProps) {
  return (
    <span
      className={cn(
        "rounded-pill inline-flex items-center gap-1 border px-2.5 py-1 text-[13px] font-bold tabular-nums",
        "bg-accent-warm-bg border-accent-warm-border text-accent-warm",
        className,
      )}
    >
      {icon}
      <span>{children}</span>
    </span>
  );
}
