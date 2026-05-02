import type { StageRendererProps } from "./herb";

export function renderMushroom({ stage, cx, by, h }: StageRendererProps) {
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
