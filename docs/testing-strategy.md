# Growth — Testing Strategy

## Pyramid

```
        ┌──────────┐
        │  E2E     │   ~6 specs   Playwright
        ├──────────┤
        │  Integr. │   ~25 specs  RTL + Zustand store, no mocks of domain
        ├──────────┤
        │  Unit    │   majority   Vitest, pure functions
        └──────────┘
```

## What goes where

### Unit (Vitest, `src/domain/__tests__`)
Every rule in `domain-model.md` has a unit test. Examples:
- `growPlant` advances stage iff cumulative `plantRes` ≥ `requirements[stage]` for both primary and secondary.
- `getOverdueCount` counts long-overdue (>7d) tasks twice.
- `applyTaskCompletion` floors resources at 0 on uncomplete.
- `placeDeco` rejects tiles occupied by a planted goal.
- Migrations: each migration takes a hand-written prior-version blob and produces the expected current shape.

### Integration (RTL, `src/features/**/__tests__`)
Render a feature with a real Zustand store seeded with fixtures. Verify user-visible behavior:
- Toggling a task on Today updates the goal's plant resources and the coin count.
- Set-priorities modal blocks tab content until submitted.
- Replanting a dead plant resets stage and reschedules overdue tasks to today.
- Completing a goal awards a trophy and frees the tile.

We do **not** mock the store or the domain layer in integration tests. The whole point is to catch wiring bugs.

### End-to-end (Playwright, `tests/e2e`)
A handful of golden flows, each one click-by-click:
1. First-run onboarding: enter name → set priorities → land on Today.
2. Plant a goal: Plans → pick goal → place on garden tile.
3. Complete the daily routine, see the resource animation, watch the plant advance a stage.
4. Let a task go overdue (mock clock) → see Wilting badge → complete it → back to Healthy.
5. Complete a goal → trophy in garden, tile freed.
6. Reset state → confirm clean slate.

E2E uses a fixed clock and a seeded `localStorage` blob so runs are deterministic.

## Coverage policy

- **Domain layer: 100% line + branch.** It's pure and small; there's no excuse.
- **Store: 90%+ on actions.** Branches that re-enter no-op paths (`if (occupied) return state`) must be tested.
- **Components: behavior coverage, not line coverage.** A component without behavior worth testing isn't tested.
- **Overall floor:** 80%. CI fails below.

## Fixtures

- `src/test/fixtures/state.ts` exports `freshState()`, `midGameState()`, `deadPlantState()`, `nearGoalCompletionState()`. These are the canonical inputs for integration tests; don't roll your own per-spec.
- `src/test/clock.ts` exports `frozenClock(iso)` and is the only way tests get a `now`.

## CI

- `pnpm test:unit` — Vitest, fast, runs on every PR.
- `pnpm test:e2e` — Playwright, runs on PRs touching `app/`, `src/features/`, `src/store/`.
- `pnpm typecheck` and `pnpm lint` always.
- Coverage uploaded as a PR comment; below-threshold blocks merge.
