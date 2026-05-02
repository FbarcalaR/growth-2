// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GoalCard } from "../goal-card";
import { makeGoalDto } from "@/test/fixtures/dto";

describe("<GoalCard />", () => {
  it("renders an unplanted goal as a Seed with no progress bar", () => {
    const { getByText, queryByRole } = render(<GoalCard goal={makeGoalDto()} />);
    getByText("Run a 5K");
    getByText("Seed");
    expect(queryByRole("progressbar")).toBeNull();
  });

  it("renders a planted goal with stage label and a progress bar when items exist", () => {
    const goal = makeGoalDto({
      planted: true,
      stage: 2,
      tasks: [
        { id: "t1", title: "a", completed: true, dueDate: null },
        { id: "t2", title: "b", completed: false, dueDate: null },
      ],
    });
    const { getByText, getByRole } = render(<GoalCard goal={goal} />);
    getByText("Seedling");
    getByText("1/2");
    expect(getByRole("progressbar").getAttribute("aria-valuenow")).toBe("50");
  });

  it("shows the trophy and 'Trophy unlocked' line on completed goals", () => {
    const { getByText, getByLabelText, queryByRole } = render(
      <GoalCard goal={makeGoalDto({ completed: true, completedAt: 1, planted: true, stage: 4 })} />,
    );
    getByText("Trophy unlocked");
    getByLabelText("Completed");
    expect(queryByRole("progressbar")).toBeNull();
  });

  it("shows the health badge for planted, non-completed goals", () => {
    const { getByLabelText } = render(
      <GoalCard goal={makeGoalDto({ planted: true, stage: 1, healthState: "wilting" })} />,
    );
    getByLabelText(/wilting/i);
  });

  it("becomes interactive when given an onClick handler", () => {
    const { getByRole } = render(<GoalCard goal={makeGoalDto()} onClick={() => undefined} />);
    expect(getByRole("button")).toBeTruthy();
  });
});
