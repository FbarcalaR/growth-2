import { Repeat } from "lucide-react";

import { AreaChip } from "@/components/molecules";
import type { HistoryDayDto, HistoryItemDto } from "@/shared/schemas/history";

type DayDetailPanelProps = {
  day: HistoryDayDto;
  todayIso: string;
};

/**
 * Inline detail panel that opens below the calendar when a day is tapped.
 * Renders three optional sections (Completed / Missed / Planned) and a
 * summary line at the top. Mirrors the prototype's `DayDetailPanel` layout.
 */
export function DayDetailPanel({ day, todayIso }: DayDetailPanelProps) {
  const isToday = day.date === todayIso;
  const isFuture = day.date > todayIso;

  const totalScheduled = day.completed.length + day.missed.length;
  const totalCompleted = day.completed.length;
  const totalPlanned = day.planned.length;
  const pct = totalScheduled === 0 ? 0 : totalCompleted / totalScheduled;
  const pctRound = Math.round(pct * 100);

  const dateLabel = new Date(`${day.date}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const summary = (() => {
    if (isFuture) {
      if (totalPlanned === 0) return "Nothing scheduled yet";
      return `${totalPlanned} task${totalPlanned === 1 ? "" : "s"} planned`;
    }
    if (totalScheduled === 0 && totalPlanned === 0) return "A quiet day — nothing was scheduled";
    if (isToday) {
      const denom = totalScheduled + totalPlanned;
      const pctNow = denom === 0 ? 0 : totalCompleted / denom;
      return `${totalCompleted} of ${denom} done so far · ${Math.round(pctNow * 100)}%`;
    }
    if (pct >= 0.999) return `Perfect day — all ${totalScheduled} done`;
    if (pct <= 0.001) return `${totalScheduled} task${totalScheduled === 1 ? "" : "s"} missed`;
    return `${totalCompleted} of ${totalScheduled} done · ${pctRound}%`;
  })();

  return (
    <div className="bg-surface-card border-surface-muted mt-3 rounded-[18px] border-[1.5px] p-4">
      <header className="mb-3">
        <p className="text-brand-muted text-[10px] font-bold tracking-wide uppercase">
          {isToday ? "Today" : isFuture ? "Upcoming" : "Past"}
        </p>
        <p className="text-ink-strong text-[17px] leading-tight font-extrabold">{dateLabel}</p>
        <p className="text-brand-700 mt-1 text-[12px] font-semibold">{summary}</p>
      </header>

      {isFuture ? (
        <DetailSection title="Planned" tone="planned" items={day.planned} />
      ) : (
        <>
          {day.completed.length > 0 && (
            <DetailSection title="Completed" tone="done" items={day.completed} />
          )}
          {day.missed.length > 0 && !isToday && (
            <DetailSection title="Missed" tone="missed" items={day.missed} />
          )}
          {isToday && day.planned.length > 0 && (
            <DetailSection title="Still to do" tone="planned" items={day.planned} />
          )}
          {totalScheduled === 0 && totalPlanned === 0 && (
            <p className="text-brand-muted py-2 text-center text-[13px]">Nothing was scheduled.</p>
          )}
        </>
      )}
    </div>
  );
}

type Tone = "done" | "missed" | "planned";

const TONE_TITLE: Record<Tone, string> = {
  done: "text-brand-700",
  missed: "text-health-critical",
  planned: "text-info",
};

const TONE_BULLET: Record<Tone, string> = {
  done: "bg-success-soft text-white",
  missed: "bg-health-critical-bg text-health-critical",
  planned: "bg-info-soft text-info",
};

function DetailSection({
  title,
  tone,
  items,
}: {
  title: string;
  tone: Tone;
  items: HistoryItemDto[];
}) {
  if (items.length === 0) return null;

  return (
    <section className="mt-2">
      <p className="text-brand-muted mb-1.5 flex items-center gap-1.5 text-[11px] font-bold tracking-wide uppercase">
        <span className={TONE_TITLE[tone]}>{title}</span>
        <span>· {items.length}</span>
      </p>
      <ul className="flex flex-col gap-1.5">
        {items.map((item, i) => (
          <li
            key={`${item.kind}:${item.itemId ?? item.goalId}:${i}`}
            className="flex items-center gap-2.5 rounded-[10px] border border-[#F0F4EC] bg-[#FAFCF8] px-2.5 py-2"
          >
            <span
              aria-hidden
              className={`inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${TONE_BULLET[tone]}`}
            >
              {tone === "done" ? "✓" : tone === "missed" ? "✕" : "○"}
            </span>
            <div className="min-w-0 flex-1">
              <p
                className={`truncate text-[13px] font-semibold ${
                  tone === "done" ? "text-ink-strong/70 line-through" : "text-ink-strong"
                }`}
              >
                {item.title}
              </p>
              <p className="text-brand-muted mt-0.5 truncate text-[10px] font-semibold">
                {item.kind === "routine" && (
                  <Repeat size={9} aria-hidden className="mr-1 inline-block align-middle" />
                )}
                {item.kind === "goal" ? "Goal completed" : item.goalTitle}
              </p>
            </div>
            <AreaChip area={item.goalArea} className="shrink-0" />
          </li>
        ))}
      </ul>
    </section>
  );
}
