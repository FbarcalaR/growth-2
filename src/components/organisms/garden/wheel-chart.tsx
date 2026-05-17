"use client";

import { useId } from "react";

import type { AreaSlots } from "@/client/hooks";
import { AREA_KEYS, AREA_META } from "@/shared/areas";
import type { WheelOfLifeDto } from "@/shared/schemas/user";

const SIZE = 260;
const CX = SIZE / 2;
const CY = SIZE / 2;
const MAX_R = 92;
const MAX_PER_AREA = 10;
const LABEL_RADIUS = MAX_R + 26;
const PRIORITY_COLOR = "#3A6647";
const CURRENT_COLOR = "#F0A500";

type WheelChartProps = {
  values: WheelOfLifeDto;
  slots: AreaSlots;
};

function spoke(i: number, n: number): { cos: number; sin: number } {
  const a = (i / n) * 2 * Math.PI - Math.PI / 2;
  return { cos: Math.cos(a), sin: Math.sin(a) };
}

/**
 * Radar visualisation of the wheel-of-life, ported from the prototype's
 * `garden-tab.jsx`. Two overlays:
 *   • CURRENT — solid amber polygon, slot usage per area (the lived reality).
 *   • PRIORITIES — dashed deep-green polygon, the user's locked allocation.
 *
 * Axis labels carry the per-area `used/quota` readout (or 🔒 when the area
 * was zeroed at onboarding). Both the polygon area and the axis numbers tell
 * the same story so the chart is honest even at small sizes.
 */
export function WheelChart({ values, slots }: WheelChartProps) {
  const titleId = useId();
  const n = AREA_KEYS.length;
  const polyPoints = (getVal: (key: (typeof AREA_KEYS)[number]) => number) =>
    AREA_KEYS.map((key, i) => {
      const { cos, sin } = spoke(i, n);
      const r = (getVal(key) / MAX_PER_AREA) * MAX_R;
      return `${CX + cos * r},${CY + sin * r}`;
    }).join(" ");

  return (
    <div className="px-3.5 pt-2 pb-4">
      <div className="mb-2 flex flex-wrap items-center justify-center gap-3.5">
        <LegendSwatch label="Current" hint="slots filled" color={CURRENT_COLOR} solid />
        <LegendSwatch label="Priorities" hint="slot capacity" color={PRIORITY_COLOR} />
      </div>

      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        width={SIZE}
        height={SIZE}
        className="mx-auto block max-w-full"
        role="img"
        aria-labelledby={titleId}
      >
        <title id={titleId}>Wheel of life — priorities vs current activity</title>

        {[0.2, 0.4, 0.6, 0.8, 1].map((s) => (
          <polygon
            key={s}
            points={AREA_KEYS.map((_, i) => {
              const { cos, sin } = spoke(i, n);
              return `${CX + cos * MAX_R * s},${CY + sin * MAX_R * s}`;
            }).join(" ")}
            fill="none"
            stroke="#E8EDE5"
            strokeWidth={s === 1 ? 1.5 : 1}
          />
        ))}

        {AREA_KEYS.map((_, i) => {
          const { cos, sin } = spoke(i, n);
          return (
            <line
              key={i}
              x1={CX}
              y1={CY}
              x2={CX + cos * MAX_R}
              y2={CY + sin * MAX_R}
              stroke="#E8EDE5"
              strokeWidth="1.5"
            />
          );
        })}

        <polygon
          points={polyPoints((key) => slots[key]?.used ?? 0)}
          fill={CURRENT_COLOR}
          fillOpacity={0.28}
          stroke={CURRENT_COLOR}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        {AREA_KEYS.map((key, i) => {
          const { cos, sin } = spoke(i, n);
          const r = ((slots[key]?.used ?? 0) / MAX_PER_AREA) * MAX_R;
          return (
            <circle
              key={`cur-${key}`}
              cx={CX + cos * r}
              cy={CY + sin * r}
              r={3.5}
              fill={CURRENT_COLOR}
              stroke="white"
              strokeWidth={1.5}
            />
          );
        })}

        <polygon
          points={polyPoints((key) => values[key] ?? 0)}
          fill="none"
          stroke={PRIORITY_COLOR}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeDasharray="5 4"
        />
        {AREA_KEYS.map((key, i) => {
          const { cos, sin } = spoke(i, n);
          const r = ((values[key] ?? 0) / MAX_PER_AREA) * MAX_R;
          return (
            <circle
              key={`pri-${key}`}
              cx={CX + cos * r}
              cy={CY + sin * r}
              r={4}
              fill="white"
              stroke={PRIORITY_COLOR}
              strokeWidth={2}
            />
          );
        })}

        {AREA_KEYS.map((key, i) => {
          const { cos, sin } = spoke(i, n);
          const lx = CX + cos * LABEL_RADIUS;
          const ly = CY + sin * LABEL_RADIUS;
          const slot = slots[key] ?? { used: 0, quota: values[key] ?? 0, locked: false };
          const meta = AREA_META[key];
          return (
            <g key={key}>
              <circle cx={lx} cy={ly} r={20} fill={`var(--color-area-${key})`} opacity={0.15} />
              <text x={lx} y={ly - 5} textAnchor="middle" fontSize={11}>
                {meta.icon}
              </text>
              <text
                x={lx}
                y={ly + 7}
                textAnchor="middle"
                fontSize={9}
                fontWeight={700}
                fill="#5A6A5A"
              >
                {meta.label}
              </text>
              <text
                x={lx}
                y={ly + 18}
                textAnchor="middle"
                fontSize={9}
                fontWeight={700}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {slot.locked ? (
                  <tspan fill="#9EB09E">🔒</tspan>
                ) : (
                  <>
                    <tspan fill={CURRENT_COLOR}>{slot.used}</tspan>
                    <tspan fill="#C8D0C8">/</tspan>
                    <tspan fill={PRIORITY_COLOR}>{slot.quota}</tspan>
                  </>
                )}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function LegendSwatch({
  label,
  hint,
  color,
  solid = false,
}: {
  label: string;
  hint: string;
  color: string;
  solid?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        aria-hidden
        className="inline-block h-2 w-3.5 rounded-[2px]"
        style={
          solid
            ? { background: color, opacity: 0.55, border: `1.5px solid ${color}` }
            : { background: "transparent", border: `1.5px dashed ${color}` }
        }
      />
      <span className="text-ink-strong text-[11px] font-bold">{label}</span>
      <span className="text-brand-muted text-[10px]">{hint}</span>
    </div>
  );
}
