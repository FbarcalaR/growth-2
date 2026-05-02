import type { StageRendererProps } from "./herb";

export function renderMoneyTree({ stage, cx, by, h }: StageRendererProps) {
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
