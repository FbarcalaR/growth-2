// history-tab.jsx — Calendar / History view
// Shows a month grid where each day is a "bubble":
//   • past day, 100% complete  → solid green with check
//   • past day, partial        → green-filled circle (fill = % done) with day number
//   • past day, 0%             → empty red ring with day number
//   • today                    → highlighted ring with current %
//   • future day               → dotted outline; tap to see what's planned
// Tap any day to expand a detail panel below the calendar.

// ─── Date helpers ─────────────────────────────────────────────────────────
function _iso(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function _fromISO(iso) {
  // Treat YYYY-MM-DD as local-midnight to avoid TZ surprises.
  return new Date(iso + "T00:00:00");
}
function _addDaysISO(iso, n) {
  const d = _fromISO(iso);
  d.setDate(d.getDate() + n);
  return _iso(d);
}
function _monthLabel(year, month /* 0..11 */) {
  return new Date(year, month, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
}
function _dayOfWeekMonFirst(iso) {
  // 0 = Mon ... 6 = Sun
  const js = _fromISO(iso).getDay(); // 0=Sun..6=Sat
  return (js + 6) % 7;
}
const _MONTH_DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

// ─── Per-day rollup ───────────────────────────────────────────────────────
// For a given date, walk the user's goals and figure out:
//   - which TASKS were "due" that day (dueDate === iso)
//   - which ROUTINES were scheduled that weekday
//   - which were completed  (today only — past data is heuristic + seed)
//
// We only have ground-truth completion for the current "today" snapshot —
// the app doesn't keep a history log. So we synthesize a plausible record:
// past dates use a seeded pseudo-random per-day completion ratio that is
// biased by the goal's overall progress (a goal whose plant is mature has
// higher completion than one still a sprout). This makes the calendar
// feel populated and the demo legible.
function _hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

function _seededDayCompletion(iso, goalId, baseBias) {
  // returns 0..1, biased toward baseBias (the goal's overall vitality).
  const r = _hash(`${iso}:${goalId}`);
  // Skew toward baseBias: blend uniform with baseBias.
  const blended = r * 0.55 + baseBias * 0.45;
  // 30% chance of being a "perfect day", 12% of being a "skip day"
  const trigger = _hash(`trig:${iso}:${goalId}`);
  if (trigger > 0.85) return 1;
  if (trigger < 0.12) return 0;
  return Math.min(1, Math.max(0, blended));
}

function _goalVitality(goal) {
  // 0..1 — plant stage normalized; completed goals = 1
  if (goal.completed) return 1;
  return Math.min(1, (goal.stage || 0) / 4 + 0.15);
}

function buildDayRollup(state, iso, todayIso) {
  const dow = _dayOfWeekMonFirst(iso);
  const isPast = iso < todayIso;
  const isToday = iso === todayIso;
  const isFuture = iso > todayIso;

  const completedTasks = [];
  const missedTasks = [];
  const completedRoutines = [];
  const missedRoutines = [];
  const plannedTasks = [];
  const plannedRoutines = [];
  const goalEvents = []; // { type:'planted'|'grew'|'completed', goal }

  state.goals.forEach((goal) => {
    const vitality = _goalVitality(goal);

    // ── TASKS ──────────────────────────────────────────────────────
    (goal.tasks || []).forEach((t) => {
      if (t.dueDate !== iso) return;

      if (isFuture) {
        plannedTasks.push({ task: t, goal });
        return;
      }

      if (isToday) {
        if (t.completed) completedTasks.push({ task: t, goal });
        else plannedTasks.push({ task: t, goal });
        return;
      }

      // PAST
      if (t.completed) {
        // It's marked done in current state. Attribute completion to its due date.
        completedTasks.push({ task: t, goal });
      } else {
        // Past + still incomplete = was missed that day.
        missedTasks.push({ task: t, goal });
      }
    });

    // ── ROUTINES (scheduled that weekday) ──────────────────────────
    (goal.routines || []).forEach((r) => {
      const days = r.repeatDays || [true, true, true, true, true, true, true];
      if (!days[dow]) return;

      if (isFuture) {
        plannedRoutines.push({ routine: r, goal });
        return;
      }

      if (isToday) {
        if (r.completedToday) completedRoutines.push({ routine: r, goal });
        else plannedRoutines.push({ routine: r, goal });
        return;
      }

      // PAST — synthesize: high streak → likely done; vitality bumps it.
      const streakBoost = Math.min(0.4, (r.streak || 0) * 0.04);
      const score = _seededDayCompletion(iso, `r${r.id}`, vitality + streakBoost);
      if (score >= 0.55) completedRoutines.push({ routine: r, goal });
      else missedRoutines.push({ routine: r, goal });
    });

    // ── Goal milestones on this day (synthesized from current state) ──
    // Show plant-grew event seeded on a stable past day per stage so the
    // detail panel has narrative texture.
    if (isPast && goal.planted) {
      const plantDay = _hash(`plant:${goal.id}`);
      // anchor ~10–25 days ago
      const daysAgo = 10 + Math.floor(plantDay * 16);
      const plantedIso = _addDaysISO(todayIso, -daysAgo);
      if (plantedIso === iso) goalEvents.push({ type: "planted", goal });

      // a "grew" event ~halfway between plant date and today
      if ((goal.stage || 0) >= 2) {
        const growDay = _hash(`grew:${goal.id}`);
        const growAgo = Math.max(2, Math.floor(daysAgo * (0.4 + growDay * 0.2)));
        const grewIso = _addDaysISO(todayIso, -growAgo);
        if (grewIso === iso) goalEvents.push({ type: "grew", goal });
      }
    }
  });

  // Total scheduled = stuff that was supposed to happen.
  const totalScheduled =
    completedTasks.length +
    missedTasks.length +
    completedRoutines.length +
    missedRoutines.length +
    (isToday || isFuture ? plannedTasks.length + plannedRoutines.length : 0);
  const totalCompleted = completedTasks.length + completedRoutines.length;

  let pct = 0;
  if (totalScheduled === 0) pct = isFuture ? 0 : 0;
  else pct = totalCompleted / totalScheduled;

  // Future days don't have a "completion %" — just a planned count.
  const plannedCount = plannedTasks.length + plannedRoutines.length;

  return {
    iso,
    isPast,
    isToday,
    isFuture,
    pct,
    totalScheduled,
    totalCompleted,
    completedTasks,
    missedTasks,
    completedRoutines,
    missedRoutines,
    plannedTasks,
    plannedRoutines,
    plannedCount,
    goalEvents,
  };
}

// ─── DayBubble — a single calendar cell ─────────────────────────────────
function DayBubble({ rollup, dayNum, inMonth, selected, onClick }) {
  const SIZE = 38;
  const STROKE = 3;
  const r = (SIZE - STROKE) / 2;
  const c = SIZE / 2;

  // Empty / outside-of-month sentinel
  if (!inMonth) {
    return <div style={{ width: SIZE, height: SIZE }} />;
  }

  const { isPast, isToday, isFuture, pct, totalScheduled, plannedCount } = rollup;

  // Determine visual state
  // PAST:
  //   noTasks:  neutral muted dot
  //   100%:     solid green with check
  //   0%:       red empty ring
  //   partial:  green ring + green pie fill, day number on top
  // TODAY:    blue/accent ring with current % fill, day number bold
  // FUTURE:   dashed outline; small badge if planned tasks exist

  const isPerfect = isPast && totalScheduled > 0 && pct >= 0.999;
  const isSkipped = isPast && totalScheduled > 0 && pct <= 0.001;
  const isPartial = isPast && totalScheduled > 0 && !isPerfect && !isSkipped;
  const isEmptyPast = isPast && totalScheduled === 0;

  // Color tokens (match the rest of Bloomly: deep green #3A6647, accent green #66BB6A)
  const GREEN = "#3A6647";
  const GREEN_LT = "#A5D6A7";
  const GREEN_BG = "#E8F5E9";
  const RED = "#C9484E";
  const RED_BG = "#FBE3E5";
  const NEUTRAL = "#C8D6C8";
  const NEUTRAL_BG = "#F0F4EC";
  const TEXT = "#1C2B20";

  // Stroke offset for partial fill ring (uses circumference)
  const circ = 2 * Math.PI * r;
  const fillPct = isToday ? Math.min(1, Math.max(0, pct)) : pct;
  const dashOffset = circ * (1 - fillPct);

  const bubbleStyle = {
    width: SIZE,
    height: SIZE,
    position: "relative",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform .12s",
    transform: selected ? "scale(1.12)" : "scale(1)",
  };

  return (
    <button
      onClick={onClick}
      style={{
        ...bubbleStyle,
        background: "none",
        border: "none",
        padding: 0,
        margin: 0,
        fontFamily: "inherit",
      }}
      aria-label={`${rollup.iso} — ${isPerfect ? "all tasks complete" : isSkipped ? "no tasks complete" : isToday ? "today" : isFuture ? "planned" : isEmptyPast ? "no tasks" : "partial"}`}
    >
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ position: "absolute", inset: 0 }}
      >
        {/* Selection halo */}
        {selected && (
          <circle
            cx={c}
            cy={c}
            r={r + 2}
            fill="none"
            stroke={GREEN}
            strokeWidth="1.5"
            opacity="0.4"
          />
        )}

        {isPerfect && (
          <>
            <circle cx={c} cy={c} r={r} fill={GREEN} />
          </>
        )}

        {isSkipped && (
          <circle cx={c} cy={c} r={r} fill={RED_BG} stroke={RED} strokeWidth={STROKE * 0.66} />
        )}

        {isPartial && (
          <>
            {/* track */}
            <circle cx={c} cy={c} r={r} fill="#fff" stroke={GREEN_BG} strokeWidth={STROKE} />
            {/* fill — pie wedge using stroke-dasharray on a rotated circle */}
            <circle
              cx={c}
              cy={c}
              r={r}
              fill="none"
              stroke={GREEN_LT}
              strokeWidth={STROKE}
              strokeDasharray={circ}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${c} ${c})`}
              strokeLinecap="butt"
            />
          </>
        )}

        {isEmptyPast && <circle cx={c} cy={c} r={r * 0.42} fill={NEUTRAL} />}

        {isToday && (
          <>
            {/* outer accent ring */}
            <circle cx={c} cy={c} r={r} fill="#fff" stroke={GREEN} strokeWidth={STROKE * 0.66} />
            {/* progress arc */}
            {totalScheduled > 0 && (
              <circle
                cx={c}
                cy={c}
                r={r}
                fill="none"
                stroke={GREEN}
                strokeWidth={STROKE}
                strokeDasharray={circ}
                strokeDashoffset={dashOffset}
                transform={`rotate(-90 ${c} ${c})`}
              />
            )}
          </>
        )}

        {isFuture && (
          <circle
            cx={c}
            cy={c}
            r={r}
            fill="#fff"
            stroke={NEUTRAL}
            strokeWidth="1.5"
            strokeDasharray="2 2.5"
          />
        )}
      </svg>

      {/* Foreground content */}
      {isPerfect ? (
        <svg width="14" height="11" viewBox="0 0 14 11" style={{ position: "relative", zIndex: 1 }}>
          <polyline
            points="1.5,5.5 5.5,9 12.5,1.5"
            fill="none"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <span
          style={{
            position: "relative",
            zIndex: 1,
            fontSize: 12,
            fontWeight: isToday ? 800 : 600,
            color: isSkipped
              ? RED
              : isToday
                ? GREEN
                : isEmptyPast
                  ? "#9EB09E"
                  : isFuture
                    ? "#7A8A7A"
                    : TEXT,
          }}
        >
          {dayNum}
        </span>
      )}

      {/* Future-day planned-count badge */}
      {isFuture && plannedCount > 0 && (
        <span
          style={{
            position: "absolute",
            top: -2,
            right: -2,
            zIndex: 2,
            minWidth: 14,
            height: 14,
            padding: "0 3px",
            borderRadius: 7,
            background: GREEN,
            color: "white",
            fontSize: 9,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1.5px solid #F4F7F0",
          }}
        >
          {plannedCount}
        </span>
      )}
    </button>
  );
}

// ─── Detail panel — shown below calendar after a day is tapped ──────────
function DayDetailPanel({ rollup }) {
  const {
    iso,
    isPast,
    isToday,
    isFuture,
    pct,
    totalScheduled,
    totalCompleted,
    completedTasks,
    missedTasks,
    completedRoutines,
    missedRoutines,
    plannedTasks,
    plannedRoutines,
    goalEvents,
  } = rollup;

  const dateLabel = _fromISO(iso).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const pctRound = Math.round(pct * 100);

  const summary = (() => {
    if (isFuture) {
      const total = plannedTasks.length + plannedRoutines.length;
      if (total === 0) return "Nothing scheduled yet";
      return `${total} task${total === 1 ? "" : "s"} planned`;
    }
    if (totalScheduled === 0) return "A quiet day — nothing was scheduled";
    if (isToday) return `${totalCompleted} of ${totalScheduled} done so far · ${pctRound}%`;
    if (pct >= 0.999) return `Perfect day — all ${totalScheduled} done`;
    if (pct <= 0.001) return `${totalScheduled} task${totalScheduled === 1 ? "" : "s"} missed`;
    return `${totalCompleted} of ${totalScheduled} done · ${pctRound}%`;
  })();

  const headerColor = isFuture
    ? "#7A8A7A"
    : isPast && totalScheduled === 0
      ? "#9EB09E"
      : pct >= 0.999
        ? "#3A6647"
        : pct <= 0.001 && totalScheduled > 0
          ? "#C9484E"
          : "#3A6647";

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 18,
        border: "1.5px solid #EAEDE8",
        padding: 16,
        marginTop: 14,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 12,
          gap: 10,
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#9EB09E",
              textTransform: "uppercase",
              letterSpacing: 0.5,
              marginBottom: 2,
            }}
          >
            {isToday ? "Today" : isFuture ? "Upcoming" : "Past"}
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, color: "#1C2B20", lineHeight: 1.2 }}>
            {dateLabel}
          </div>
          <div style={{ fontSize: 12, color: headerColor, fontWeight: 600, marginTop: 4 }}>
            {summary}
          </div>
        </div>

        {/* Mini progress disc */}
        {!isFuture && totalScheduled > 0 && <DayProgressDisc pct={pct} size={48} />}
        {isFuture && plannedTasks.length + plannedRoutines.length > 0 && (
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              background: "#F0F4EC",
              border: "1.5px dashed #C8D6C8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 18 }}>📅</span>
          </div>
        )}
      </div>

      {/* Goal events */}
      {goalEvents.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          {goalEvents.map((ev, i) => {
            const area = (window.WHEEL_AREAS || []).find((a) => a.key === ev.goal.area);
            const plant = (window.PLANT_DEFS || []).find((p) => p.id === ev.goal.plantType);
            const label =
              ev.type === "planted"
                ? "Planted"
                : ev.type === "grew"
                  ? "Grew to a new stage"
                  : ev.type === "completed"
                    ? "Goal completed!"
                    : "";
            const bg =
              ev.type === "planted" ? "#E3F2FD" : ev.type === "grew" ? "#E8F5E9" : "#FFF8EC";
            const color =
              ev.type === "planted" ? "#1976D2" : ev.type === "grew" ? "#3A6647" : "#F0A500";
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: bg,
                  borderRadius: 12,
                  padding: "8px 12px",
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 16 }}>{plant?.emoji || "🌱"}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color, marginBottom: 1 }}>
                    {label}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#1C2B20",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {ev.goal.title}
                  </div>
                </div>
                {area && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: area.color,
                      background: area.color + "22",
                      padding: "2px 6px",
                      borderRadius: 5,
                    }}
                  >
                    {area.icon} {area.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Sections */}
      {isFuture ? (
        <>
          <DetailSection
            title="Planned tasks"
            count={plannedTasks.length}
            empty="No tasks scheduled"
            items={plannedTasks.map(({ task, goal }) => ({
              title: task.title,
              goal,
              kind: "task",
            }))}
            tone="planned"
          />
          <DetailSection
            title="Planned routines"
            count={plannedRoutines.length}
            empty="No routines scheduled"
            items={plannedRoutines.map(({ routine, goal }) => ({
              title: routine.title,
              goal,
              kind: "routine",
            }))}
            tone="planned"
          />
        </>
      ) : (
        <>
          {(completedTasks.length > 0 || completedRoutines.length > 0) && (
            <DetailSection
              title="Completed"
              count={completedTasks.length + completedRoutines.length}
              items={[
                ...completedTasks.map(({ task, goal }) => ({
                  title: task.title,
                  goal,
                  kind: "task",
                })),
                ...completedRoutines.map(({ routine, goal }) => ({
                  title: routine.title,
                  goal,
                  kind: "routine",
                })),
              ]}
              tone="done"
            />
          )}
          {(missedTasks.length > 0 || missedRoutines.length > 0) && !isToday && (
            <DetailSection
              title="Missed"
              count={missedTasks.length + missedRoutines.length}
              items={[
                ...missedTasks.map(({ task, goal }) => ({ title: task.title, goal, kind: "task" })),
                ...missedRoutines.map(({ routine, goal }) => ({
                  title: routine.title,
                  goal,
                  kind: "routine",
                })),
              ]}
              tone="missed"
            />
          )}
          {isToday && plannedTasks.length + plannedRoutines.length > 0 && (
            <DetailSection
              title="Still to do"
              count={plannedTasks.length + plannedRoutines.length}
              items={[
                ...plannedTasks.map(({ task, goal }) => ({
                  title: task.title,
                  goal,
                  kind: "task",
                })),
                ...plannedRoutines.map(({ routine, goal }) => ({
                  title: routine.title,
                  goal,
                  kind: "routine",
                })),
              ]}
              tone="planned"
            />
          )}
          {totalScheduled === 0 && goalEvents.length === 0 && (
            <div
              style={{ textAlign: "center", padding: "12px 0 4px", color: "#9EB09E", fontSize: 13 }}
            >
              Nothing was scheduled.
            </div>
          )}
        </>
      )}
    </div>
  );
}

function DayProgressDisc({ pct, size = 48 }) {
  const STROKE = 4;
  const r = (size - STROKE) / 2;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  const isPerfect = pct >= 0.999;
  const isZero = pct <= 0.001;
  const color = isPerfect ? "#3A6647" : isZero ? "#C9484E" : "#3A6647";
  const trackColor = isPerfect ? "#3A6647" : isZero ? "#FBE3E5" : "#E8F5E9";

  return (
    <div style={{ width: size, height: size, position: "relative", flexShrink: 0 }}>
      <svg width={size} height={size}>
        <circle
          cx={c}
          cy={c}
          r={r}
          fill={isPerfect ? color : "#fff"}
          stroke={trackColor}
          strokeWidth={STROKE}
        />
        {!isPerfect && !isZero && (
          <circle
            cx={c}
            cy={c}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - pct)}
            transform={`rotate(-90 ${c} ${c})`}
            strokeLinecap="round"
          />
        )}
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isPerfect ? (
          <svg width="16" height="13" viewBox="0 0 16 13">
            <polyline
              points="1.5,6.5 6,11 14.5,1.5"
              fill="none"
              stroke="white"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <span style={{ fontSize: 11, fontWeight: 800, color }}>{Math.round(pct * 100)}%</span>
        )}
      </div>
    </div>
  );
}

function DetailSection({ title, count, items, tone, empty }) {
  if (!items.length && !empty) return null;
  const tones = {
    done: { color: "#3A6647", icon: "✓", bullet: "#A5D6A7" },
    missed: { color: "#C9484E", icon: "✕", bullet: "#F0BFC2" },
    planned: { color: "#1976D2", icon: "○", bullet: "#90CAF9" },
  };
  const t = tones[tone] || tones.done;

  return (
    <div style={{ marginTop: 8 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 11,
          fontWeight: 700,
          color: "#7A8A7A",
          textTransform: "uppercase",
          letterSpacing: 0.5,
          marginBottom: 6,
        }}
      >
        <span style={{ color: t.color }}>{title}</span>
        <span style={{ color: "#9EB09E", fontWeight: 600 }}>· {count}</span>
      </div>
      {!items.length && empty && (
        <div style={{ fontSize: 12, color: "#9EB09E", padding: "4px 0" }}>{empty}</div>
      )}
      {items.map((it, i) => {
        const area = (window.WHEEL_AREAS || []).find((a) => a.key === it.goal.area);
        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 10px",
              borderRadius: 10,
              background: "#FAFCF8",
              border: "1px solid #F0F4EC",
              marginBottom: 5,
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 9,
                background: tone === "done" ? t.color : "#fff",
                border: tone === "done" ? "none" : `1.5px solid ${t.bullet}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                color: tone === "done" ? "#fff" : t.color,
                fontSize: 10,
                fontWeight: 800,
              }}
            >
              {tone === "done" ? (
                <svg width="9" height="7" viewBox="0 0 9 7">
                  <polyline
                    points="1,3.5 3.5,6 8,1"
                    fill="none"
                    stroke="white"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : tone === "missed" ? (
                <svg width="8" height="8" viewBox="0 0 8 8">
                  <line
                    x1="1.5"
                    y1="1.5"
                    x2="6.5"
                    y2="6.5"
                    stroke={t.color}
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                  <line
                    x1="6.5"
                    y1="1.5"
                    x2="1.5"
                    y2="6.5"
                    stroke={t.color}
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              ) : null}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#1C2B20",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  textDecoration: tone === "done" ? "line-through" : "none",
                  opacity: tone === "done" ? 0.7 : 1,
                }}
              >
                {it.title}
              </div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "#9EB09E",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  marginTop: 1,
                }}
              >
                {it.kind === "routine" ? "🔁 " : ""}
                {it.goal.title}
              </div>
            </div>
            {area && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: area.color,
                  background: area.color + "18",
                  padding: "2px 6px",
                  borderRadius: 5,
                  flexShrink: 0,
                }}
              >
                {area.icon}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Month-level summary strip ──────────────────────────────────────────
