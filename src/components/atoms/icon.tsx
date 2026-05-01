import type { SVGProps } from "react";

import { cn } from "@/client/lib/cn";

export type IconSize = "sm" | "md" | "lg";

type IconProps = SVGProps<SVGSVGElement> & {
  size?: IconSize;
  /** A child SVG path/group. The Icon atom owns sizing and color (currentColor). */
  children: React.ReactNode;
  /** Accessible label. If omitted, the icon is decorative (aria-hidden). */
  label?: string;
};

const SIZE = {
  sm: 16,
  md: 22,
  lg: 28,
} as const;

export function Icon({ size = "md", label, className, children, ...props }: IconProps) {
  const dim = SIZE[size];
  return (
    <svg
      width={dim}
      height={dim}
      viewBox={`0 0 ${dim} ${dim}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("inline-block", className)}
      role={label ? "img" : "presentation"}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...props}
    >
      {children}
    </svg>
  );
}
