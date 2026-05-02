# Growth — Testing Strategy

## Pyramid

```
        ┌──────────┐
        │  E2E     │   handful    Playwright — golden flows only
        ├──────────┤
        │  Integr. │   moderate   Vitest (backend) + RTL (frontend)
        ├──────────┤
        │  Unit    │   majority   Vitest — pure domain functions
        └──────────┘
```

## What goes where

### Unit (Vitest, server `src/server/**/__tests__`)
Every rule in `domain-model.md` has at least one unit test. Examples:
- `growPlant` advances stage iff cumulative `plantRes` ≥ `requirements[stage]` for both primary and secondary.
- `getOverdueCount` counts long-overdue (>7d) tasks twice.
- `applyTaskCompletion` floors resources at 0 on uncomplete.
- `placeDeco` rejects tiles occupied by a planted goal.

### Integration — backend (Vitest)
Call Route Handlers directly (no HTTP); use the in-memory repositories. Verify request/response contracts and ownership enforcement:
- `PATCH /api/goals/[id]` returns 404 when the goal belongs to a different user.
- `POST /api/garden/tiles` returns 409 on a collision.
- `PATCH /api/me/priorities` is idempotent — second call after lock returns 409.

### Integration — frontend (RTL)
Render features against a real query client backed by a mock fetch (or MSW handlers wired to the in-memory backend). Verify user-visible behavior:
- Toggling a task on Today updates the goal's plant resources and the coin count.
- Set-priorities modal blocks tab content until submitted.
- Replanting a dead plant resets stage and reschedules overdue tasks to today.
- Completing a goal awards a trophy and frees the tile.

We do **not** mock the domain layer or services in integration tests. The whole point is to catch wiring bugs.

### End-to-end (Playwright, `tests/e2e`)
A handful of golden flows, each one click-by-click. Run via `pnpm test:e2e` (or `:ui` for the UI mode); CI runs them on every PR via the `e2e` job. The Playwright config in `playwright.config.ts` boots `pnpm dev -p 3100` for the test run (separate port from the developer's `pnpm dev` so both can coexist).

Currently shipped:
1. **First-run onboarding** (`tests/e2e/onboarding.spec.ts`) — visit `/` → sign in via the welcome→name two-step → set priorities → land on `/today`. Landed in PR #14 (Story 1.3.3).

Planned as the relevant epics ship:
2. Plant a goal: Plans → pick goal → place on garden tile.
3. Complete the daily routine, see the resource animation, watch the plant advance a stage.
4. Let a task go overdue (mock clock) → see Wilting badge → complete it → back to Healthy.
5. Complete a goal → trophy in garden, tile freed.
6. Reset state → confirm clean slate.

E2E uses a fixed clock (server-side) and unique random usernames per test so the in-memory backend doesn't carry state across tests.

## Coverage philosophy

We don't enforce a single coverage number with a CI gate — that incentivises writing dumb tests to hit lines. Apply common sense:

- **Domain layer**: every documented rule has at least one test. Branches that encode real business decisions (e.g. long-overdue > 7 days counts double) get explicit cases. If you can't see the rule reflected in a test, it isn't tested enough.
- **Services**: tests cover the happy path, the auth/ownership rejections, and any branch that maps to a 4xx error.
- **Route handlers**: integration test for each endpoint's contract (validation + happy path + the most likely error).
- **Components**: behavior, not lines. A presentational atom with no logic doesn't need a test.
- **E2E**: a small set of golden flows (see below).

Reviewers ask "would I notice if this regressed?" — if the answer is yes and there's no test catching it, push back. If the code is dead simple and a test would only echo it back, skip it.

## Fixtures

- **Unit tests** keep their fixtures module-local (e.g. `src/server/domain/__tests__/fixtures.ts` exports `makeGoal(overrides)` / `makeUser(overrides)`). Override-based factories beat hand-rolled per-spec objects.
- **Integration tests** use the shared harness in `src/test/`:
  - `src/test/render.tsx` — `renderWithQuery(ui)` wraps RTL render with a fresh test `QueryClient` (no retry / refetch / gc).
  - `src/test/fetch-mock.ts` — `setupFetchMock()` installs a global fetch spy with URL→response mappings + a typed `calls()` accessor.
  - `src/test/fixtures/state.ts` — `freshUser()`, `lockedUser()`, `seededGoals()` async builders that drive the in-memory backend through the real services (no shadow data path) and return DTO-shaped values. Drop them straight into a fetch-mock body so the wire shape matches what `/api/*` would return.
  - Canonical pattern: fixture → fetch-mock → `renderWithQuery` → assert. See `src/test/__tests__/harness.spec.tsx` for the worked example.
- **Clock**: `src/server/domain/clock.ts` exports `frozenClock(iso)` and `systemClock`. Domain functions and tests must inject the clock; reading `new Date()` inside domain code is forbidden.

## CI

- `pnpm typecheck` / `pnpm lint` / `pnpm format:check` — fast checks, run on every PR.
- `pnpm test:unit` — Vitest, runs on every PR.
- `pnpm build` — Next.js production build, runs on every PR.
- `pnpm test:e2e` — Playwright, runs on every PR in a separate `e2e` job (depends on `check`). Browsers cached across runs; HTML report uploaded as an artefact on failure. Retries set to 2 in CI to soak up flake.
- Coverage is reported as a PR comment so we can see trends. It is **not** a hard merge gate — reviewers use judgment per the philosophy above.
