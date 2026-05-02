import type { StageRendererProps } from "./herb";

export function renderSunflower({ stage, cx, by, h }: StageRendererProps) {
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
