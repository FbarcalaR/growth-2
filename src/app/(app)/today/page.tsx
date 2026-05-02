"use client";

import { useSession, useToday } from "@/client/hooks";
import { Spinner } from "@/components/atoms";

import { EmptyState } from "./_components/empty-state";
import { GoalGroup } from "./_components/goal-group";
import { ProgressSummary } from "./_components/progress-summary";
import { TodayHeader } from "./_components/today-header";

export default function TodayPage() {
  const { user } = useSession();
  const today = useToday();

  if (today.isPending || !user) {
    return (
      <section className="flex min-h-full items-center justify-center px-6 py-16">
        <Spinner size="lg" className="text-brand-muted" />
      </section>
    );
  }

  const groups = today.data?.groups ?? [];
  const allItems = groups.flatMap((g) => [
    ...g.tasks.map((t) => ({ done: t.completed })),
    ...g.routines.map((r) => ({ done: r.completedToday })),
  ]);
  const totalAll = allItems.length;
  const totalDone = allItems.filter((i) => i.done).length;

  return (
    <section className="flex flex-col gap-3 px-5 pt-5 pb-10">
      <TodayHeader userName={user.name} shopCoins={user.shopCoins} streak={user.streak} />

      {totalAll > 0 && <ProgressSummary totalDone={totalDone} totalAll={totalAll} />}

      {totalAll === 0 ? (
        <EmptyState />
      ) : (
        <ul className="mt-2 flex flex-col gap-3" aria-label="Today's items grouped by goal">
          {groups.map((group) => (
            <GoalGroup key={group.goalId} group={group} />
          ))}
        </ul>
      )}
    </section>
  );
}
