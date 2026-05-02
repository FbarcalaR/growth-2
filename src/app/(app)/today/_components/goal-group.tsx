import { TaskRow, RoutineRow } from "@/components/molecules";
import { AREA_META } from "@/shared/areas";
import type { TodayGroupDto } from "@/shared/schemas/today";

export function GoalGroup({ group }: { group: TodayGroupDto }) {
  const meta = AREA_META[group.goalArea];
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
          <li key={task.id}>
            <TaskRow
              title={task.title}
              completed={task.completed}
              onToggle={() => undefined}
              area={group.goalArea}
              dueLabel={task.dueDate ?? undefined}
            />
          </li>
        ))}
        {group.routines.map((routine) => (
          <li key={routine.id}>
            <RoutineRow
              title={routine.title}
              completedToday={routine.completedToday}
              streak={routine.streak}
              onToggle={() => undefined}
              area={group.goalArea}
            />
          </li>
        ))}
      </ul>
    </li>
  );
}
