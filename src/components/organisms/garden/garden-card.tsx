"use client";

import { Coins } from "lucide-react";

import { useSession } from "@/client/hooks";
import type { GardenDto } from "@/shared/schemas/garden";
import type { GoalDto } from "@/shared/schemas/goal";

import type { DecoId } from "./deco-sprite";
import { IsometricGarden } from "./isometric-garden";

type GardenCardProps = {
  goals: GoalDto[];
  garden: GardenDto;
  placingGoalId?: string | null;
  placingDeco?: DecoId | null;
  onTilePlantClick?: (goalId: string) => void;
  onTileTap?: (col: number, row: number, kind: "plant" | "deco" | "empty") => void;
  selectedGoalId?: string | null;
  /** Optional cancel button shown while the user is placing something. */
  onCancelPlacing?: () => void;
};

/**
 * Card wrapper around `<IsometricGarden>` matching the prototype: white card
 * with rounded corners, header showing "My Garden" + plant/deco count, and a
 * coin-balance pill on the right. Renders the iso garden inside.
 */
export function GardenCard({
  goals,
  garden,
  placingGoalId = null,
  placingDeco = null,
  onTilePlantClick,
  onTileTap,
  selectedGoalId = null,
  onCancelPlacing,
}: GardenCardProps) {
  const { user } = useSession();
  const plantedCount = goals.filter((g) => g.planted).length;
  const decoCount = garden.decoGrid.flat().filter((t) => t?.kind === "deco").length;
  const placing = Boolean(placingGoalId || placingDeco);

  return (
    <div className="bg-surface-card border-surface-muted overflow-hidden rounded-[20px] border-[1.5px]">
      <div className="flex items-center justify-between px-3.5 pt-3.5 pb-2.5">
        <div>
          <p className="text-ink-strong text-[17px] font-extrabold">My Garden</p>
          <p className="text-brand-muted text-[11px]">
            {plantedCount} plant{plantedCount === 1 ? "" : "s"} · {decoCount} decoration
            {decoCount === 1 ? "" : "s"}
          </p>
        </div>
        <span className="rounded-pill bg-accent-warm-bg border-accent-warm-border text-accent-warm inline-flex items-center gap-1 border px-2.5 py-1 text-[13px] font-bold tabular-nums">
          <Coins size={13} aria-hidden />
          {user?.shopCoins ?? 0}
        </span>
      </div>

      {placing && (
        <div className="bg-accent-warm-bg border-accent-warm-border flex items-center justify-between border-y px-3.5 py-2 text-[12px] font-semibold text-[#7A4F2C]">
          <span>
            {placingGoalId ? "Tap a tilled tile to plant your goal." : "Tap a grass tile to place."}
          </span>
          {onCancelPlacing && (
            <button
              type="button"
              onClick={onCancelPlacing}
              className="text-accent-warm rounded-md px-2 py-0.5 text-[11px] font-bold underline-offset-2 hover:underline"
            >
              Cancel
            </button>
          )}
        </div>
      )}

      <IsometricGarden
        goals={goals}
        garden={garden}
        placingGoalId={placingGoalId}
        placingDeco={placingDeco}
        onTilePlantClick={onTilePlantClick}
        onTileTap={onTileTap}
        selectedGoalId={selectedGoalId}
      />
    </div>
  );
}
