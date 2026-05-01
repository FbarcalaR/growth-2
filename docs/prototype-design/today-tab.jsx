// today-tab.jsx — Today view: tasks + routines from all goals — exported to window

function ResourcePill({ type, amount }) {
  const info = RESOURCE_INFO[type];
  if (!info) return null;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 2,
        fontSize: 10,
        fontWeight: 700,
        color: info.color,
        background: info.bg,
        padding: "2px 6px",
        borderRadius: 6,
      }}
    >
      {info.icon} +{amount}
    </span>
  );
}

function CoinPill({ amount }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 2,
        fontSize: 10,
        fontWeight: 700,
        color: "#F0A500",
        background: "#FFF8EC",
        padding: "2px 6px",
        borderRadius: 6,
        border: "1px solid #FFE0B2",
      }}
    >
      🪙 +{amount}
    </span>
  );
}

function TodayTaskRow({ task, goal, onToggle }) {
  const area = WHEEL_AREAS.find((a) => a.key === goal.area);
  const resourceType = AREA_RESOURCE[goal.area];
  const resourceInfo = RESOURCE_INFO[resourceType];
  const plantDef = PLANT_DEFS.find((p) => p.id === goal.plantType);
  const secondaryRes = plantDef?.secondary;

  return (
    <div
      onClick={() => onToggle(goal.id, task.id, task.isRoutine)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: task.completed || task.completedToday ? "#F7FAF7" : "#fff",
        border: "1.5px solid",
        borderColor: task.completed || task.completedToday ? "#C8E6C9" : "#EAEDE8",
        borderRadius: 14,
        padding: "12px 14px",
        marginBottom: 8,
        cursor: "pointer",
        opacity: task.completed || task.completedToday ? 0.6 : 1,
        transition: "transform .1s",
      }}
    >
      {/* Check */}
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: 7,
          border: "2px solid",
          flexShrink: 0,
          borderColor: task.completed || task.completedToday ? "#3A6647" : "#C8D6C8",
          background: task.completed || task.completedToday ? "#3A6647" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all .2s",
        }}
      >
        {(task.completed || task.completedToday) && (
          <svg width="10" height="8" viewBox="0 0 10 8">
            <polyline
              points="1,4 3.5,7 9,1"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#1C2B20",
            textDecoration: task.completed || task.completedToday ? "line-through" : "none",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {task.title}
        </div>
        <div
          style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3, flexWrap: "wrap" }}
        >
          {task.isRoutine && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#9EB09E",
                background: "#F5F5F5",
                padding: "2px 6px",
                borderRadius: 5,
              }}
            >
              🔁 {task.streak || 0}d streak
            </span>
          )}
          {!task.isRoutine &&
            task.dueDate &&
            window.isOverdue &&
            window.isOverdue(task.dueDate) &&
            !task.completed && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#C9484E",
                  background: "#FDECEE",
                  padding: "2px 6px",
                  borderRadius: 5,
                }}
              >
                ⚠ {window.formatDueLabel(task.dueDate)}
              </span>
            )}
          {!task.isRoutine &&
            task.dueDate === (window.todayISO ? window.todayISO() : null) &&
            !task.completed && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#3A6647",
                  background: "#E8F5E9",
                  padding: "2px 6px",
                  borderRadius: 5,
                }}
              >
                📅 Today
              </span>
            )}
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: area?.color || "#9EB09E",
              background: (area?.color || "#ccc") + "18",
              padding: "2px 6px",
              borderRadius: 5,
            }}
          >
            {area?.icon} {area?.label}
          </span>
        </div>
      </div>
      {/* Rewards */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          alignItems: "flex-end",
          flexShrink: 0,
        }}
      >
        {resourceType && <ResourcePill type={resourceType} amount={task.isRoutine ? 2 : 4} />}
        {task.isRoutine && secondaryRes && <ResourcePill type={secondaryRes} amount={2} />}
        <CoinPill amount={task.isRoutine ? 2 : 3} />
      </div>
    </div>
  );
}

function GoalGroupHeader({ goal }) {
  const area = WHEEL_AREAS.find((a) => a.key === goal.area);
  const plantDef = PLANT_DEFS.find((p) => p.id === goal.plantType);
  const { pct } = getPlantProgress(goal);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, marginTop: 16 }}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          background: (area?.color || "#3A6647") + "22",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          flexShrink: 0,
        }}
      >
        {plantDef?.emoji || "🌱"}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#1C2B20",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {goal.title}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ flex: 1, height: 4, background: "#F0F4EC", borderRadius: 2 }}>
            <div
              style={{
                height: "100%",
                background: area?.color || "#3A6647",
                borderRadius: 2,
                width: `${pct * 100}%`,
                transition: "width .4s",
              }}
            />
          </div>
          <span style={{ fontSize: 9, color: "#9EB09E", fontWeight: 600, flexShrink: 0 }}>
            {STAGE_NAMES[goal.stage]}
          </span>
        </div>
      </div>
    </div>
  );
}

