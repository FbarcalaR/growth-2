import { Trophy } from "lucide-react";

import { HealthBadge } from "@/components/molecules";
import type { GoalDto } from "@/shared/schemas/goal";

type GoalStatusBadgeProps = {
  goal: GoalDto;
};

/**
 * Top-right badge in a goal card. Three exclusive states:
 *   - completed → trophy in the warm-accent palette
 *   - planted (and not completed) → health badge
 *   - seed (not planted yet) → no badge
 */
export function GoalStatusBadge({ goal }: GoalStatusBadgeProps) {
  if (goal.completed) {
    return (
      <span
        aria-label="Completed"
        className="rounded-pill bg-accent-warm-bg text-accent-warm flex h-9 w-9 items-center justify-center"
      >
        <Trophy size={18} aria-hidden />
      </span>
    );
  }
  if (goal.planted) {
    return <HealthBadge state={goal.healthState} />;
  }
  return null;
}

/** Single-word status descriptor used next to the area chip in the card header. */
export function statusLabel(goal: GoalDto, stageLabel: string): string {
  if (goal.completed) return "Trophy unlocked";
  if (goal.planted) return stageLabel;
  return "Seed";
}
