// @vitest-environment jsdom
import { fireEvent, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RoutinesEditor } from "../routines-editor";
import { setupFetchMock } from "@/test/fetch-mock";
import { lockedUser } from "@/test/fixtures/state";
import { renderWithQuery } from "@/test/render";
import type { GoalDto, RoutineDto } from "@/shared/schemas/goal";

vi.mock("next/navigation", () => ({
  usePathname: () => "/garden",
  useRouter: () => ({ replace: vi.fn(), push: vi.fn(), back: vi.fn() }),
}));

afterEach(() => {
  vi.unstubAllGlobals();
});

const goalId = "g1";

function routine(overrides: Partial<RoutineDto> = {}): RoutineDto {
  return {
    id: "r1",
    title: "Read 30 minutes",
    completedToday: false,
    streak: 4,
    repeatDays: [true, true, true, true, true, true, true],
    ...overrides,
  };
}

function makeGoal(overrides: Partial<GoalDto> = {}): GoalDto {
  return {
    id: goalId,
    title: "Read 12 books",
    area: "personal",
    plantType: "mushroom",
    stage: 1,
    plantRes: {},
    planted: true,
    tileCol: 0,
    tileRow: 4,
    tasks: [],
    routines: [],
    health: 100,
    healthState: "healthy",
    ...overrides,
  };
}

describe("<RoutinesEditor />", () => {
  it("renders the count, the streak label, and the routine title", () => {
    const { getByText } = renderWithQuery(
      <RoutinesEditor goalId={goalId} area="personal" routines={[routine()]} />,
    );
    getByText("Routines (1)");
    getByText("Read 30 minutes");
    getByText(/4-day streak/);
  });

  it("toggles completedToday via the same PATCH endpoint as Today", async () => {
    const fm = setupFetchMock();
    fm.json(
      `/api/goals/${goalId}/routines/r1`,
      { goal: makeGoal(), user: await lockedUser() },
      "PATCH",
    );
    const { findByLabelText } = renderWithQuery(
      <RoutinesEditor goalId={goalId} area="personal" routines={[routine()]} />,
    );
    fireEvent.click(await findByLabelText('Mark "Read 30 minutes" done for today'));
    await waitFor(() =>
      expect(fm.calls("PATCH", `/api/goals/${goalId}/routines/r1`)).toHaveLength(1),
    );
    expect(fm.calls("PATCH", `/api/goals/${goalId}/routines/r1`)[0]!.body).toEqual({
      completedToday: true,
    });
  });

  it("adds a routine with title + repeat days", async () => {
    const fm = setupFetchMock();
    fm.json(`/api/goals/${goalId}/routines`, makeGoal(), "POST");
    const { findByRole, getByPlaceholderText } = renderWithQuery(
      <RoutinesEditor goalId={goalId} area="personal" routines={[]} />,
    );
    fireEvent.click(await findByRole("button", { name: /add routine/i }));
    fireEvent.change(getByPlaceholderText(/new routine title/i), {
      target: { value: "Read 30 minutes" },
    });
    // Default state has all days selected; tap Tuesday off so we change the
    // day mask through the picker and assert it round-trips.
    fireEvent.click(await findByRole("checkbox", { name: /tuesday/i }));
    fireEvent.click(await findByRole("button", { name: /^add$/i }));

    await waitFor(() => expect(fm.calls("POST", `/api/goals/${goalId}/routines`)).toHaveLength(1));
    expect(fm.calls("POST", `/api/goals/${goalId}/routines`)[0]!.body).toEqual({
      title: "Read 30 minutes",
      repeatDays: [true, false, true, true, true, true, true],
    });
  });

  it("edits a routine's title + repeat-day mask", async () => {
    const fm = setupFetchMock();
    fm.json(
      `/api/goals/${goalId}/routines/r1`,
      { goal: makeGoal(), user: await lockedUser() },
      "PATCH",
    );
    const { findByLabelText, findByRole, getByDisplayValue } = renderWithQuery(
      <RoutinesEditor goalId={goalId} area="personal" routines={[routine()]} />,
    );
    fireEvent.click(await findByLabelText('Edit "Read 30 minutes"'));
    const input = getByDisplayValue("Read 30 minutes") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Read 1 hour" } });
    fireEvent.click(await findByRole("checkbox", { name: /sunday/i }));
    fireEvent.click(await findByRole("button", { name: /^save$/i }));

    await waitFor(() =>
      expect(fm.calls("PATCH", `/api/goals/${goalId}/routines/r1`)).toHaveLength(1),
    );
    expect(fm.calls("PATCH", `/api/goals/${goalId}/routines/r1`)[0]!.body).toEqual({
      title: "Read 1 hour",
      repeatDays: [true, true, true, true, true, true, false],
    });
  });

  it("graduates a routine via the permanent-complete confirmation", async () => {
    const fm = setupFetchMock();
    fm.json(
      `/api/goals/${goalId}/routines/r1/permanent`,
      { goal: makeGoal(), user: await lockedUser() },
      "POST",
    );
    const { findByLabelText, findByRole } = renderWithQuery(
      <RoutinesEditor goalId={goalId} area="personal" routines={[routine()]} />,
    );
    fireEvent.click(await findByLabelText('Mark "Read 30 minutes" permanently complete'));
    fireEvent.click(await findByRole("button", { name: /graduate/i }));
    await waitFor(() =>
      expect(fm.calls("POST", `/api/goals/${goalId}/routines/r1/permanent`)).toHaveLength(1),
    );
  });

  it("renders permanently completed routines with a graduated badge", () => {
    const { getByText } = renderWithQuery(
      <RoutinesEditor
        goalId={goalId}
        area="personal"
        routines={[routine({ permanentlyCompleted: true })]}
      />,
    );
    getByText(/graduated/i);
    getByText(/4-day streak kept/i);
  });

  it("deletes a routine via the dedicated icon button", async () => {
    const fm = setupFetchMock();
    fm.mock(`/api/goals/${goalId}/routines/r1`, {
      method: "DELETE",
      status: 200,
      body: makeGoal(),
    });
    const { findByLabelText } = renderWithQuery(
      <RoutinesEditor goalId={goalId} area="personal" routines={[routine()]} />,
    );
    fireEvent.click(await findByLabelText('Delete "Read 30 minutes"'));
    await waitFor(() =>
      expect(fm.calls("DELETE", `/api/goals/${goalId}/routines/r1`)).toHaveLength(1),
    );
  });
});
