"use client";

import { BottomSheet } from "@/components/atoms";
import { AreaChip } from "@/components/molecules";
import type { GoalDto } from "@/shared/schemas/goal";
import { type Stage } from "@/shared/plants";

import { GoalIcon } from "../goal-card/goal-icon";

type PlantNowSheetProps = {
  open: boolean;
  goals: GoalDto[];
  onClose: () => void;
  /** Called when the user picks a seed to plant. */
  onPick: (goalId: string) => void;
};

/**
 * Bottom-sheet listing every unplanted goal as a tappable seed packet. Picking
 * one starts the planting state (parent stores `placingGoalId` + the user
 * taps a tile in the garden).
 */
export function PlantNowSheet({ open, goals, onClose, onPick }: PlantNowSheetProps) {
  const unplanted = goals.filter((g) => !g.planted && !g.completed);

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Pick a goal to plant"
      className="bg-surface-card"
    >
      <div className="px-4 pt-2 pb-9">
        <h2 className="text-ink-strong text-lg font-extrabold">Pick a goal to plant</h2>
        <p className="text-brand-muted mt-1 text-[13px]">
          Each seed grows the plant tied to its life area. Tap one and then tap a tilled tile in
          your garden to plant it.
        </p>

        {unplanted.length === 0 ? (
          <p className="text-brand-muted mt-6 text-center text-sm">
            All your goals are already planted. Create a new goal first.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {unplanted.map((goal) => (
              <li key={goal.id}>
                <button
                  type="button"
                  onClick={() => onPick(goal.id)}
                  className="bg-surface-card border-input-border hover:border-brand-700 flex w-full items-center gap-3 rounded-[14px] border-[1.5px] p-3 text-left transition-colors"
                >
                  <GoalIcon
                    area={goal.area}
                    plantType={goal.plantType}
                    stage={goal.stage as Stage}
                    healthState={goal.healthState}
                    isSeed
                    size={48}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-ink-strong truncate text-[14px] leading-tight font-bold">
                      {goal.title}
                    </p>
                    <div className="mt-1">
                      <AreaChip area={goal.area} />
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </BottomSheet>
  );
}
