// TasksTab — tasks give coins; routines grow plants — exported to window

const PRIORITY_COLORS = { high: "#E05252", medium: "#F0A500", low: "#4CAF50" };
const PRIORITY_BG = { high: "#FFF0F0", medium: "#FFF8EC", low: "#F1F8F1" };
const AREA_COLORS = {
  health: "#66BB6A",
  career: "#42A5F5",
  finances: "#FFA726",
  relationships: "#EC407A",
  personal: "#AB47BC",
  fun: "#26C6DA",
  spirituality: "#8D6E63",
};

const PLANT_TYPES = [
  { id: "herb", name: "Herb", emoji: "🌿" },
  { id: "flower", name: "Flower", emoji: "🌸" },
  { id: "succulent", name: "Succulent", emoji: "🪴" },
  { id: "fern", name: "Fern", emoji: "🌿" },
  { id: "tree", name: "Tree", emoji: "🌳" },
];

// Growth stages by streak
function getStage(streak) {
  if (streak >= 30) return 4;
  if (streak >= 14) return 3;
  if (streak >= 7) return 2;
  if (streak >= 3) return 1;
  return 0;
}

const STAGE_LABELS = ["Seed", "Sprout", "Seedling", "Mature", "Blooming ✨"];
const STAGE_COLORS = ["#C8D6C8", "#8BC34A", "#4CAF50", "#2E7D32", "#FDD835"];