function TodayTab({ state, dispatch }) {
  const [completedOpen, setCompletedOpen] = React.useState(false);

  // Today's date + day-of-week (Mon=0..Sun=6)
  const todayIso = window.todayISO
    ? window.todayISO()
    : (() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      })();
  const jsDay = new Date().getDay(); // 0=Sun..6=Sat
  const dowMonFirst = (jsDay + 6) % 7; // Mon=0..Sun=6

  // Flatten only items relevant to TODAY:
  //  - tasks: due today, overdue, or with no due date
  //  - routines: scheduled for today's weekday (defaults to every day if missing)
  const allItems = [];
  state.goals.forEach((goal) => {
    (goal.tasks || []).forEach((t) => {
      const due = t.dueDate || null;
      const showByDate = !due || due <= todayIso; // today or overdue or undated
      if (showByDate || t.completed) {
        allItems.push({ item: t, goal, isRoutine: false });
      }
    });
    (goal.routines || []).forEach((r) => {
      const days = r.repeatDays || [true, true, true, true, true, true, true];
      const scheduledToday = !!days[dowMonFirst];
      if (scheduledToday || r.completedToday) {
        allItems.push({ item: { ...r, isRoutine: true }, goal, isRoutine: true });
      }
    });
  });

  const pending = allItems.filter((x) => !(x.item.completed || x.item.completedToday));
  const done = allItems.filter((x) => x.item.completed || x.item.completedToday);
  const totalAll = allItems.length;
  const totalDone = done.length;

  // Group pending by goal
  const byGoal = {};
  pending.forEach((x) => {
    if (!byGoal[x.goal.id]) byGoal[x.goal.id] = { goal: x.goal, items: [] };
    byGoal[x.goal.id].items.push(x);
  });

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div
      style={{ height: "100%", display: "flex", flexDirection: "column", background: "#F4F7F0" }}
    >
      {/* Header */}
      <div style={{ padding: "20px 20px 14px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 12, color: "#9EB09E", fontWeight: 500 }}>{greeting},</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#1C2B20", lineHeight: 1.2 }}>
              {state.user.name} 🌿
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                background: "#FFF8EC",
                padding: "5px 10px",
                borderRadius: 20,
                border: "1px solid #FFE0B2",
              }}
            >
              <span style={{ fontSize: 13 }}>🪙</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#F0A500" }}>
                {state.shopCoins}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                background: "#FFF3E0",
                padding: "5px 10px",
                borderRadius: 20,
                border: "1px solid #FFE0B2",
              }}
            >
              <span style={{ fontSize: 12 }}>🔥</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#F0A500" }}>
                {state.streak}d
              </span>
            </div>
          </div>
        </div>

        {/* Progress summary */}
        {totalAll > 0 && (
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: "12px 16px",
              border: "1.5px solid #E8EDE5",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 7,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: "#1C2B20" }}>Today's Plan</span>
              <span style={{ fontSize: 12, color: "#9EB09E" }}>
                {totalDone}/{totalAll} complete
              </span>
            </div>
            <div style={{ height: 7, background: "#E8F5E9", borderRadius: 4 }}>
              <div
                style={{
                  height: "100%",
                  background: "linear-gradient(90deg,#3A6647,#66BB6A)",
                  borderRadius: 4,
                  width: `${totalAll ? (totalDone / totalAll) * 100 : 0}%`,
                  transition: "width .5s ease",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 24px" }}>
        {totalAll === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#9EB09E" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🌱</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#3A6647", marginBottom: 6 }}>
              No tasks yet
            </div>
            <div style={{ fontSize: 13 }}>Go to Life tab to create a goal and add tasks to it.</div>
          </div>
        ) : (
          <>
            {/* Pending items grouped by goal */}
            {Object.values(byGoal).map(({ goal, items }) => (
              <div key={goal.id}>
                <GoalGroupHeader goal={goal} />
                {items.map(({ item }) => (
                  <TodayTaskRow
                    key={item.id}
                    task={item}
                    goal={goal}
                    onToggle={(gid, tid, isRoutine) =>
                      dispatch({
                        type: isRoutine ? "TOGGLE_ROUTINE_ITEM" : "TOGGLE_TASK_ITEM",
                        goalId: gid,
                        itemId: tid,
                      })
                    }
                  />
                ))}
              </div>
            ))}

            {/* Done section (accordion, collapsed by default) */}
            {done.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <button
                  onClick={() => setCompletedOpen((o) => !o)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: "none",
                    border: "none",
                    padding: "4px 0",
                    marginBottom: 8,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#9EB09E",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    style={{
                      transform: `rotate(${completedOpen ? 90 : 0}deg)`,
                      transition: "transform .15s",
                    }}
                  >
                    <polyline
                      points="3,2 7,5 3,8"
                      fill="none"
                      stroke="#9EB09E"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Completed · {done.length}</span>
                </button>
                {completedOpen &&
                  done.map(({ item, goal }) => (
                    <TodayTaskRow
                      key={item.id}
                      task={item}
                      goal={goal}
                      onToggle={(gid, tid, isRoutine) =>
                        dispatch({
                          type: isRoutine ? "TOGGLE_ROUTINE_ITEM" : "TOGGLE_TASK_ITEM",
                          goalId: gid,
                          itemId: tid,
                        })
                      }
                    />
                  ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { TodayTab });
