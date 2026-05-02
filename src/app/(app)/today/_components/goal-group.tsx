"use client";

import { useState } from "react";

import { useToggleTodayRoutine, useToggleTodayTask } from "@/client/hooks";
import { TaskRow, RoutineRow } from "@/components/molecules";
import { AREA_META } from "@/shared/areas";
import type { TodayGroupDto } from "@/shared/schemas/today";

import { FlyingResource } from "./flying-resource";

export function GoalGroup({ group }: { group: TodayGroupDto }) {
  const meta = AREA_META[group.goalArea];
  const toggleTask = useToggleTodayTask();
  const toggleRoutine = useToggleTodayRoutine();
  // Map of item-id → counter; the counter changes per click so React remounts
  // the FlyingResource and replays its CSS animation. Falsy/missing means no
  // sprite is currently in flight for that row.
  const [flying, setFlying] = useState<Record<string, number>>({});

  const launch = (id: string) => setFlying((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  const land = (id: string) =>
    setFlying((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

  return (
    <li className="bg-surface-card border-surface-muted rounded-lg border-[1.5px] p-3">
      <div className="mb-2 flex items-center gap-2">
        <span
          aria-hidden
          className="flex h-7 w-7 items-center justify-center rounded-md text-base"
          style={{
            background: `color-mix(in srgb, var(--color-area-${group.goalArea}) 13%, transparent)`,
          }}
        >
          {meta.icon}
        </span>
        <span className="text-ink-strong flex-1 truncate text-sm leading-tight font-bold">
          {group.goalTitle}
        </span>
      </div>
      <ul className="flex flex-col gap-2">
        {group.tasks.map((task) => (
          <li key={task.id} className="relative">
            <TaskRow
              title={task.title}
              completed={task.completed}
              onToggle={(next) => {
                if (next) launch(task.id);
                toggleTask.mutate({ goalId: group.goalId, taskId: task.id, completed: next });
              }}
              area={group.goalArea}
              dueLabel={task.dueDate ?? undefined}
            />
            {flying[task.id] !== undefined && (
              <FlyingResource key={flying[task.id]} onDone={() => land(task.id)} />
            )}
          </li>
        ))}
        {group.routines.map((routine) => (
          <li key={routine.id} className="relative">
            <RoutineRow
              title={routine.title}
              completedToday={routine.completedToday}
              streak={routine.streak}
              onToggle={(next) => {
                if (next) launch(routine.id);
                toggleRoutine.mutate({
                  goalId: group.goalId,
                  routineId: routine.id,
                  completedToday: next,
                });
              }}
              area={group.goalArea}
            />
            {flying[routine.id] !== undefined && (
              <FlyingResource key={flying[routine.id]} onDone={() => land(routine.id)} />
            )}
          </li>
        ))}
      </ul>
    </li>
  );
}
