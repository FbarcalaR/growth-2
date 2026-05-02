"use client";

import { cn } from "@/client/lib/cn";
import { AreaChip } from "@/components/molecules";
import { STAGE_NAMES, type Stage } from "@/shared/plants";
import type { GoalDto } from "@/shared/schemas/goal";

import { GoalIcon } from "./goal-icon";
import { GoalProgress } from "./goal-progress";
import { GoalStatusBadge, statusLabel } from "./goal-status-badge";

type GoalCardProps = {
  goal: GoalDto;
  /** Slot rendered below the header — used by Garden to inline tasks/routines. */
  children?: React.ReactNode;
  className?: string;
  /** Click handler on the whole card (not the children slot). */
  onClick?: () => void;
};

/**
 * Card for a single goal: plant sprite, title + area, status descriptor,
 * progress bar, and a status badge (trophy / health / none).
 *
 * Each visual region (icon, status badge, progress block) lives in its own
 * file under `goal-card/` so this top-level stays mostly composition.
 */
export function GoalCard({ goal, children, className, onClick }: GoalCardProps) {
  const stage = goal.stage as Stage;
  const totalItems = goal.tasks.length + goal.routines.length;
  const doneItems =
    goal.tasks.filter((t) => t.completed).length +
    goal.routines.filter((r) => r.completedToday).length;
  const showProgress = !goal.completed && totalItems > 0;
  const isInteractive = Boolean(onClick);

  return (
    <article
      className={cn(
        "bg-surface-card border-surface-muted relative rounded-xl border-[1.5px] p-4",
        isInteractive && "hover:border-brand-muted cursor-pointer transition-colors",
        className,
      )}
      onClick={onClick}
      role={isInteractive ? "button" : undefined}
    >
      <div className="flex items-start gap-3">
        <GoalIcon
          area={goal.area}
          plantType={goal.plantType}
          stage={stage}
          healthState={goal.healthState}
        />
        <div className="min-w-0 flex-1">
          <h3 className="text-ink-strong truncate text-base leading-tight font-bold">
            {goal.title}
          </h3>
          <div className="mt-1 flex items-center gap-2">
            <AreaChip area={goal.area} />
            <span className="text-brand-muted text-xs font-semibold tabular-nums">
              {statusLabel(goal, STAGE_NAMES[stage])}
            </span>
          </div>
        </div>
        <GoalStatusBadge goal={goal} />
      </div>

      {showProgress && (
        <GoalProgress
          area={goal.area}
          doneItems={doneItems}
          totalItems={totalItems}
          goalTitle={goal.title}
        />
      )}

      {children}
    </article>
  );
}
