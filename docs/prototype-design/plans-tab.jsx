// plans-tab.jsx — Life goals with tasks/routines — exported to window

// ── Goal Card ──────────────────────────────────────────────────────────────
// Helper: today's local date in YYYY-MM-DD
function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
const DAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"]; // Mon..Sun
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Format an ISO date as a short friendly label
function formatDueLabel(iso) {
  if (!iso) return null;
  const today = todayISO();
  if (iso === today) return "Today";
  const t = new Date(today + "T00:00:00");
  const d = new Date(iso + "T00:00:00");
  const diffDays = Math.round((d - t) / 86400000);
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
  if (diffDays < 7) return d.toLocaleDateString(undefined, { weekday: "short" });
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function isOverdue(iso) {
  if (!iso) return false;
  return iso < todayISO();
}

// Compact day-of-week selector (Mon-Sun)
function DayPicker({ value, onChange, accent = "#3A6647" }) {
  // value: array of 7 booleans [Mon..Sun]
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {DAY_LETTERS.map((letter, i) => {
        const on = !!value[i];
        return (
          <button
            key={i}
            type="button"
            onClick={() => {
              const next = [...value];
              next[i] = !next[i];
              onChange(next);
            }}
            title={DAY_NAMES[i]}
            style={{
              flex: 1,
              height: 30,
              borderRadius: 8,
              border: "1.5px solid",
              borderColor: on ? accent : "#D6E0D6",
              background: on ? accent : "#fff",
              color: on ? "#fff" : "#7A8A7A",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
              padding: 0,
              transition: "all .15s",
            }}
          >
            {letter}
          </button>
        );
      })}
    </div>
  );
}

