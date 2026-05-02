"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { useCreateGoal, useGoals } from "@/client/hooks";
import { Button, Spinner } from "@/components/atoms";
import { GoalCard, GoalEditor } from "@/components/organisms";
import type { GoalDto } from "@/shared/schemas/goal";

import { EmptyState } from "./_components/empty-state";

export default function PlansPage() {
  const goals = useGoals();
  const createGoal = useCreateGoal();
  const [editorOpen, setEditorOpen] = useState(false);

  const { active, blooming } = useMemo(() => splitByBloom(goals.data ?? []), [goals.data]);
  const all = goals.data ?? [];

  if (goals.isPending) {
    return (
      <section className="flex min-h-full items-center justify-center px-6 py-16">
        <Spinner size="lg" className="text-brand-muted" />
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-3 px-5 pt-5 pb-10">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-ink-strong text-[22px] leading-tight font-extrabold">Life Goals</h1>
          <p className="text-brand-muted text-xs">Each goal grows a plant in your garden</p>
        </div>
        <Button
          size="sm"
          onClick={() => setEditorOpen(true)}
          leadingIcon={<Plus size={14} aria-hidden />}
        >
          New
        </Button>
      </header>

      {all.length === 0 ? (
        <EmptyState onCreate={() => setEditorOpen(true)} />
      ) : (
        <>
          {active.length > 0 && (
            <ul className="mt-2 flex flex-col gap-3" aria-label="Active goals">
              {active.map((goal) => (
                <li key={goal.id}>
                  <GoalCard goal={goal} />
                </li>
              ))}
            </ul>
          )}
          {blooming.length > 0 && (
            <section className="mt-4">
              <h2 className="text-brand-muted mb-2 text-[11px] font-bold tracking-wide uppercase">
                Blooming &amp; Completed
              </h2>
              <ul className="flex flex-col gap-3">
                {blooming.map((goal) => (
                  <li key={goal.id}>
                    <GoalCard goal={goal} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      <GoalEditor
        mode="create"
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSubmit={async (input) => {
          await createGoal.mutateAsync(input);
        }}
      />
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
