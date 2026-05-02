"use client";

import type { Area } from "@/shared/areas";
import type { RoutineDto } from "@/shared/schemas/goal";

import { AddRoutineRow } from "./add-routine-row";
import { RoutineRowItem } from "./routine-row-item";

type RoutinesEditorProps = {
  goalId: string;
  area: Area;
  routines: RoutineDto[];
};

/**
 * All routines for one goal: list + inline add form. Each row owns its own
 * edit / delete / graduate state. The toggle goes through the same
 * `useUpdateRoutine` PATCH endpoint that Today uses.
 */
export function RoutinesEditor({ goalId, area, routines }: RoutinesEditorProps) {
  return (
    <section aria-label="Routines" className="mt-5 space-y-3">
      <h3 className="text-ink-strong text-xs font-bold tracking-wide uppercase">
        Routines ({routines.length})
      </h3>
      <ul className="flex flex-col gap-2">
        {routines.map((routine) => (
          <li key={routine.id}>
            <RoutineRowItem goalId={goalId} area={area} routine={routine} />
          </li>
        ))}
      </ul>
      <AddRoutineRow goalId={goalId} />
    </section>
  );
}
