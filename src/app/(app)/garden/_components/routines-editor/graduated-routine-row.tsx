"use client";

import { Award, Trash2 } from "lucide-react";

import { useDeleteRoutine } from "@/client/hooks";
import type { RoutineDto } from "@/shared/schemas/goal";

type GraduatedRoutineRowProps = {
  goalId: string;
  routine: RoutineDto;
};

/**
 * Read-only row for a permanently-completed (graduated) routine. The streak
 * the user earned before graduating is preserved as a milestone label.
 * The only action available is delete — the routine has already left the
 * daily list, but the user might want to clear it from history.
 */
export function GraduatedRoutineRow({ goalId, routine }: GraduatedRoutineRowProps) {
  const deleteRoutine = useDeleteRoutine(goalId);
  return (
    <div className="bg-surface-card border-surface-muted flex items-center gap-3 rounded-md border p-3">
      <Award size={18} className="text-area-fun" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-brand-700 truncate text-sm font-semibold line-through">
          {routine.title}
        </p>
        <p className="text-brand-muted text-xs">Graduated · {routine.streak}-day streak kept</p>
      </div>
      <button
        type="button"
        aria-label={`Delete "${routine.title}"`}
        onClick={() => deleteRoutine.mutate(routine.id)}
        className="text-brand-muted hover:text-health-critical rounded-md p-1.5"
      >
        <Trash2 size={14} aria-hidden />
      </button>
    </div>
  );
}
