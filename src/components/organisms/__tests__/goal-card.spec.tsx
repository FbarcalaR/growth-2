// @vitest-environment jsdom
import { fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GoalCard } from "../goal-card";
import { setupFetchMock } from "@/test/fetch-mock";
import { makeGoalDto } from "@/test/fixtures/dto";
import { renderWithQuery } from "@/test/render";

vi.mock("next/navigation", () => ({
  usePathname: () => "/garden",
  useRouter: () => ({ replace: vi.fn(), push: vi.fn(), back: vi.fn() }),
}));

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("<GoalCard />", () => {
  it("starts collapsed and shows the seed chip + no progress bar for unplanted goals", () => {
    setupFetchMock();
    const { getByText, queryByRole } = renderWithQuery(<GoalCard goal={makeGoalDto()} />);
    getByText("Run a 5K");
    getByText(/seed/i);
    // No growth bar for seeds.
    expect(queryByRole("progressbar")).toBeNull();
  });

  it("renders a stage chip + growth bar for planted goals (not yet bloomed)", () => {
    setupFetchMock();
    const goal = makeGoalDto({
      planted: true,
      stage: 2,
      tasks: [
        { id: "t1", title: "a", completed: true, dueDate: null },
        { id: "t2", title: "b", completed: false, dueDate: null },
      ],
    });
    const { getByText, getByRole, getAllByText } = renderWithQuery(<GoalCard goal={goal} />);
    getByText("Seedling");
    // "1/2" appears in both the chip row and the growth bar legend.
    expect(getAllByText("1/2").length).toBeGreaterThanOrEqual(1);
    expect(getByRole("progressbar").getAttribute("aria-valuenow")).toBe("50");
  });

  it("shows the dead banner instead of the growth bar when the plant is dead", () => {
    setupFetchMock();
    const { getByText, queryByRole } = renderWithQuery(
      <GoalCard
        goal={makeGoalDto({
          planted: true,
          stage: 1,
          healthState: "dead",
        })}
      />,
    );
    getByText(/withered/i);
    expect(queryByRole("progressbar")).toBeNull();
  });

  it("shows the fully-blooming banner when the plant has reached stage 4", () => {
    setupFetchMock();
    const { getByText, queryByRole } = renderWithQuery(
      <GoalCard goal={makeGoalDto({ planted: true, stage: 4 })} />,
    );
    getByText(/fully blooming/i);
    expect(queryByRole("progressbar")).toBeNull();
  });

  it("calls onClick when tapped (drawer-opening pattern)", () => {
    setupFetchMock();
    const onClick = vi.fn();
    const { getByRole } = renderWithQuery(
      <GoalCard goal={makeGoalDto({ planted: true, stage: 1 })} onClick={onClick} />,
    );
    fireEvent.click(getByRole("button", { name: /run a 5k/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders without an interactive role when no onClick is provided", () => {
    setupFetchMock();
    const { queryByRole } = renderWithQuery(<GoalCard goal={makeGoalDto()} />);
    expect(queryByRole("button")).toBeNull();
  });
});
