import type { StageRendererProps } from "./herb";

export function renderCrystal({ stage, cx, by, h }: StageRendererProps) {
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
