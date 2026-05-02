// @vitest-environment jsdom
import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GoalPlant } from "../_components/goal-plant";

describe("<GoalPlant />", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not start in the growing state on first render", () => {
    const { container } = render(<GoalPlant plantId="herb" stage={0} />);
    const badge = container.querySelector("[data-testid='goal-plant']")!;
    expect(badge.getAttribute("data-growing")).toBeNull();
    expect(badge.className).not.toContain("plant-grow");
  });

  it("plays the grow animation when the stage advances, then settles", () => {
    const { container, rerender } = render(<GoalPlant plantId="herb" stage={0} />);
    const badge = () => container.querySelector("[data-testid='goal-plant']")!;
    expect(badge().getAttribute("data-growing")).toBeNull();

    // Stage advances from 0 → 1.
    rerender(<GoalPlant plantId="herb" stage={1} />);
    expect(badge().getAttribute("data-growing")).toBe("true");
    expect(badge().className).toContain("plant-grow");

    // Animation completes after ~700ms; the class is dropped.
    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(badge().getAttribute("data-growing")).toBeNull();
    expect(badge().className).not.toContain("plant-grow");
  });

  it.each([
    [1, 2],
    [2, 3],
    [3, 4],
  ])("plays the grow animation across the %d→%d transition", (from, to) => {
    const { container, rerender } = render(<GoalPlant plantId="herb" stage={from as 1 | 2 | 3} />);
    rerender(<GoalPlant plantId="herb" stage={to as 2 | 3 | 4} />);
    const badge = container.querySelector("[data-testid='goal-plant']")!;
    expect(badge.getAttribute("data-growing")).toBe("true");
    expect(badge.getAttribute("data-stage")).toBe(String(to));
  });

  it("does not play the animation when the stage stays the same or regresses", () => {
    const { container, rerender } = render(<GoalPlant plantId="herb" stage={2} />);
    rerender(<GoalPlant plantId="herb" stage={2} />);
    rerender(<GoalPlant plantId="herb" stage={1} />);
    const badge = container.querySelector("[data-testid='goal-plant']")!;
    expect(badge.getAttribute("data-growing")).toBeNull();
  });
});
