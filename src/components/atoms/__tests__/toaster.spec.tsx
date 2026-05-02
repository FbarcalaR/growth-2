// @vitest-environment jsdom
import { fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { Toaster } from "../toaster";
import { clearAllToasts, toast } from "@/client/hooks";

beforeEach(() => clearAllToasts());
afterEach(() => clearAllToasts());

describe("<Toaster />", () => {
  it("renders nothing when there are no toasts", () => {
    const { container } = render(<Toaster />);
    expect(container.textContent).toBe("");
  });

  it("renders an active toast and dismisses it on the X button click", () => {
    const { rerender, getByText, getByRole, queryByText } = render(<Toaster />);
    toast.success("Saved", 0);
    rerender(<Toaster />);
    expect(getByText("Saved")).toBeTruthy();

    fireEvent.click(getByRole("button", { name: /dismiss notification/i }));
    rerender(<Toaster />);
    expect(queryByText("Saved")).toBeNull();
  });

  it("error toasts get role=alert; success/info get role=status", () => {
    const { rerender, getAllByRole } = render(<Toaster />);
    toast.error("Boom", 0);
    toast.success("Saved", 0);
    rerender(<Toaster />);

    expect(getAllByRole("alert")).toHaveLength(1);
    expect(getAllByRole("status").length).toBeGreaterThanOrEqual(1);
  });
});