// Mini plant sprite for routine cards
function MiniPlant({ type, stage, size = 48 }) {
  const s = size,
    h = s,
    w = s;
  const cx = w / 2,
    cy = h * 0.68;
  const sc = stage / 4; // 0→1

  // Pot
  const potH = h * 0.28,
    potW = w * 0.38;
  const potY = cy;

  const potPts = `${cx - potW * 0.5},${potY} ${cx + potW * 0.5},${potY} ${cx + potW * 0.4},${potY + potH} ${cx - potW * 0.4},${potY + potH}`;
  const rimPts = `${cx - potW * 0.55},${potY} ${cx + potW * 0.55},${potY} ${cx + potW * 0.5},${potY + potH * 0.22} ${cx - potW * 0.5},${potY + potH * 0.22}`;

  function renderPlant() {
    if (stage === 0) {
      // Seed bump
      return <ellipse cx={cx} cy={potY} rx={4} ry={2.5} fill="#A5D6A7" />;
    }
    if (type === "herb" || type === "fern") {
      if (stage === 1)
        return (
          <g>
            <line
              x1={cx}
              y1={potY}
              x2={cx}
              y2={potY - h * 0.18}
              stroke="#66BB6A"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <ellipse
              cx={cx}
              cy={potY - h * 0.22}
              rx={5}
              ry={4}
              fill="#81C784"
              transform={`rotate(-20,${cx},${potY - h * 0.22})`}
            />
          </g>
        );
      if (stage === 2)
        return (
          <g>
            <line
              x1={cx}
              y1={potY}
              x2={cx}
              y2={potY - h * 0.3}
              stroke="#4CAF50"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <ellipse
              cx={cx - 7}
              cy={potY - h * 0.2}
              rx={7}
              ry={4}
              fill="#66BB6A"
              transform={`rotate(-30,${cx - 7},${potY - h * 0.2})`}
            />
            <ellipse
              cx={cx + 6}
              cy={potY - h * 0.24}
              rx={6}
              ry={3.5}
              fill="#81C784"
              transform={`rotate(25,${cx + 6},${potY - h * 0.24})`}
            />
            <ellipse cx={cx} cy={potY - h * 0.34} rx={5} ry={3} fill="#4CAF50" />
          </g>
        );
      if (stage === 3)
        return (
          <g>
            <line
              x1={cx}
              y1={potY}
              x2={cx}
              y2={potY - h * 0.42}
              stroke="#388E3C"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {[
              [-14, -0.28, -35],
              [-8, -0.38, 20],
              [8, -0.35, -15],
              [12, -0.26, 30],
              [0, -0.45, 0],
            ].map(([dx, dy, rot], i) => (
              <ellipse
                key={i}
                cx={cx + dx}
                cy={potY + dy * h}
                rx={7}
                ry={4}
                fill={i % 2 ? "#66BB6A" : "#4CAF50"}
                transform={`rotate(${rot},${cx + dx},${potY + dy * h})`}
              />
            ))}
          </g>
        );
      // stage 4
      return (
        <g>
          <line
            x1={cx}
            y1={potY}
            x2={cx}
            y2={potY - h * 0.46}
            stroke="#2E7D32"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {[
            [-14, -0.28, -35],
            [-8, -0.38, 20],
            [8, -0.35, -15],
            [12, -0.26, 30],
            [0, -0.46, 0],
            [-4, -0.52, 10],
          ].map(([dx, dy, rot], i) => (
            <ellipse
              key={i}
              cx={cx + dx}
              cy={potY + dy * h}
              rx={8}
              ry={4.5}
              fill={i % 2 ? "#66BB6A" : "#43A047"}
              transform={`rotate(${rot},${cx + dx},${potY + dy * h})`}
            />
          ))}
          {[
            [-10, -0.3],
            [8, -0.34],
            [0, -0.52],
          ].map(([dx, dy], i) => (
            <circle key={i} cx={cx + dx} cy={potY + dy * h} r="3" fill="#FDD835" opacity="0.9" />
          ))}
        </g>
      );
    }
    if (type === "flower") {
      const stemH = [0, h * 0.16, h * 0.24, h * 0.32, h * 0.36][stage];
      const petR = [0, 0, 5, 8, 10][stage];
      const petColor = ["", "", "#F48FB1", "#E91E63", "#E91E63"][stage];
      const centerColor = ["", "", "#FDD835", "#FDD835", "#FDD835"][stage];
      return (
        <g>
          {stage >= 1 && (
            <line
              x1={cx}
              y1={potY}
              x2={cx}
              y2={potY - stemH}
              stroke="#4CAF50"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          )}
          {stage >= 2 &&
            [0, 60, 120, 180, 240, 300].map((a) => {
              const r = (a * Math.PI) / 180;
              return (
                <ellipse
                  key={a}
                  cx={cx + Math.cos(r) * (petR + 2)}
                  cy={potY - stemH + Math.sin(r) * (petR + 2)}
                  rx={petR * 0.5}
                  ry={petR}
                  fill={petColor}
                  transform={`rotate(${a},${cx + Math.cos(r) * (petR + 2)},${potY - stemH + Math.sin(r) * (petR + 2)})`}
                />
              );
            })}
          {stage >= 2 && <circle cx={cx} cy={potY - stemH} r={petR * 0.45} fill={centerColor} />}
          {stage === 4 && (
            <circle cx={cx} cy={potY - stemH} r={petR * 1.5} fill="#FDD835" opacity="0.15" />
          )}
          {stage >= 2 && stage < 4 && (
            <path
              d={`M${cx},${potY - stemH * 0.4} Q${cx - 9},${potY - stemH * 0.5} ${cx - 6},${potY - stemH * 0.7}`}
              stroke="#66BB6A"
              strokeWidth="1.5"
              fill="none"
            />
          )}
        </g>
      );
    }
    if (type === "succulent") {
      if (stage === 1)
        return (
          <g>
            <ellipse cx={cx} cy={potY - 5} rx={6} ry={5} fill="#81C784" />
            <ellipse cx={cx} cy={potY - 7} rx={4} ry={3.5} fill="#A5D6A7" />
          </g>
        );
      const radii = [0, 0, [6, 4], [9, 6, 4], [12, 8, 5, 3]][stage] || [];
      return (
        <g>
          {radii.map((r, i) => (
            <ellipse
              key={i}
              cx={cx}
              cy={potY - 4 - i * 5}
              rx={r}
              ry={r * 0.7}
              fill={i % 2 ? "#81C784" : "#66BB6A"}
            />
          ))}
          {stage === 4 && (
            <circle cx={cx} cy={potY - 4 - radii.length * 5 + 3} r="3" fill="#F48FB1" />
          )}
        </g>
      );
    }
    if (type === "tree") {
      const trunkH = [0, 8, 14, 20, 24][stage];
      const crownR = [0, 5, 9, 13, 16][stage];
      return (
        <g>
          {stage >= 1 && (
            <rect x={cx - 2} y={potY - trunkH} width={4} height={trunkH} rx={1} fill="#795548" />
          )}
          {stage >= 1 && <circle cx={cx} cy={potY - trunkH} r={crownR} fill="#43A047" />}
          {stage >= 2 && (
            <circle
              cx={cx - crownR * 0.5}
              cy={potY - trunkH - crownR * 0.3}
              r={crownR * 0.7}
              fill="#66BB6A"
            />
          )}
          {stage >= 3 && (
            <circle
              cx={cx + crownR * 0.5}
              cy={potY - trunkH - crownR * 0.25}
              r={crownR * 0.65}
              fill="#388E3C"
            />
          )}
          {stage === 4 &&
            [
              [-5, -3],
              [4, -5],
              [0, -7],
            ].map(([dx, dy], i) => (
              <circle
                key={i}
                cx={cx + dx}
                cy={potY - trunkH + dy}
                r="2.5"
                fill="#FDD835"
                opacity="0.85"
              />
            ))}
        </g>
      );
    }
    return null;
  }

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {/* Pot */}
      <polygon points={rimPts} fill="#BCAAA4" />
      <polygon points={potPts} fill="#A1887F" />
      <ellipse cx={cx} cy={potY + potH} rx={potW * 0.4} ry={3} fill="rgba(0,0,0,0.08)" />
      {/* Soil */}
      <ellipse cx={cx} cy={potY} rx={potW * 0.47} ry={potW * 0.18} fill="#5D4037" />
      {renderPlant()}
    </svg>
  );
}

