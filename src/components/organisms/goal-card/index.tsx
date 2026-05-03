"use client";

import { ChevronRight } from "lucide-react";

import { cn } from "@/client/lib/cn";
import { HealthWarning } from "@/components/molecules";
import type { GoalDto } from "@/shared/schemas/goal";
import { type Stage } from "@/shared/plants";

import { DeadPlantBanner, FullyBloomingBanner, GoalGrowthBar } from "./goal-growth-bar";
import { GoalIcon } from "./goal-icon";
import { GoalStatusChips } from "./goal-status-chips";

type GoalCardProps = {
  goal: GoalDto;
  /** Tap handler — typically opens the `<GoalDetailSheet>` drawer. */
  onClick?: () => void;
  className?: string;
};

/**
 * Compact summary card for a goal in the `/garden` list. Tapping the card
 * opens `<GoalDetailSheet>`, which is where the full detail UI (tasks,
 * routines, edit, delete, mark-complete) lives.
 */
export function GoalCard({ goal, onClick, className }: GoalCardProps) {
  const isSeed = !goal.planted;
  const isDead = goal.healthState === "dead";
  const isFullyGrown = goal.stage >= 4;
  const isUnhealthy =
    goal.healthState === "wilting" || goal.healthState === "ill" || goal.healthState === "critical";
  const totalItems = goal.tasks.length + goal.routines.length;
  const doneItems =
    goal.tasks.filter((t) => t.completed).length +
    goal.routines.filter((r) => r.completedToday).length;

  const borderColor = cardBorderColor({ isSeed, isDead, healthState: goal.healthState });
  const isInteractive = Boolean(onClick);

  return (
    <article
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (!isInteractive) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={cn(
        "bg-surface-card overflow-hidden rounded-[20px] border-[1.5px]",
        isInteractive && "hover:border-brand-muted cursor-pointer transition-colors",
        className,
      )}
      style={{ borderColor }}
    >
      <div className="flex items-center gap-2.5 px-4 py-3.5">
        <GoalIcon
          area={goal.area}
          plantType={goal.plantType}
          stage={goal.stage as Stage}
          healthState={goal.healthState}
          isSeed={isSeed}
          size={52}
        />
        <div className="min-w-0 flex-1">
          <h3 className="text-ink-strong truncate text-[15px] leading-tight font-bold">
            {goal.title}
          </h3>
          <div className="mt-0.5">
            <GoalStatusChips goal={goal} doneItems={doneItems} totalItems={totalItems} />
          </div>
        </div>
        {isInteractive && (
          <ChevronRight size={16} aria-hidden className="text-brand-muted shrink-0" />
        )}
      </div>

      <div className="flex flex-col gap-2 px-4 pb-3">
        {!isSeed && !isDead && isUnhealthy && (
          <HealthWarning state={goal.healthState} overdueCount={goal.overdueCount} />
        )}
        {!isSeed && isDead && <DeadPlantBanner />}
        {!isSeed && !isDead && isFullyGrown && <FullyBloomingBanner />}
        {!isSeed && !isDead && !isFullyGrown && <GoalGrowthBar goal={goal} />}
      </div>
    </article>
  );
}

function cardBorderColor({
  isSeed,
  isDead,
  healthState,
}: {
  isSeed: boolean;
  isDead: boolean;
  healthState: GoalDto["healthState"];
}): string {
  if (isDead) return "#BFBFBF";
  if (healthState === "critical") return "#F5C6CB";
  if (healthState === "ill") return "#FCD9B0";
  if (healthState === "wilting") return "#FFE7A6";
  if (isSeed) return "#FFE082";
  return "#EAEDE8";
}

export { GoalIcon };
