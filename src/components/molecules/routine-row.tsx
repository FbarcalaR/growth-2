"use client";

import { Flame } from "lucide-react";

import { Checkbox } from "@/components/atoms";
import { cn } from "@/client/lib/cn";
import { type Area } from "@/shared/areas";
import { AreaChip } from "./area-chip";

type RoutineRowProps = {
  title: string;
  completedToday: boolean;
  streak: number;
  onToggle: (next: boolean) => void;
  area?: Area;
  className?: string;
};

export function RoutineRow({
  title,
  completedToday,
  streak,
  onToggle,
  area,
  className,
}: RoutineRowProps) {
  return (
    <div
      className={cn(
        "bg-surface-card border-surface-muted flex items-center gap-3 rounded-md border p-3",
        className,
      )}
    >
      <Checkbox
        checked={completedToday}
        onCheckedChange={onToggle}
        label={`Mark "${title}" done for today`}
        tint={area ? `var(--color-area-${area})` : undefined}
      />
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-sm font-semibold",
            completedToday ? "text-brand-muted" : "text-brand-700",
          )}
        >
          {title}
        </p>
        <p className="text-brand-muted flex items-center gap-1 text-xs">
          {streak > 0 ? (
            <>
              <Flame size={12} strokeWidth={2} aria-hidden />
              <span>{streak}-day streak</span>
            </>
          ) : (
            "Starts your streak today"
          )}
        </p>
      </div>
      {area && <AreaChip area={area} />}
    </div>
  );
}
