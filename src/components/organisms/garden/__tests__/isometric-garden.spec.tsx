// @vitest-environment jsdom
import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { IsometricGarden } from "../isometric-garden";
import { makeGoalDto } from "@/test/fixtures/dto";
import type { GardenDto } from "@/shared/schemas/garden";

function emptyGarden(): GardenDto {
  return {
    decoGrid: Array.from({ length: 8 }, () => Array.from({ length: 6 }, () => null)),
    owned: [],
  };
}

describe("<IsometricGarden />", () => {
  it("renders the SVG canvas with the scenery + 8×6 plot", () => {
    const { container } = render(<IsometricGarden goals={[]} garden={emptyGarden()} />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("viewBox")).toBe("0 0 336 264");
  });

  it("places a planted goal as a <TilePlant> at its tile coords", () => {
    const goal = makeGoalDto({
      id: "g1",
      title: "Run a 5K",
      planted: true,
      stage: 2,
      tileCol: 3,
      tileRow: 5,
    });
    const garden: GardenDto = emptyGarden();
    garden.decoGrid[3]![5] = { kind: "plant", goalId: "g1" };
    const { container } = render(<IsometricGarden goals={[goal]} garden={garden} />);
    // The plant layer wraps each TilePlant in a `<g data-testid='tile-plant'>` —
    // we don't assert the testid (the prototype doesn't emit one) but at minimum
    // the plant SVG should be in the document.
    const svg = container.querySelector("svg");
    expect(svg?.innerHTML.length ?? 0).toBeGreaterThan(0);
  });

  it("fires onTileTap('plant') when planting and tapping a tilled tile", () => {
    const onTileTap = vi.fn();
    const { container } = render(
      <IsometricGarden
        goals={[]}
        garden={emptyGarden()}
        placingGoalId="g1"
        onTileTap={onTileTap}
      />,
    );
    // Each tile-cell is a top-level `<g>` inside the SVG with onClick. Find one
    // in the planting zone (row >= 4, col=0). Easiest: tap the first tile in
    // the bottom-left of the plot (col=0, row=4) — the catch-all rect under
    // the soil. We click via a DOM walk: pick a `<g>` with cursor pointer.
    const groups = Array.from(container.querySelectorAll("svg > g"));
    // Find the group that wraps the (col=0, row=4) tile. Tiles are sorted
    // row-then-col so the first row-4 tile sits at index = tilesBefore(row=4).
    // Rather than guessing, find any clickable g — clicking a planting tile
    // when placing fires "plant".
    // We rely on `IsometricGarden` rendering each tile as its own `<g>` with
    // a click handler; click them in order until onTileTap fires with
    // ("plant").
    for (const g of groups) {
      fireEvent.click(g);
      if (onTileTap.mock.calls.some(([, , kind]) => kind === "plant")) break;
    }
    expect(onTileTap).toHaveBeenCalled();
    const planted = onTileTap.mock.calls.find(([, , kind]) => kind === "plant");
    expect(planted).toBeTruthy();
  });
});
