// @vitest-environment jsdom
import { fireEvent, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { setupFetchMock } from "@/test/fetch-mock";
import { makeGoalDto } from "@/test/fixtures/dto";
import { renderWithQuery } from "@/test/render";

import { DeadPlantPanel } from "../dead-plant-panel";

vi.mock("next/navigation", () => ({
  usePathname: () => "/garden",
  useRouter: () => ({ replace: vi.fn(), push: vi.fn(), back: vi.fn() }),
}));

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("<DeadPlantPanel />", () => {
  it("DELETEs the goal and fires onDeleted on Drop -> confirm", async () => {
    const fm = setupFetchMock();
    fm.mock("/api/goals/g1", { method: "DELETE", status: 204, body: null });
    const onDeleted = vi.fn();
    const { findByRole, findAllByRole } = renderWithQuery(
      <DeadPlantPanel goalId="g1" goalTitle="Run a 5K" onDeleted={onDeleted} />,
    );

    fireEvent.click(await findByRole("button", { name: /^drop goal$/i }));
    const buttons = await findAllByRole("button", { name: /^drop goal$/i });
    fireEvent.click(buttons[buttons.length - 1]!);

    await waitFor(() => expect(fm.calls("DELETE", "/api/goals/g1")).toHaveLength(1));
    await waitFor(() => expect(onDeleted).toHaveBeenCalled());
  });

  it("POSTs replant on Replant -> confirm", async () => {
    const fm = setupFetchMock();
    fm.mock("/api/goals/g1/replant", {
      method: "POST",
      status: 200,
      body: makeGoalDto({ id: "g1", healthState: "healthy", stage: 1 }),
    });
    const { findByRole } = renderWithQuery(
      <DeadPlantPanel goalId="g1" goalTitle="Run a 5K" onDeleted={() => undefined} />,
    );

    fireEvent.click(await findByRole("button", { name: /^🌱 replant$/i }));
    fireEvent.click(await findByRole("button", { name: /^replant$/i }));

    await waitFor(() => expect(fm.calls("POST", "/api/goals/g1/replant")).toHaveLength(1));
  });

  it("does nothing when the user cancels the drop dialog", async () => {
    const fm = setupFetchMock();
    const { findByRole } = renderWithQuery(
      <DeadPlantPanel goalId="g1" goalTitle="Run a 5K" onDeleted={() => undefined} />,
    );
    fireEvent.click(await findByRole("button", { name: /^drop goal$/i }));
    fireEvent.click(await findByRole("button", { name: /^cancel$/i }));
    expect(fm.calls("DELETE")).toHaveLength(0);
  });
});
