// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PlantSprite } from "../plant-sprite";
import { PLANT_IDS, STAGES, type PlantId, type Stage } from "@/shared/plants";

describe("<PlantSprite />", () => {
  it("renders a labelled <svg> tagged with the plant + stage", () => {
    const { container } = render(<PlantSprite plantId="herb" stage={2} />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("role")).toBe("img");
    expect(svg.getAttribute("data-plant-id")).toBe("herb");
    expect(svg.getAttribute("data-stage")).toBe("2");
    expect(svg.getAttribute("aria-label")).toMatch(/herb/);
  });

  it.each(PLANT_IDS)("renders every stage 0–4 for %s without crashing", (plantId: PlantId) => {
    for (const stage of STAGES as readonly Stage[]) {
      const { container } = render(<PlantSprite plantId={plantId} stage={stage} />);
      const svg = container.querySelector("svg")!;
      expect(svg.getAttribute("data-stage")).toBe(String(stage));
    }
  });

  it("renders progressively richer artwork as the herb advances through stages", () => {
    // The seed (stage 0) is a single ellipse on top of the pot; each stage
    // adds elements (stem, leaves, accents). We assert the *count of visual
    // children inside the plant <g> grows monotonically*, which encodes the
    // 4 stage transitions without locking us into pixel-perfect snapshots.
    const counts: number[] = [];
    for (const stage of [0, 1, 2, 3, 4] as const) {
      const { container } = render(<PlantSprite plantId="herb" stage={stage} size={64} />);
      const svg = container.querySelector("svg")!;
      // Total visual children inside the SVG.
      counts.push(svg.querySelectorAll("ellipse, line, circle, path, polygon").length);
    }
    // Pot artwork is constant (4 polygons/ellipses), so the deltas reflect
    // plant-only growth between stages.
    expect(counts[0]).toBeLessThan(counts[1]!);
    expect(counts[1]).toBeLessThan(counts[2]!);
    expect(counts[2]).toBeLessThan(counts[3]!);
    expect(counts[3]).toBeLessThan(counts[4]!);
  });

  it("applies a desaturating filter when the plant is wilting", () => {
    const { container } = render(<PlantSprite plantId="herb" stage={2} healthState="wilting" />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("style") ?? "").toMatch(/saturate\(0\.65\)/);
  });

  it("renders the dead fallback (withered stem) regardless of plantId", () => {
    const { container } = render(<PlantSprite plantId="rose" stage={3} healthState="dead" />);
    const svg = container.querySelector("svg")!;
    // Dead branch uses brown stems; no rose petals (#EF5350) should appear.
    expect(svg.innerHTML).not.toMatch(/EF5350/i);
    expect(svg.innerHTML).toMatch(/6B4F2F/i);
  });
});
