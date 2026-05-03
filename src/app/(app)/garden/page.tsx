"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { useCreateGoal, useGoals } from "@/client/hooks";
import { Button, Spinner } from "@/components/atoms";
import { PageHeader } from "@/components/molecules";
import { GoalCard, GoalDetailSheet, GoalEditor } from "@/components/organisms";
import type { GoalDto } from "@/shared/schemas/goal";

import { EmptyState } from "./_components/empty-state";
import { RoutinesEditor } from "./_components/routines-editor";
import { TasksEditor } from "./_components/tasks-editor";

export default function GardenPage() {
  const goals = useGoals();
  const createGoal = useCreateGoal();
  const [editorOpen, setEditorOpen] = useState(false);
  const [openGoalId, setOpenGoalId] = useState<string | null>(null);

  const all = useMemo(() => goals.data ?? [], [goals.data]);
  const { active, blooming } = useMemo(() => splitByBloom(all), [all]);
  const isEmpty = all.length === 0;
  const hasActive = active.length > 0;
  const hasBlooming = blooming.length > 0;
  const openGoal = openGoalId ? (all.find((g) => g.id === openGoalId) ?? null) : null;

  if (goals.isPending) {
    return (
      <section className="flex min-h-full items-center justify-center px-6 py-16">
        <Spinner size="lg" className="text-brand-muted" />
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-3 px-5 pt-5 pb-10">
      <PageHeader
        title="Life Goals"
        description="Each goal grows a plant in your garden"
        actions={
          <Button
            size="sm"
            onClick={() => setEditorOpen(true)}
            leadingIcon={<Plus size={14} aria-hidden />}
          >
            New
          </Button>
        }
      />

      {isEmpty && <EmptyState onCreate={() => setEditorOpen(true)} />}

      {hasActive && (
        <ul className="mt-2 flex flex-col gap-3" aria-label="Active goals">
          {active.map((goal) => (
            <li key={goal.id}>
              <GoalCard goal={goal} onClick={() => setOpenGoalId(goal.id)} />
            </li>
          ))}
        </ul>
      )}

      {hasBlooming && (
        <section className="mt-4">
          <h2 className="text-brand-muted mb-2 text-[11px] font-bold tracking-wide uppercase">
            Blooming &amp; Completed
          </h2>
          <ul className="flex flex-col gap-3">
            {blooming.map((goal) => (
              <li key={goal.id}>
                <GoalCard goal={goal} onClick={() => setOpenGoalId(goal.id)} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <GoalEditor
        mode="create"
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSubmit={async (input) => {
          await createGoal.mutateAsync(input);
        }}
      />

      {openGoal && (
        <GoalDetailSheet
          open={openGoalId !== null}
          goal={openGoal}
          onClose={() => setOpenGoalId(null)}
        >
          <TasksEditor goalId={openGoal.id} area={openGoal.area} tasks={openGoal.tasks} />
          <RoutinesEditor goalId={openGoal.id} area={openGoal.area} routines={openGoal.routines} />
        </GoalDetailSheet>
      )}
    </section>
  );
}

function splitByBloom(goals: GoalDto[]): { active: GoalDto[]; blooming: GoalDto[] } {
  const active: GoalDto[] = [];
  const blooming: GoalDto[] = [];
  for (const g of goals) {
    if (g.completed || (g.planted && g.stage >= 4)) blooming.push(g);
    else active.push(g);
  }
  return { active, blooming };
}
