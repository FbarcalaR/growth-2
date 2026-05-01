# Growth — Product Backlog

> Revised after PR #1 review: dropped the iOS-frame story, added backend foundation work, and reordered Epic 0 so the backend goes in alongside the frontend foundation. Stories ordered to maximise demonstrable value early and minimise rework.

Each story uses **As a / I want / So that** + acceptance criteria. Tasks are the engineering breakdown.

Status legend: `[ ]` not started · `[~]` in progress · `[x]` done.

---

## Epic 0 — Foundations

Goal: a runnable Next.js project with tokens, atomic-design primitives, and a working backend skeleton. After this epic, the next person can pick up a feature without yak-shaving.

### Story 0.1 — Project bootstrap ✅ (PR #2)
**As a** developer, **I want** a Next.js + TS + Tailwind project initialized at the latest stable versions, **so that** all later work has a working baseline.
- [x] 0.1.1 `create-next-app` (latest stable) with App Router, TS strict, Tailwind, ESLint
- [x] 0.1.2 Add Prettier + EditorConfig
- [x] 0.1.3 Configure path alias `@/*` → `src/*`
- [x] 0.1.4 `pnpm` scripts: `dev`, `build`, `start`, `lint`, `typecheck`, `format`, `format:check` (`test:unit`/`test:e2e` land with Story 0.5)
- [x] 0.1.5 ESLint rule preventing `src/server/**` imports from `src/components/**`, `src/features/**`, `src/client/**`
- [x] 0.1.6 GitHub Actions CI: install → typecheck → lint → format:check → build
- **Acceptance:** `pnpm dev` shows a Hello page; CI passes on a noop PR. ✅

