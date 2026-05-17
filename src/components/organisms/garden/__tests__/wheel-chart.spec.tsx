// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { AreaSlots } from "@/client/hooks";
import { AREA_KEYS } from "@/shared/areas";
import type { WheelOfLifeDto } from "@/shared/schemas/user";

import { WheelChart } from "../wheel-chart";

function makeSlots(
  overrides: Partial<
    Record<(typeof AREA_KEYS)[number], Partial<AreaSlots[(typeof AREA_KEYS)[number]]>>
  > = {},
): AreaSlots {
  return AREA_KEYS.reduce<AreaSlots>((acc, key) => {
    const o = overrides[key];
    const quota = o?.quota ?? 0;
    const used = o?.used ?? 0;
    acc[key] = {
      quota,
      used,
      remaining: Math.max(0, quota - used),
      locked: o?.locked ?? quota === 0,
      full: o?.full ?? (quota > 0 && used >= quota),
    };
    return acc;
  }, {} as AreaSlots);
}

function makeValues(overrides: Partial<WheelOfLifeDto> = {}): WheelOfLifeDto {
  return AREA_KEYS.reduce<WheelOfLifeDto>((acc, key) => {
    acc[key] = overrides[key] ?? 0;
    return acc;
  }, {} as WheelOfLifeDto);
}

describe("<WheelChart />", () => {
  it("renders the SVG with both legend entries", () => {
    const { container, getByText } = render(
      <WheelChart values={makeValues()} slots={makeSlots()} />,
    );
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("viewBox")).toBe("0 0 260 260");
    expect(getByText(/^Current$/)).toBeTruthy();
    expect(getByText(/^Priorities$/)).toBeTruthy();
  });

  it("renders an axis label for every life area", () => {
    const { container } = render(<WheelChart values={makeValues()} slots={makeSlots()} />);
    const labels = Array.from(container.querySelectorAll("svg text"))
      .map((el) => el.textContent)
      .filter(Boolean);
    expect(labels).toContain("Health");
    expect(labels).toContain("Career");
    expect(labels).toContain("Purpose");
  });

  it("shows used/quota numbers when the area is unlocked", () => {
    const values = makeValues({ health: 5 });
    const slots = makeSlots({ health: { quota: 5, used: 2 } });
    const { container } = render(<WheelChart values={values} slots={slots} />);
    const tspans = Array.from(container.querySelectorAll("svg tspan")).map((el) => el.textContent);
    expect(tspans).toContain("2");
    expect(tspans).toContain("5");
  });

  it("renders a lock glyph for a zero-priority area", () => {
    const slots = makeSlots({ career: { quota: 0, used: 0, locked: true } });
    const { container } = render(<WheelChart values={makeValues()} slots={slots} />);
    const tspans = Array.from(container.querySelectorAll("svg tspan")).map((el) => el.textContent);
    expect(tspans).toContain("🔒");
  });
});
