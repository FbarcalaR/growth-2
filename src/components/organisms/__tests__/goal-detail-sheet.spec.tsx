// @vitest-environment jsdom
import { fireEvent, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GoalDetailSheet } from "../goal-detail-sheet";
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

const baseGoal = () =>
  makeGoalDto({ id: "g1", title: "Run a 5K", planted: true, stage: 1, tileCol: 0, tileRow: 4 });

describe("<GoalDetailSheet />", () => {
  it("PATCHes the goal on Edit goal -> Save changes", async () => {
    const goal = baseGoal();
    const fm = setupFetchMock();
    fm.json(`/api/goals/${goal.id}`, { ...goal, title: "Run a 10K" }, "PATCH");

    const { findByRole, getByDisplayValue } = renderWithQuery(
      <GoalDetailSheet open goal={goal} onClose={() => undefined} />,
    );
    fireEvent.click(await findByRole("button", { name: /edit goal/i }));
    const input = getByDisplayValue("Run a 5K") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Run a 10K" } });
    fireEvent.click(await findByRole("button", { name: /save changes/i }));

    await waitFor(() => expect(fm.calls("PATCH", `/api/goals/${goal.id}`)).toHaveLength(1));
  });

  it("opens the confirm dialog on Delete goal and DELETEs on confirmation", async () => {
    const goal = baseGoal();
    const fm = setupFetchMock();
    fm.mock(`/api/goals/${goal.id}`, { method: "DELETE", status: 204, body: null });

    const onClose = vi.fn();
    const { findByRole, findAllByRole } = renderWithQuery(
      <GoalDetailSheet open goal={goal} onClose={onClose} />,
    );
    // Tap the drawer's Delete goal button to open the confirm dialog.
    fireEvent.click(await findByRole("button", { name: /^delete goal$/i }));
    // Now there are two matching buttons (drawer trigger + dialog confirm).
    // The last match is the just-mounted confirm button inside the modal.
    const buttons = await findAllByRole("button", { name: /^delete goal$/i });
    fireEvent.click(buttons[buttons.length - 1]!);
    await waitFor(() => expect(fm.calls("DELETE", `/api/goals/${goal.id}`)).toHaveLength(1));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it("hides Mark-complete while items remain; shows it once every item is done", () => {
    setupFetchMock();
    const partial = makeGoalDto({
      planted: true,
      stage: 2,
      tasks: [
        { id: "t1", title: "a", completed: true, dueDate: null },
        { id: "t2", title: "b", completed: false, dueDate: null },
      ],
    });
    const { queryByRole, rerender } = renderWithQuery(
      <GoalDetailSheet open goal={partial} onClose={() => undefined} />,
    );
    expect(queryByRole("button", { name: /mark goal as complete/i })).toBeNull();

    const allDone = makeGoalDto({
      planted: true,
      stage: 2,
      tasks: [
        { id: "t1", title: "a", completed: true, dueDate: null },
        { id: "t2", title: "b", completed: true, dueDate: null },
      ],
    });
    rerender(<GoalDetailSheet open goal={allDone} onClose={() => undefined} />);
    expect(queryByRole("button", { name: /mark goal as complete/i })).not.toBeNull();
  });

  it("backs out of delete via Cancel without sending a DELETE", async () => {
    const goal = baseGoal();
    const fm = setupFetchMock();
    const { findByRole, queryByRole } = renderWithQuery(
      <GoalDetailSheet open goal={goal} onClose={() => undefined} />,
    );
    fireEvent.click(await findByRole("button", { name: /delete goal/i }));
    fireEvent.click(await findByRole("button", { name: /^cancel$/i }));
    expect(fm.calls("DELETE")).toHaveLength(0);
    await waitFor(() =>
      expect(queryByRole("button", { name: /^delete goal$/i, hidden: false })).toBeDefined(),
    );
  });
});
