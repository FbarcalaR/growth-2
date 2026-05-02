import { expect, test } from "@playwright/test";

/**
 * Story 1.3.3 — first golden e2e flow.
 *
 * Visit the root, sign in via the welcome→name two-step flow, set the seven
 * priorities to spend the full 30-point budget, lock them, and land on
 * `/today`. Asserts the same observable state a real user would see.
 *
 * Each test gets a fresh user via a unique random name so the in-memory
 * backend doesn't carry state across tests.
 */
test.describe("first-run onboarding", () => {
  test("visit / → sign in → set priorities → land on /today", async ({ page }) => {
    const name = `Reviewer ${crypto.randomUUID().slice(0, 8)}`;

    // 1. Visit the root; redirects to /today; (app) layout sees no session and
    //    sends us to /login.
    await page.goto("/");
    await page.waitForURL("**/login");

    // 2. Welcome step.
    await expect(page.getByRole("heading", { name: "Growth" })).toBeVisible();
    await expect(page.getByText(/grow your best life/i)).toBeVisible();
    await page.getByRole("button", { name: /start growing/i }).click();

    // 3. Name step.
    const nameInput = page.getByLabel(/your name/i);
    await expect(nameInput).toBeVisible();
    await nameInput.fill(name);
    await page.getByRole("button", { name: /let's go,/i }).click();

    // 4. Land on /today; the priorities modal is overlaid because the user
    //    has not locked the wheel yet.
    await page.waitForURL("**/today");
    const dialog = page.getByRole("dialog", { name: /set your priorities/i });
    await expect(dialog).toBeVisible();

    // 5. Spend the full budget. The simplest deterministic distribution: 30
    //    points on Health (the prototype allows it). Click + on the first
    //    increment button thirty times.
    const incrementHealth = dialog.getByRole("button", { name: /increase health/i });
    for (let i = 0; i < 30; i += 1) {
      await incrementHealth.click();
    }

    // 6. The save CTA flips at remaining=0.
    const lockButton = dialog.getByRole("button", { name: /save and lock my priorities/i });
    await expect(lockButton).toBeEnabled();

    // 7. Lock; the modal disappears and Today's placeholder is visible.
    await lockButton.click();
    await expect(dialog).toBeHidden();
    await expect(page.getByRole("heading", { name: /^today$/i })).toBeVisible();
  });
});
