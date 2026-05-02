import type { StageRendererProps } from "./herb";

export function renderMoonFlower({ stage, cx, by, h }: StageRendererProps) {
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
