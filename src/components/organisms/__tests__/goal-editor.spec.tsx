// @vitest-environment jsdom
import { fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GoalEditor } from "../goal-editor";

afterEach(() => {
  vi.clearAllMocks();
});

describe("<GoalEditor mode='create' />", () => {
  it("disables save until title + area are picked", () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { getByRole, getByPlaceholderText } = render(
      <GoalEditor mode="create" open onClose={() => undefined} onSubmit={onSubmit} />,
    );
    const save = getByRole("button", { name: /plant goal/i }) as HTMLButtonElement;
    expect(save.disabled).toBe(true);
    fireEvent.change(getByPlaceholderText(/run a 5k/i), { target: { value: "Run a 5K" } });
    expect(save.disabled).toBe(true); // still no area
    fireEvent.click(getByRole("radio", { name: /health/i }));
    expect(save.disabled).toBe(false);
  });

  it("defaults the plant to the area's recommended kind, then lets the user override", () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { getByRole, queryByRole, getByPlaceholderText } = render(
      <GoalEditor mode="create" open onClose={() => undefined} onSubmit={onSubmit} />,
    );
    fireEvent.change(getByPlaceholderText(/run a 5k/i), { target: { value: "Run a 5K" } });
    // No plant picker visible until area is chosen.
    expect(queryByRole("radiogroup", { name: /plant kind/i })).toBeNull();

    fireEvent.click(getByRole("radio", { name: /health/i }));
    // Plant picker appears, herb (health's default) is selected.
    expect(getByRole("radio", { name: /^herb$/i }).getAttribute("aria-checked")).toBe("true");

    // Overriding picks a different one.
    fireEvent.click(getByRole("radio", { name: /^rose$/i }));
    expect(getByRole("radio", { name: /^rose$/i }).getAttribute("aria-checked")).toBe("true");
  });

  it("submits the trimmed title + area + selected plant on save and closes", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    const { getByRole, getByPlaceholderText } = render(
      <GoalEditor mode="create" open onClose={onClose} onSubmit={onSubmit} />,
    );
    fireEvent.change(getByPlaceholderText(/run a 5k/i), { target: { value: "  Run a 5K  " } });
    fireEvent.click(getByRole("radio", { name: /career/i }));
    fireEvent.click(getByRole("button", { name: /plant goal/i }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({
      title: "Run a 5K",
      area: "career",
      plantType: "sunflower",
    });
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });
});

describe("<GoalEditor mode='edit' />", () => {
  it("prefills title + plant, hides the area picker, and submits without area", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { getByDisplayValue, getByRole, queryByRole } = render(
      <GoalEditor
        mode="edit"
        open
        onClose={() => undefined}
        initial={{ title: "Run a 5K", area: "health", plantType: "rose" }}
        onSubmit={onSubmit}
      />,
    );
    expect(getByDisplayValue("Run a 5K")).toBeTruthy();
    expect(queryByRole("radiogroup", { name: /life area/i })).toBeNull();
    expect(getByRole("radio", { name: /^rose$/i }).getAttribute("aria-checked")).toBe("true");

    fireEvent.click(getByRole("button", { name: /save changes/i }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({ title: "Run a 5K", plantType: "rose" });
  });
});
