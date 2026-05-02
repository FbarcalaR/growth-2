"use client";

import { Trophy } from "lucide-react";

import { PlantSprite, ProgressBar } from "@/components/atoms";
import { AreaChip, HealthBadge } from "@/components/molecules";
import { cn } from "@/client/lib/cn";
import { STAGE_NAMES, type Stage } from "@/shared/plants";
import type { GoalDto } from "@/shared/schemas/goal";

type GoalCardProps = {
  goal: GoalDto;
  /** Slot rendered below the header — used by Plans to inline tasks/routines/editor. */
  children?: React.ReactNode;
  className?: string;
  /** Click handler on the whole card (not the children slot). */
  onClick?: () => void;
};

/**
 * Plans-tab card for a single goal: plant sprite, title + area, status line
 * (stage label or completion stamp), progress bar (tasks done / tasks total),
 * and health badge when relevant. Children render below the header so callers
 * can compose tasks / routines / editor controls without extra wrappers.
 */
export function GoalCard({ goal, children, className, onClick }: GoalCardProps) {
  const totalTasks = goal.tasks.length;
  const doneTasks = goal.tasks.filter((t) => t.completed).length;
  const totalRoutines = goal.routines.length;
  const doneRoutines = goal.routines.filter((r) => r.completedToday).length;
  const totalItems = totalTasks + totalRoutines;
  const doneItems = doneTasks + doneRoutines;
  const progress = totalItems === 0 ? 0 : doneItems / totalItems;
  const stageLabel = STAGE_NAMES[goal.stage as Stage];

  return (
    <article
      className={cn(
        "bg-surface-card border-surface-muted relative rounded-xl border-[1.5px] p-4",
        onClick && "hover:border-brand-muted cursor-pointer transition-colors",
        className,
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      <div className="flex items-start gap-3">
        <span
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg"
          style={{
            background: `color-mix(in srgb, var(--color-area-${goal.area}) 13%, transparent)`,
          }}
        >
          <PlantSprite
            plantId={goal.plantType}
            stage={goal.stage as Stage}
            healthState={goal.healthState}
            size={48}
          />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-ink-strong truncate text-base leading-tight font-bold">
            {goal.title}
          </h3>
          <div className="mt-1 flex items-center gap-2">
            <AreaChip area={goal.area} />
            <span className="text-brand-muted text-xs font-semibold tabular-nums">
              {goal.completed ? "Trophy unlocked" : goal.planted ? stageLabel : "Seed"}
            </span>
          </div>
        </div>
        {goal.completed ? (
          <span
            aria-label="Completed"
            className="rounded-pill flex h-9 w-9 items-center justify-center bg-[#FFF8E1] text-[#F0A500]"
          >
            <Trophy size={18} aria-hidden />
          </span>
        ) : goal.planted ? (
          <HealthBadge state={goal.healthState} />
        ) : null}
      </div>

      {!goal.completed && totalItems > 0 && (
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-brand-muted text-[11px] font-semibold tracking-wide uppercase">
              Progress
            </span>
            <span className="text-brand-muted text-xs tabular-nums">
              {doneItems}/{totalItems}
            </span>
          </div>
          <ProgressBar
            value={progress}
            label={`${goal.title} progress`}
            accent={`var(--color-area-${goal.area})`}
            className="h-2"
          />
        </div>
      )}

      {children}
    </article>
  );
}
