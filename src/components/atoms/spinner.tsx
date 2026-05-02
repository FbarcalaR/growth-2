import { cn } from "@/client/lib/cn";

export type SpinnerSize = "sm" | "md" | "lg";

type SpinnerProps = {
  size?: SpinnerSize;
  /** Optional accessible label. Defaults to "Loading". */
  label?: string;
  className?: string;
};

const SIZE: Record<SpinnerSize, number> = { sm: 14, md: 18, lg: 24 };
const STROKE: Record<SpinnerSize, number> = { sm: 2, md: 2.5, lg: 3 };

/**
 * A small token-driven spinner. Color flows from `currentColor` so it inherits
 * whatever the parent text color is — drop it inside a `Button` and it tints
 * with the button variant; drop it on the welcome surface and it picks up the
 * brand green.
 */
export function Spinner({ size = "md", label = "Loading", className }: SpinnerProps) {
  const dim = SIZE[size];
  return (
    <svg
      role="status"
      aria-label={label}
      width={dim}
      height={dim}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={STROKE[size]}
      strokeLinecap="round"
      className={cn("animate-spin", className)}
    >
      {/* Track */}
      <circle cx="12" cy="12" r="9" opacity="0.25" />
      {/* Arc — three-quarters circle so the spin direction reads */}
      <path d="M12 3 a9 9 0 0 1 9 9" />
    </svg>
  );
}
