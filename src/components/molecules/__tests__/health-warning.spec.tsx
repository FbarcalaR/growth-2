// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HealthWarning } from "../health-warning";

describe("<HealthWarning />", () => {
  it("renders the wilting copy with the overdue count", () => {
    const { getByRole } = render(<HealthWarning state="wilting" overdueCount={1} />);
    const status = getByRole("status");
    expect(status.textContent).toContain("1 overdue");
    expect(status.textContent).toContain("catch up");
  });

  it("drops the count prefix when no tasks are overdue (lapsed routines only)", () => {
    const { getByRole } = render(<HealthWarning state="ill" overdueCount={0} />);
    const status = getByRole("status");
    expect(status.textContent).not.toContain("0 overdue");
    expect(status.textContent).toContain("Multiple tasks overdue");
  });

  it("renders nothing for healthy", () => {
    const { container } = render(<HealthWarning state="healthy" overdueCount={0} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing for dead — that state has its own dedicated banner", () => {
    const { container } = render(<HealthWarning state="dead" overdueCount={5} />);
    expect(container.firstChild).toBeNull();
  });

  it("uses an aria-label that includes the human label and copy", () => {
    const { getByRole } = render(<HealthWarning state="critical" overdueCount={3} />);
    const status = getByRole("status");
    expect(status.getAttribute("aria-label")).toContain("Critical");
    expect(status.getAttribute("aria-label")).toContain("On the brink");
  });
});