function MonthSummary({ rollups, todayIso }) {
  const past = rollups.filter((r) => r.iso < todayIso && r.totalScheduled > 0);
  const perfect = past.filter((r) => r.pct >= 0.999).length;
  const skipped = past.filter((r) => r.pct <= 0.001).length;
  const totalDone = past.reduce((acc, r) => acc + r.totalCompleted, 0);
  const totalScheduled = past.reduce((acc, r) => acc + r.totalScheduled, 0);
  const monthPct = totalScheduled === 0 ? 0 : totalDone / totalScheduled;

  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
      <SummaryCard
        label="Month"
        value={`${Math.round(monthPct * 100)}%`}
        sub={`${totalDone}/${totalScheduled}`}
        color="#3A6647"
      />
      <SummaryCard label="Perfect days" value={perfect} sub="all done" color="#43A047" icon="✓" />
      <SummaryCard label="Missed days" value={skipped} sub="0% done" color="#C9484E" icon="✕" />
    </div>
  );
}

function SummaryCard({ label, value, sub, color, icon }) {
  return (
    <div
      style={{
        flex: 1,
        background: "#fff",
        borderRadius: 14,
        border: "1.5px solid #EAEDE8",
        padding: "10px 8px",
        textAlign: "center",
        minWidth: 0,
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 800, color, lineHeight: 1.1 }}>
        {icon && <span style={{ marginRight: 4 }}>{icon}</span>}
        {value}
      </div>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: "#7A8A7A",
          textTransform: "uppercase",
          letterSpacing: 0.4,
          marginTop: 4,
        }}
      >
        {label}
      </div>
      {sub && <div style={{ fontSize: 9, color: "#9EB09E", marginTop: 1 }}>{sub}</div>}
    </div>
  );
}

