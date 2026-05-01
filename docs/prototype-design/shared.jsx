// shared.jsx — constants, PlantSprite, helpers — exported to window

const WHEEL_AREAS = [
  { key: "health", label: "Health", color: "#66BB6A", icon: "💪" },
  { key: "career", label: "Career", color: "#42A5F5", icon: "💼" },
  { key: "finances", label: "Finances", color: "#FFA726", icon: "💰" },
  { key: "relationships", label: "Relations", color: "#EC407A", icon: "❤️" },
  { key: "personal", label: "Growth", color: "#AB47BC", icon: "✨" },
  { key: "fun", label: "Fun", color: "#26C6DA", icon: "🎉" },
  { key: "spirituality", label: "Purpose", color: "#8D6E63", icon: "🌙" },
];

const AREA_RESOURCE = {
  health: "water",
  career: "sunlight",
  finances: "gold",
  relationships: "love",
  personal: "nutrients",
  fun: "magic",
  spirituality: "moonlight",
};

const RESOURCE_INFO = {
  water: { icon: "💧", label: "Water", color: "#29B6F6", bg: "#E3F2FD" },
  sunlight: { icon: "☀️", label: "Sunlight", color: "#FDD835", bg: "#FFFDE7" },
  gold: { icon: "🪙", label: "Gold", color: "#FFA726", bg: "#FFF3E0" },
  love: { icon: "🌸", label: "Love", color: "#EC407A", bg: "#FCE4EC" },
  nutrients: { icon: "🌿", label: "Nutrients", color: "#66BB6A", bg: "#E8F5E9" },
  magic: { icon: "✨", label: "Magic", color: "#AB47BC", bg: "#F3E5F5" },
  moonlight: { icon: "🌙", label: "Moonlight", color: "#7986CB", bg: "#E8EAF6" },
};

// 7 plant types — each with primary + secondary resource needs per stage transition
const PLANT_DEFS = [
  {
    id: "herb",
    name: "Herb",
    emoji: "🌿",
    primary: "water",
    secondary: "nutrients",
    hint: "Loves water & nutrients. Great for Health goals.",
    requirements: [
      { water: 8, nutrients: 4 },
      { water: 16, nutrients: 8 },
      { water: 28, nutrients: 14 },
      { water: 44, nutrients: 22 },
    ],
  },
  {
    id: "sunflower",
    name: "Sunflower",
    emoji: "🌻",
    primary: "sunlight",
    secondary: "water",
    hint: "Reaches for the sun. Perfect for Career goals.",
    requirements: [
      { sunlight: 8, water: 4 },
      { sunlight: 16, water: 8 },
      { sunlight: 28, water: 14 },
      { sunlight: 44, water: 22 },
    ],
  },
  {
    id: "money_tree",
    name: "Money Tree",
    emoji: "💰",
    primary: "gold",
    secondary: "sunlight",
    hint: "Grows with financial energy. Ideal for Finance goals.",
    requirements: [
      { gold: 6, sunlight: 4 },
      { gold: 12, sunlight: 8 },
      { gold: 22, sunlight: 14 },
      { gold: 35, sunlight: 22 },
    ],
  },
  {
    id: "rose",
    name: "Rose",
    emoji: "🌹",
    primary: "love",
    secondary: "water",
    hint: "Blooms with love & care. For Relationship goals.",
    requirements: [
      { love: 8, water: 4 },
      { love: 16, water: 8 },
      { love: 28, water: 14 },
      { love: 44, water: 22 },
    ],
  },
  {
    id: "mushroom",
    name: "Mushroom",
    emoji: "🍄",
    primary: "nutrients",
    secondary: "moonlight",
    hint: "Thrives in depth. For Personal Growth goals.",
    requirements: [
      { nutrients: 8, moonlight: 4 },
      { nutrients: 16, moonlight: 8 },
      { nutrients: 28, moonlight: 14 },
      { nutrients: 44, moonlight: 22 },
    ],
  },
  {
    id: "crystal",
    name: "Crystal",
    emoji: "💎",
    primary: "magic",
    secondary: "love",
    hint: "Crystallizes playful energy. For Fun goals.",
    requirements: [
      { magic: 8, love: 4 },
      { magic: 16, love: 8 },
      { magic: 28, love: 14 },
      { magic: 44, love: 22 },
    ],
  },
  {
    id: "moon_flower",
    name: "Moon Flower",
    emoji: "🌙",
    primary: "moonlight",
    secondary: "magic",
    hint: "Blooms under moonlight. For Spiritual goals.",
    requirements: [
      { moonlight: 8, magic: 4 },
      { moonlight: 16, magic: 8 },
      { moonlight: 28, magic: 14 },
      { moonlight: 44, magic: 22 },
    ],
  },
];

