"use client";

import { Sprout } from "lucide-react";
import { useEffect } from "react";

import { useReducedMotion } from "@/client/hooks";

type FlyingResourceProps = {
  /** Called when the sprite finishes (or is skipped under reduced motion). */
  onDone: () => void;
};

/**
 * Tiny "+1 resource" sprite that animates from the row toward the goal icon
 * after a successful completion. It schedules its own removal once the CSS
 * animation finishes, or immediately if `prefers-reduced-motion: reduce` is on
 * — the user gets the state change without the motion.
 */
export function FlyingResource({ onDone }: FlyingResourceProps) {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      onDone();
      return;
    }
    const timer = window.setTimeout(onDone, 650);
    return () => window.clearTimeout(timer);
  }, [reduced, onDone]);

  if (reduced) return null;

  return (
    <span
      aria-hidden
      data-testid="flying-resource"
      className="text-brand-700 fly-resource pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
    >
      <Sprout size={16} />
    </span>
  );
}
