// ProfileTab — works with new goal-nested state — exported to window

function StatCard({ label, value, icon, color }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: "14px 12px",
        textAlign: "center",
        border: "1.5px solid #EAEDE8",
        flex: 1,
      }}
    >
      <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: color || "#1C2B20" }}>{value}</div>
      <div style={{ fontSize: 11, color: "#9EB09E", fontWeight: 500 }}>{label}</div>
    </div>
  );
}

// Flatten helpers
function allTasks(state) {
  return (state.goals || []).flatMap((g) => g.tasks || []);
}
function allRoutines(state) {
  return (state.goals || []).flatMap((g) => g.routines || []);
}

const ACHIEVEMENTS = [
  {
    id: "first_task",
    icon: "🌱",
    name: "First Bloom",
    desc: "Complete your first task",
    check: (s) => allTasks(s).some((t) => t.completed),
  },
  {
    id: "week_streak",
    icon: "🔥",
    name: "On Fire",
    desc: "7-day streak",
    check: (s) => s.streak >= 7,
  },
  {
    id: "first_routine",
    icon: "🌿",
    name: "Habit Starter",
    desc: "Add your first routine",
    check: (s) => allRoutines(s).length >= 1,
  },
  {
    id: "routine_7",
    icon: "💧",
    name: "Consistent",
    desc: "Keep a routine for 7 days",
    check: (s) => allRoutines(s).some((r) => r.streak >= 7),
  },
  {
    id: "routine_30",
    icon: "🌳",
    name: "Deep Roots",
    desc: "Keep a routine for 30 days",
    check: (s) => allRoutines(s).some((r) => r.streak >= 30),
  },
  {
    id: "first_goal",
    icon: "🎯",
    name: "Visionary",
    desc: "Set your first goal",
    check: (s) => (s.goals || []).length >= 1,
  },
  {
    id: "first_plant",
    icon: "🌸",
    name: "In Bloom",
    desc: "Grow a plant to Sprout stage",
    check: (s) => (s.goals || []).some((g) => g.planted && g.stage >= 1),
  },
  {
    id: "full_bloom",
    icon: "✨",
    name: "Full Bloom",
    desc: "Grow a plant to Blooming",
    check: (s) => (s.goals || []).some((g) => g.stage >= 4),
  },
  {
    id: "big_spender",
    icon: "💰",
    name: "Green Thumb",
    desc: "Spend 500 coins in the shop",
    check: (s) => (s.totalCoinsSpent || 0) >= 500,
  },
  {
    id: "wheel_full",
    icon: "☯️",
    name: "In Balance",
    desc: "Score 7+ in all life areas",
    check: (s) => Object.values(s.wheelOfLife || {}).every((v) => v >= 7),
  },
  {
    id: "decorator",
    icon: "🏡",
    name: "Decorator",
    desc: "Place 3 decorations in the garden",
    check: (s) => (s.garden?.decoGrid || []).flat().filter(Boolean).length >= 3,
  },
];

