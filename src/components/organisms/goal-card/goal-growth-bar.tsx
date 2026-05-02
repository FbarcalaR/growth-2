import { STAGE_NAMES, type Stage } from "@/shared/plants";
import type { GoalDto } from "@/shared/schemas/goal";

type GoalGrowthBarProps = {
  goal: GoalDto;
};

/**
 * "Growing → Sprout" header + thin progress bar in the area's accent colour.
 *
 * Resource-level progress (e.g. "💧 4/8 Water") is deferred — it needs the
 * server's `PLANT_DEFS` requirements exposed to the client. Until then we
 * approximate progress as completed-items / total-items (tasks + routines),
 * which still gives a usable "you're getting close" signal on the card.
 */
export function GoalGrowthBar({ goal }: GoalGrowthBarProps) {
  const totalItems = goal.tasks.length + goal.routines.length;
  const doneItems =
    goal.tasks.filter((t) => t.completed).length +
    goal.routines.filter((r) => r.completedToday).length;
  const pct = totalItems === 0 ? 0 : Math.min(1, doneItems / totalItems);
  const nextStage = (goal.stage + 1) as Stage;
  const nextLabel = goal.stage >= 4 ? "Blooming" : `Growing → ${STAGE_NAMES[nextStage]}`;

  return (
    <div className="mt-2.5">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-brand-muted text-[10px]">{nextLabel}</span>
        <span className="text-brand-muted text-[10px] font-bold tabular-nums">
          {doneItems}/{totalItems}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={`${goal.title} growth`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct * 100)}
        className="h-[5px] w-full overflow-hidden rounded-[3px] bg-[#F0F4EC]"
      >
        <div
          className="h-full rounded-[3px] transition-[width] duration-500"
          style={{
            width: `${pct * 100}%`,
            background: `var(--color-area-${goal.area})`,
          }}
        />
      </div>
    </div>
  );
}

/** Visual replacement when the plant has reached full bloom. */
export function FullyBloomingBanner() {
  return (
    <div className="mt-2.5 flex items-center gap-1.5 rounded-[10px] bg-[#F1F8F1] px-2.5 py-1.5">
      <span aria-hidden>✨</span>
      <span className="text-brand-700 text-xs font-semibold">Your plant is fully blooming!</span>
    </div>
  );
}

/** Banner shown in place of the growth bar when the plant has died. */
export function DeadPlantBanner() {
  return (
    <div className="mt-2.5 flex items-center gap-2 rounded-[10px] border border-[#C8C8C8] bg-[#EAEAEA] px-2.5 py-2">
      <span aria-hidden className="text-sm">
        💀
      </span>
      <span className="flex-1 text-[11px] leading-tight font-bold text-[#3F3F3F]">
        Your plant withered from neglect.
      </span>
      <span className="text-brand-muted text-[10px] font-semibold">Tap to choose</span>
    </div>
  );
}