const STAGE_NAMES = ["Seed", "Sprout", "Seedling", "Mature", "Blooming ✨"];
const STAGE_COLORS = ["#9E9E9E", "#8BC34A", "#4CAF50", "#2E7D32", "#FDD835"];

// ── Plant health (driven by overdue tasks) ─────────────────────────────────
// Health is a 0..100 score derived from overdue tasks on the goal:
//   0 overdue           → 100 (healthy)
//   1 overdue           → 70  (wilting — visible droop)
//   2 overdue           → 40  (ill — yellowing leaves, sad)
//   3 overdue           → 15  (critically ill — last warning)
//   4+ overdue          → 0   (dead — must replant or drop)
// Each subsequent task drops health more steeply, and the slope tightens for
// long-overdue tasks (>7 days late counts double). Routines that the user has
// repeatedly missed also pull health down — we count a routine as a "miss" if
// its streak is 0 AND it has at least one repeat day this week.
function _todayLocalISO() {
  const d = new Date();
  const y = d.getFullYear(),
    m = String(d.getMonth() + 1).padStart(2, "0"),
    day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getOverdueCount(goal) {
  const today = _todayLocalISO();
  const tasks = goal.tasks || [];
  let count = 0;
  let weight = 0;
  tasks.forEach((t) => {
    if (t.completed) return;
    if (!t.dueDate) return;
    if (t.dueDate >= today) return;
    count++;
    // long-overdue (>7d) counts double weight
    const dueMs = new Date(t.dueDate + "T00:00:00").getTime();
    const todayMs = new Date(today + "T00:00:00").getTime();
    const daysLate = Math.round((todayMs - dueMs) / 86400000);
    weight += daysLate > 7 ? 2 : 1;
  });
  // Routines that lapsed (streak fully reset and they have repeat days)
  const routines = goal.routines || [];
  let lapsed = 0;
  routines.forEach((r) => {
    if (r.permanentlyCompleted) return;
    if (!(r.repeatDays || []).some(Boolean)) return;
    if ((r.streak || 0) === 0 && r.completedToday !== true) lapsed++;
  });
  // Lapsed routines add half-weight
  weight += lapsed * 0.5;
  return { count, weight, lapsed };
}

function getPlantHealth(goal) {
  // Seeds and completed/blooming goals don't have health concerns.
  // (A fully-bloomed plant is the user's victory state — we never wilt it.)
  if (!goal.planted) return { value: 100, state: "healthy", overdue: 0, lapsed: 0 };
  if (goal.completed) return { value: 100, state: "healthy", overdue: 0, lapsed: 0 };

  const { count, weight, lapsed } = getOverdueCount(goal);
  // Map weight → health using a steepening scale:
  // weight  0→100, 1→70, 2→40, 3→15, ≥4→0
  let value;
  if (weight <= 0) value = 100;
  else if (weight <= 1) value = 70;
  else if (weight <= 2) value = 40;
  else if (weight < 4) value = 15;
  else value = 0;

  let state;
  if (value >= 90) state = "healthy";
  else if (value >= 60) state = "wilting";
  else if (value >= 25) state = "ill";
  else if (value > 0) state = "critical";
  else state = "dead";

  return { value, state, overdue: count, lapsed };
}

const HEALTH_STATE_INFO = {
  healthy: { label: "Healthy", color: "#3A6647", bg: "#E8F0E8", icon: "🌿", message: "Thriving" },
  wilting: {
    label: "Wilting",
    color: "#B58900",
    bg: "#FFF8E1",
    icon: "🥀",
    message: "A task is overdue — catch up to perk it back up",
  },
  ill: {
    label: "Unwell",
    color: "#D97706",
    bg: "#FFEDD5",
    icon: "😷",
    message: "Multiple tasks overdue — your plant is struggling",
  },
  critical: {
    label: "Critical",
    color: "#C9484E",
    bg: "#FBE3E5",
    icon: "⚠️",
    message: "On the brink — finish a task today to save it",
  },
  dead: {
    label: "Dead",
    color: "#5A5A5A",
    bg: "#EAEAEA",
    icon: "💀",
    message: "Your plant withered. Replant or drop the goal.",
  },
};

function getPlantProgress(goal) {
  const def = PLANT_DEFS.find((p) => p.id === goal.plantType);
  if (!def || goal.stage >= 4) return { pct: 1, needed: {}, req: {} };
  const req = def.requirements[goal.stage];
  const res = goal.plantRes || {};
  let totalNeeded = 0,
    totalHave = 0;
  const needed = {};
  Object.entries(req).forEach(([r, amt]) => {
    const have = Math.min(res[r] || 0, amt);
    totalHave += have;
    totalNeeded += amt;
    if (have < amt) needed[r] = amt - have;
  });
  return { pct: totalNeeded > 0 ? totalHave / totalNeeded : 1, needed, req };
}

function checkAndGrowPlant(goal) {
  const def = PLANT_DEFS.find((p) => p.id === goal.plantType);
  if (!def || goal.stage >= 4) return goal;
  // A dead plant cannot grow until it's replanted.
  const h = getPlantHealth(goal);
  if (h.state === "dead") return goal;
  const req = def.requirements[goal.stage];
  const res = goal.plantRes || {};
  const canGrow = Object.entries(req).every(([r, amt]) => (res[r] || 0) >= amt);
  if (!canGrow) return goal;
  const newRes = { ...res };
  Object.entries(req).forEach(([r, amt]) => {
    newRes[r] = Math.max(0, (newRes[r] || 0) - amt);
  });
  // chain: check again in case resources allow multiple jumps
  let grown = { ...goal, stage: goal.stage + 1, plantRes: newRes };
  return checkAndGrowPlant(grown);
}

// ─── PlantSprite ─────────────────────────────────────────────────────────────
// healthState: 'healthy' | 'wilting' | 'ill' | 'critical' | 'dead' (optional)
function PlantSprite({ plantId, stage, size = 64, healthState = "healthy" }) {
  const w = size,
    h = size;
  const cx = w / 2;
  const potY = h * 0.65;
  const potH = h * 0.28;
  const potW = w * 0.4;
  const rimPts = `${cx - potW * 0.55},${potY} ${cx + potW * 0.55},${potY} ${cx + potW * 0.5},${potY + potH * 0.25} ${cx - potW * 0.5},${potY + potH * 0.25}`;
  const potPts = `${cx - potW * 0.5},${potY + potH * 0.22} ${cx + potW * 0.5},${potY + potH * 0.22} ${cx + potW * 0.4},${potY + potH} ${cx - potW * 0.4},${potY + potH}`;
  const by = potY;

  function renderHerb() {
    if (stage === 0) return <ellipse cx={cx} cy={by - 1} rx={4} ry={2.5} fill="#A5D6A7" />;
    if (stage === 1)
      return (
        <g>
          <line
            x1={cx}
            y1={by}
            x2={cx}
            y2={by - h * 0.2}
            stroke="#4CAF50"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <ellipse
            cx={cx - 5}
            cy={by - h * 0.13}
            rx={5}
            ry={3}
            fill="#66BB6A"
            transform={`rotate(-35,${cx - 5},${by - h * 0.13})`}
          />
          <ellipse
            cx={cx + 5}
            cy={by - h * 0.15}
            rx={5}
            ry={3}
            fill="#81C784"
            transform={`rotate(30,${cx + 5},${by - h * 0.15})`}
          />
        </g>
      );
    if (stage === 2)
      return (
        <g>
          <line
            x1={cx}
            y1={by}
            x2={cx}
            y2={by - h * 0.35}
            stroke="#388E3C"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {[
            [-9, -0.2, -35],
            [0, -0.28, 5],
            [9, -0.22, 30],
            [4, -0.35, -20],
            [-5, -0.32, 15],
          ].map(([dx, dy, rot], i) => (
            <ellipse
              key={i}
              cx={cx + dx}
              cy={by + dy * h}
              rx={6}
              ry={3.5}
              fill={i % 2 ? "#66BB6A" : "#4CAF50"}
              transform={`rotate(${rot},${cx + dx},${by + dy * h})`}
            />
          ))}
        </g>
      );
    if (stage === 3)
      return (
        <g>
          <line
            x1={cx}
            y1={by}
            x2={cx}
            y2={by - h * 0.44}
            stroke="#2E7D32"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {[
            [-10, -0.22, -35],
            [-5, -0.35, 15],
            [0, -0.44, 0],
            [5, -0.38, -10],
            [10, -0.26, 30],
            [-7, -0.48, 20],
            [7, -0.5, -15],
          ].map(([dx, dy, rot], i) => (
            <ellipse
              key={i}
              cx={cx + dx}
              cy={by + dy * h}
              rx={7}
              ry={4}
              fill={i % 2 ? "#66BB6A" : "#43A047"}
              transform={`rotate(${rot},${cx + dx},${by + dy * h})`}
            />
          ))}
          {[
            [-6, -0.3],
            [4, -0.28],
            [0, -0.5],
          ].map(([dx, dy], i) => (
            <circle key={i} cx={cx + dx} cy={by + dy * h} r="2" fill="#FDD835" />
          ))}
        </g>
      );
    return (
      <g>
        <line
          x1={cx}
          y1={by}
          x2={cx}
          y2={by - h * 0.48}
          stroke="#1B5E20"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {[
          [-12, -0.22, -35],
          [-6, -0.36, 15],
          [0, -0.48, 0],
          [6, -0.4, -10],
          [12, -0.26, 30],
          [-8, -0.5, 20],
          [8, -0.52, -15],
          [0, -0.58, 5],
        ].map(([dx, dy, rot], i) => (
          <ellipse
            key={i}
            cx={cx + dx}
            cy={by + dy * h}
            rx={8}
            ry={4.5}
            fill={i % 2 ? "#66BB6A" : "#43A047"}
            transform={`rotate(${rot},${cx + dx},${by + dy * h})`}
          />
        ))}
        {[
          [-8, -0.3],
          [5, -0.28],
          [0, -0.5],
          [-3, -0.56],
          [6, -0.42],
        ].map(([dx, dy], i) => (
          <circle key={i} cx={cx + dx} cy={by + dy * h} r="2.5" fill="#FDD835" opacity="0.9" />
        ))}
        <ellipse
          cx={cx}
          cy={by - h * 0.38}
          rx={h * 0.22}
          ry={h * 0.12}
          fill="#FDD835"
          opacity="0.12"
        />
      </g>
    );
  }

  function renderSunflower() {
    if (stage === 0) return <ellipse cx={cx} cy={by - 1} rx={4} ry={2.5} fill="#FFF9C4" />;
    const stemH = [h * 0.18, h * 0.26, h * 0.34, h * 0.42][stage - 1] || h * 0.18;
    const petR = [0, 7, 10, 14][stage - 1] || 0;
    return (
      <g>
        <line
          x1={cx}
          y1={by}
          x2={cx}
          y2={by - stemH}
          stroke="#4CAF50"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {stage >= 2 && (
          <path
            d={`M${cx},${by - stemH * 0.5} Q${cx - 8},${by - stemH * 0.58} ${cx - 6},${by - stemH * 0.74}`}
            stroke="#66BB6A"
            strokeWidth="1.5"
            fill="none"
          />
        )}
        {stage === 1 && (
          <ellipse cx={cx} cy={by - stemH} rx={5} ry={4} fill="#FDD835" opacity="0.5" />
        )}
        {stage >= 2 &&
          [0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
            const r = (a * Math.PI) / 180;
            return (
              <ellipse
                key={a}
                cx={cx + Math.cos(r) * (petR + 2)}
                cy={by - stemH + Math.sin(r) * (petR + 2)}
                rx={petR * 0.45}
                ry={petR}
                fill="#FDD835"
                transform={`rotate(${a},${cx + Math.cos(r) * (petR + 2)},${by - stemH + Math.sin(r) * (petR + 2)})`}
              />
            );
          })}
        {stage >= 2 && <circle cx={cx} cy={by - stemH} r={petR * 0.5} fill="#795548" />}
        {stage === 4 && (
          <circle cx={cx} cy={by - stemH} r={petR * 2} fill="#FDD835" opacity="0.13" />
        )}
      </g>
    );
  }

  function renderRose() {
    if (stage === 0) return <ellipse cx={cx} cy={by - 1} rx={4} ry={2.5} fill="#FFCDD2" />;
    const stemH = [h * 0.2, h * 0.28, h * 0.36, h * 0.42][stage - 1];
    const petR = [0, 6, 9, 12][stage - 1] || 0;
    return (
      <g>
        <line
          x1={cx}
          y1={by}
          x2={cx}
          y2={by - stemH}
          stroke="#4CAF50"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {stage >= 2 && (
          <path
            d={`M${cx},${by - stemH * 0.4} Q${cx - 8},${by - stemH * 0.5} ${cx - 5},${by - stemH * 0.65}`}
            stroke="#66BB6A"
            strokeWidth="1.5"
            fill="none"
          />
        )}
        {stage === 1 && <ellipse cx={cx} cy={by - stemH - 3} rx={3} ry={5} fill="#EF5350" />}
        {stage >= 2 && (
          <g>
            <path
              d={`M${cx},${by - stemH - petR} C${cx + petR * 1.2},${by - stemH - petR * 0.5} ${cx + petR},${by - stemH + petR * 0.4} ${cx},${by - stemH + petR * 0.3} C${cx - petR},${by - stemH + petR * 0.4} ${cx - petR * 1.2},${by - stemH - petR * 0.5} ${cx},${by - stemH - petR}Z`}
              fill="#EF5350"
            />
            <circle cx={cx} cy={by - stemH} r={petR * 0.55} fill="#E53935" />
            {stage >= 3 && <circle cx={cx} cy={by - stemH} r={petR * 0.3} fill="#C62828" />}
            {stage === 4 &&
              [-petR * 1.4, petR * 1.4].map((dx, i) => (
                <path
                  key={i}
                  d={`M${cx + dx},${by - stemH - petR * 0.8} C${cx + dx + petR * (i ? -1.2 : 1.2)},${by - stemH - petR * 0.3} ${cx + dx + petR * (i ? -1 : 1)},${by - stemH + petR * 0.3} ${cx + dx},${by - stemH + petR * 0.2} C${cx + dx - petR * (i ? -1 : 1) * 0.8},${by - stemH + petR * 0.3} ${cx + dx - petR * (i ? -1.2 : 1.2)},${by - stemH - petR * 0.3} ${cx + dx},${by - stemH - petR * 0.8}Z`}
                  fill="#EF5350"
                  opacity="0.6"
                />
              ))}
            {stage === 4 && (
              <circle cx={cx} cy={by - stemH} r={petR * 1.9} fill="#EF5350" opacity="0.08" />
            )}
          </g>
        )}
        {stage >= 2 &&
          [h * 0.25, h * 0.35].map((sh, i) => (
            <path
              key={i}
              d={`M${cx},${by - sh} L${cx + (i ? -1 : 1) * 5},${by - sh + 4}`}
              stroke="#4CAF50"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          ))}
      </g>
    );
  }

  function renderMushroom() {
    if (stage === 0) return <ellipse cx={cx} cy={by - 1} rx={4} ry={2.5} fill="#D7CCC8" />;
    const sc = [0.3, 0.5, 0.72, 1][stage - 1];
    const capR = h * 0.2 * sc,
      stemH = h * 0.22 * sc,
      capRY = capR * 0.65;
    return (
      <g>
        <rect
          x={cx - 3 * sc}
          y={by - stemH - 1}
          width={6 * sc}
          height={stemH + 1}
          rx={2 * sc}
          fill="#D7CCC8"
        />
        <ellipse cx={cx} cy={by - stemH} rx={capR} ry={capRY} fill="#EF5350" />
        <ellipse
          cx={cx}
          cy={by - stemH + capRY * 0.25}
          rx={capR * 0.88}
          ry={capRY * 0.55}
          fill="#E53935"
        />
        {stage >= 2 &&
          [
            [-capR * 0.44, -capRY * 0.5],
            [0, -capRY * 0.72],
            [capR * 0.42, -capRY * 0.4],
          ].map(([dx, dy], i) => (
            <circle key={i} cx={cx + dx} cy={by - stemH + dy} r={3 * sc} fill="white" />
          ))}
        {stage === 4 && (
          <>
            <ellipse
              cx={cx}
              cy={by - stemH}
              rx={capR * 1.8}
              ry={capRY * 0.5}
              fill="#EF5350"
              opacity="0.14"
            />
            <ellipse
              cx={cx}
              cy={by - stemH}
              rx={capR * 3}
              ry={capRY * 0.3}
              fill="#7986CB"
              opacity="0.1"
            />
          </>
        )}
      </g>
    );
  }

  function renderMoneyTree() {
    if (stage === 0)
      return (
        <g>
          <ellipse cx={cx} cy={by - 1} rx={4} ry={2.5} fill="#A5D6A7" />
          <circle cx={cx} cy={by - 6} r="3" fill="#FDD835" opacity="0.8" />
        </g>
      );
    const trunkH = [h * 0.2, h * 0.3, h * 0.38, h * 0.44][stage - 1];
    const crownR = [h * 0.14, h * 0.18, h * 0.24, h * 0.28][stage - 1];
    const coins =
      stage >= 2
        ? [
            [-crownR * 0.7, 0],
            [crownR * 0.6, -crownR * 0.1],
            [0, crownR * 0.3],
            [-crownR * 0.3, -crownR * 0.5],
            [crownR * 0.4, crownR * 0.2],
          ].slice(0, stage)
        : [];
    return (
      <g>
        <rect x={cx - 3} y={by - trunkH} width={6} height={trunkH} rx="2" fill="#795548" />
        <circle cx={cx} cy={by - trunkH} r={crownR} fill="#2E7D32" />
        {stage >= 2 && (
          <circle
            cx={cx - crownR * 0.55}
            cy={by - trunkH - crownR * 0.3}
            r={crownR * 0.7}
            fill="#388E3C"
          />
        )}
        {stage >= 3 && (
          <circle
            cx={cx + crownR * 0.5}
            cy={by - trunkH - crownR * 0.25}
            r={crownR * 0.65}
            fill="#43A047"
          />
        )}
        {stage >= 4 && (
          <circle cx={cx} cy={by - trunkH - crownR * 0.6} r={crownR * 0.55} fill="#4CAF50" />
        )}
        {coins.map(([dx, dy], i) => (
          <circle
            key={i}
            cx={cx + dx}
            cy={by - trunkH + dy}
            r="3.5"
            fill="#FDD835"
            stroke="#F9A825"
            strokeWidth="0.8"
          />
        ))}
        {stage === 4 && (
          <circle cx={cx} cy={by - trunkH} r={crownR * 1.7} fill="#FDD835" opacity="0.1" />
        )}
      </g>
    );
  }

  function renderCrystal() {
    if (stage === 0) return <ellipse cx={cx} cy={by - 1} rx={4} ry={2.5} fill="#E1BEE7" />;
    const base = h * 0.1 * (stage * 0.5 + 0.5);
    const sets = [
      [{ x: cx, h: base * 1.6, w: 5 }],
      [
        { x: cx - 8, h: base * 0.9, w: 4 },
        { x: cx, h: base * 1.6, w: 5 },
        { x: cx + 7, h: base, w: 4 },
      ],
      [
        { x: cx - 10, h: base * 0.8, w: 3 },
        { x: cx - 4, h: base * 1.3, w: 4 },
        { x: cx, h: base * 1.8, w: 6 },
        { x: cx + 4, h: base * 1.2, w: 4 },
        { x: cx + 9, h: base * 0.7, w: 3 },
      ],
      [
        { x: cx - 12, h: base * 0.8, w: 3 },
        { x: cx - 7, h: base * 1.2, w: 4 },
        { x: cx - 2, h: base * 1.9, w: 6 },
        { x: cx + 3, h: base * 1.5, w: 5 },
        { x: cx + 8, h: base * 1.1, w: 4 },
        { x: cx + 12, h: base * 0.7, w: 3 },
      ],
    ][stage - 1];
    const cols = ["#CE93D8", "#AB47BC", "#9C27B0", "#7B1FA2", "#E1BEE7"];
    return (
      <g>
        {sets.map((c, i) => (
          <g key={i}>
            <polygon
              points={`${c.x},${by - c.h} ${c.x + c.w},${by} ${c.x - c.w},${by}`}
              fill={cols[i % cols.length]}
              opacity="0.9"
            />
            <polygon
              points={`${c.x},${by - c.h} ${c.x + c.w},${by} ${c.x + c.w * 0.3},${by - c.h * 0.7}`}
              fill="white"
              opacity="0.22"
            />
          </g>
        ))}
        {stage === 4 && (
          <>
            <ellipse
              cx={cx}
              cy={by - base * 1.4}
              rx={base * 2}
              ry={base * 0.6}
              fill="#AB47BC"
              opacity="0.13"
            />
            {[
              [-8, -base * 0.7],
              [8, -base * 1.2],
              [0, -base * 2],
            ].map(([dx, dy], i) => (
              <circle key={i} cx={cx + dx} cy={by + dy} r="1.8" fill="#E1BEE7" opacity="0.9" />
            ))}
          </>
        )}
      </g>
    );
  }

  function renderMoonFlower() {
    if (stage === 0)
      return (
        <g>
          <ellipse cx={cx} cy={by - 1} rx={4} ry={2.5} fill="#C5CAE9" />
          <circle cx={cx} cy={by - 6} r="2.5" fill="#7986CB" opacity="0.6" />
        </g>
      );
    const stemH = [h * 0.2, h * 0.3, h * 0.38, h * 0.44][stage - 1];
    const petR = [0, 7, 10, 13][stage - 1] || 0;
    return (
      <g>
        <line
          x1={cx}
          y1={by}
          x2={cx}
          y2={by - stemH}
          stroke="#5C6BC0"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        {stage >= 2 && (
          <path
            d={`M${cx},${by - stemH * 0.4} Q${cx - 7},${by - stemH * 0.52} ${cx - 5},${by - stemH * 0.68}`}
            stroke="#7986CB"
            strokeWidth="1.5"
            fill="none"
          />
        )}
        {stage === 1 && <ellipse cx={cx} cy={by - stemH - 3} rx={3} ry={6} fill="#C5CAE9" />}
        {stage >= 2 &&
          [0, 60, 120, 180, 240, 300].map((a) => {
            const r = (a * Math.PI) / 180;
            return (
              <ellipse
                key={a}
                cx={cx + Math.cos(r) * (petR + 2)}
                cy={by - stemH + Math.sin(r) * (petR + 2)}
                rx={petR * 0.44}
                ry={petR}
                fill="#C5CAE9"
                transform={`rotate(${a},${cx + Math.cos(r) * (petR + 2)},${by - stemH + Math.sin(r) * (petR + 2)})`}
              />
            );
          })}
        {stage >= 2 && <circle cx={cx} cy={by - stemH} r={petR * 0.45} fill="#FFFDE7" />}
        {stage === 4 && (
          <>
            <circle cx={cx} cy={by - stemH} r={petR * 1.9} fill="#7986CB" opacity="0.13" />
            <circle cx={cx} cy={by - stemH} r={petR * 3.2} fill="#7986CB" opacity="0.06" />
            {[
              [-petR * 1.2, -petR * 0.8],
              [petR * 1.2, -petR * 0.6],
              [-petR * 0.4, petR * 1.3],
            ].map(([dx, dy], i) => (
              <circle
                key={i}
                cx={cx + dx}
                cy={by - stemH + dy}
                r="1.5"
                fill="white"
                opacity="0.9"
              />
            ))}
          </>
        )}
      </g>
    );
  }

  function renderPlant() {
    switch (plantId) {
      case "herb":
        return renderHerb();
      case "sunflower":
        return renderSunflower();
      case "rose":
        return renderRose();
      case "mushroom":
        return renderMushroom();
      case "money_tree":
        return renderMoneyTree();
      case "crystal":
        return renderCrystal();
      case "moon_flower":
        return renderMoonFlower();
      default:
        return renderHerb();
    }
  }

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={(() => {
        switch (healthState) {
          case "wilting":
            return { filter: "saturate(0.65) hue-rotate(-8deg) brightness(0.96)" };
          case "ill":
            return { filter: "saturate(0.45) sepia(0.25) brightness(0.92)" };
          case "critical":
            return { filter: "saturate(0.25) sepia(0.45) brightness(0.85)", opacity: 0.92 };
          case "dead":
            return { filter: "grayscale(0.85) brightness(0.7) contrast(0.95)", opacity: 0.85 };
          default:
            return undefined;
        }
      })()}
    >
      <polygon points={rimPts} fill="#BCAAA4" />
      <polygon points={potPts} fill="#A1887F" />
      <ellipse cx={cx} cy={potY + potH} rx={potW * 0.4} ry={3} fill="rgba(0,0,0,0.07)" />
      <ellipse cx={cx} cy={potY} rx={potW * 0.47} ry={potW * 0.17} fill="#5D4037" />
      {healthState === "dead" ? (
        // Dead plant — render bare withered stem regardless of plantId
        <g>
          <line
            x1={cx}
            y1={by}
            x2={cx - 3}
            y2={by - h * 0.18}
            stroke="#6B4F2F"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1={cx - 3}
            y1={by - h * 0.18}
            x2={cx + 4}
            y2={by - h * 0.28}
            stroke="#6B4F2F"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <line
            x1={cx - 3}
            y1={by - h * 0.18}
            x2={cx - 7}
            y2={by - h * 0.24}
            stroke="#6B4F2F"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          {/* drooping dried leaf */}
          <path
            d={`M${cx + 4},${by - h * 0.28} Q${cx + 8},${by - h * 0.18} ${cx + 9},${by - h * 0.08}`}
            stroke="#8B6F47"
            strokeWidth="1.4"
            fill="none"
            strokeLinecap="round"
          />
          {/* X eyes for clarity at small sizes */}
          {size >= 40 && (
            <g opacity="0.65">
              <text
                x={cx}
                y={by - h * 0.04}
                textAnchor="middle"
                fontSize={size * 0.18}
                fontWeight="700"
                fill="#5A5A5A"
              >
                ✕‿✕
              </text>
            </g>
          )}
        </g>
      ) : (
        renderPlant()
      )}
      {healthState === "wilting" && (
        // Single droplet hint
        <text x={cx + w * 0.32} y={by - h * 0.2} fontSize={size * 0.18} opacity="0.85">
          💧
        </text>
      )}
      {healthState === "ill" && (
        <text x={cx + w * 0.32} y={by - h * 0.18} fontSize={size * 0.2} opacity="0.9">
          🥀
        </text>
      )}
      {healthState === "critical" && (
        <text x={cx + w * 0.3} y={by - h * 0.2} fontSize={size * 0.22} opacity="0.95">
          ⚠️
        </text>
      )}
    </svg>
  );
}

