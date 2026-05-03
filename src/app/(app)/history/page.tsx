"use client";

import { Flame } from "lucide-react";
import { useMemo, useState } from "react";

import { useHistory } from "@/client/hooks";
import { Spinner } from "@/components/atoms";
import { PageHeader } from "@/components/molecules";

import { DayDetailPanel } from "./_components/day-detail-panel";
import { MonthGrid } from "./_components/month-grid";
import { MonthSummary } from "./_components/month-summary";

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function currentMonthIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function shiftMonth(month: string, delta: number): string {
  const [yearStr, monthStr] = month.split("-");
  const d = new Date(Number(yearStr), Number(monthStr) - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function HistoryPage() {
  const today = todayIso();
  const [month, setMonth] = useState(currentMonthIso());
  const [selectedDate, setSelectedDate] = useState<string | null>(today);
  const history = useHistory(month);

  const selectedDay = useMemo(() => {
    if (!history.data || !selectedDate) return null;
    return history.data.days.find((d) => d.date === selectedDate) ?? null;
  }, [history.data, selectedDate]);

  function jumpToToday() {
    const m = currentMonthIso();
    setMonth(m);
    setSelectedDate(today);
  }

  function changeMonth(delta: number) {
    const next = shiftMonth(month, delta);
    setMonth(next);
    // Snap selection: keep "today" if we land back on the current month, else
    // pick the 1st so the detail panel always has something to render.
    setSelectedDate(next === currentMonthIso() ? today : `${next}-01`);
  }

  return (
    <section className="flex flex-col gap-3 px-5 pt-5 pb-10">
      <PageHeader
        title="History"
        description="A calendar of completions and streaks."
        actions={
          history.data && history.data.summary.currentStreak > 0 ? (
            <span className="bg-accent-warm-bg border-accent-warm-border text-accent-warm rounded-pill inline-flex items-center gap-1 border px-2.5 py-1 text-[13px] font-bold tabular-nums">
              <Flame size={13} aria-hidden />
              {history.data.summary.currentStreak}-day streak
            </span>
          ) : null
        }
      />

      {history.isPending ? (
        <div className="flex justify-center py-10">
          <Spinner size="lg" className="text-brand-muted" />
        </div>
      ) : history.data ? (
        <>
          <MonthSummary summary={history.data.summary} />
          <MonthGrid
            month={history.data.month}
            todayIso={today}
            days={history.data.days}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onPrev={() => changeMonth(-1)}
            onNext={() => changeMonth(1)}
            onJumpToday={jumpToToday}
          />
          {selectedDay && <DayDetailPanel day={selectedDay} todayIso={today} />}
        </>
      ) : null}
    </section>
  );
}