// ── Swipeable Item Row (mobile swipe-left + desktop hover actions) ─────────
function SwipeableItemRow({ children, actions, leftMeta, rightMeta, onPress, completed, accent }) {
  // actions: [{ icon, label, color, onClick }]
  const [hovered, setHovered] = React.useState(false);
  const [dragX, setDragX] = React.useState(0);
  const [open, setOpen] = React.useState(false);
  const startX = React.useRef(null);
  const startY = React.useRef(null);
  const movedRef = React.useRef(false);
  const horizontalRef = React.useRef(false);

  const ACTION_W = 56;
  const totalActionWidth = actions.length * ACTION_W;

  function onTouchStart(e) {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    movedRef.current = false;
    horizontalRef.current = false;
  }
  function onTouchMove(e) {
    if (startX.current == null) return;
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;
    if (!horizontalRef.current && Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) {
      horizontalRef.current = true;
    }
    if (horizontalRef.current) {
      movedRef.current = true;
      const base = open ? -totalActionWidth : 0;
      const next = Math.max(-totalActionWidth, Math.min(0, base + dx));
      setDragX(next);
    }
  }
  function onTouchEnd() {
    if (horizontalRef.current) {
      // snap
      if (dragX < -totalActionWidth / 2) {
        setOpen(true);
        setDragX(-totalActionWidth);
      } else {
        setOpen(false);
        setDragX(0);
      }
    }
    startX.current = null;
    startY.current = null;
  }

  function handleClick(e) {
    // If swipe was active, don't fire press
    if (movedRef.current) {
      movedRef.current = false;
      return;
    }
    if (open) {
      setOpen(false);
      setDragX(0);
      return;
    }
    onPress && onPress(e);
  }

  // Show actions on desktop hover, replacing right meta. On mobile, behind the row.
  const showActions = hovered;

  return (
    <div
      style={{ position: "relative", borderBottom: "1px solid #F7FAF5", overflow: "hidden" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
      }}
    >
      {/* Mobile swipe-revealed actions (behind row) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          alignItems: "stretch",
        }}
      >
        {actions.map((a, i) => (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              a.onClick(e);
              setOpen(false);
              setDragX(0);
            }}
            title={a.label}
            style={{
              width: ACTION_W,
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              background: a.color,
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
            }}
          >
            <span style={{ fontSize: 16, lineHeight: 1 }}>{a.icon}</span>
            <span>{a.label}</span>
          </button>
        ))}
      </div>

      {/* Foreground row */}
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={handleClick}
        style={{
          background: "#fff",
          position: "relative",
          transform: `translateX(${dragX}px)`,
          transition: startX.current == null ? "transform .18s" : "none",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "9px 0",
          cursor: "pointer",
        }}
      >
        {/* Checkbox area (children render the checkbox + body) */}
        {children}
        {/* Right meta — hidden on hover, replaced by inline action buttons */}
        {!showActions && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {leftMeta}
            {rightMeta}
          </div>
        )}
        {showActions && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            {actions.map((a, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  a.onClick(e);
                }}
                title={a.label}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  border: "1px solid #EAEDE8",
                  background: "#fff",
                  color: a.color,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 700,
                  padding: 0,
                }}
              >
                {a.icon}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Goal Card ──────────────────────────────────────────────────────────────
function GoalCard({ goal, dispatch, onPlantNow }) {
  const [expanded, setExpanded] = React.useState(false);
  const [newTask, setNewTask] = React.useState("");
  const [newTaskDue, setNewTaskDue] = React.useState(todayISO());
  const [newRoutine, setNewRoutine] = React.useState("");
  const [newRoutineDays, setNewRoutineDays] = React.useState([
    true,
    true,
    true,
    true,
    true,
    false,
    false,
  ]);
  const [addingType, setAddingType] = React.useState(null); // 'task' | 'routine' | null
  const [editingItem, setEditingItem] = React.useState(null); // { kind, id, title, dueDate?, repeatDays? }
  const [editingGoal, setEditingGoal] = React.useState(false);
  const [editGoalTitle, setEditGoalTitle] = React.useState(goal.title);
  const [editGoalArea, setEditGoalArea] = React.useState(goal.area);
  const [confirmDeleteGoal, setConfirmDeleteGoal] = React.useState(false);
  const [showCompleteCelebration, setShowCompleteCelebration] = React.useState(false);

  const area = WHEEL_AREAS.find((a) => a.key === goal.area);
  const plantDef = PLANT_DEFS.find((p) => p.id === goal.plantType);
  const { pct, needed, req } = getPlantProgress(goal);
  const health = window.getPlantHealth
    ? window.getPlantHealth(goal)
    : { value: 100, state: "healthy", overdue: 0, lapsed: 0 };
  const healthInfo = (window.HEALTH_STATE_INFO || {})[health.state] || {};
  const isDead = health.state === "dead";
  const isUnhealthy = !goal.completed && goal.planted && health.state !== "healthy";
  const tasks = goal.tasks || [];
  const routines = goal.routines || [];
  const totalItems = tasks.length + routines.length;
  const doneItems =
    tasks.filter((t) => t.completed).length + routines.filter((r) => r.completedToday).length;
  const isFullyGrown = goal.stage >= 4;
  const isSeed = !goal.planted;
  const primaryRes = AREA_RESOURCE[goal.area];
  const primaryInfo = RESOURCE_INFO[primaryRes];

  function submitTask() {
    if (!newTask.trim()) return;
    dispatch({
      type: "ADD_TASK_TO_GOAL",
      goalId: goal.id,
      title: newTask.trim(),
      dueDate: newTaskDue || null,
    });
    setNewTask("");
    setNewTaskDue(todayISO());
    setAddingType(null);
  }
  function submitRoutine() {
    if (!newRoutine.trim()) return;
    if (!newRoutineDays.some(Boolean)) return; // require at least one day
    dispatch({
      type: "ADD_ROUTINE_TO_GOAL",
      goalId: goal.id,
      title: newRoutine.trim(),
      repeatDays: newRoutineDays,
    });
    setNewRoutine("");
    setNewRoutineDays([true, true, true, true, true, false, false]);
    setAddingType(null);
  }

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 20,
        marginBottom: 12,
        overflow: "hidden",
        border: `1.5px solid ${
          isDead
            ? "#BFBFBF"
            : health.state === "critical"
              ? "#F5C6CB"
              : health.state === "ill"
                ? "#FCD9B0"
                : health.state === "wilting"
                  ? "#FFE7A6"
                  : expanded
                    ? "#C8E6C9"
                    : isSeed
                      ? "#FFE082"
                      : "#EAEDE8"
        }`,
      }}
    >
      {/* Header */}
      <div
        onClick={() => setExpanded((e) => !e)}
        style={{ padding: "14px 16px", cursor: "pointer" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          {/* Plant or seed preview */}
          <div
            style={{
              flexShrink: 0,
              width: 52,
              height: 52,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isSeed ? (
              <svg width="44" height="50" viewBox="0 0 52 60">
                <rect x="6" y="8" width="40" height="44" rx="4" fill="#FFF8E1" />
                <rect
                  x="6"
                  y="8"
                  width="40"
                  height="44"
                  rx="4"
                  fill="none"
                  stroke="#F9A825"
                  strokeWidth="1.5"
                />
                <rect x="6" y="8" width="40" height="10" rx="4" fill="#F9A825" />
                <rect x="6" y="14" width="40" height="4" fill="#F9A825" />
                <ellipse cx="26" cy="35" rx="9" ry="11" fill="#A5D6A7" />
                <ellipse cx="26" cy="33" rx="6" ry="7" fill="#81C784" />
                <ellipse cx="21" cy="30" rx="3" ry="4" fill="white" opacity="0.25" />
              </svg>
            ) : (
              <PlantSprite
                plantId={goal.plantType}
                stage={goal.stage}
                size={52}
                healthState={health.state}
              />
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1C2B20", marginBottom: 2 }}>
              {goal.title}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: area?.color || "#3A6647",
                  background: (area?.color || "#3A6647") + "18",
                  padding: "2px 7px",
                  borderRadius: 5,
                }}
              >
                {area?.icon} {area?.label}
              </span>
              {isSeed ? (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#F57F17",
                    background: "#FFF3E0",
                    padding: "2px 7px",
                    borderRadius: 5,
                  }}
                >
                  🌰 Seed
                </span>
              ) : isDead ? (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: "#5A5A5A",
                    background: "#EAEAEA",
                    padding: "2px 7px",
                    borderRadius: 5,
                    border: "1px solid #C8C8C8",
                  }}
                >
                  💀 Dead
                </span>
              ) : (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: STAGE_COLORS[goal.stage],
                    background: STAGE_COLORS[goal.stage] + "22",
                    padding: "2px 7px",
                    borderRadius: 5,
                  }}
                >
                  {STAGE_NAMES[goal.stage]}
                </span>
              )}
              {isUnhealthy && !isDead && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: healthInfo.color,
                    background: healthInfo.bg,
                    padding: "2px 7px",
                    borderRadius: 5,
                  }}
                >
                  {healthInfo.icon} {healthInfo.label}
                </span>
              )}
              {totalItems > 0 && (
                <span style={{ fontSize: 10, color: "#9EB09E" }}>
                  {doneItems}/{totalItems}
                </span>
              )}
            </div>
          </div>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            style={{
              transform: expanded ? "rotate(180deg)" : "none",
              transition: "transform .2s",
              flexShrink: 0,
            }}
          >
            <polyline
              points="3,5 8,11 13,5"
              fill="none"
              stroke="#9EB09E"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {isSeed && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlantNow && onPlantNow(goal.id);
            }}
            style={{
              width: "100%",
              padding: "9px",
              borderRadius: 12,
              border: "none",
              background: "#3A6647",
              color: "white",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            🌱 Plant now in garden
          </button>
        )}

        {/* Dead-state banner — replaces the growth bar when plant has died */}
        {!isSeed && isDead && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 10px",
              background: "#EAEAEA",
              borderRadius: 10,
              border: "1px solid #C8C8C8",
            }}
          >
            <span style={{ fontSize: 14 }}>💀</span>
            <span
              style={{ fontSize: 11, fontWeight: 700, color: "#3F3F3F", flex: 1, lineHeight: 1.3 }}
            >
              Your plant withered from neglect.
            </span>
            <span style={{ fontSize: 10, color: "#7A7A7A", fontWeight: 600 }}>Tap to choose</span>
          </div>
        )}

        {/* Health warning — when wilting/ill/critical, replaces growth subtitle */}
        {!isSeed && !isDead && isUnhealthy && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 10px",
              marginBottom: 6,
              background: healthInfo.bg,
              borderRadius: 10,
              border: `1px solid ${healthInfo.color}33`,
            }}
          >
            <span style={{ fontSize: 13 }}>{healthInfo.icon}</span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: healthInfo.color,
                flex: 1,
                lineHeight: 1.3,
              }}
            >
              {health.overdue} overdue · {healthInfo.message}
            </span>
          </div>
        )}

        {/* Growth bar */}
        {!isSeed && !isFullyGrown && !isDead && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <span style={{ fontSize: 10, color: "#9EB09E" }}>
                Growing → {STAGE_NAMES[goal.stage + 1]}
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: primaryInfo?.color,
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                {primaryInfo?.icon} {(goal.plantRes?.[primaryRes] || 0).toFixed(0)}/
                {req?.[primaryRes] || "?"}
              </span>
            </div>
            <div style={{ height: 5, background: "#F0F4EC", borderRadius: 3 }}>
              <div
                style={{
                  height: "100%",
                  background: area?.color || "#3A6647",
                  borderRadius: 3,
                  width: `${pct * 100}%`,
                  transition: "width .5s",
                }}
              />
            </div>
          </div>
        )}
        {!isSeed && isFullyGrown && !isDead && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 10px",
              background: "#F1F8F1",
              borderRadius: 10,
            }}
          >
            <span style={{ fontSize: 12 }}>✨</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#3A6647" }}>
              Your plant is fully blooming!
            </span>
          </div>
        )}
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{ borderTop: "1px solid #F0F4EC", padding: "14px 16px" }}>
          {/* Dead-state action panel — sits at top of expanded view */}
          {isDead && (
            <div
              style={{
                background: "#F4F4F4",
                border: "1px solid #C8C8C8",
                borderRadius: 14,
                padding: 14,
                marginBottom: 14,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 24 }}>💀</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: "#1C2B20" }}>
                    Your plant withered
                  </div>
                  <div style={{ fontSize: 11, color: "#5A5A5A", lineHeight: 1.4, marginTop: 2 }}>
                    Too many overdue tasks took their toll. The goal is still here — decide what to
                    do next.
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setConfirmDeleteGoal(true)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: 11,
                    border: "1px solid #F5D7D9",
                    background: "#fff",
                    color: "#C9484E",
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  🗑 Drop goal
                </button>
                <button
                  onClick={() => {
                    if (
                      confirm(
                        "Replant this goal? Overdue tasks will be rescheduled to today and your plant restarts as a sprout — your task history stays.",
                      )
                    ) {
                      dispatch({ type: "REPLANT_GOAL", goalId: goal.id });
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: 11,
                    border: "none",
                    background: "#3A6647",
                    color: "#fff",
                    fontSize: 12.5,
                    fontWeight: 800,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  🌱 Replant
                </button>
              </div>
            </div>
          )}
          {/* Resource needed hint */}
          {!isSeed && !isFullyGrown && !isDead && Object.keys(needed || {}).length > 0 && (
            <div
              style={{
                background: "#F8FBF8",
                borderRadius: 12,
                padding: "10px 12px",
                marginBottom: 14,
                border: "1px solid #E8EDE5",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 600, color: "#7A8A7A", marginBottom: 6 }}>
                Needs to grow:
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {Object.entries(needed).map(([r, amt]) => {
                  const ri = RESOURCE_INFO[r];
                  return (
                    <span
                      key={r}
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: ri?.color,
                        background: ri?.bg,
                        padding: "3px 8px",
                        borderRadius: 8,
                      }}
                    >
                      {ri?.icon} {amt} more {ri?.label}
                    </span>
                  );
                })}
              </div>
              <div style={{ fontSize: 10, color: "#9EB09E", marginTop: 6 }}>
                Complete tasks in <strong>{area?.label}</strong> goals to earn {primaryInfo?.icon}{" "}
                {primaryInfo?.label}
              </div>
            </div>
          )}

          {/* Tasks */}
          {tasks.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#7A8A7A",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  marginBottom: 6,
                }}
              >
                Tasks
              </div>
              {tasks.map((t) => {
                const dueLabel = formatDueLabel(t.dueDate);
                const overdue = !t.completed && isOverdue(t.dueDate);
                const taskActions = [
                  {
                    icon: "✏️",
                    label: "Edit",
                    color: "#7A8A7A",
                    onClick: () =>
                      setEditingItem({
                        kind: "task",
                        id: t.id,
                        title: t.title,
                        dueDate: t.dueDate || "",
                      }),
                  },
                  {
                    icon: "🗑",
                    label: "Delete",
                    color: "#C9484E",
                    onClick: () =>
                      dispatch({ type: "DELETE_TASK_FROM_GOAL", goalId: goal.id, itemId: t.id }),
                  },
                ];
                return (
                  <SwipeableItemRow
                    key={t.id}
                    actions={taskActions}
                    completed={t.completed}
                    accent={area?.color || "#3A6647"}
                    onPress={() =>
                      dispatch({ type: "TOGGLE_TASK_ITEM", goalId: goal.id, itemId: t.id })
                    }
                    rightMeta={
                      <span style={{ fontSize: 10, color: primaryInfo?.color, fontWeight: 700 }}>
                        {primaryInfo?.icon}+4
                      </span>
                    }
                  >
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 5,
                        border: "2px solid",
                        flexShrink: 0,
                        marginLeft: 0,
                        borderColor: t.completed ? area?.color || "#3A6647" : "#C8D6C8",
                        background: t.completed ? area?.color || "#3A6647" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {t.completed && (
                        <svg width="9" height="7" viewBox="0 0 9 7">
                          <polyline
                            points="1,3.5 3,6 8,1"
                            fill="none"
                            stroke="white"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 14,
                          color: "#1C2B20",
                          textDecoration: t.completed ? "line-through" : "none",
                          opacity: t.completed ? 0.55 : 1,
                        }}
                      >
                        {t.title}
                      </div>
                      {dueLabel && (
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            marginTop: 2,
                            color: overdue
                              ? "#C9484E"
                              : dueLabel === "Today"
                                ? "#3A6647"
                                : "#9EB09E",
                          }}
                        >
                          📅 {dueLabel}
                        </div>
                      )}
                    </div>
                  </SwipeableItemRow>
                );
              })}
            </div>
          )}

          {/* Routines */}
          {routines.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#7A8A7A",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  marginBottom: 6,
                }}
              >
                Routines
              </div>
              {routines.map((r) => {
                const days = r.repeatDays || [true, true, true, true, true, true, true];
                const allDays = days.every(Boolean);
                const isPermDone = !!r.permanentlyCompleted;
                const routineActions = isPermDone
                  ? [
                      {
                        icon: "🗑",
                        label: "Delete",
                        color: "#C9484E",
                        onClick: () =>
                          dispatch({
                            type: "DELETE_ROUTINE_FROM_GOAL",
                            goalId: goal.id,
                            itemId: r.id,
                          }),
                      },
                    ]
                  : [
                      {
                        icon: "✓✓",
                        label: "Done",
                        color: "#3A6647",
                        onClick: () => {
                          if (
                            confirm(
                              `Mark "${r.title}" as permanently completed? It will graduate from your daily routines.`,
                            )
                          ) {
                            dispatch({
                              type: "COMPLETE_ROUTINE_PERMANENT",
                              goalId: goal.id,
                              itemId: r.id,
                            });
                          }
                        },
                      },
                      {
                        icon: "✏️",
                        label: "Edit",
                        color: "#7A8A7A",
                        onClick: () =>
                          setEditingItem({
                            kind: "routine",
                            id: r.id,
                            title: r.title,
                            repeatDays: [...days],
                          }),
                      },
                      {
                        icon: "🗑",
                        label: "Delete",
                        color: "#C9484E",
                        onClick: () =>
                          dispatch({
                            type: "DELETE_ROUTINE_FROM_GOAL",
                            goalId: goal.id,
                            itemId: r.id,
                          }),
                      },
                    ];
                return (
                  <SwipeableItemRow
                    key={r.id}
                    actions={routineActions}
                    completed={r.completedToday}
                    accent={area?.color || "#3A6647"}
                    onPress={() => {
                      if (!isPermDone)
                        dispatch({ type: "TOGGLE_ROUTINE_ITEM", goalId: goal.id, itemId: r.id });
                    }}
                    rightMeta={
                      <>
                        {isPermDone ? (
                          <span
                            style={{
                              fontSize: 10,
                              color: "#3A6647",
                              fontWeight: 700,
                              background: "#E8F5E9",
                              padding: "2px 6px",
                              borderRadius: 6,
                            }}
                          >
                            ✓ Graduated
                          </span>
                        ) : (
                          <>
                            <span style={{ fontSize: 10, color: "#9EB09E", fontWeight: 600 }}>
                              🔁 {r.streak || 0}d
                            </span>
                            <span
                              style={{ fontSize: 10, color: primaryInfo?.color, fontWeight: 700 }}
                            >
                              {primaryInfo?.icon}+2
                            </span>
                          </>
                        )}
                      </>
                    }
                  >
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 5,
                        border: "2px solid",
                        flexShrink: 0,
                        borderColor: r.completedToday ? area?.color || "#3A6647" : "#C8D6C8",
                        background: r.completedToday ? area?.color || "#3A6647" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: isPermDone ? 0.6 : 1,
                      }}
                    >
                      {r.completedToday && (
                        <svg width="9" height="7" viewBox="0 0 9 7">
                          <polyline
                            points="1,3.5 3,6 8,1"
                            fill="none"
                            stroke="white"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 14,
                          color: "#1C2B20",
                          textDecoration: r.completedToday || isPermDone ? "line-through" : "none",
                          opacity: r.completedToday || isPermDone ? 0.55 : 1,
                        }}
                      >
                        {r.title}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                        {allDays ? (
                          <span style={{ fontSize: 10, fontWeight: 600, color: "#9EB09E" }}>
                            🔁 Every day
                          </span>
                        ) : (
                          <div style={{ display: "flex", gap: 2 }}>
                            {DAY_LETTERS.map((l, i) => (
                              <span
                                key={i}
                                style={{
                                  width: 14,
                                  height: 14,
                                  fontSize: 8,
                                  fontWeight: 700,
                                  borderRadius: 3,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  background: days[i] ? area?.color || "#3A6647" : "#F0F4EC",
                                  color: days[i] ? "#fff" : "#C8D6C8",
                                }}
                              >
                                {l}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </SwipeableItemRow>
                );
              })}
            </div>
          )}

          {/* Add item buttons / forms */}
          {addingType === null && (
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button
                onClick={() => setAddingType("task")}
                style={{
                  flex: 1,
                  padding: "9px",
                  borderRadius: 12,
                  border: "1.5px solid #C8E6C9",
                  background: "#F8FBF8",
                  color: "#3A6647",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                + Task
              </button>
              <button
                onClick={() => setAddingType("routine")}
                style={{
                  flex: 1,
                  padding: "9px",
                  borderRadius: 12,
                  border: "1.5px solid #C8E6C9",
                  background: "#F8FBF8",
                  color: "#3A6647",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                🔁 Routine
              </button>
            </div>
          )}
          {addingType === "task" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginTop: 4,
                padding: 12,
                background: "#F8FBF8",
                borderRadius: 14,
                border: "1px solid #E8EDE5",
              }}
            >
              <input
                autoFocus
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitTask();
                  if (e.key === "Escape") setAddingType(null);
                }}
                placeholder="New task…"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "10px 12px",
                  border: "1.5px solid #C8E6C9",
                  borderRadius: 10,
                  fontSize: 14,
                  fontFamily: "inherit",
                  outline: "none",
                  color: "#1C2B20",
                  background: "#fff",
                }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#7A8A7A" }}>📅 Due</span>
                <input
                  type="date"
                  value={newTaskDue || ""}
                  onChange={(e) => setNewTaskDue(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "8px 10px",
                    border: "1.5px solid #C8E6C9",
                    borderRadius: 10,
                    fontSize: 13,
                    fontFamily: "inherit",
                    outline: "none",
                    color: "#1C2B20",
                    background: "#fff",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setNewTaskDue(todayISO())}
                  style={{
                    padding: "8px 10px",
                    border: "1.5px solid #C8E6C9",
                    borderRadius: 10,
                    background: "#fff",
                    color: "#3A6647",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Today
                </button>
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button
                  onClick={() => setAddingType(null)}
                  style={{
                    padding: "9px 14px",
                    background: "#F0F4EC",
                    color: "#7A8A7A",
                    border: "none",
                    borderRadius: 10,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={submitTask}
                  style={{
                    padding: "9px 18px",
                    background: "#3A6647",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: 13,
                  }}
                >
                  Add task
                </button>
              </div>
            </div>
          )}
          {addingType === "routine" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                marginTop: 4,
                padding: 12,
                background: "#F8FBF8",
                borderRadius: 14,
                border: "1px solid #E8EDE5",
              }}
            >
              <input
                autoFocus
                value={newRoutine}
                onChange={(e) => setNewRoutine(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitRoutine();
                  if (e.key === "Escape") setAddingType(null);
                }}
                placeholder="Daily routine…"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "10px 12px",
                  border: "1.5px solid #C8E6C9",
                  borderRadius: 10,
                  fontSize: 14,
                  fontFamily: "inherit",
                  outline: "none",
                  color: "#1C2B20",
                  background: "#fff",
                }}
              />
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#7A8A7A" }}>
                    🔁 Repeat on
                  </span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => setNewRoutineDays([true, true, true, true, true, true, true])}
                      style={{
                        padding: "3px 8px",
                        border: "1px solid #C8E6C9",
                        borderRadius: 8,
                        background: "#fff",
                        color: "#3A6647",
                        fontSize: 10,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      Every day
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setNewRoutineDays([true, true, true, true, true, false, false])
                      }
                      style={{
                        padding: "3px 8px",
                        border: "1px solid #C8E6C9",
                        borderRadius: 8,
                        background: "#fff",
                        color: "#3A6647",
                        fontSize: 10,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      Weekdays
                    </button>
                  </div>
                </div>
                <DayPicker
                  value={newRoutineDays}
                  onChange={setNewRoutineDays}
                  accent={area?.color || "#3A6647"}
                />
                {!newRoutineDays.some(Boolean) && (
                  <div style={{ fontSize: 10, color: "#C9484E", marginTop: 6 }}>
                    Pick at least one day
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button
                  onClick={() => setAddingType(null)}
                  style={{
                    padding: "9px 14px",
                    background: "#F0F4EC",
                    color: "#7A8A7A",
                    border: "none",
                    borderRadius: 10,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={submitRoutine}
                  style={{
                    padding: "9px 18px",
                    background: "#3A6647",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: 13,
                    opacity: newRoutineDays.some(Boolean) ? 1 : 0.5,
                  }}
                >
                  Add routine
                </button>
              </div>
            </div>
          )}

          {/* Mark goal complete — only when all tasks/routines are done & not already completed */}
          {!goal.completed && totalItems > 0 && doneItems === totalItems && (
            <button
              onClick={() => setShowCompleteCelebration(true)}
              style={{
                width: "100%",
                marginTop: 12,
                padding: "12px",
                borderRadius: 14,
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                background: "linear-gradient(135deg, #FDD835 0%, #F9A825 100%)",
                color: "#3A2A00",
                fontWeight: 800,
                fontSize: 14,
                boxShadow: "0 4px 12px rgba(249,168,37,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              🏆 Mark goal as complete
            </button>
          )}
          {goal.completed && (
            <div
              style={{
                marginTop: 12,
                padding: "10px 12px",
                borderRadius: 12,
                background: "#FFF8E1",
                border: "1px solid #FDD835",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 18 }}>🏆</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#3A2A00" }}>
                  Goal completed!
                </div>
                <div style={{ fontSize: 10, color: "#7A6A2A" }}>
                  Trophy unlocked in your garden shop.
                </div>
              </div>
            </div>
          )}

          {/* Goal-level edit/delete footer */}
          <div
            style={{
              marginTop: 14,
              paddingTop: 12,
              borderTop: "1px dashed #E8EDE5",
              display: "flex",
              gap: 8,
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <button
              onClick={() => {
                setEditGoalTitle(goal.title);
                setEditGoalArea(goal.area);
                setEditingGoal(true);
              }}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: 10,
                border: "1px solid #EAEDE8",
                background: "#fff",
                color: "#7A8A7A",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              ✏️ Edit goal
            </button>
            <button
              onClick={() => setConfirmDeleteGoal(true)}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: 10,
                border: "1px solid #F5D7D9",
                background: "#fff",
                color: "#C9484E",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              🗑 Delete goal
            </button>
          </div>
        </div>
      )}

      {/* ── Edit task/routine modal ─────────────────────────────────────── */}
      {editingItem && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={() => setEditingItem(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 18,
              padding: 18,
              width: "100%",
              maxWidth: 320,
              boxSizing: "border-box",
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 800, color: "#1C2B20", marginBottom: 12 }}>
              Edit {editingItem.kind}
            </div>
            <input
              autoFocus
              value={editingItem.title}
              onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "10px 12px",
                border: "1.5px solid #C8E6C9",
                borderRadius: 10,
                fontSize: 14,
                fontFamily: "inherit",
                outline: "none",
                color: "#1C2B20",
                marginBottom: 10,
              }}
            />
            {editingItem.kind === "task" && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#7A8A7A" }}>📅 Due</span>
                <input
                  type="date"
                  value={editingItem.dueDate || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, dueDate: e.target.value })}
                  style={{
                    flex: 1,
                    padding: "8px 10px",
                    border: "1.5px solid #C8E6C9",
                    borderRadius: 10,
                    fontSize: 13,
                    fontFamily: "inherit",
                    outline: "none",
                    color: "#1C2B20",
                    background: "#fff",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setEditingItem({ ...editingItem, dueDate: "" })}
                  style={{
                    padding: "6px 8px",
                    border: "1px solid #EAEDE8",
                    borderRadius: 8,
                    background: "#fff",
                    color: "#7A8A7A",
                    fontSize: 10,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Clear
                </button>
              </div>
            )}
            {editingItem.kind === "routine" && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#7A8A7A", marginBottom: 6 }}>
                  🔁 Repeat on
                </div>
                <DayPicker
                  value={editingItem.repeatDays}
                  onChange={(v) => setEditingItem({ ...editingItem, repeatDays: v })}
                  accent={area?.color || "#3A6647"}
                />
              </div>
            )}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                onClick={() => setEditingItem(null)}
                style={{
                  padding: "9px 14px",
                  background: "#F0F4EC",
                  color: "#7A8A7A",
                  border: "none",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const changes =
                    editingItem.kind === "task"
                      ? { title: editingItem.title.trim(), dueDate: editingItem.dueDate || null }
                      : { title: editingItem.title.trim(), repeatDays: editingItem.repeatDays };
                  if (!changes.title) return;
                  if (editingItem.kind === "task") {
                    dispatch({
                      type: "EDIT_TASK_IN_GOAL",
                      goalId: goal.id,
                      itemId: editingItem.id,
                      changes,
                    });
                  } else {
                    dispatch({
                      type: "EDIT_ROUTINE_IN_GOAL",
                      goalId: goal.id,
                      itemId: editingItem.id,
                      changes,
                    });
                  }
                  setEditingItem(null);
                }}
                style={{
                  padding: "9px 18px",
                  background: "#3A6647",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 13,
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit goal modal ─────────────────────────────────────────────── */}
      {editingGoal && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={() => setEditingGoal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 18,
              padding: 18,
              width: "100%",
              maxWidth: 320,
              boxSizing: "border-box",
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 800, color: "#1C2B20", marginBottom: 12 }}>
              Edit goal
            </div>
            <input
              autoFocus
              value={editGoalTitle}
              onChange={(e) => setEditGoalTitle(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "10px 12px",
                border: "1.5px solid #C8E6C9",
                borderRadius: 10,
                fontSize: 14,
                fontFamily: "inherit",
                outline: "none",
                color: "#1C2B20",
                marginBottom: 14,
              }}
            />
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#7A8A7A",
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Life area
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
              {WHEEL_AREAS.map((a) => (
                <button
                  key={a.key}
                  onClick={() => setEditGoalArea(a.key)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 16,
                    border: "2px solid",
                    fontFamily: "inherit",
                    borderColor: editGoalArea === a.key ? a.color : "#EAEDE8",
                    background: editGoalArea === a.key ? a.color + "22" : "#FAFAFA",
                    color: editGoalArea === a.key ? a.color : "#9EB09E",
                    fontWeight: 600,
                    fontSize: 11,
                    cursor: "pointer",
                  }}
                >
                  {a.icon} {a.label}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                onClick={() => setEditingGoal(false)}
                style={{
                  padding: "9px 14px",
                  background: "#F0F4EC",
                  color: "#7A8A7A",
                  border: "none",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!editGoalTitle.trim()) return;
                  dispatch({
                    type: "EDIT_GOAL",
                    goalId: goal.id,
                    changes: { title: editGoalTitle.trim(), area: editGoalArea },
                  });
                  setEditingGoal(false);
                }}
                style={{
                  padding: "9px 18px",
                  background: "#3A6647",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 13,
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm delete goal ─────────────────────────────────────────── */}
      {confirmDeleteGoal && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={() => setConfirmDeleteGoal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 18,
              padding: 20,
              width: "100%",
              maxWidth: 300,
              boxSizing: "border-box",
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 800, color: "#1C2B20", marginBottom: 6 }}>
              Delete this goal?
            </div>
            <div style={{ fontSize: 12, color: "#7A8A7A", marginBottom: 16 }}>
              "{goal.title}" and all its tasks &amp; routines will be removed. The plant will
              disappear from your garden. This can't be undone.
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                onClick={() => setConfirmDeleteGoal(false)}
                style={{
                  padding: "9px 14px",
                  background: "#F0F4EC",
                  color: "#7A8A7A",
                  border: "none",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  dispatch({ type: "DELETE_GOAL", goalId: goal.id });
                  setConfirmDeleteGoal(false);
                }}
                style={{
                  padding: "9px 18px",
                  background: "#C9484E",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 13,
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Goal completion celebration ─────────────────────────────────── */}
      {showCompleteCelebration && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            zIndex: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={() => setShowCompleteCelebration(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "linear-gradient(160deg, #FFF8E1 0%, #FFFFFF 60%)",
              borderRadius: 22,
              padding: "28px 22px 22px",
              width: "100%",
              maxWidth: 300,
              textAlign: "center",
              boxSizing: "border-box",
              border: "2px solid #FDD835",
            }}
          >
            <div style={{ fontSize: 54, marginBottom: 8 }}>🏆</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#3A2A00", marginBottom: 6 }}>
              Goal complete!
            </div>
            <div style={{ fontSize: 13, color: "#7A6A2A", marginBottom: 18, lineHeight: 1.4 }}>
              You've finished <strong>{goal.title}</strong>. Your plant is forever blooming, and
              you've unlocked rewards.
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginBottom: 18,
                background: "#fff",
                borderRadius: 14,
                padding: 14,
                border: "1px solid #FFE082",
              }}
            >
              <div
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <span style={{ fontSize: 13, color: "#7A6A2A", fontWeight: 600 }}>
                  🪙 Bonus coins
                </span>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#F57F17" }}>+50</span>
              </div>
              <div
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <span style={{ fontSize: 13, color: "#7A6A2A", fontWeight: 600 }}>
                  🏆 Trophy unlocked
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#3A6647" }}>Garden shop</span>
              </div>
              <div
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <span style={{ fontSize: 13, color: "#7A6A2A", fontWeight: 600 }}>
                  🌸 Plant fully bloomed
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#3A6647" }}>Forever</span>
              </div>
            </div>
            <button
              onClick={() => {
                dispatch({ type: "COMPLETE_GOAL", goalId: goal.id });
                setShowCompleteCelebration(false);
              }}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 14,
                border: "none",
                background: "#3A6647",
                color: "#fff",
                fontWeight: 800,
                fontSize: 14,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Claim rewards
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Make Room Overlay ─────────────────────────────────────────────────────
// Shown when the user wants to add a goal to an area that's at its quota.
// Lists active goals in that area, lowest-priority (droppable) first, and lets
// them delete one to free a slot.
function MakeRoomOverlay({ areaKey, state, dispatch, onClose }) {
  const area = (window.WHEEL_AREAS || []).find((a) => a.key === areaKey);
  const goals = window.getAreaGoalsByDroppability
    ? window.getAreaGoalsByDroppability(state, areaKey)
    : [];
  const [confirmId, setConfirmId] = React.useState(null);
  const confirmGoal = goals.find((g) => g.id === confirmId);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 300,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxHeight: "80%",
          background: "#fff",
          borderRadius: "22px 22px 0 0",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "18px 18px 8px", flexShrink: 0 }}>
          <div
            style={{
              width: 36,
              height: 4,
              background: "#E0E0E0",
              borderRadius: 2,
              margin: "0 auto 14px",
            }}
          />
          <div
            style={{
              fontSize: 17,
              fontWeight: 800,
              color: "#1C2B20",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>{area?.icon}</span>
            <span>Make room in {area?.label}</span>
          </div>
          <div style={{ fontSize: 12.5, color: "#7A8A7A", lineHeight: 1.45, marginTop: 6 }}>
            Pick a goal to drop. We've sorted lowest-priority first — seeds and freshly-planted
            goals are at the top because they have the least invested in them.
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "8px 14px 18px" }}>
          {goals.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0", color: "#9EB09E", fontSize: 13 }}>
              No goals to drop in this area.
            </div>
          ) : (
            goals.map((g, i) => {
              const isLowest = i === 0;
              const stageLabel = !g.planted
                ? "🌰 Seed"
                : window.STAGE_NAMES?.[g.stage] || `Stage ${g.stage}`;
              return (
                <div
                  key={g.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 12px",
                    marginBottom: 8,
                    borderRadius: 14,
                    background: "#FAFCF8",
                    border: `1px solid ${isLowest ? area?.color + "55" : "#EAEDE8"}`,
                  }}
                >
                  <div
                    style={{
                      flexShrink: 0,
                      width: 42,
                      height: 42,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {g.planted ? (
                      <window.PlantSprite plantId={g.plantType} stage={g.stage} size={42} />
                    ) : (
                      <span style={{ fontSize: 24 }}>🌰</span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13.5,
                        fontWeight: 700,
                        color: "#1C2B20",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {g.title}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginTop: 3,
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: area?.color,
                          background: (area?.color || "#3A6647") + "18",
                          padding: "2px 6px",
                          borderRadius: 5,
                        }}
                      >
                        {stageLabel}
                      </span>
                      {isLowest && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: "#3A6647",
                            background: "#E8F0E8",
                            padding: "2px 6px",
                            borderRadius: 5,
                          }}
                        >
                          Lowest priority
                        </span>
                      )}
                      <span style={{ fontSize: 10, color: "#9EB09E" }}>
                        {(g.tasks || []).length} task{(g.tasks || []).length === 1 ? "" : "s"} ·{" "}
                        {(g.routines || []).length} routine
                        {(g.routines || []).length === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setConfirmId(g.id)}
                    style={{
                      flexShrink: 0,
                      padding: "8px 12px",
                      borderRadius: 10,
                      border: "1px solid #F5D7D9",
                      background: "#fff",
                      color: "#C9484E",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Drop
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div style={{ padding: "10px 16px 18px", borderTop: "1px solid #EAEDE8", flexShrink: 0 }}>
          <button
            onClick={onClose}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 12,
              border: "none",
              background: "#F0F4EC",
              color: "#3A6647",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Keep all goals — go back
          </button>
        </div>

        {/* Confirm drop */}
        {confirmGoal && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 400,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
            }}
            onClick={() => setConfirmId(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#fff",
                borderRadius: 18,
                padding: 20,
                width: "100%",
                maxWidth: 300,
                boxSizing: "border-box",
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 800, color: "#1C2B20", marginBottom: 6 }}>
                Drop "{confirmGoal.title}"?
              </div>
              <div style={{ fontSize: 12, color: "#7A8A7A", marginBottom: 16, lineHeight: 1.45 }}>
                The goal, its tasks, routines, and plant will be removed. This frees one slot in{" "}
                {area?.label}. This can't be undone.
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button
                  onClick={() => setConfirmId(null)}
                  style={{
                    padding: "9px 14px",
                    background: "#F0F4EC",
                    color: "#7A8A7A",
                    border: "none",
                    borderRadius: 10,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    dispatch({ type: "DELETE_GOAL", goalId: confirmGoal.id });
                    setConfirmId(null);
                  }}
                  style={{
                    padding: "9px 18px",
                    background: "#C9484E",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: 13,
                  }}
                >
                  Drop goal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── New Goal Modal ────────────────────────────────────────────────────────────
function NewGoalModal({ onAdd, onClose, state, dispatch }) {
  const slots = window.getAreaSlots ? window.getAreaSlots(state) : {};

  // Pick the first area that still has room as the default selection.
  const firstOpenArea =
    WHEEL_AREAS.find((a) => {
      const s = slots[a.key];
      return s && !s.locked && !s.full;
    })?.key || "health";

  const [step, setStep] = React.useState(0); // 0=title+area, 1=plant
  const [title, setTitle] = React.useState("");
  const [area, setArea] = React.useState(firstOpenArea);
  const [plantType, setPlantType] = React.useState("herb");
  const [removingFromArea, setRemovingFromArea] = React.useState(null); // areaKey to manage

  const selectedArea = WHEEL_AREAS.find((a) => a.key === area);
  const selectedSlot = slots[area];

  // Suggest plant based on area
  const areaPlantMap = {
    health: "herb",
    career: "sunflower",
    finances: "money_tree",
    relationships: "rose",
    personal: "mushroom",
    fun: "crystal",
    spirituality: "moon_flower",
  };
  React.useEffect(() => {
    setPlantType(areaPlantMap[area] || "herb");
  }, [area]);

  // Block step advance when chosen area has no available slot.
  const areaBlocked = !selectedSlot || selectedSlot.locked || selectedSlot.full;

  function submit() {
    if (!title.trim()) return;
    if (areaBlocked) return;
    onAdd({ title: title.trim(), area, plantType });
    onClose();
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        zIndex: 100,
        display: "flex",
        alignItems: "flex-end",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: "24px 24px 0 0",
          padding: "24px 20px 36px",
          width: "100%",
          boxSizing: "border-box",
          maxHeight: "88%",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            width: 36,
            height: 4,
            background: "#E0E0E0",
            borderRadius: 2,
            margin: "0 auto 20px",
          }}
        />

        {step === 0 ? (
          <>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#1C2B20", marginBottom: 4 }}>
              New Life Goal
            </div>
            <div style={{ fontSize: 13, color: "#9EB09E", marginBottom: 18 }}>
              Goals are the heart of your journey. Each one grows a plant 🌱
            </div>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && title.trim() && setStep(1)}
              placeholder="What do you want to achieve?"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "14px 16px",
                border: "1.5px solid #C8E6C9",
                borderRadius: 14,
                fontSize: 15,
                fontFamily: "inherit",
                outline: "none",
                marginBottom: 18,
                color: "#1C2B20",
              }}
            />
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#7A8A7A",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Life Area
                </span>
                <span style={{ fontSize: 10, fontWeight: 600, color: "#9EB09E" }}>
                  Slots = priority points
                </span>
              </div>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {WHEEL_AREAS.map((a) => {
                  const s = slots[a.key] || { quota: 0, used: 0, locked: true, full: false };
                  const selected = area === a.key;
                  const dim = s.locked || s.full;
                  return (
                    <button
                      key={a.key}
                      onClick={() => setArea(a.key)}
                      style={{
                        padding: "8px 13px",
                        borderRadius: 20,
                        border: "2px solid",
                        fontFamily: "inherit",
                        borderColor: selected ? a.color : dim ? "#E0E5DE" : "#EAEDE8",
                        background: selected ? a.color + "22" : dim ? "#F4F6F2" : "#FAFAFA",
                        color: selected ? a.color : dim ? "#B5BEB5" : "#9EB09E",
                        fontWeight: 600,
                        fontSize: 12,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        opacity: dim && !selected ? 0.78 : 1,
                      }}
                    >
                      <span>
                        {a.icon} {a.label}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          padding: "1px 6px",
                          borderRadius: 8,
                          background: selected
                            ? a.color
                            : s.locked
                              ? "#E8EDE5"
                              : s.full
                                ? "#FBE3E5"
                                : "#E8F0E8",
                          color: selected
                            ? "#fff"
                            : s.locked
                              ? "#9EB09E"
                              : s.full
                                ? "#C9484E"
                                : "#3A6647",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {s.locked ? "🔒" : `${s.used}/${s.quota}`}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Why-disabled explanation for the currently-selected area */}
              {selectedArea && selectedSlot && (selectedSlot.locked || selectedSlot.full) && (
                <div
                  style={{
                    marginTop: 12,
                    padding: "12px 12px",
                    background: selectedSlot.locked ? "#F4F6F2" : "#FFF6F6",
                    border: `1px solid ${selectedSlot.locked ? "#E0E5DE" : "#F5D7D9"}`,
                    borderRadius: 12,
                  }}
                >
                  {selectedSlot.locked ? (
                    <>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#1C2B20",
                          marginBottom: 4,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        🔒 No slots in{" "}
                        <span style={{ color: selectedArea.color }}>{selectedArea.label}</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: "#5A6A5A", lineHeight: 1.45 }}>
                        You assigned <b>0 priority points</b> to this area in your wheel of life, so
                        it's not part of your focus right now. To create goals here, raise its
                        priority from your profile.
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#1C2B20",
                          marginBottom: 4,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        ⚠️ <span style={{ color: selectedArea.color }}>{selectedArea.label}</span>{" "}
                        is full ({selectedSlot.used}/{selectedSlot.quota})
                      </div>
                      <div
                        style={{
                          fontSize: 11.5,
                          color: "#5A6A5A",
                          lineHeight: 1.45,
                          marginBottom: 10,
                        }}
                      >
                        Your priority of{" "}
                        <b>
                          {selectedSlot.quota} point{selectedSlot.quota === 1 ? "" : "s"}
                        </b>{" "}
                        on {selectedArea.label} caps you at {selectedSlot.quota} active goal
                        {selectedSlot.quota === 1 ? "" : "s"}. Drop one to make room — start with
                        the lowest-priority one.
                      </div>
                      <button
                        type="button"
                        onClick={() => setRemovingFromArea(area)}
                        style={{
                          width: "100%",
                          padding: "9px 10px",
                          borderRadius: 10,
                          background: "#fff",
                          border: `1.5px solid ${selectedArea.color}`,
                          color: selectedArea.color,
                          fontFamily: "inherit",
                          fontSize: 12.5,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Choose a goal to drop →
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Helpful hint when area is open but tight */}
              {selectedSlot &&
                !selectedSlot.locked &&
                !selectedSlot.full &&
                selectedSlot.remaining === 1 && (
                  <div
                    style={{
                      marginTop: 10,
                      fontSize: 11,
                      color: "#7A8A7A",
                      textAlign: "center",
                    }}
                  >
                    Last open slot in {selectedArea.label}.
                  </div>
                )}
            </div>
            <button
              onClick={() => title.trim() && !areaBlocked && setStep(1)}
              disabled={!title.trim() || areaBlocked}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 16,
                border: "none",
                background: !title.trim() || areaBlocked ? "#D6DDD2" : "#3A6647",
                color: !title.trim() || areaBlocked ? "#8A988A" : "white",
                fontSize: 15,
                fontWeight: 700,
                cursor: !title.trim() || areaBlocked ? "not-allowed" : "pointer",
                fontFamily: "inherit",
              }}
            >
              {areaBlocked
                ? selectedSlot?.locked
                  ? "Area locked — pick another"
                  : "Area full — drop one to continue"
                : "Next: Choose your plant →"}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setStep(0)}
              style={{
                background: "none",
                border: "none",
                color: "#9EB09E",
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "inherit",
                marginBottom: 12,
                padding: 0,
              }}
            >
              ← Back
            </button>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#1C2B20", marginBottom: 4 }}>
              Choose Your Plant
            </div>
            <div style={{ fontSize: 13, color: "#9EB09E", marginBottom: 6 }}>
              This plant will grow in your garden as you work on{" "}
              <strong style={{ color: "#1C2B20" }}>{title}</strong>
            </div>
            {selectedArea && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 12px",
                  background: selectedArea.color + "15",
                  borderRadius: 10,
                  marginBottom: 18,
                  border: `1px solid ${selectedArea.color}33`,
                }}
              >
                <span style={{ fontSize: 12 }}>{selectedArea.icon}</span>
                <span style={{ fontSize: 12, color: selectedArea.color, fontWeight: 600 }}>
                  {selectedArea.label} tasks earn {RESOURCE_INFO[AREA_RESOURCE[area]]?.icon}{" "}
                  {RESOURCE_INFO[AREA_RESOURCE[area]]?.label}
                </span>
              </div>
            )}
            <div
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}
            >
              {PLANT_DEFS.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setPlantType(p.id)}
                  style={{
                    borderRadius: 16,
                    border: "2px solid",
                    cursor: "pointer",
                    borderColor: plantType === p.id ? "#3A6647" : "#EAEDE8",
                    background: plantType === p.id ? "#F0F7F0" : "#FAFAFA",
                    padding: "12px 8px",
                    textAlign: "center",
                    transition: "border-color .15s",
                  }}
                >
                  <PlantSprite plantId={p.id} stage={3} size={60} />
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: plantType === p.id ? "#3A6647" : "#1C2B20",
                      marginTop: 4,
                    }}
                  >
                    {p.name}
                  </div>
                  <div style={{ fontSize: 10, color: "#9EB09E", marginTop: 2 }}>
                    {RESOURCE_INFO[p.primary]?.icon}
                    {RESOURCE_INFO[p.secondary]?.icon}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={submit}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 16,
                border: "none",
                background: "#3A6647",
                color: "white",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Add as seed 🌰
            </button>
          </>
        )}

        {/* Make-room overlay: shows lower-priority goals in the chosen area, sorted droppable-first */}
        {removingFromArea && (
          <MakeRoomOverlay
            areaKey={removingFromArea}
            state={state}
            dispatch={dispatch}
            onClose={() => setRemovingFromArea(null)}
          />
        )}
      </div>
    </div>
  );
}

// ── Plans Tab ─────────────────────────────────────────────────────────────────
function PlansTab({ state, dispatch }) {
  const [showAdd, setShowAdd] = React.useState(false);
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    const onNav = (e) => {
      if (e.detail?.action === "newGoal") setShowAdd(true);
    };
    window.addEventListener("bloomly:navigate", onNav);
    return () => window.removeEventListener("bloomly:navigate", onNav);
  }, []);

  function handleAddGoal(data) {
    dispatch({
      type: "ADD_GOAL",
      goal: { ...data, id: Date.now(), tasks: [], routines: [], stage: 0, plantRes: {} },
    });
  }

  function handlePlantNow(goalId) {
    if (window.GardenTab_startPlanting) window.GardenTab_startPlanting(goalId);
    if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Split goals into active vs blooming/completed.
  // A goal lands in the "Blooming & Completed" section when:
  //   • it's been marked complete (trophy unlocked), OR
  //   • its plant has reached full bloom (stage >= 4)
  const isBloomedOrDone = (g) => !!g.completed || (g.planted && (g.stage || 0) >= 4);
  const activeGoals = state.goals.filter((g) => !isBloomedOrDone(g));
  const bloomingGoals = state.goals.filter(isBloomedOrDone);

  // Sort active: seeds first, then planted by stage
  const sortedActive = [...activeGoals].sort((a, b) => {
    if (!a.planted && b.planted) return -1;
    if (a.planted && !b.planted) return 1;
    return 0;
  });

  // Sort blooming: completed (trophies) first, then full-bloom-only
  const sortedBlooming = [...bloomingGoals].sort((a, b) => {
    if (a.completed && !b.completed) return -1;
    if (!a.completed && b.completed) return 1;
    return (b.completedAt || 0) - (a.completedAt || 0);
  });

  const [bloomOpen, setBloomOpen] = React.useState(true);

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#F4F7F0",
        position: "relative",
      }}
    >
      <div ref={scrollRef} style={{ overflowY: "auto", flex: 1, paddingBottom: 20 }}>
        {/* Embedded garden card */}
        <div style={{ padding: "12px 12px 0" }}>
          <window.GardenCard state={state} dispatch={dispatch} />
        </div>

        <div
          style={{
            padding: "18px 20px 14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#1C2B20", marginBottom: 2 }}>
              Life Goals
            </div>
            <div style={{ fontSize: 13, color: "#9EB09E" }}>
              Each goal grows a plant in your garden
            </div>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            style={{
              padding: "8px 14px",
              borderRadius: 20,
              background: "#3A6647",
              color: "#fff",
              border: "none",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            + New
          </button>
        </div>

        <div style={{ padding: "0 16px" }}>
          {state.goals.length === 0 ? (
            <div
              style={{
                background: "#fff",
                borderRadius: 20,
                padding: "28px",
                textAlign: "center",
                border: "2px dashed #C8E6C9",
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 10 }}>🌱</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#3A6647", marginBottom: 6 }}>
                Plant your first goal
              </div>
              <div style={{ fontSize: 13, color: "#9EB09E", marginBottom: 16 }}>
                Create a goal to get started. Each goal grows a unique plant in your garden.
              </div>
              <button
                onClick={() => setShowAdd(true)}
                style={{
                  padding: "12px 24px",
                  borderRadius: 14,
                  background: "#3A6647",
                  color: "white",
                  fontSize: 14,
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Create First Goal
              </button>
            </div>
          ) : sortedActive.length === 0 && sortedBlooming.length > 0 ? (
            <>
              <div
                style={{
                  background: "#fff",
                  borderRadius: 20,
                  padding: "22px",
                  textAlign: "center",
                  border: "2px dashed #C8E6C9",
                  marginBottom: 14,
                }}
              >
                <div style={{ fontSize: 30, marginBottom: 8 }}>🌟</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#3A6647", marginBottom: 4 }}>
                  All your goals are blooming!
                </div>
                <div style={{ fontSize: 12, color: "#9EB09E" }}>
                  Plant a new seed to keep growing.
                </div>
              </div>
              {/* Render the blooming section directly below */}
              {(() => {
                const trophies = sortedBlooming.filter((g) => g.completed).length;
                const blooms = sortedBlooming.filter((g) => !g.completed).length;
                return (
                  <div
                    style={{
                      borderRadius: 20,
                      background: "linear-gradient(160deg, #FFF8E1 0%, #F1F8F1 100%)",
                      border: "1.5px solid #FDD835",
                      padding: "4px 4px 8px",
                    }}
                  >
                    <button
                      onClick={() => setBloomOpen((o) => !o)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "12px 14px",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        textAlign: "left",
                      }}
                    >
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 12,
                          flexShrink: 0,
                          background: "#fff",
                          border: "1.5px solid #FDD835",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 20,
                        }}
                      >
                        🏆
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: "#3A2A00" }}>
                          Blooming &amp; Completed
                        </div>
                        <div style={{ fontSize: 11, color: "#7A6A2A", marginTop: 2 }}>
                          {trophies} trophies · {blooms} fully bloomed
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          color: "#3A2A00",
                          background: "#FDD835",
                          padding: "3px 9px",
                          borderRadius: 10,
                        }}
                      >
                        {sortedBlooming.length}
                      </span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        style={{
                          transform: bloomOpen ? "rotate(180deg)" : "none",
                          transition: "transform .2s",
                          flexShrink: 0,
                          marginLeft: 4,
                        }}
                      >
                        <polyline
                          points="3,5 8,11 13,5"
                          fill="none"
                          stroke="#7A6A2A"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    {bloomOpen && (
                      <div style={{ padding: "2px 6px 4px" }}>
                        {sortedBlooming.map((g) => (
                          <GoalCard
                            key={g.id}
                            goal={g}
                            dispatch={dispatch}
                            onPlantNow={handlePlantNow}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </>
          ) : (
            <>
              {sortedActive.map((g) => (
                <GoalCard key={g.id} goal={g} dispatch={dispatch} onPlantNow={handlePlantNow} />
              ))}

              {sortedBlooming.length > 0 && (
                <div
                  style={{
                    marginTop: sortedActive.length ? 18 : 0,
                    borderRadius: 20,
                    background: "linear-gradient(160deg, #FFF8E1 0%, #F1F8F1 100%)",
                    border: "1.5px solid #FDD835",
                    padding: "4px 4px 8px",
                  }}
                >
                  <button
                    onClick={() => setBloomOpen((o) => !o)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "12px 14px",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      textAlign: "left",
                    }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 12,
                        flexShrink: 0,
                        background: "#fff",
                        border: "1.5px solid #FDD835",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 20,
                      }}
                    >
                      🏆
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#3A2A00" }}>
                        Blooming &amp; Completed
                      </div>
                      <div style={{ fontSize: 11, color: "#7A6A2A", marginTop: 2 }}>
                        {sortedBlooming.filter((g) => g.completed).length} trophies ·{" "}
                        {sortedBlooming.filter((g) => !g.completed).length} fully bloomed
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: "#3A2A00",
                        background: "#FDD835",
                        padding: "3px 9px",
                        borderRadius: 10,
                      }}
                    >
                      {sortedBlooming.length}
                    </span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      style={{
                        transform: bloomOpen ? "rotate(180deg)" : "none",
                        transition: "transform .2s",
                        flexShrink: 0,
                        marginLeft: 4,
                      }}
                    >
                      <polyline
                        points="3,5 8,11 13,5"
                        fill="none"
                        stroke="#7A6A2A"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {bloomOpen && (
                    <div style={{ padding: "2px 6px 4px" }}>
                      {sortedBlooming.map((g) => (
                        <GoalCard
                          key={g.id}
                          goal={g}
                          dispatch={dispatch}
                          onPlantNow={handlePlantNow}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showAdd && (
        <NewGoalModal
          onAdd={handleAddGoal}
          onClose={() => setShowAdd(false)}
          state={state}
          dispatch={dispatch}
        />
      )}
    </div>
  );
}

Object.assign(window, { PlansTab, todayISO, formatDueLabel, isOverdue, DAY_LETTERS, DAY_NAMES });