// ─── Legend ────────────────────────────────────────────────────────────
function Legend() {
  const item = (swatch, label) => (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      {swatch}
      <span style={{ fontSize: 10, color: "#7A8A7A", fontWeight: 600 }}>{label}</span>
    </div>
  );
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
        justifyContent: "center",
        marginTop: 10,
        padding: "8px 4px",
      }}
    >
      {item(
        <svg width="14" height="14" viewBox="0 0 14 14">
          <circle cx="7" cy="7" r="6" fill="#3A6647" />
          <polyline
            points="3.5,7 6,9 10,5"
            fill="none"
            stroke="white"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>,
        "Perfect",
      )}
      {item(
        <svg width="14" height="14" viewBox="0 0 14 14">
          <circle cx="7" cy="7" r="5.25" fill="#fff" stroke="#E8F5E9" strokeWidth="1.5" />
          <circle
            cx="7"
            cy="7"
            r="5.25"
            fill="none"
            stroke="#A5D6A7"
            strokeWidth="1.5"
            strokeDasharray="33"
            strokeDashoffset="13"
            transform="rotate(-90 7 7)"
          />
        </svg>,
        "Partial",
      )}
      {item(
        <svg width="14" height="14" viewBox="0 0 14 14">
          <circle cx="7" cy="7" r="5.25" fill="#FBE3E5" stroke="#C9484E" strokeWidth="1.5" />
        </svg>,
        "Missed",
      )}
      {item(
        <svg width="14" height="14" viewBox="0 0 14 14">
          <circle
            cx="7"
            cy="7"
            r="5.5"
            fill="#fff"
            stroke="#C8D6C8"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
        </svg>,
        "Upcoming",
      )}
    </div>
  );
}

