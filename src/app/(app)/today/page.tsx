"use client";

import { Coins, Flame, Sprout } from "lucide-react";

import { useSession, useToday } from "@/client/hooks";
import { Spinner } from "@/components/atoms";
import { TaskRow, RoutineRow } from "@/components/molecules";
import { AREA_META } from "@/shared/areas";
import type { TodayGroupDto } from "@/shared/schemas/today";

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
      <Header userName={user.name} shopCoins={user.shopCoins} streak={user.streak} />

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

type HeaderProps = { userName: string; shopCoins: number; streak: number };

function Header({ userName, shopCoins, streak }: HeaderProps) {
  const greeting = greetingForNow(new Date());
  return (
    <header className="flex items-start justify-between">
      <div>
        <p className="text-brand-muted text-xs font-medium">{greeting},</p>
        <h1 className="text-ink-strong text-[22px] leading-tight font-extrabold">
          {userName} <span aria-hidden>🌿</span>
        </h1>
      </div>
      <div className="flex flex-col items-end gap-1">
        <Pill tone="coins" icon={<Coins size={13} aria-hidden />} value={shopCoins} suffix={null} />
        <Pill tone="streak" icon={<Flame size={12} aria-hidden />} value={streak} suffix="d" />
      </div>
    </header>
  );
}

function Pill({
  tone,
  icon,
  value,
  suffix,
}: {
  tone: "coins" | "streak";
  icon: React.ReactNode;
  value: number;
  suffix: string | null;
}) {
  // Coins + streak share an accent palette in the prototype (warm gold/orange);
  // expressed inline because it's specific to these two pills and not part of
  // the broader token system. If a third surface adopts the same look we'll
  // promote it to a `--color-accent-*` group.
  const className =
    tone === "coins"
      ? "bg-[#FFF8EC] border-[#FFE0B2] text-[#F0A500]"
      : "bg-[#FFF3E0] border-[#FFE0B2] text-[#F0A500]";
  return (
    <span
      className={`rounded-pill inline-flex items-center gap-1 border px-2.5 py-1 text-[13px] font-bold tabular-nums ${className}`}
    >
      {icon}
      <span>
        {value}
        {suffix ?? ""}
      </span>
    </span>
  );
}

function ProgressSummary({ totalDone, totalAll }: { totalDone: number; totalAll: number }) {
  const pct = totalAll === 0 ? 0 : Math.round((totalDone / totalAll) * 100);
  return (
    <div className="bg-surface-card border-surface-muted rounded-lg border-[1.5px] px-4 py-3">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-ink-strong text-[13px] font-semibold">Today&rsquo;s Plan</span>
        <span className="text-brand-muted text-xs tabular-nums">
          {totalDone}/{totalAll} complete
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        className="bg-res-nutrients-bg rounded-pill h-[7px] overflow-hidden"
      >
        <div
          className="rounded-pill h-full transition-[width] duration-500"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, var(--color-brand-700), var(--color-brand-500))",
          }}
        />
      </div>
    </div>
  );
}

function GoalGroup({ group }: { group: TodayGroupDto }) {
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
              onToggle={() => undefined /* Story 2.2 wires this */}
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
              onToggle={() => undefined /* Story 2.2 wires this */}
              area={group.goalArea}
            />
          </li>
        ))}
      </ul>
    </li>
  );
}

function EmptyState() {
  return (
    <div className="bg-surface-card border-surface-muted mt-2 flex flex-col items-center gap-2 rounded-lg border-[1.5px] px-6 py-12 text-center">
      <Sprout size={36} className="text-brand-muted" aria-hidden />
      <p className="text-ink-strong text-sm font-bold">Nothing for today</p>
      <p className="text-brand-muted max-w-xs text-xs">
        When you have tasks or routines due today, they&rsquo;ll show up here.
      </p>
    </div>
  );
}

function greetingForNow(now: Date): string {
  const hour = now.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
