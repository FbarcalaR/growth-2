"use client";

import { useEffect, useRef, useState } from "react";

import { PlantSprite } from "@/components/atoms";
import { cn } from "@/client/lib/cn";
import type { PlantId, Stage } from "@/shared/plants";

type GoalPlantProps = {
  plantId: PlantId;
  stage: Stage;
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
export function GoalPlant({ plantId, stage, size = 36 }: GoalPlantProps) {
  const prev = useRef(stage);
  const [growing, setGrowing] = useState(false);

  useEffect(() => {
    if (stage > prev.current) {
      setGrowing(true);
      const timer = window.setTimeout(() => setGrowing(false), 700);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [stage]);

  useEffect(() => {
    prev.current = stage;
  }, [stage]);

  return (
    <span
      data-testid="goal-plant"
      data-stage={stage}
      data-growing={growing ? "true" : undefined}
      className={cn("inline-flex items-center justify-center", growing && "plant-grow")}
    >
      <PlantSprite plantId={plantId} stage={stage} size={size} />
    </span>
  );
}