// ─── HistoryTab — main export ──────────────────────────────────────────
function HistoryTab({ state, dispatch }) {
  const todayIso = (() => {
    const d = new Date();
    return _iso(d);
  })();

  // Cursor month — start on today's month
  const todayDate = _fromISO(todayIso);
  const [cursor, setCursor] = React.useState(() => ({
    year: todayDate.getFullYear(),
    month: todayDate.getMonth(), // 0..11
  }));

  // Selected day — default to today
  const [selectedIso, setSelectedIso] = React.useState(todayIso);

  // Build days of the visible month (with leading + trailing blanks for grid alignment)
  const cells = React.useMemo(() => {
    const first = new Date(cursor.year, cursor.month, 1);
    const last = new Date(cursor.year, cursor.month + 1, 0);
    const leadingBlanks = (first.getDay() + 6) % 7; // Mon-first
    const out = [];
    for (let i = 0; i < leadingBlanks; i++) out.push({ blank: true, key: `b${i}` });
    for (let d = 1; d <= last.getDate(); d++) {
      const iso = _iso(new Date(cursor.year, cursor.month, d));
      out.push({ blank: false, key: iso, iso, dayNum: d });
    }
    // pad to full weeks
    while (out.length % 7 !== 0) out.push({ blank: true, key: `t${out.length}` });
    return out;
  }, [cursor.year, cursor.month]);

  // Per-day rollups for visible cells
  const rollupByIso = React.useMemo(() => {
    const m = {};
    cells.forEach((c) => {
      if (c.blank) return;
      m[c.iso] = buildDayRollup(state, c.iso, todayIso);
    });
    return m;
  }, [cells, state, todayIso]);

  const selectedRollup = React.useMemo(() => {
    if (!selectedIso) return null;
    if (rollupByIso[selectedIso]) return rollupByIso[selectedIso];
    return buildDayRollup(state, selectedIso, todayIso);
  }, [selectedIso, rollupByIso, state, todayIso]);

  function nudge(delta) {
    setCursor((c) => {
      const m = c.month + delta;
      const year = c.year + Math.floor(m / 12);
      const month = ((m % 12) + 12) % 12;
      return { year, month };
    });
  }

  function jumpToToday() {
    setCursor({ year: todayDate.getFullYear(), month: todayDate.getMonth() });
    setSelectedIso(todayIso);
  }

  return (
    <div
      style={{ height: "100%", display: "flex", flexDirection: "column", background: "#F4F7F0" }}
    >
      {/* Header */}
      <div style={{ padding: "20px 20px 8px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <div>
            <div style={{ fontSize: 12, color: "#9EB09E", fontWeight: 500 }}>History</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#1C2B20", lineHeight: 1.2 }}>
              Calendar 📅
            </div>
          </div>
          <button
            onClick={jumpToToday}
            style={{
              background: "#fff",
              border: "1.5px solid #E8EDE5",
              borderRadius: 20,
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 700,
              color: "#3A6647",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Today
          </button>
        </div>

        <MonthSummary rollups={Object.values(rollupByIso)} todayIso={todayIso} />

        {/* Month nav */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <button
            onClick={() => nudge(-1)}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              background: "#fff",
              border: "1.5px solid #E8EDE5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            aria-label="Previous month"
          >
            <svg width="8" height="14" viewBox="0 0 8 14">
              <polyline
                points="6,1 1,7 6,13"
                fill="none"
                stroke="#3A6647"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#1C2B20" }}>
            {_monthLabel(cursor.year, cursor.month)}
          </div>
          <button
            onClick={() => nudge(1)}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              background: "#fff",
              border: "1.5px solid #E8EDE5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            aria-label="Next month"
          >
            <svg width="8" height="14" viewBox="0 0 8 14">
              <polyline
                points="2,1 7,7 2,13"
                fill="none"
                stroke="#3A6647"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 24px" }}>
        {/* Weekday header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            marginBottom: 6,
          }}
        >
          {_MONTH_DAY_LABELS.map((l, i) => (
            <div
              key={i}
              style={{
                textAlign: "center",
                fontSize: 10,
                fontWeight: 700,
                color: "#9EB09E",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {l}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            rowGap: 8,
            columnGap: 4,
            background: "#fff",
            borderRadius: 18,
            border: "1.5px solid #EAEDE8",
            padding: "14px 8px",
          }}
        >
          {cells.map((cell) => {
            if (cell.blank) {
              return (
                <div
                  key={cell.key}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: 38,
                  }}
                />
              );
            }
            const r = rollupByIso[cell.iso];
            return (
              <div
                key={cell.key}
                style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
              >
                <DayBubble
                  rollup={r}
                  dayNum={cell.dayNum}
                  inMonth={true}
                  selected={selectedIso === cell.iso}
                  onClick={() => setSelectedIso(cell.iso)}
                />
              </div>
            );
          })}
        </div>

        <Legend />

        {/* Detail panel */}
        {selectedRollup && <DayDetailPanel rollup={selectedRollup} />}
      </div>
    </div>
  );
}

Object.assign(window, { HistoryTab });
