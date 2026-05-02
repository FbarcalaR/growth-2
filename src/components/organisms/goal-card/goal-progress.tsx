import { ProgressBar } from "@/components/atoms";
import type { Area } from "@/shared/areas";

type GoalProgressProps = {
  area: Area;
  doneItems: number;
  totalItems: number;
  /** Used as part of the progressbar's accessible label. */
  goalTitle: string;
};

export function GoalProgress({ area, doneItems, totalItems, goalTitle }: GoalProgressProps) {
  const value = totalItems === 0 ? 0 : doneItems / totalItems;
  return (
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
        value={value}
        label={`${goalTitle} progress`}
        accent={`var(--color-area-${area})`}
        className="h-2"
      />
    </div>
  );
}
