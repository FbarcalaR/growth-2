import { cn } from "@/client/lib/cn";

type ProgressBarProps = {
  /** Progress value from 0 to 1. Clamped. */
  value: number;
  /** Optional accessible label; defaults to "Progress". */
  label?: string;
  /**
   * Optional CSS color for the fill (a hex, named color, or `var(--color-...)`).
   * Defaults to the brand green. We accept a CSS value rather than a Tailwind
   * class so callers can pass dynamic values like `var(--color-res-water)`
   * without fighting Tailwind's static class scanning.
   */
  accent?: string;
  className?: string;
};

export function ProgressBar({ value, label, accent, className }: ProgressBarProps) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div
      role="progressbar"
      aria-label={label ?? "Progress"}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      className={cn("rounded-pill bg-surface-muted h-2 w-full overflow-hidden", className)}
    >
      <div
        className="rounded-pill h-full transition-[width] duration-500"
        style={{ width: `${pct}%`, background: accent ?? "var(--color-brand-700)" }}
      />
    </div>
  );
}
