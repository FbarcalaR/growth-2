import type { CSSProperties } from "react";

import type { HealthState } from "@/shared/health";
import type { PlantId, Stage } from "@/shared/plants";

type PlantSpriteProps = {
  plantId: PlantId;
  stage: Stage;
  /** Side length in px. Defaults to 64. */
  size?: number;
  /** Tints the sprite to reflect plant health. Defaults to "healthy". */
  healthState?: HealthState;
  className?: string;
};

/**
 * SVG plant illustration ported from the prototype's `shared.jsx#PlantSprite`.
 * Renders one of seven plant variants across five stages (0 = seed,
 * 4 = blooming) plus a withered-stem fallback when the plant is dead.
 *
 * Health filters are inline `style` (rather than Tailwind classes) because the
 * `filter` chains are too specific to be tokenised — they're tightly coupled
 * to the colour palette of each variant.
 */
export function PlantSprite({
  plantId,
  stage,
  size = 64,
  healthState = "healthy",
  className,
}: PlantSpriteProps) {
  const w = size;
  const h = size;
  const cx = w / 2;
  const potY = h * 0.65;
  const potH = h * 0.28;
  const potW = w * 0.4;
  const rimPts = `${cx - potW * 0.55},${potY} ${cx + potW * 0.55},${potY} ${cx + potW * 0.5},${potY + potH * 0.25} ${cx - potW * 0.5},${potY + potH * 0.25}`;
  const potPts = `${cx - potW * 0.5},${potY + potH * 0.22} ${cx + potW * 0.5},${potY + potH * 0.22} ${cx + potW * 0.4},${potY + potH} ${cx - potW * 0.4},${potY + potH}`;
  const by = potY;

  const style: CSSProperties | undefined = healthFilter(healthState);

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      role="img"
      aria-label={`${plantId} stage ${stage}`}
      data-plant-id={plantId}
      data-stage={stage}
      data-health-state={healthState}
      style={style}
      className={className}
    >
      <polygon points={rimPts} fill="#BCAAA4" />
      <polygon points={potPts} fill="#A1887F" />
      <ellipse cx={cx} cy={potY + potH} rx={potW * 0.4} ry={3} fill="rgba(0,0,0,0.07)" />
      <ellipse cx={cx} cy={potY} rx={potW * 0.47} ry={potW * 0.17} fill="#5D4037" />
      {healthState === "dead" ? (
        <DeadPlant cx={cx} by={by} h={h} size={size} />
      ) : (
        renderPlant(plantId, stage, cx, by, h)
      )}
      {healthState === "wilting" && (
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

function healthFilter(state: HealthState): CSSProperties | undefined {
  switch (state) {
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
}

function renderPlant(plantId: PlantId, stage: Stage, cx: number, by: number, h: number) {
  switch (plantId) {
    case "herb":
      return renderHerb(stage, cx, by, h);
    case "sunflower":
      return renderSunflower(stage, cx, by, h);
    case "rose":
      return renderRose(stage, cx, by, h);
    case "mushroom":
      return renderMushroom(stage, cx, by, h);
    case "money_tree":
      return renderMoneyTree(stage, cx, by, h);
    case "crystal":
      return renderCrystal(stage, cx, by, h);
    case "moon_flower":
      return renderMoonFlower(stage, cx, by, h);
    default:
      return renderHerb(stage, cx, by, h);
  }
}

// ─── Variant renderers ──────────────────────────────────────────────────────
// Each renderer takes the stage and pot anchors and returns an SVG `<g>` that
// the parent overlays on the pot. They're long because each stage is a hand-
// drawn composition; ports are 1:1 from the prototype to keep visual fidelity.

function renderHerb(stage: Stage, cx: number, by: number, h: number) {
  if (stage === 0) return <ellipse cx={cx} cy={by - 1} rx={4} ry={2.5} fill="#A5D6A7" />;
  if (stage === 1) {
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
  }
  if (stage === 2) {
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
        {(
          [
            [-9, -0.2, -35],
            [0, -0.28, 5],
            [9, -0.22, 30],
            [4, -0.35, -20],
            [-5, -0.32, 15],
          ] as const
        ).map(([dx, dy, rot], i) => (
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
  }
  if (stage === 3) {
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
        {(
          [
            [-10, -0.22, -35],
            [-5, -0.35, 15],
            [0, -0.44, 0],
            [5, -0.38, -10],
            [10, -0.26, 30],
            [-7, -0.48, 20],
            [7, -0.5, -15],
          ] as const
        ).map(([dx, dy, rot], i) => (
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
        {(
          [
            [-6, -0.3],
            [4, -0.28],
            [0, -0.5],
          ] as const
        ).map(([dx, dy], i) => (
          <circle key={i} cx={cx + dx} cy={by + dy * h} r="2" fill="#FDD835" />
        ))}
      </g>
    );
  }
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
      {(
        [
          [-12, -0.22, -35],
          [-6, -0.36, 15],
          [0, -0.48, 0],
          [6, -0.4, -10],
          [12, -0.26, 30],
          [-8, -0.5, 20],
          [8, -0.52, -15],
          [0, -0.58, 5],
        ] as const
      ).map(([dx, dy, rot], i) => (
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
      {(
        [
          [-8, -0.3],
          [5, -0.28],
          [0, -0.5],
          [-3, -0.56],
          [6, -0.42],
        ] as const
      ).map(([dx, dy], i) => (
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

function renderSunflower(stage: Stage, cx: number, by: number, h: number) {
  if (stage === 0) return <ellipse cx={cx} cy={by - 1} rx={4} ry={2.5} fill="#FFF9C4" />;
  const stemH = [h * 0.18, h * 0.26, h * 0.34, h * 0.42][stage - 1] ?? h * 0.18;
  const petR = [0, 7, 10, 14][stage - 1] ?? 0;
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
      {stage === 4 && <circle cx={cx} cy={by - stemH} r={petR * 2} fill="#FDD835" opacity="0.13" />}
    </g>
  );
}

function renderRose(stage: Stage, cx: number, by: number, h: number) {
  if (stage === 0) return <ellipse cx={cx} cy={by - 1} rx={4} ry={2.5} fill="#FFCDD2" />;
  const stemH = [h * 0.2, h * 0.28, h * 0.36, h * 0.42][stage - 1] ?? h * 0.2;
  const petR = [0, 6, 9, 12][stage - 1] ?? 0;
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

function renderMushroom(stage: Stage, cx: number, by: number, h: number) {
  if (stage === 0) return <ellipse cx={cx} cy={by - 1} rx={4} ry={2.5} fill="#D7CCC8" />;
  const sc = [0.3, 0.5, 0.72, 1][stage - 1] ?? 1;
  const capR = h * 0.2 * sc;
  const stemH = h * 0.22 * sc;
  const capRY = capR * 0.65;
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
        (
          [
            [-capR * 0.44, -capRY * 0.5],
            [0, -capRY * 0.72],
            [capR * 0.42, -capRY * 0.4],
          ] as const
        ).map(([dx, dy], i) => (
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

function renderMoneyTree(stage: Stage, cx: number, by: number, h: number) {
  if (stage === 0) {
    return (
      <g>
        <ellipse cx={cx} cy={by - 1} rx={4} ry={2.5} fill="#A5D6A7" />
        <circle cx={cx} cy={by - 6} r="3" fill="#FDD835" opacity="0.8" />
      </g>
    );
  }
  const trunkH = [h * 0.2, h * 0.3, h * 0.38, h * 0.44][stage - 1] ?? h * 0.2;
  const crownR = [h * 0.14, h * 0.18, h * 0.24, h * 0.28][stage - 1] ?? h * 0.14;
  const coinPositions: ReadonlyArray<readonly [number, number]> = [
    [-crownR * 0.7, 0],
    [crownR * 0.6, -crownR * 0.1],
    [0, crownR * 0.3],
    [-crownR * 0.3, -crownR * 0.5],
    [crownR * 0.4, crownR * 0.2],
  ];
  const coins = stage >= 2 ? coinPositions.slice(0, stage) : [];
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

function renderCrystal(stage: Stage, cx: number, by: number, h: number) {
  if (stage === 0) return <ellipse cx={cx} cy={by - 1} rx={4} ry={2.5} fill="#E1BEE7" />;
  const base = h * 0.1 * (stage * 0.5 + 0.5);
  type Spike = { x: number; h: number; w: number };
  const sets: Spike[] = ([
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
  ][stage - 1] ?? []) as Spike[];
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
          {(
            [
              [-8, -base * 0.7],
              [8, -base * 1.2],
              [0, -base * 2],
            ] as const
          ).map(([dx, dy], i) => (
            <circle key={i} cx={cx + dx} cy={by + dy} r="1.8" fill="#E1BEE7" opacity="0.9" />
          ))}
        </>
      )}
    </g>
  );
}

function renderMoonFlower(stage: Stage, cx: number, by: number, h: number) {
  if (stage === 0) {
    return (
      <g>
        <ellipse cx={cx} cy={by - 1} rx={4} ry={2.5} fill="#C5CAE9" />
        <circle cx={cx} cy={by - 6} r="2.5" fill="#7986CB" opacity="0.6" />
      </g>
    );
  }
  const stemH = [h * 0.2, h * 0.3, h * 0.38, h * 0.44][stage - 1] ?? h * 0.2;
  const petR = [0, 7, 10, 13][stage - 1] ?? 0;
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
          {(
            [
              [-petR * 1.2, -petR * 0.8],
              [petR * 1.2, -petR * 0.6],
              [-petR * 0.4, petR * 1.3],
            ] as const
          ).map(([dx, dy], i) => (
            <circle key={i} cx={cx + dx} cy={by - stemH + dy} r="1.5" fill="white" opacity="0.9" />
          ))}
        </>
      )}
    </g>
  );
}

function DeadPlant({ cx, by, h, size }: { cx: number; by: number; h: number; size: number }) {
  return (
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
      <path
        d={`M${cx + 4},${by - h * 0.28} Q${cx + 8},${by - h * 0.18} ${cx + 9},${by - h * 0.08}`}
        stroke="#8B6F47"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />
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
  );
}
