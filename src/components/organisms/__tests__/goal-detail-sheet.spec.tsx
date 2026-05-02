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

const makeGoal = (overrides: Parameters<typeof makeGoalDto>[0] = {}) =>
  makeGoalDto({ stage: 1, planted: true, tileCol: 0, tileRow: 4, ...overrides });

describe("<GoalDetailSheet />", () => {
  it("PATCHes the goal on Edit -> Save", async () => {
    const goal = makeGoal();
    const fm = setupFetchMock();
    fm.json(`/api/goals/${goal.id}`, { ...goal, title: "Run a 10K" }, "PATCH");

    const onClose = vi.fn();
    const { findByRole, getByDisplayValue } = renderWithQuery(
      <GoalDetailSheet open goal={goal} onClose={onClose} />,
    );
    fireEvent.click(await findByRole("button", { name: /^edit$/i }));
    const input = getByDisplayValue("Run a 5K") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Run a 10K" } });
    fireEvent.click(await findByRole("button", { name: /save changes/i }));

    await waitFor(() => expect(fm.calls("PATCH", `/api/goals/${goal.id}`)).toHaveLength(1));
    expect(fm.calls("PATCH", `/api/goals/${goal.id}`)[0]!.body).toEqual({
      title: "Run a 10K",
      plantType: "herb",
    });
  });

  it("opens the confirm dialog on Delete and DELETEs on confirmation", async () => {
    const goal = makeGoal();
    const fm = setupFetchMock();
    fm.mock(`/api/goals/${goal.id}`, { method: "DELETE", status: 204, body: null });

    const onClose = vi.fn();
    const { findByRole } = renderWithQuery(<GoalDetailSheet open goal={goal} onClose={onClose} />);
    fireEvent.click(await findByRole("button", { name: /^delete$/i }));
    // Dialog appears with an explicit confirm label.
    fireEvent.click(await findByRole("button", { name: /delete goal/i }));

    await waitFor(() => expect(fm.calls("DELETE", `/api/goals/${goal.id}`)).toHaveLength(1));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it("backs out of delete via Cancel without sending a DELETE", async () => {
    const goal = makeGoal();
    const fm = setupFetchMock();
    const { findByRole, queryByRole } = renderWithQuery(
      <GoalDetailSheet open goal={goal} onClose={() => undefined} />,
    );
    fireEvent.click(await findByRole("button", { name: /^delete$/i }));
    const cancel = await findByRole("button", { name: /^cancel$/i });
    fireEvent.click(cancel);
    expect(fm.calls("DELETE")).toHaveLength(0);
    // Dialog dismissed.
    await waitFor(() => expect(queryByRole("button", { name: /delete goal/i })).toBeNull());
  });
});
