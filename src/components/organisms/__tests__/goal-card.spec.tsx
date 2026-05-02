// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GoalCard } from "../goal-card";
import type { GoalDto } from "@/shared/schemas/goal";

function makeGoal(overrides: Partial<GoalDto> = {}): GoalDto {
  return {
    id: "g1",
    title: "Run a 5K",
    area: "health",
    plantType: "herb",
    stage: 0,
    plantRes: {},
    planted: false,
    tileCol: null,
    tileRow: null,
    tasks: [],
    routines: [],
    health: 100,
    healthState: "healthy",
    ...overrides,
  };
}

describe("<GoalCard />", () => {
  it("renders an unplanted goal as a Seed with no progress bar", () => {
    const { getByText, queryByRole } = render(<GoalCard goal={makeGoal()} />);
    getByText("Run a 5K");
    getByText("Seed");
    expect(queryByRole("progressbar")).toBeNull();
  });

  it("renders a planted goal with stage label and a progress bar when items exist", () => {
    const goal = makeGoal({
      planted: true,
      stage: 2,
      tasks: [
        { id: "t1", title: "a", completed: true, dueDate: null },
        { id: "t2", title: "b", completed: false, dueDate: null },
      ],
    });
    const { getByText, getByRole } = render(<GoalCard goal={goal} />);
    getByText("Seedling"); // stage 2 label
    getByText("1/2");
    expect(getByRole("progressbar").getAttribute("aria-valuenow")).toBe("50");
  });

  it("shows the trophy and 'Trophy unlocked' line on completed goals", () => {
    const { getByText, getByLabelText, queryByRole } = render(
      <GoalCard goal={makeGoal({ completed: true, completedAt: 1, planted: true, stage: 4 })} />,
    );
    getByText("Trophy unlocked");
    getByLabelText("Completed");
    // Completed goals don't surface the progress bar — the trophy is the punchline.
    expect(queryByRole("progressbar")).toBeNull();
  });

  it("shows the health badge for planted, non-completed goals", () => {
    const { getByLabelText } = render(
      <GoalCard goal={makeGoal({ planted: true, stage: 1, healthState: "wilting" })} />,
    );
    getByLabelText(/wilting/i);
  });

  it("becomes interactive when given an onClick handler", () => {
    const { getByRole } = render(<GoalCard goal={makeGoal()} onClick={() => undefined} />);
    expect(getByRole("button")).toBeTruthy();
  });
});
