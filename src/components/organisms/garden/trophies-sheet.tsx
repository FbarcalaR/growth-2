"use client";

import { Trophy } from "lucide-react";

import { BottomSheet } from "@/components/atoms";
import type { GardenDto } from "@/shared/schemas/garden";
import type { GoalDto } from "@/shared/schemas/goal";
import { type Stage } from "@/shared/plants";

import { GoalIcon } from "../goal-card/goal-icon";

type TrophiesSheetProps = {
  open: boolean;
  goals: GoalDto[];
  garden: GardenDto;
  onClose: () => void;
};

/**
 * Bottom sheet listing every trophy the user has earned. Trophies are minted as
 * `trophy_${goalId}` in `garden.owned` when a goal is marked complete (see
 * `goal-service.ts > completeGoal`). Each row shows the original goal's plant
 * sprite and title in a warm-gold card.
 */
export function TrophiesSheet({ open, goals, garden, onClose }: TrophiesSheetProps) {
  const trophyIds = garden.owned.filter((id) => id.startsWith("trophy_"));
  const goalsById = new Map(goals.map((g) => [g.id, g]));
  const trophies = trophyIds
    .map((id) => ({ id, goal: goalsById.get(id.slice("trophy_".length)) }))
    .filter((t): t is { id: string; goal: GoalDto } => Boolean(t.goal));

  return (
    <BottomSheet open={open} onClose={onClose} title="Trophies" className="bg-surface-card">
      <div className="px-4 pt-2 pb-9">
        <div className="flex items-center gap-2">
          <span className="bg-accent-warm-bg text-accent-warm flex h-9 w-9 items-center justify-center rounded-full">
            <Trophy size={18} aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="text-ink-strong text-lg font-extrabold">Trophies</h2>
            <p className="text-brand-muted text-[12px]">
              {trophies.length} unlocked · earn one for every goal you complete.
            </p>
          </div>
        </div>

        {trophies.length === 0 ? (
          <p className="text-brand-muted mt-6 rounded-[14px] border border-dashed border-[#E0DCC8] bg-[#FFFCF0] px-4 py-8 text-center text-sm">
            Complete a goal to earn your first trophy.
          </p>
        ) : (
          <ul className="mt-4 grid grid-cols-2 gap-2.5">
            {trophies.map(({ id, goal }) => (
              <li
                key={id}
                className="border-accent-warm-border bg-accent-warm-bg flex flex-col items-center gap-2 rounded-[14px] border-[1.5px] px-2.5 py-3 text-center"
              >
                <GoalIcon
                  area={goal.area}
                  plantType={goal.plantType}
                  stage={4 satisfies Stage}
                  healthState="healthy"
                  size={48}
                />
                <p className="text-ink-strong line-clamp-2 text-[12px] leading-tight font-bold">
                  {goal.title}
                </p>
                <span className="text-accent-warm inline-flex items-center gap-1 text-[10px] font-bold tracking-wide uppercase">
                  <Trophy size={10} aria-hidden />
                  Trophy
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </BottomSheet>
  );
}
