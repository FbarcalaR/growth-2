export function DeadPlant({
  cx,
  by,
  h,
  size,
}: {
  cx: number;
  by: number;
  h: number;
  size: number;
}) {
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