function CoinBadge({ coins }) {
  return (
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
      <svg width="14" height="14" viewBox="0 0 14 14">
        <circle cx="7" cy="7" r="6.5" fill="#FDD835" stroke="#F9A825" strokeWidth="1" />
        <text x="7" y="10.5" textAnchor="middle" fontSize="8" fontWeight="800" fill="#F57F17">
          C
        </text>
      </svg>
      <span style={{ fontSize: 13, fontWeight: 700, color: "#F0A500" }}>{coins}</span>
    </div>
  );
}

function StreakBadge({ streak }) {
  return (
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
      <span style={{ fontSize: 13 }}>🔥</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: "#F0A500" }}>{streak}d</span>
    </div>
  );
}

function TaskCard({ task, onToggle }) {
  const [pressed, setPressed] = React.useState(false);
  return (
    <div
      onClick={() => onToggle(task.id)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: task.completed ? "#F7FAF7" : "#fff",
        border: "1.5px solid",
        borderColor: task.completed ? "#C8E6C9" : "#EAEDE8",
        borderRadius: 16,
        padding: "14px 16px",
        marginBottom: 10,
        cursor: "pointer",
        transition: "transform .1s, opacity .2s",
        transform: pressed ? "scale(0.98)" : "scale(1)",
        opacity: task.completed ? 0.6 : 1,
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: 8,
          border: "2px solid",
          borderColor: task.completed ? "#3A6647" : "#C8D6C8",
          background: task.completed ? "#3A6647" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "all .2s",
        }}
      >
        {task.completed && (
          <svg width="12" height="10" viewBox="0 0 12 10">
            <polyline
              points="1,5 4.5,8.5 11,1"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "#1C2B20",
            textDecoration: task.completed ? "line-through" : "none",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {task.title}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              background: PRIORITY_BG[task.priority],
              color: PRIORITY_COLORS[task.priority],
              padding: "2px 7px",
              borderRadius: 6,
            }}
          >
            {task.priority}
          </span>
          {task.dueDate && <span style={{ fontSize: 11, color: "#9EB09E" }}>{task.dueDate}</span>}
          {task.area && (
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: AREA_COLORS[task.area] || "#ccc",
                display: "inline-block",
              }}
            />
          )}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 3,
          fontSize: 12,
          fontWeight: 700,
          color: "#F0A500",
          background: "#FFF8EC",
          padding: "4px 8px",
          borderRadius: 8,
          flexShrink: 0,
          border: "1px solid #FFE0B2",
        }}
      >
        <svg width="11" height="11" viewBox="0 0 14 14">
          <circle cx="7" cy="7" r="6.5" fill="#FDD835" stroke="#F9A825" strokeWidth="1" />
          <text x="7" y="10.5" textAnchor="middle" fontSize="8" fontWeight="800" fill="#F57F17">
            C
          </text>
        </svg>
        +{task.coinReward}
      </div>
    </div>
  );
}

