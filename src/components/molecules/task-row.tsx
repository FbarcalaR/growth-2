"use client";

import { Checkbox } from "@/components/atoms";
import { cn } from "@/client/lib/cn";
import { type Area } from "@/shared/areas";
import { AreaChip } from "./area-chip";

type TaskRowProps = {
  title: string;
  completed: boolean;
  onToggle: (next: boolean) => void;
  area?: Area;
  /** Human-readable due-date label (e.g. "Today", "Tomorrow", "3 days overdue"). */
  dueLabel?: string;
  /** Visually emphasises overdue state when due-date is in the past. */
  overdue?: boolean;
  className?: string;
};

export function TaskRow({
  title,
  completed,
  onToggle,
  area,
  dueLabel,
  overdue,
  className,
}: TaskRowProps) {
  return (
    <div
      className={cn(
        "bg-surface-card border-surface-muted flex items-center gap-3 rounded-md border p-3",
        className,
      )}
    >
      <Checkbox
        checked={completed}
        onCheckedChange={onToggle}
        label={`Mark "${title}" ${completed ? "incomplete" : "complete"}`}
        tint={area ? `var(--color-area-${area})` : undefined}
      />
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-sm font-semibold",
            completed ? "text-brand-muted line-through" : "text-brand-700",
          )}
        >
          {title}
        </p>
        {dueLabel && (
          <p className={cn("text-xs", overdue ? "text-health-critical" : "text-brand-muted")}>
            {dueLabel}
          </p>
        )}
      </div>
      {area && <AreaChip area={area} />}
    </div>
  );
}
