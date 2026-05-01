// @vitest-environment jsdom
import { fireEvent, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import LoginPage from "../page";
import { setupFetchMock } from "@/test/fetch-mock";
import { freshUser } from "@/test/fixtures/state";
import { renderWithQuery } from "@/test/render";

/**
 * Story 1.1 integration test. Mounts the real `LoginPage`, drives the
 * two-step flow, and asserts the network calls + redirect. RTL `cleanup`
 * runs globally via `src/test/setup.ts`.
 */

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn(), back: vi.fn() }),
}));

beforeEach(() => {
  replace.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("/login — two-step welcome flow", () => {
  it("renders the welcome step first with the tagline and Start Growing button", async () => {
    const fetch = setupFetchMock();
    fetch.mock("/api/me", {
      method: "GET",
      status: 401,
      body: { code: "UNAUTHORIZED", message: "Sign in required" },
    });

    const { findByRole, queryByLabelText } = renderWithQuery(<LoginPage />);
    await findByRole("button", { name: /start growing/i });
    // Name field shouldn't render yet on the welcome step.
    expect(queryByLabelText(/your name/i)).toBeNull();
  });

  it("clicking Start Growing reveals the name input + Continue button", async () => {
    setupFetchMock().mock("/api/me", {
      method: "GET",
      status: 401,
      body: { code: "UNAUTHORIZED", message: "Sign in required" },
    });

    const { findByRole, getByRole, queryByLabelText } = renderWithQuery(<LoginPage />);
    fireEvent.click(await findByRole("button", { name: /start growing/i }));

    await waitFor(() => expect(queryByLabelText(/your name/i)).not.toBeNull());
    expect(getByRole("button", { name: /continue/i })).toBeTruthy();
  });

  it("submitting an empty name shows the validation error and does NOT call POST /api/me", async () => {
    const fetch = setupFetchMock();
    fetch.mock("/api/me", {
      method: "GET",
      status: 401,
      body: { code: "UNAUTHORIZED", message: "Sign in required" },
    });

    const { findByRole, getByRole, findByRole: findByRoleAgain } = renderWithQuery(<LoginPage />);
    fireEvent.click(await findByRole("button", { name: /start growing/i }));
    fireEvent.click(getByRole("button", { name: /continue/i }));

    await findByRoleAgain("alert");
    expect(fetch.calls("POST", "/api/me")).toHaveLength(0);
  });

  it("submitting a valid name POSTs /api/me and replaces to /today", async () => {
    const user = await freshUser("Ada Lovelace");
    const fetch = setupFetchMock();
    fetch.mock("/api/me", {
      method: "GET",
      status: 401,
      body: { code: "UNAUTHORIZED", message: "Sign in required" },
    });
    fetch.mock("/api/me", { method: "POST", status: 201, body: user });

    const { findByRole, getByRole, getByLabelText } = renderWithQuery(<LoginPage />);
    fireEvent.click(await findByRole("button", { name: /start growing/i }));

    await waitFor(() => expect(getByLabelText(/your name/i)).toBeTruthy());
    fireEvent.change(getByLabelText(/your name/i), { target: { value: "Ada Lovelace" } });

    // The button label personalises with the first name.
    fireEvent.click(getByRole("button", { name: /let's go, ada!/i }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/today"));
    const posts = fetch.calls("POST", "/api/me");
    expect(posts).toHaveLength(1);
    expect(posts[0]?.body).toEqual({ name: "Ada Lovelace" });
  });

  it("server-side error from POST /api/me surfaces as inline alert (no redirect)", async () => {
    const fetch = setupFetchMock();
    fetch.mock("/api/me", {
      method: "GET",
      status: 401,
      body: { code: "UNAUTHORIZED", message: "Sign in required" },
    });
    fetch.mock("/api/me", {
      method: "POST",
      status: 422,
      body: { code: "INVALID_INPUT", message: "Name is too long" },
    });

    const { findByRole, getByRole, getByLabelText, findByText } = renderWithQuery(<LoginPage />);
    fireEvent.click(await findByRole("button", { name: /start growing/i }));
    await waitFor(() => expect(getByLabelText(/your name/i)).toBeTruthy());
    fireEvent.change(getByLabelText(/your name/i), { target: { value: "anything" } });
    fireEvent.click(getByRole("button", { name: /let's go/i }));

    await findByText(/name is too long/i);
    expect(replace).not.toHaveBeenCalled();
  });
});