function RoutineCard({ routine, onToggle }) {
  const stage = getStage(routine.streak);
  const stageLabel = STAGE_LABELS[stage];
  const stageColor = STAGE_COLORS[stage];
  const nextStreak = [3, 7, 14, 30][stage] || null;
  const pct =
    stage < 4
      ? (() => {
          const thresholds = [0, 3, 7, 14, 30];
          const lo = thresholds[stage],
            hi = thresholds[stage + 1];
          return Math.min(1, (routine.streak - lo) / (hi - lo));
        })()
      : 1;

  return (
    <div
      onClick={() => onToggle(routine.id)}
      style={{
        background: "#fff",
        border: "1.5px solid",
        borderRadius: 18,
        borderColor: routine.completedToday ? "#C8E6C9" : "#EAEDE8",
        padding: "14px 16px",
        marginBottom: 10,
        cursor: "pointer",
        transition: "box-shadow .2s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Plant preview */}
        <div style={{ flexShrink: 0, position: "relative" }}>
          <MiniPlant type={routine.plantType} stage={stage} size={52} />
          {routine.completedToday && (
            <div
              style={{
                position: "absolute",
                top: -3,
                right: -3,
                width: 14,
                height: 14,
                background: "#3A6647",
                borderRadius: "50%",
                border: "2px solid white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="7" height="6" viewBox="0 0 7 6">
                <polyline
                  points="0.5,3 2.5,5 6.5,0.5"
                  fill="none"
                  stroke="white"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
        </div>
        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#1C2B20", marginBottom: 3 }}>
            {routine.title}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: stageColor,
                background: stageColor + "22",
                padding: "2px 8px",
                borderRadius: 6,
              }}
            >
              {stageLabel}
            </span>
            <span style={{ fontSize: 11, color: "#9EB09E" }}>🔥 {routine.streak}d streak</span>
          </div>
          {/* Growth bar */}
          <div style={{ height: 5, background: "#F0F4EC", borderRadius: 3 }}>
            <div
              style={{
                height: "100%",
                background: stageColor,
                borderRadius: 3,
                width: `${pct * 100}%`,
                transition: "width .5s ease",
              }}
            />
          </div>
          {stage < 4 && nextStreak && (
            <div style={{ fontSize: 10, color: "#9EB09E", marginTop: 3 }}>
              {nextStreak - routine.streak} more days to {STAGE_LABELS[stage + 1]}
            </div>
          )}
        </div>
        {/* Coin reward */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            fontSize: 11,
            fontWeight: 700,
            color: "#F0A500",
            background: "#FFF8EC",
            padding: "4px 8px",
            borderRadius: 8,
            flexShrink: 0,
            border: "1px solid #FFE0B2",
          }}
        >
          <svg width="11" height="11" viewBox="0 0 14 14">
            <circle cx="7" cy="7" r="6.5" fill="#FDD835" stroke="#F9A825" strokeWidth="1" />
            <text x="7" y="10.5" textAnchor="middle" fontSize="8" fontWeight="800" fill="#F57F17">
              C
            </text>
          </svg>
          +{routine.coinReward}
        </div>
      </div>
    </div>
  );
}

function AddTaskModal({ onAdd, onClose }) {
  const [title, setTitle] = React.useState("");
  const [priority, setPriority] = React.useState("medium");
  const [area, setArea] = React.useState("health");
  function submit() {
    if (!title.trim()) return;
    onAdd({ title: title.trim(), priority, area, coinReward: 20 });
    onClose();
  }
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
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
        <div style={{ fontSize: 18, fontWeight: 700, color: "#1C2B20", marginBottom: 20 }}>
          New Task
        </div>
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="What do you want to do?"
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "13px 16px",
            border: "1.5px solid #C8E6C9",
            borderRadius: 14,
            fontSize: 15,
            fontFamily: "inherit",
            outline: "none",
            marginBottom: 16,
            color: "#1C2B20",
          }}
        />
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#7A8A7A",
              marginBottom: 8,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Priority
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {["high", "medium", "low"].map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 12,
                  border: "2px solid",
                  borderColor: priority === p ? PRIORITY_COLORS[p] : "#EAEDE8",
                  background: priority === p ? PRIORITY_BG[p] : "#FAFAFA",
                  color: priority === p ? PRIORITY_COLORS[p] : "#9EB09E",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#7A8A7A",
              marginBottom: 8,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Life Area
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {Object.entries(AREA_COLORS).map(([a, c]) => (
              <button
                key={a}
                onClick={() => setArea(a)}
                style={{
                  padding: "7px 12px",
                  borderRadius: 20,
                  border: "2px solid",
                  borderColor: area === a ? c : "#EAEDE8",
                  background: area === a ? c + "22" : "#FAFAFA",
                  color: area === a ? c : "#9EB09E",
                  fontWeight: 600,
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {a.charAt(0).toUpperCase() + a.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={submit}
          style={{
            width: "100%",
            padding: "15px",
            borderRadius: 16,
            border: "none",
            background: "#3A6647",
            color: "white",
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Add Task · +20 🪙
        </button>
      </div>
    </div>
  );
}

function AddRoutineModal({ onAdd, onClose }) {
  const [title, setTitle] = React.useState("");
  const [plantType, setPlantType] = React.useState("herb");
  function submit() {
    if (!title.trim()) return;
    onAdd({ title: title.trim(), plantType, coinReward: 5 });
    onClose();
  }
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
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
        <div style={{ fontSize: 18, fontWeight: 700, color: "#1C2B20", marginBottom: 6 }}>
          New Routine
        </div>
        <div style={{ fontSize: 13, color: "#9EB09E", marginBottom: 18 }}>
          Your routine will grow its own plant in the garden 🌱
        </div>
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="e.g. Morning meditation"
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "13px 16px",
            border: "1.5px solid #C8E6C9",
            borderRadius: 14,
            fontSize: 15,
            fontFamily: "inherit",
            outline: "none",
            marginBottom: 18,
            color: "#1C2B20",
          }}
        />
        <div style={{ marginBottom: 24 }}>
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
            Choose your plant
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6 }}>
            {PLANT_TYPES.map((p) => (
              <div
                key={p.id}
                onClick={() => setPlantType(p.id)}
                style={{
                  borderRadius: 14,
                  border: "2px solid",
                  borderColor: plantType === p.id ? "#3A6647" : "#EAEDE8",
                  background: plantType === p.id ? "#F0F7F0" : "#FAFAFA",
                  padding: "8px 4px",
                  textAlign: "center",
                  cursor: "pointer",
                }}
              >
                <MiniPlant type={p.id} stage={3} size={44} />
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: plantType === p.id ? "#3A6647" : "#9EB09E",
                    marginTop: 2,
                  }}
                >
                  {p.name}
                </div>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={submit}
          style={{
            width: "100%",
            padding: "15px",
            borderRadius: 16,
            border: "none",
            background: "#3A6647",
            color: "white",
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Start Growing 🌱
        </button>
      </div>
    </div>
  );
}

function TasksTab({ state, dispatch }) {
  const [showAdd, setShowAdd] = React.useState(false);
  const [showAddRoutine, setShowAddRoutine] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState("tasks");

  const todayTasks = state.tasks.filter((t) => !t.archived);
  const completed = todayTasks.filter((t) => t.completed).length;

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
      {/* Header */}
      <div style={{ padding: "20px 20px 16px", background: "#F4F7F0" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 13, color: "#9EB09E", fontWeight: 500 }}>Good morning,</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#1C2B20" }}>
              {state.user.name} 🌿
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5, alignItems: "flex-end" }}>
            <CoinBadge coins={state.coins} />
            <StreakBadge streak={state.streak} />
          </div>
        </div>
        {/* Day progress */}
        {activeSection === "tasks" && (
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
                marginBottom: 8,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: "#1C2B20" }}>Today's Tasks</span>
              <span style={{ fontSize: 13, color: "#9EB09E" }}>
                {completed}/{todayTasks.length}
              </span>
            </div>
            <div style={{ height: 7, background: "#E8F5E9", borderRadius: 4 }}>
              <div
                style={{
                  height: "100%",
                  background: "linear-gradient(90deg,#3A6647,#66BB6A)",
                  borderRadius: 4,
                  width: `${todayTasks.length ? (completed / todayTasks.length) * 100 : 0}%`,
                  transition: "width .4s ease",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", padding: "0 20px 12px", gap: 8 }}>
        {["tasks", "routines"].map((s) => (
          <button
            key={s}
            onClick={() => setActiveSection(s)}
            style={{
              padding: "8px 20px",
              borderRadius: 20,
              border: "1.5px solid",
              cursor: "pointer",
              fontFamily: "inherit",
              background: activeSection === s ? "#3A6647" : "#fff",
              color: activeSection === s ? "#fff" : "#7A8A7A",
              borderColor: activeSection === s ? "#3A6647" : "#E8EDE5",
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px", paddingBottom: 80 }}>
        {activeSection === "tasks" ? (
          <>
            {todayTasks.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#9EB09E" }}>
                <div style={{ fontSize: 32 }}>📋</div>
                <div style={{ fontSize: 15, marginTop: 8 }}>No tasks yet. Add some!</div>
              </div>
            ) : (
              todayTasks.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  onToggle={(id) => dispatch({ type: "TOGGLE_TASK", id })}
                />
              ))
            )}
          </>
        ) : (
          <>
            {state.routines.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#9EB09E" }}>
                <div style={{ fontSize: 32 }}>🌱</div>
                <div style={{ fontSize: 15, marginTop: 8 }}>
                  Add a routine to grow your first plant!
                </div>
              </div>
            ) : (
              state.routines.map((r) => (
                <RoutineCard
                  key={r.id}
                  routine={r}
                  onToggle={(id) => dispatch({ type: "TOGGLE_ROUTINE", id })}
                />
              ))
            )}
          </>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => (activeSection === "tasks" ? setShowAdd(true) : setShowAddRoutine(true))}
        style={{
          position: "absolute",
          bottom: 24,
          right: 20,
          width: 52,
          height: 52,
          borderRadius: "50%",
          border: "none",
          background: "#3A6647",
          color: "white",
          fontSize: 26,
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(58,102,71,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        +
      </button>

      {showAdd && (
        <AddTaskModal
          onAdd={(t) =>
            dispatch({ type: "ADD_TASK", task: { ...t, id: Date.now(), completed: false } })
          }
          onClose={() => setShowAdd(false)}
        />
      )}
      {showAddRoutine && (
        <AddRoutineModal
          onAdd={(r) =>
            dispatch({
              type: "ADD_ROUTINE",
              routine: { ...r, id: Date.now(), completedToday: false, streak: 0 },
            })
          }
          onClose={() => setShowAddRoutine(false)}
        />
      )}
    </div>
  );
}

Object.assign(window, { TasksTab, MiniPlant, getStage, STAGE_LABELS, STAGE_COLORS, PLANT_TYPES });
