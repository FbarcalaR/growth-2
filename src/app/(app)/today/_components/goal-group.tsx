"use client";

import { useState } from "react";

import { useToggleTodayRoutine, useToggleTodayTask } from "@/client/hooks";
import { HealthWarning, TaskRow, RoutineRow } from "@/components/molecules";
import { isUnhealthyState } from "@/shared/health";
import type { TodayGroupDto } from "@/shared/schemas/today";

import { FlyingResource } from "./flying-resource";
import { GoalPlant } from "./goal-plant";

export function GoalGroup({ group }: { group: TodayGroupDto }) {
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

  const isUnhealthy = isUnhealthyState(group.goalHealthState);

  return (
    <li className="bg-surface-card border-surface-muted rounded-lg border-[1.5px] p-3">
      <div className="mb-2 flex items-center gap-2">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
          style={{
            background: `color-mix(in srgb, var(--color-area-${group.goalArea}) 13%, transparent)`,
          }}
        >
          <GoalPlant
            plantId={group.goalPlantType}
            stage={group.goalStage}
            healthState={group.goalHealthState}
            size={32}
          />
        </span>
        <span className="text-ink-strong flex-1 truncate text-sm leading-tight font-bold">
          {group.goalTitle}
        </span>
      </div>
      {isUnhealthy && (
        <div className="mb-2">
          <HealthWarning state={group.goalHealthState} overdueCount={group.goalOverdueCount} />
        </div>
      )}
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