function ProfileTab({ state, dispatch }) {
  const tasks = allTasks(state);
  const routines = allRoutines(state);
  const tasksCompleted = tasks.filter((t) => t.completed).length;
  const goalsCount = (state.goals || []).length;
  const plantsPlanted = (state.goals || []).filter((g) => g.planted).length;
  const longestStreak = routines.length ? Math.max(...routines.map((r) => r.streak || 0)) : 0;
  const totalDecos = (state.garden?.decoGrid || []).flat().filter(Boolean).length;
  const level = Math.floor((state.totalCoinsEarned || 0) / 100) + 1;
  const xpPct = (state.totalCoinsEarned || 0) % 100;
  const xpToNext = 100 - xpPct;
  const avgWheel = Object.values(state.wheelOfLife || {}).length
    ? Math.round((Object.values(state.wheelOfLife).reduce((a, b) => a + b, 0) / 7) * 10) / 10
    : 0;

  const [showReset, setShowReset] = React.useState(false);

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
      <div style={{ overflowY: "auto", flex: 1 }}>
        {/* Hero */}
        <div
          style={{
            background: "linear-gradient(135deg,#3A6647 0%,#4E8A62 100%)",
            padding: "28px 20px 24px",
            color: "white",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                background: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                border: "2px solid rgba(255,255,255,0.4)",
              }}
            >
              🌿
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{state.user.name}</div>
              <div style={{ fontSize: 13, opacity: 0.8 }}>Level {level} Gardener</div>
              <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 120,
                    height: 6,
                    background: "rgba(255,255,255,0.2)",
                    borderRadius: 3,
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      background: "#FDD835",
                      borderRadius: 3,
                      width: `${xpPct}%`,
                      transition: "width .4s",
                    }}
                  />
                </div>
                <span style={{ fontSize: 11, opacity: 0.8 }}>{xpToNext} to next</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, opacity: 0.7 }}>Coins</div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>🪙 {state.shopCoins || 0}</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ padding: "16px 16px 0" }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#7A8A7A",
              marginBottom: 10,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Stats
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <StatCard label="Day Streak" value={state.streak || 0} icon="🔥" color="#F0A500" />
            <StatCard label="Life Balance" value={avgWheel} icon="☯️" color="#42A5F5" />
            <StatCard label="Goals" value={goalsCount} icon="🎯" color="#AB47BC" />
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            <StatCard label="Tasks Done" value={tasksCompleted} icon="✅" color="#3A6647" />
            <StatCard label="Plants" value={plantsPlanted} icon="🌿" color="#66BB6A" />
            <StatCard label="Decorations" value={totalDecos} icon="🏡" color="#8D6E63" />
          </div>
        </div>

        {/* Resource overview */}
        {(state.goals || []).some((g) => g.planted) && (
          <div style={{ padding: "0 16px 16px" }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#7A8A7A",
                marginBottom: 10,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Garden
            </div>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
              {(state.goals || [])
                .filter((g) => g.planted)
                .map((goal) => {
                  const stageNames = window.STAGE_NAMES || [];
                  const stageColors = window.STAGE_COLORS || [];
                  const plantDef = (window.PLANT_DEFS || []).find((p) => p.id === goal.plantType);
                  const area = (window.WHEEL_AREAS || []).find((a) => a.key === goal.area);
                  return (
                    <div
                      key={goal.id}
                      style={{
                        flexShrink: 0,
                        background: "#fff",
                        borderRadius: 14,
                        padding: "10px 14px",
                        border: "1.5px solid #EAEDE8",
                        textAlign: "center",
                        minWidth: 72,
                      }}
                    >
                      <div style={{ fontSize: 20, marginBottom: 2 }}>{plantDef?.emoji || "🌱"}</div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: stageColors[goal.stage] || "#9EB09E",
                        }}
                      >
                        {stageNames[goal.stage] || "Seed"}
                      </div>
                      <div
                        style={{
                          fontSize: 9,
                          color: "#9EB09E",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: 64,
                        }}
                      >
                        {goal.title}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Achievements */}
        <div style={{ padding: "0 16px 16px" }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#7A8A7A",
              marginBottom: 10,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Achievements
          </div>
          {ACHIEVEMENTS.map((a) => {
            const unlocked = a.check(state);
            return (
              <div
                key={a.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: "#fff",
                  borderRadius: 16,
                  padding: "14px 16px",
                  marginBottom: 8,
                  border: "1.5px solid",
                  borderColor: unlocked ? "#C8E6C9" : "#EAEDE8",
                  opacity: unlocked ? 1 : 0.55,
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 14,
                    background: unlocked ? "#F1F8F1" : "#F5F5F5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    flexShrink: 0,
                  }}
                >
                  {a.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#1C2B20" }}>{a.name}</div>
                  <div style={{ fontSize: 12, color: "#9EB09E" }}>{a.desc}</div>
                </div>
                {unlocked && <div style={{ fontSize: 16, color: "#3A6647" }}>✓</div>}
              </div>
            );
          })}
        </div>

        {/* Settings */}
        <div style={{ padding: "0 16px 32px" }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#7A8A7A",
              marginBottom: 10,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Settings
          </div>
          <div
            style={{
              background: "#fff",
              borderRadius: 18,
              border: "1.5px solid #EAEDE8",
              overflow: "hidden",
            }}
          >
            {[
              { label: "Notifications", icon: "🔔" },
              { label: "Dark Mode", icon: "🌙" },
              { label: "Export Data", icon: "📦" },
            ].map((item, i, arr) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "16px",
                  borderBottom: i < arr.length - 1 ? "1px solid #F0F4EC" : "none",
                }}
              >
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: "#1C2B20" }}>
                  {item.label}
                </span>
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <polyline
                    points="5,3 11,8 5,13"
                    fill="none"
                    stroke="#C8D6C8"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            ))}
            <div
              onClick={() => setShowReset(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "16px",
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: 18 }}>🔄</span>
              <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: "#E05252" }}>
                Reset Progress
              </span>
            </div>
          </div>
        </div>
      </div>

      {showReset && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 32,
          }}
          onClick={() => setShowReset(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 24,
              padding: "28px 24px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>⚠️</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#1C2B20", marginBottom: 8 }}>
              Reset Everything?
            </div>
            <div style={{ fontSize: 13, color: "#9EB09E", marginBottom: 20 }}>
              This will erase all goals, plants, and your garden.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowReset(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: 14,
                  border: "1.5px solid #E8EDE5",
                  background: "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  color: "#7A8A7A",
                  fontFamily: "inherit",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  dispatch({ type: "RESET" });
                  setShowReset(false);
                }}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: 14,
                  border: "none",
                  background: "#E05252",
                  color: "white",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { ProfileTab });
