"use client";

import { ChevronDown, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { useCompleteGoal, useDeleteGoal, useUpdateGoal } from "@/client/hooks";
import { Button } from "@/components/atoms";
import { ConfirmDialog } from "@/components/molecules";
import { cn } from "@/client/lib/cn";
import type { GoalDto, UpdateGoalRequest } from "@/shared/schemas/goal";
import { type Stage } from "@/shared/plants";

import { GoalEditor } from "../goal-editor";
import { DeadPlantBanner, FullyBloomingBanner, GoalGrowthBar } from "./goal-growth-bar";
import { GoalIcon } from "./goal-icon";
import { GoalStatusChips } from "./goal-status-chips";

type GoalCardProps = {
  goal: GoalDto;
  /** Inline-expanded slot — typically tasks + routines editors. */
  children?: React.ReactNode;
  /** Optional hook for the seed-state "Plant now" CTA (Epic 4). */
  onPlantNow?: (goalId: string) => void;
  className?: string;
};

/**
 * Inline-expandable goal card matching the prototype: collapsed shows the
 * plant/seed icon + title + status chips + chevron; tapping the header opens
 * the body slot (tasks + routines editors), the optional "Mark goal as
 * complete" CTA when every item is done, and the Edit / Delete action row.
 */
export function GoalCard({ goal, children, onPlantNow, className }: GoalCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const updateGoal = useUpdateGoal(goal.id);
  const deleteGoal = useDeleteGoal();
  const completeGoal = useCompleteGoal();

  const isSeed = !goal.planted;
  const isDead = goal.healthState === "dead";
  const isFullyGrown = goal.stage >= 4;
  const totalItems = goal.tasks.length + goal.routines.length;
  const doneItems =
    goal.tasks.filter((t) => t.completed).length +
    goal.routines.filter((r) => r.completedToday).length;
  const allDone = totalItems > 0 && doneItems === totalItems;
  const canMarkComplete = !goal.completed && allDone;

  const borderColor = cardBorderColor({
    isSeed,
    isDead,
    expanded,
    healthState: goal.healthState,
  });

  async function handleEditSubmit(input: { title: string; plantType: GoalDto["plantType"] }) {
    const patch: UpdateGoalRequest = { title: input.title, plantType: input.plantType };
    await updateGoal.mutateAsync(patch);
  }

  async function handleDelete() {
    await deleteGoal.mutateAsync(goal.id);
    setConfirmDelete(false);
  }

  return (
    <article
      className={cn("bg-surface-card overflow-hidden rounded-[20px] border-[1.5px]", className)}
      style={{ borderColor }}
    >
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center gap-2.5 px-4 py-3.5 text-left"
      >
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
        <ChevronDown
          size={16}
          aria-hidden
          className={cn("text-brand-muted shrink-0 transition-transform", expanded && "rotate-180")}
        />
      </button>

      <div className="px-4 pb-3">
        {isSeed && onPlantNow && (
          <Button size="lg" onClick={() => onPlantNow(goal.id)} className="w-full rounded-[14px]">
            🌱 Plant now in garden
          </Button>
        )}

        {!isSeed && isDead && <DeadPlantBanner />}
        {!isSeed && !isDead && isFullyGrown && <FullyBloomingBanner />}
        {!isSeed && !isDead && !isFullyGrown && <GoalGrowthBar goal={goal} />}
      </div>

      {expanded && (
        <div className="border-t border-[#F0F4EC] px-4 py-3.5">
          {children}

          {canMarkComplete && (
            <button
              type="button"
              onClick={() => completeGoal.mutate(goal.id)}
              disabled={completeGoal.isPending}
              className="mt-4 w-full rounded-[14px] bg-[#F4B400] px-4 py-3 text-[14px] font-bold text-white shadow-sm transition-colors hover:bg-[#E8A800] disabled:cursor-not-allowed disabled:opacity-60"
            >
              🏆 Mark goal as complete
            </button>
          )}

          <div className="mt-3 flex items-center gap-2.5">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => setEditorOpen(true)}
              leadingIcon={<Pencil size={14} aria-hidden />}
              className="flex-1 rounded-[14px]"
            >
              Edit goal
            </Button>
            <Button
              variant="destructive"
              size="lg"
              onClick={() => setConfirmDelete(true)}
              leadingIcon={<Trash2 size={14} aria-hidden />}
              className="flex-1 rounded-[14px]"
            >
              Delete goal
            </Button>
          </div>
        </div>
      )}

      <GoalEditor
        mode="edit"
        open={editorOpen}
        initial={{ title: goal.title, area: goal.area, plantType: goal.plantType }}
        onClose={() => setEditorOpen(false)}
        onSubmit={handleEditSubmit}
      />

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this goal?"
        message={`"${goal.title}" and all its tasks and routines will be removed. This frees the tile if the goal was planted.`}
        confirmLabel="Delete goal"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        busy={deleteGoal.isPending}
      />
    </article>
  );
}

function cardBorderColor({
  isSeed,
  isDead,
  expanded,
  healthState,
}: {
  isSeed: boolean;
  isDead: boolean;
  expanded: boolean;
  healthState: GoalDto["healthState"];
}): string {
  if (isDead) return "#BFBFBF";
  if (healthState === "critical") return "#F5C6CB";
  if (healthState === "ill") return "#FCD9B0";
  if (healthState === "wilting") return "#FFE7A6";
  if (expanded) return "#C8E6C9";
  if (isSeed) return "#FFE082";
  return "#EAEDE8";
}

export { GoalIcon };
