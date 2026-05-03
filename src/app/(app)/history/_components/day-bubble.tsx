import type { HistoryDayDto } from "@/shared/schemas/history";

type DayBubbleProps = {
  day: HistoryDayDto;
  /** Local YYYY-MM-DD for "today" — controls past/today/future visuals. */
  todayIso: string;
  selected: boolean;
  onClick: () => void;
};

const SIZE = 38;
const STROKE = 3;
const RADIUS = (SIZE - STROKE) / 2;
const CENTER = SIZE / 2;
const CIRC = 2 * Math.PI * RADIUS;

const GREEN = "#3A6647";
const GREEN_BG = "#E8F5E9";
const GREEN_LT = "#A5D6A7";
const RED = "#C9484E";
const RED_BG = "#FBE3E5";
const NEUTRAL = "#C8D6C8";
const TEXT = "#1C2B20";

/**
 * One calendar cell. Visual state derives from `(date vs today, completed,
 * missed, planned)`:
 *
 *   PAST + scheduled === 0           → small neutral dot (a quiet day)
 *   PAST + perfect (100%)            → solid green + check
 *   PAST + 0%                        → red ring on red-tinted bg + day number
 *   PAST + partial                   → green ring (arc fill) + day number
 *   TODAY                            → green ring with progress arc + bold day number
 *   FUTURE                           → dashed outline + planned-count badge
 */
export function DayBubble({ day, todayIso, selected, onClick }: DayBubbleProps) {
  const dayNum = Number(day.date.slice(8));
  const isPast = day.date < todayIso;
  const isToday = day.date === todayIso;
  const isFuture = day.date > todayIso;

  const totalScheduled = day.completed.length + day.missed.length;
  const totalPlanned = day.planned.length;
  const totalCompleted = day.completed.length;

  const pct =
    totalScheduled === 0
      ? 0
      : isToday
        ? totalCompleted / Math.max(1, totalScheduled + totalPlanned)
        : totalCompleted / totalScheduled;

  const isPerfect = isPast && totalScheduled > 0 && totalCompleted === totalScheduled;
  const isSkipped = isPast && totalScheduled > 0 && totalCompleted === 0;
  const isPartial = isPast && totalScheduled > 0 && !isPerfect && !isSkipped;
  const isEmptyPast = isPast && totalScheduled === 0;

  const dashOffset = CIRC * (1 - pct);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Open ${day.date}`}
      aria-pressed={selected}
      className={`relative inline-flex shrink-0 items-center justify-center transition-shadow ${
        selected ? "ring-brand-700 rounded-full ring-2 ring-offset-2" : ""
      }`}
      style={{ width: SIZE, height: SIZE }}
    >
      {/* Empty past — small neutral dot in the centre */}
      {isEmptyPast ? (
        <span
          aria-hidden
          className="rounded-full"
          style={{ width: 6, height: 6, background: NEUTRAL }}
        />
      ) : (
        <svg width={SIZE} height={SIZE} aria-hidden style={{ position: "absolute", inset: 0 }}>
          {isPerfect ? (
            <circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill={GREEN}
              stroke={GREEN}
              strokeWidth={STROKE}
            />
          ) : isSkipped ? (
            <circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill={RED_BG}
              stroke={RED}
              strokeWidth={STROKE}
            />
          ) : isToday ? (
            <>
              <circle
                cx={CENTER}
                cy={CENTER}
                r={RADIUS}
                fill={GREEN_BG}
                stroke={GREEN_LT}
                strokeWidth={STROKE}
              />
              {pct > 0 && (
                <circle
                  cx={CENTER}
                  cy={CENTER}
                  r={RADIUS}
                  fill="none"
                  stroke={GREEN}
                  strokeWidth={STROKE}
                  strokeDasharray={CIRC}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${CENTER} ${CENTER})`}
                />
              )}
            </>
          ) : isPartial ? (
            <>
              <circle
                cx={CENTER}
                cy={CENTER}
                r={RADIUS}
                fill="#fff"
                stroke={GREEN_BG}
                strokeWidth={STROKE}
              />
              <circle
                cx={CENTER}
                cy={CENTER}
                r={RADIUS}
                fill="none"
                stroke={GREEN_LT}
                strokeWidth={STROKE}
                strokeDasharray={CIRC}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${CENTER} ${CENTER})`}
              />
            </>
          ) : isFuture ? (
            <circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="#fff"
              stroke={NEUTRAL}
              strokeWidth="1.5"
              strokeDasharray="2 2.5"
            />
          ) : null}
        </svg>
      )}

      {/* Foreground content */}
      {isPerfect ? (
        <svg
          width="14"
          height="11"
          viewBox="0 0 14 11"
          aria-hidden
          style={{ position: "relative", zIndex: 1 }}
        >
          <polyline
            points="1.5,5.5 5.5,9 12.5,1.5"
            fill="none"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : !isEmptyPast ? (
        <span
          className="relative text-[12px]"
          style={{
            zIndex: 1,
            fontWeight: isToday ? 800 : 600,
            color: isSkipped ? RED : isFuture ? "#7A8A7A" : isToday ? GREEN : TEXT,
          }}
        >
          {dayNum}
        </span>
      ) : null}

      {/* Future planned-count badge */}
      {isFuture && totalPlanned > 0 && (
        <span
          aria-label={`${totalPlanned} planned`}
          className="absolute -top-0.5 -right-0.5 z-10 inline-flex items-center justify-center rounded-full text-[9px] font-extrabold text-white"
          style={{
            minWidth: 14,
            height: 14,
            padding: "0 3px",
            background: GREEN,
            border: "1.5px solid #F4F7F0",
          }}
        >
          {totalPlanned}
        </span>
      )}
    </button>
  );
}
