import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Compose Tailwind class names with conflict-aware merging.
 *
 * Use this whenever a component accepts a `className` prop or composes classes
 * conditionally — it merges Tailwind utilities so later classes win over
 * earlier ones in the same group (e.g. `cn("p-2", "p-4")` → `p-4`).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
