// @vitest-environment jsdom
import { fireEvent, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GoalEditor } from "../goal-editor";
import { setupFetchMock } from "@/test/fetch-mock";
import { lockedUser } from "@/test/fixtures/state";
import { renderWithQuery } from "@/test/render";

vi.mock("next/navigation", () => ({
  usePathname: () => "/garden",
  useRouter: () => ({ replace: vi.fn(), push: vi.fn(), back: vi.fn() }),
}));

afterEach(() => {
  vi.unstubAllGlobals();
});

async function mountCreate(onSubmit = vi.fn().mockResolvedValue(undefined)) {
  const user = await lockedUser();
  setupFetchMock({
    "/api/me": user,
    "/api/goals": { goals: [] },
  });
  const result = renderWithQuery(
    <GoalEditor mode="create" open onClose={() => undefined} onSubmit={onSubmit} />,
  );
  return { ...result, onSubmit };
}

describe("<GoalEditor mode='create' /> two-step flow", () => {
  it("Step 0 disables Next until a title is entered", async () => {
    const { findByRole, getByPlaceholderText } = await mountCreate();
    const next = (await findByRole("button", {
      name: /next: choose your plant/i,
    })) as HTMLButtonElement;
    expect(next.disabled).toBe(true);
    fireEvent.change(getByPlaceholderText(/what do you want to achieve/i), {
      target: { value: "Run a 5K" },
    });
    expect(next.disabled).toBe(false);
  });

  it("Step 0 surfaces a slot counter on each area chip", async () => {
    const { findAllByText } = await mountCreate();
    // lockedUser's wheel allocates 5 priority points each to health / career /
    // finances / relationships / personal — five chips show "0/5". The
    // counter exists, that's what we care about here.
    const counters = await findAllByText("0/5");
    expect(counters.length).toBeGreaterThanOrEqual(5);
  });

  it("advancing to Step 1 shows the plant grid pre-selected for the area", async () => {
    const { findByRole, getByPlaceholderText } = await mountCreate();
    fireEvent.change(getByPlaceholderText(/what do you want to achieve/i), {
      target: { value: "Run a 5K" },
    });
    fireEvent.click(await findByRole("button", { name: /next: choose your plant/i }));

    // We're on Step 1 now; the herb option is selected (health's default).
    const herb = await findByRole("radio", { name: /^herb$/i });
    expect(herb.getAttribute("aria-checked")).toBe("true");
    // Submit button is the seed CTA.
    await findByRole("button", { name: /add as seed/i });
  });

  it("submits area + plant on Add as seed and closes", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { findByRole, getByPlaceholderText } = await mountCreate(onSubmit);
    fireEvent.change(getByPlaceholderText(/what do you want to achieve/i), {
      target: { value: "  Run a 5K  " },
    });
    fireEvent.click(await findByRole("button", { name: /next: choose your plant/i }));
    fireEvent.click(await findByRole("radio", { name: /^rose$/i }));
    fireEvent.click(await findByRole("button", { name: /add as seed/i }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({
      title: "Run a 5K",
      area: "health",
      plantType: "rose",
    });
  });

  it("Back button on Step 1 returns to Step 0", async () => {
    const { findByRole, getByPlaceholderText } = await mountCreate();
    fireEvent.change(getByPlaceholderText(/what do you want to achieve/i), {
      target: { value: "Run a 5K" },
    });
    fireEvent.click(await findByRole("button", { name: /next: choose your plant/i }));
    fireEvent.click(await findByRole("button", { name: /^← back$/i }));
    // We're on Step 0 again — the Next button is back.
    await findByRole("button", { name: /next: choose your plant/i });
  });
});

describe("<GoalEditor mode='edit' />", () => {
  it("opens directly on Step 1 with title prefilled and submits without area", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = await lockedUser();
    setupFetchMock({
      "/api/me": user,
      "/api/goals": { goals: [] },
    });
    const { findByRole, getByDisplayValue } = renderWithQuery(
      <GoalEditor
        mode="edit"
        open
        initial={{ title: "Run a 5K", area: "health", plantType: "rose" }}
        onClose={() => undefined}
        onSubmit={onSubmit}
      />,
    );
    getByDisplayValue("Run a 5K");
    expect((await findByRole("radio", { name: /^rose$/i })).getAttribute("aria-checked")).toBe(
      "true",
    );
    fireEvent.click(await findByRole("button", { name: /save changes/i }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({ title: "Run a 5K", plantType: "rose" });
  });
});
