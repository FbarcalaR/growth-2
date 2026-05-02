import type { StageRendererProps } from "./herb";

export function renderRose({ stage, cx, by, h }: StageRendererProps) {
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
