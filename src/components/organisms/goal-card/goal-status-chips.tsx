import { AREA_META } from "@/shared/areas";
import { STAGE_COLORS, STAGE_NAMES, type Stage } from "@/shared/plants";
import type { GoalDto } from "@/shared/schemas/goal";

type GoalStatusChipsProps = {
  goal: GoalDto;
  /** Number of items (tasks + routines) finished today; renders inline `done/total` if > 0. */
  doneItems?: number;
  totalItems?: number;
};

/**
 * Small chips under a goal's title: area, then either Seed / Dead / stage,
 * plus an optional `X/Y` progress count when items exist.
 */
export function GoalStatusChips({ goal, doneItems = 0, totalItems = 0 }: GoalStatusChipsProps) {
  const meta = AREA_META[goal.area];
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Chip
        text={`${meta.icon} ${meta.label}`}
        color={`var(--color-area-${goal.area})`}
        background={`color-mix(in srgb, var(--color-area-${goal.area}) 18%, white)`}
      />
      {goal.healthState === "dead" ? (
        <Chip text="💀 Dead" color="#5A5A5A" background="#EAEAEA" borderColor="#C8C8C8" />
      ) : !goal.planted ? (
        <Chip text="🌰 Seed" color="#F57F17" background="#FFF3E0" />
      ) : (
        <Chip
          text={STAGE_NAMES[goal.stage as Stage]}
          color={STAGE_COLORS[goal.stage as Stage]}
          background={`color-mix(in srgb, ${STAGE_COLORS[goal.stage as Stage]} 22%, white)`}
        />
      )}
      {totalItems > 0 && (
        <span className="text-brand-muted text-[10px]">
          {doneItems}/{totalItems}
        </span>
      )}
    </div>
  );
}

function Chip({
  text,
  color,
  background,
  borderColor,
}: {
  text: string;
  color: string;
  background: string;
  borderColor?: string;
}) {
  return (
    <span
      className="rounded-[5px] px-1.5 py-[2px] text-[10px] font-bold"
      style={{
        color,
        background,
        ...(borderColor ? { border: `1px solid ${borderColor}` } : null),
      }}
    >
      {text}
    </span>
  );
}