// ── Area-quota helpers ──────────────────────────────────────────────────────
// A user's quota for an area = priority points they assigned in the wheel of life.
// 0 priority points → that area is locked (no goals allowed).
// We also enforce a minimum of 1 if priority > 0 so quotas line up 1:1 with points.
//
// Completed goals don't count against the quota — they've graduated and freed
// up the slot for a new pursuit. Seeds (unplanted goals) DO count.
function getAreaQuota(state, areaKey) {
  return Math.max(0, +(state?.wheelOfLife?.[areaKey] || 0));
}

function getAreaUsage(state, areaKey) {
  return (state?.goals || []).filter((g) => g.area === areaKey && !g.completed).length;
}

function getAreaSlots(state) {
  // Returns { areaKey: { quota, used, remaining, locked, full } } for every wheel area.
  const out = {};
  (window.WHEEL_AREAS || []).forEach((a) => {
    const quota = getAreaQuota(state, a.key);
    const used = getAreaUsage(state, a.key);
    out[a.key] = {
      quota,
      used,
      remaining: Math.max(0, quota - used),
      locked: quota === 0,
      full: quota > 0 && used >= quota,
    };
  });
  return out;
}

// Return active (non-completed) goals in an area, sorted lowest-priority first.
// Used for "remove a goal to free a slot" suggestions. Within an area we sort
// seeds before planted (seeds are cheapest to drop), then by lowest growth stage.
function getAreaGoalsByDroppability(state, areaKey) {
  return (state?.goals || [])
    .filter((g) => g.area === areaKey && !g.completed)
    .sort((a, b) => {
      if (!!a.planted !== !!b.planted) return a.planted ? 1 : -1;
      return (a.stage || 0) - (b.stage || 0);
    });
}

Object.assign(window, {
  WHEEL_AREAS,
  AREA_RESOURCE,
  RESOURCE_INFO,
  PLANT_DEFS,
  STAGE_NAMES,
  STAGE_COLORS,
  PlantSprite,
  getPlantProgress,
  checkAndGrowPlant,
  getPlantHealth,
  getOverdueCount,
  HEALTH_STATE_INFO,
  getAreaQuota,
  getAreaUsage,
  getAreaSlots,
  getAreaGoalsByDroppability,
});
