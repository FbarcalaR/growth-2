import type { Stage } from "@/shared/plants";

export type StageRendererProps = {
  stage: Stage;
  cx: number;
  by: number;
  h: number;
};

export function renderHerb({ stage, cx, by, h }: StageRendererProps) {
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
