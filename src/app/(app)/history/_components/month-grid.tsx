import { ChevronLeft, ChevronRight } from "lucide-react";

import type { HistoryDayDto } from "@/shared/schemas/history";

import { DayBubble } from "./day-bubble";

type MonthGridProps = {
  /** "YYYY-MM" — the month being viewed. */
  month: string;
  /** Local YYYY-MM-DD for "today" — controls past/today/future visuals. */
  todayIso: string;
  /** Days from the API. Each day has rolled-up `completed/missed/planned` lists. */
  days: HistoryDayDto[];
  selectedDate: string | null;
  onSelectDate: (iso: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onJumpToday: () => void;
};

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

/**
 * Calendar grid: month-nav header (← Month Year → · Today), Mon-first weekday
 * row, then a 7-column grid of `<DayBubble>`s padded with empty cells so the
 * 1st of the month sits under its weekday column. Mirrors the prototype's
 * white-card calendar.
 */
export function MonthGrid({
  month,
  todayIso,
  days,
  selectedDate,
  onSelectDate,
  onPrev,
  onNext,
  onJumpToday,
}: MonthGridProps) {
  const [yearStr, monthStr] = month.split("-");
  const year = Number(yearStr);
  const monthIndex = Number(monthStr) - 1;
  const monthLabel = new Date(year, monthIndex, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  // Mon-first leading-pad: the 1st of the month sits under its weekday column.
  const firstWeekday = mondayFirstWeekday(`${month}-01`);
  const cells: Array<HistoryDayDto | null> = [];
  for (let i = 0; i < firstWeekday; i += 1) cells.push(null);
  for (const day of days) cells.push(day);

  return (
    <div className="bg-surface-card border-surface-muted rounded-[18px] border-[1.5px] p-3">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onPrev}
          aria-label="Previous month"
          className="text-brand-muted hover:text-brand-700 inline-flex h-8 w-8 items-center justify-center rounded-full"
        >
          <ChevronLeft size={18} aria-hidden />
        </button>
        <div className="flex flex-col items-center">
          <p className="text-ink-strong text-[14px] font-extrabold">{monthLabel}</p>
          <button
            type="button"
            onClick={onJumpToday}
            className="text-brand-700 mt-0.5 text-[10px] font-bold tracking-wide uppercase hover:underline"
          >
            Today
          </button>
        </div>
        <button
          type="button"
          onClick={onNext}
          aria-label="Next month"
          className="text-brand-muted hover:text-brand-700 inline-flex h-8 w-8 items-center justify-center rounded-full"
        >
          <ChevronRight size={18} aria-hidden />
        </button>
      </div>

      <div className="text-brand-muted mb-1.5 grid grid-cols-7 gap-1 text-center text-[10px] font-bold tracking-wide">
        {WEEKDAYS.map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 place-items-center gap-y-2">
        {cells.map((day, i) =>
          day ? (
            <DayBubble
              key={day.date}
              day={day}
              todayIso={todayIso}
              selected={selectedDate === day.date}
              onClick={() => onSelectDate(day.date)}
            />
          ) : (
            <span key={`pad-${i}`} className="block" style={{ width: 38, height: 38 }} />
          ),
        )}
      </div>
    </div>
  );
}

function mondayFirstWeekday(iso: string): number {
  const d = new Date(`${iso}T00:00:00`);
  return (d.getDay() + 6) % 7;
}
