"use client";

import { useEffect, useRef, useState } from "react";

import { PlantSprite } from "@/components/atoms";
import { cn } from "@/client/lib/cn";
import type { HealthState } from "@/shared/health";
import type { PlantId, Stage } from "@/shared/plants";

type GoalPlantProps = {
  plantId: PlantId;
  stage: Stage;
  /** Tints the sprite (Story 7.2.1). Defaults to "healthy". */
  healthState?: HealthState;
  size?: number;
};

/**
 * Small plant sprite that briefly plays a "grow" animation whenever its stage
 * advances. Detects the change by comparing `stage` to the previous render's
 * value via a ref. The animation is purely a CSS keyframe (`plant-grow`) and
 * is gated by the same `prefers-reduced-motion` rule as the resource fly
 * animation, so reduced-motion users get the instant state change without
 * the bounce.
 */
export function GoalPlant({ plantId, stage, healthState = "healthy", size = 36 }: GoalPlantProps) {
  const prev = useRef(stage);
  const [growing, setGrowing] = useState(false);

  useEffect(() => {
    const advanced = stage > prev.current;
    prev.current = stage;
    if (!advanced) return undefined;
    setGrowing(true);
    const timer = window.setTimeout(() => setGrowing(false), 700);
    return () => window.clearTimeout(timer);
  }, [stage]);

  return (
    <span
      data-testid="goal-plant"
      data-stage={stage}
      data-growing={growing ? "true" : undefined}
      className={cn("inline-flex items-center justify-center", growing && "plant-grow")}
    >
      <PlantSprite plantId={plantId} stage={stage} healthState={healthState} size={size} />
    </span>
  );
}
