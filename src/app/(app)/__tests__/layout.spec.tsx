// @vitest-environment jsdom
import { waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import AppShellLayout from "../layout";
import { setupFetchMock } from "@/test/fetch-mock";
import { freshUser, lockedUser } from "@/test/fixtures/state";
import { renderWithQuery } from "@/test/render";

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => "/today",
  useRouter: () => ({ replace, push: vi.fn(), back: vi.fn() }),
}));

beforeEach(() => {
  replace.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("(app) shell guard", () => {
  it("redirects to /login when there's no session", async () => {
    const fetch = setupFetchMock();
    fetch.mock("/api/me", {
      method: "GET",
      status: 401,
      body: { code: "UNAUTHORIZED", message: "Sign in required" },
    });

    renderWithQuery(
      <AppShellLayout>
        <div>protected content</div>
      </AppShellLayout>,
    );

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
  });

  it("renders children + bottom nav when the user is signed in AND priorities are locked", async () => {
    const user = await lockedUser();
    setupFetchMock().json("/api/me", user);

    const { findByText, queryByRole } = renderWithQuery(
      <AppShellLayout>
        <div>protected content</div>
      </AppShellLayout>,
    );

    await findByText("protected content");
    // No priorities modal should be rendered.
    expect(queryByRole("dialog", { name: /set your priorities/i })).toBeNull();
  });

  it("overlays the SetPrioritiesModal when the user is signed in but priorities NOT locked", async () => {
    const user = await freshUser();
    setupFetchMock().json("/api/me", user);

    const { findByRole, findByText } = renderWithQuery(
      <AppShellLayout>
        <div>protected content</div>
      </AppShellLayout>,
    );

    // Children still render underneath; the modal sits on top.
    await findByText("protected content");
    await findByRole("dialog", { name: /set your priorities/i });
  });
});