### Story 0.2 — Design tokens & fonts ✅ (PR #2)
**As a** designer-developer, **I want** all colors, fonts, and radii encoded once, **so that** components don't drift.
- [x] 0.2.1 Configure `next/font` for Plus Jakarta Sans
- [x] 0.2.2 Add tokens to Tailwind v4's `@theme` block in `globals.css` (Tailwind v4 is CSS-first; no `tailwind.config.ts`)
- [x] 0.2.3 CSS variables in `globals.css` for tokens that need runtime theming (`--accent` reserved for the Profile picker in Story 6.2.2)
- [x] 0.2.4 `/styleguide` route renders every token (kept for the project's life)

### Story 0.3 — Atomic design primitives ✅ (PR #3)
**As a** developer, **I want** the reusable atoms and a few key molecules in place, **so that** features compose them instead of restyling.
- [x] 0.3.1 Atoms: `Button`, `Chip`, `Badge`, `Icon`, `Input`, `ProgressBar`, `Avatar`, `Toggle`, `Checkbox`, `Modal`
- [x] 0.3.2 Molecules: `AreaChip`, `HealthBadge`, `TaskRow`, `RoutineRow`, `AreaPicker`, `ResourceMeter`
- [x] 0.3.3 `cn()` helper (`clsx` + `tailwind-merge`), typed `variant`/`tone`/`size` props on atoms (no Tailwind blobs at call sites)
- [x] 0.3.4 `/styleguide` extended to show every atom + molecule with each variant
- **Acceptance:** A second developer can build a new screen using only atoms/molecules without writing new utility-class soup. ✅

### Story 0.4 — App shell (no device frame) ✅ (PR #4)
**As a** user, **I want** a clean web app shell with bottom navigation, **so that** I can move between tabs.
- [x] 0.4.1 Root layout in `app/layout.tsx`: fonts, globals (TanStack Query + any other providers land in Story 0.8)
- [x] 0.4.2 `(app)` route group with bottom-nav layout
- [x] 0.4.3 Routes: `/today`, `/garden`, `/history`, `/profile` — each a real page
- [x] 0.4.4 Responsive shell: full-width on mobile; centered max-width column on desktop
- [x] 0.4.5 Auth guard at `(app)/layout.tsx` redirects to `/login` if no session (dev-stub via `useSyncExternalStore` over `localStorage`; onboarding-modal overlay lands with Story 1.2/1.3)
- **Bonus:** `BottomNav` and `PlaceholderPage` use `lucide-react` icons (project's chosen icon library) instead of inline SVGs/emojis.

### Story 0.5 — Domain layer scaffold (server-side) ✅ (PR #6)
**As a** developer, **I want** the domain types and constants in `src/server/domain/`, **so that** every service speaks the same language.
- [x] 0.5.1 Port `AREA_RESOURCE`, `AREA_DEFAULT_PLANT`, `PLANT_DEFS`, `STAGE_NAMES` (resource and area display metadata already lives in `src/shared/`)
- [x] 0.5.2 Define `Goal`, `Task`, `Routine`, `Plant`, `Resource`, `Area`, `GardenState`, `User`, `WheelOfLife` types (every persistent entity scoped by `userId`)
- [x] 0.5.3 Pure functions: `growPlant`, `getOverdueCount`, `getHealth`, `getHealthState`, `applyTaskCompletion`, `applyRoutineCompletion`, `completeRoutinePermanently`, `replantGoal`, `completeGoal`, `placeDeco`/`unplaceDeco`, `plantGoalOnTile`/`unplantGoalFromTile`, `lockPriorities`
- [x] 0.5.4 Clock injected via `Clock` interface; `frozenClock(iso)` for tests; `systemClock` for production
- [x] 0.5.5 Unit tests for each rule (Vitest); 76 specs across plants/health/rewards/goals/garden/wheel/schemas
- [x] 0.5.6 `DomainError` class with stable error codes (`GOAL_NOT_FOUND`, `TILE_OCCUPIED`, `PRIORITIES_ALREADY_LOCKED`, …) — services let these bubble; HTTP error mapper translates to 4xx in Story 0.7
- [x] 0.5.7 Zod schemas in `src/server/domain/schemas.ts` for entity validation at the persistence/API boundary

### Story 0.6 — Repository abstraction + in-memory impl ✅ (PR #6)
**As a** developer, **I want** repository interfaces with an in-memory implementation, **so that** services have somewhere to read/write that we can later swap for Postgres without touching domain or services.
- [x] 0.6.1 Interfaces: `UserRepo`, `GoalRepo`, `GardenRepo`, `ShopRepo` in `src/server/repositories/types.ts`
- [x] 0.6.2 In-memory implementations under `src/server/repositories/memory/`
- [x] 0.6.3 Composition root `src/server/container.ts` — single place that picks impls; `getContainer()` / `resetContainer()`
- [x] 0.6.4 Every repo method scoped by `userId`; cross-user reads return null / empty
- [x] 0.6.5 Conformance suite (`__tests__/conformance.ts`) parameterised by a `makeRepos()` factory; `memory.spec.ts` runs it against the in-memory impls. Same suite will run against Prisma in Epic A.
- [x] 0.6.6 Repos return defensive clones — callers can't mutate the store by holding onto references.

### Story 0.7 — HTTP boundary (Route Handlers + validation)
**As a** developer, **I want** the API surface defined and validated, **so that** the frontend has a stable contract.
- [ ] 0.7.1 Zod schemas in `src/shared/schemas/` for every request and response
- [ ] 0.7.2 `requireUser(req)` helper (dev stub; ready to swap for Auth.js session)
- [ ] 0.7.3 Error mapper: `DomainError` → 4xx, unknown → 5xx + log
- [ ] 0.7.4 Routes: `GET/POST /api/goals`, `PATCH/DELETE /api/goals/[id]`, etc. (skeletons for the rest of the epics)
- [ ] 0.7.5 Integration tests against the Route Handlers (no HTTP, call the handler directly)

### Story 0.8 — Frontend data layer (TanStack Query)
**As a** developer, **I want** typed hooks for every API endpoint, **so that** features just call `useGoals()` and don't worry about loading/error/cache.
- [ ] 0.8.1 Query client provider in root layout
- [ ] 0.8.2 Typed fetcher per route (uses the shared Zod schemas)
- [ ] 0.8.3 Hooks: `useGoals`, `useGoal`, `useGarden`, mutation hooks for tasks/routines/goals with optimistic updates and rollback
- [ ] 0.8.4 Error boundary + toast on mutation failure

---

## Epic 1 — First-run onboarding

Goal: a user can launch the app, log in (dev stub), set priorities, land on Today.

### Story 1.1 — Login page
- [ ] 1.1.1 `LoginPage` collects name (and email when Auth.js arrives)
- [ ] 1.1.2 React Hook Form + Zod validation (non-empty)
- [ ] 1.1.3 `POST /api/me` creates the user; sets the dev session cookie
- [ ] 1.1.4 Integration test: empty submit blocked; valid submit advances

### Story 1.2 — Set priorities (Wheel of Life)
- [ ] 1.2.1 `WheelOfLife` organism (slider + budget meter)
- [ ] 1.2.2 Enforce total budget ≤ 30 with live remaining indicator
- [ ] 1.2.3 `PATCH /api/me/priorities` writes wheel + flips `prioritiesLocked = true`
- [ ] 1.2.4 Modal cannot be dismissed except by submitting (one-time, locked thereafter)
- [ ] 1.2.5 Server enforces idempotency — second lock is rejected

### Story 1.3 — Authed shell guard
- [ ] 1.3.1 `(app)/layout.tsx` redirects to `/login` if no session
- [ ] 1.3.2 Overlays `SetPrioritiesModal` if `prioritiesLocked === false`
- [ ] 1.3.3 E2E: full first-run flow lands on `/today`

---

## Epic 2 — Today tab

Goal: see and complete today's tasks and routines; resources accrue; plant grows.

### Story 2.1 — Today list
- [ ] 2.1.1 `GET /api/today` returns today's items grouped by goal (server filters by date + user)
- [ ] 2.1.2 `TaskRow`/`RoutineRow` molecules render the items with checkbox, title, area badge
- [ ] 2.1.3 Empty state copy

### Story 2.2 — Toggle task / routine
- [ ] 2.2.1 Domain functions for completion math (already in 0.5)
- [ ] 2.2.2 Service `toggleTask`, `toggleRoutine` — applies math, persists, returns updated goal
- [ ] 2.2.3 `PATCH /api/goals/[id]/tasks/[taskId]` and `/routines/[routineId]`
- [ ] 2.2.4 Optimistic update in TanStack Query mutation; rollback on error
- [ ] 2.2.5 Resource-fly-to-plant animation (respects `prefers-reduced-motion`)

### Story 2.3 — Plant growth on completion
- [ ] 2.3.1 Server applies `growPlant` after every resource change; returns new stage
- [ ] 2.3.2 Stage-transition animation in the goal card
- [ ] 2.3.3 Tests covering each of the 4 stage transitions

---

## Epic 3 — Plans tab

### Story 3.1 — Goals list
- [ ] 3.1.1 `GET /api/goals` (filters: area, status); sorted by recently updated
- [ ] 3.1.2 `GoalCard` organism with title, area, plant emoji, progress, health badge

### Story 3.2 — Create goal
- [ ] 3.2.1 `GoalEditor` modal: title, area, plant kind (defaults from area)
- [ ] 3.2.2 `POST /api/goals`; new goals start unplanted (`stage:0`)

### Story 3.3 — Edit / delete goal
- [ ] 3.3.1 `PATCH /api/goals/[id]`, `DELETE /api/goals/[id]`
- [ ] 3.3.2 Confirmation dialog on delete (destructive)
- [ ] 3.3.3 Delete frees the tile (server handles via service)

### Story 3.4 — Tasks within a goal
- [ ] 3.4.1 Add / edit / delete; due-date picker
- [ ] 3.4.2 Inline checkbox toggle (same endpoint as Today)

### Story 3.5 — Routines within a goal
- [ ] 3.5.1 Add / edit / delete; repeat-day picker
- [ ] 3.5.2 Mark routine permanently complete
- [ ] 3.5.3 Streak displays correctly

---

## Epic 4 — Garden tab

### Story 4.1 — Garden grid render
- [ ] 4.1.1 `GardenGrid` 8×6 (locked); terrain map (plantable / non-plantable)
- [ ] 4.1.2 Render planted goals as `PlantSprite` per stage + health
- [ ] 4.1.3 Render placed decorations

### Story 4.2 — Plant a goal on a tile
- [ ] 4.2.1 Tap empty tile → "Pick a goal to plant" sheet listing unplanted goals
- [ ] 4.2.2 `POST /api/garden/tiles` with `(col, row, goalId)`; rejects occupied tiles (DB-level uniqueness later)
- [ ] 4.2.3 Animation: seed → sprout

### Story 4.3 — Replant / drop a dead plant
- [ ] 4.3.1 Tap dead plant → modal with Replant / Drop
- [ ] 4.3.2 Server `replantGoal` resets stage and reschedules overdue tasks to today

### Story 4.4 — Trophies on goal completion
- [ ] 4.4.1 `POST /api/goals/[id]/complete` awards `+50 coins` and `trophyId`
- [ ] 4.4.2 Tile freed; trophy added to `garden.owned`
- [ ] 4.4.3 Trophy display somewhere on the garden

### Story 4.5 — Decoration shop
- [ ] 4.5.1 `DECO_CATALOG` ported (server-owned)
- [ ] 4.5.2 `POST /api/shop/buy` rejects insufficient coins / duplicate purchase
- [ ] 4.5.3 Place owned decoration on a free tile

---

## Epic 5 — History tab
- [ ] 5.1.1 `GET /api/history?month=YYYY-MM` returns completion counts per day
- [ ] 5.1.2 Month view; dot density per day
- [ ] 5.1.3 Tap a day → list of completions
- [ ] 5.1.4 Streak summary at top

---

## Epic 6 — Profile tab
- [ ] 6.1.1 Display name, total coins earned, current streak
- [ ] 6.1.2 Edit name
- [ ] 6.2.1 Toggle resource animations
- [ ] 6.2.2 Accent color picker (CSS var)
- [ ] 6.3.1 Reset all data with double confirmation (`POST /api/me/reset`)
- [ ] 6.3.2 Export state as JSON
- [ ] 6.3.3 Import state from JSON (validated server-side)

---

## Epic 7 — Plant health system
- [ ] 7.1.1 `getOverdueCount`, `getHealth`, `getHealthState` (already drafted in 0.5)
- [ ] 7.1.2 Long-overdue (>7d) doubled; missed routines half-weight
- [ ] 7.1.3 Server returns health alongside goals (never persisted)
- [ ] 7.2.1 Plant sprite swaps per state
- [ ] 7.2.2 Health badge on `GoalCard`
- [ ] 7.2.3 Today copy nags appropriately

---

## Epic 8 — Polish
- [ ] 8.1 Empty states for every tab
- [ ] 8.2 Error boundary at the app shell + toast for API failures
- [ ] 8.3 Reduced-motion compliance pass
- [ ] 8.4 Accessibility audit (axe; tap-target check; keyboard nav for the bottom nav)
- [ ] 8.5 Lighthouse pass
- [ ] 8.6 README with run instructions, screenshots, `docs/` index
- [ ] 8.7 First Playwright run in CI green

---

## Epic A — Persistence: Postgres + Prisma (replaces in-memory)

Run when the in-memory layer becomes a real bottleneck (data loss on restart starts hurting). The point of repository abstraction is that this is a self-contained epic.

- [ ] A.1 Add `prisma/schema.prisma` modeling `User`, `Goal`, `Task`, `Routine`, `GardenTile`, `OwnedDeco`, `Trophy`, with `userId` foreign keys and `(userId, tileCol, tileRow)` uniqueness
- [ ] A.2 Implement Prisma-backed repos under `src/server/repositories/prisma/` against the same interfaces
- [ ] A.3 Run interface conformance tests against the Prisma impl
- [ ] A.4 Switch `container.ts` binding behind an env flag; rollback by flipping it back
- [ ] A.5 Provision Postgres (Neon for dev/preview, decide hosted prod target)
- [ ] A.6 First migration + seed scripts

---

## Epic B — Auth (Auth.js)

Run when product wants real accounts. Designed-for in v1; this epic is the actual rollout.

- [ ] B.1 Install `next-auth` (latest), configure providers (start: email magic link)
- [ ] B.2 Prisma adapter on the same DB
- [ ] B.3 Replace `requireUser` dev stub with the Auth.js session subject
- [ ] B.4 Login UI swaps from "type a name" to "enter your email"
- [ ] B.5 Migrate dev-stub users (or wipe — TBD by product)
- [ ] B.6 OAuth providers (Google, Apple) as a follow-up

---

## Delivery order

The order isn't a Gantt chart — it's the sequence that lets us demo something real after each epic:

1. **Epic 0** — foundations (frontend + backend skeleton). Most invisible work; everything depends on it.
2. **Epic 1** — onboarding. First demoable: name + priorities, persisted server-side.
3. **Epic 2** — Today + completion + growth. The core loop. After this we have a real game.
4. **Epic 7** — health. Adds tension to the loop. Slot here, before Plans, because Today depends on the visual health state.
5. **Epic 3** — Plans (CRUD).
6. **Epic 4** — Garden (visual payoff).
7. **Epic 5** — History.
8. **Epic 6** — Profile.
9. **Epic 8** — Polish, runs alongside the late epics.
10. **Epic A** — Postgres swap, when needed.
11. **Epic B** — Auth, when product wants accounts.

## Definition of Done (every story)

1. Code merged through PR with green CI.
2. New behavior covered by tests proportional to its risk (see `testing-strategy.md`).
3. Acceptance criteria demoed in PR description.
4. No new ESLint warnings, no `any`, no `@ts-ignore`.
5. User-facing copy reads aloud cleanly.
6. **Docs are kept in sync in the same PR**:
   - This backlog: every implemented sub-task ticked `[x]`; every implemented story tagged with the merging PR (e.g. `### Story X — Title ✅ (PR #N)`).
   - Domain rules added or revised in `domain-model.md` if any were introduced or changed.
   - `architecture.md` / `coding-guidelines.md` / `design-system.md` updated when a decision in the PR contradicts or extends them. Don't ship the code and "do the docs later" — reviewers should be able to read the doc change and the code change side by side.
