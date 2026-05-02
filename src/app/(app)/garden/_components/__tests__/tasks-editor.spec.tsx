// @vitest-environment jsdom
import { fireEvent, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TasksEditor } from "../tasks-editor";
import { setupFetchMock } from "@/test/fetch-mock";
import { makeGoalDto, makeTaskDto } from "@/test/fixtures/dto";
import { lockedUser } from "@/test/fixtures/state";
import { renderWithQuery } from "@/test/render";

vi.mock("next/navigation", () => ({
  usePathname: () => "/garden",
  useRouter: () => ({ replace: vi.fn(), push: vi.fn(), back: vi.fn() }),
}));

afterEach(() => {
  vi.unstubAllGlobals();
});

const goalId = "g1";

describe("<TasksEditor />", () => {
  it("renders the count and the existing tasks", () => {
    const { getByText } = renderWithQuery(
      <TasksEditor
        goalId={goalId}
        area="health"
        tasks={[makeTaskDto(), makeTaskDto({ id: "t2", title: "Sign up for race" })]}
      />,
    );
    getByText("Tasks (2)");
    getByText("Buy shoes");
    getByText("Sign up for race");
  });

  it("toggles completion via the same PATCH endpoint as Today", async () => {
    const fm = setupFetchMock();
    fm.json(
      `/api/goals/${goalId}/tasks/t1`,
      { goal: makeGoalDto(), user: await lockedUser() },
      "PATCH",
    );
    const { findByLabelText } = renderWithQuery(
      <TasksEditor goalId={goalId} area="health" tasks={[makeTaskDto()]} />,
    );
    fireEvent.click(await findByLabelText('Mark "Buy shoes" complete'));
    await waitFor(() => expect(fm.calls("PATCH", `/api/goals/${goalId}/tasks/t1`)).toHaveLength(1));
    expect(fm.calls("PATCH", `/api/goals/${goalId}/tasks/t1`)[0]!.body).toEqual({
      completed: true,
    });
  });

  it("adds a new task with title + dueDate", async () => {
    const fm = setupFetchMock();
    fm.json(
      `/api/goals/${goalId}/tasks`,
      makeGoalDto({
        tasks: [{ id: "t2", title: "Sign up for race", completed: false, dueDate: "2026-05-10" }],
      }),
      "POST",
    );
    const { findByRole, getByPlaceholderText } = renderWithQuery(
      <TasksEditor goalId={goalId} area="health" tasks={[]} />,
    );
    fireEvent.click(await findByRole("button", { name: /add task/i }));
    fireEvent.change(getByPlaceholderText(/new task title/i), {
      target: { value: "Sign up for race" },
    });
    fireEvent.change(
      getByPlaceholderText(/new task title/i).parentElement!.querySelector("input[type='date']")!,
      {
        target: { value: "2026-05-10" },
      },
    );
    fireEvent.click(await findByRole("button", { name: /^add$/i }));
    await waitFor(() => expect(fm.calls("POST", `/api/goals/${goalId}/tasks`)).toHaveLength(1));
    expect(fm.calls("POST", `/api/goals/${goalId}/tasks`)[0]!.body).toEqual({
      title: "Sign up for race",
      dueDate: "2026-05-10",
    });
  });

  it("edits an existing task title + dueDate", async () => {
    const fm = setupFetchMock();
    fm.json(
      `/api/goals/${goalId}/tasks/t1`,
      { goal: makeGoalDto(), user: await lockedUser() },
      "PATCH",
    );
    const { findByLabelText, findByRole, getByDisplayValue } = renderWithQuery(
      <TasksEditor goalId={goalId} area="health" tasks={[makeTaskDto()]} />,
    );
    fireEvent.click(await findByLabelText('Edit "Buy shoes"'));
    const input = getByDisplayValue("Buy shoes") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Buy running shoes" } });
    fireEvent.click(await findByRole("button", { name: /^save$/i }));
    await waitFor(() => expect(fm.calls("PATCH", `/api/goals/${goalId}/tasks/t1`)).toHaveLength(1));
    expect(fm.calls("PATCH", `/api/goals/${goalId}/tasks/t1`)[0]!.body).toEqual({
      title: "Buy running shoes",
      dueDate: null,
    });
  });

  it("deletes a task via the dedicated icon button", async () => {
    const fm = setupFetchMock();
    fm.mock(`/api/goals/${goalId}/tasks/t1`, { method: "DELETE", status: 200, body: {} });
    const { findByLabelText } = renderWithQuery(
      <TasksEditor goalId={goalId} area="health" tasks={[makeTaskDto()]} />,
    );
    fireEvent.click(await findByLabelText('Delete "Buy shoes"'));
    await waitFor(() =>
      expect(fm.calls("DELETE", `/api/goals/${goalId}/tasks/t1`)).toHaveLength(1),
    );
  });
});
