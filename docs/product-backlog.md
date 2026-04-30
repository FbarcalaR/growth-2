# Growth — Product Backlog

Written from a PO perspective: stories ordered to maximise demonstrable value early, minimise rework, and make every milestone something we could plausibly ship if we had to stop here. Each story uses **As a / I want / So that** + acceptance criteria. Tasks are the engineering breakdown.

Status legend: `[ ]` not started · `[~]` in progress · `[x]` done.

---

## Epic 0 — Foundations

Goal: a runnable Next.js project with tokens, fonts, and the iOS frame, ready to host real screens.

### Story 0.1 — Project bootstrap
**As a** developer, **I want** a Next.js 15 + TS + Tailwind project initialized, **so that** all later work has a working baseline.
- [ ] 0.1.1 `create-next-app` with App Router, TS, Tailwind, ESLint
- [ ] 0.1.2 Add Prettier + EditorConfig
- [ ] 0.1.3 Configure path alias `@/*` → `src/*`
- [ ] 0.1.4 Add `pnpm` scripts: `dev`, `build`, `lint`, `typecheck`, `test:unit`, `test:e2e`
- [ ] 0.1.5 GitHub Actions CI: install → typecheck → lint → unit tests
- **Acceptance:** `pnpm dev` shows a Hello page, CI passes on a noop PR.

### Story 0.2 — Design tokens & fonts
**As a** designer-developer, **I want** all colors, fonts, and radii encoded once, **so that** components don't drift.
- [ ] 0.2.1 Configure `next/font` for Plus Jakarta Sans
- [ ] 0.2.2 Add tokens to `tailwind.config.ts` per `design-system.md`
- [ ] 0.2.3 Add CSS variables in `globals.css` for tokens that need runtime theming (accent color)
- [ ] 0.2.4 Build a `/_styleguide` route that renders every token (kept for the project's life)
- **Acceptance:** `/_styleguide` shows every color, every font weight, every radius.

### Story 0.3 — iOS frame shell
**As a** user, **I want** the app rendered inside a phone-shaped frame on desktop, **so that** the mobile-first design reads correctly.
- [ ] 0.3.1 Port `IOSDevice` from prototype to `components/ios-frame/`
- [ ] 0.3.2 Status bar + home indicator
- [ ] 0.3.3 Mount in `app/layout.tsx`
- **Acceptance:** Resizing the window keeps a centered phone; mobile viewports go edge-to-edge.

### Story 0.4 — Domain layer scaffold
**As a** developer, **I want** the domain types and constants in one place, **so that** every feature speaks the same language.
- [ ] 0.4.1 Port `WHEEL_AREAS`, `AREA_RESOURCE`, `PLANT_DEFS`, `RESOURCE_INFO`, `STAGE_NAMES`, `STAGE_COLORS` to `domain/`
- [ ] 0.4.2 Define `Goal`, `Task`, `Routine`, `Plant`, `Resource`, `Area`, `GardenState` types
- [ ] 0.4.3 Define Zod schemas mirroring the types
- [ ] 0.4.4 Unit tests on the schemas (round-trip)

### Story 0.5 — Store + persistence
**As a** developer, **I want** a Zustand store with persisted state and migrations, **so that** the app survives reloads.
- [ ] 0.5.1 Create `useGrowthStore` with `persist` middleware, key `growth_v1`
- [ ] 0.5.2 Implement `INITIAL_STATE` matching prototype seeds (toggleable for testing)
- [ ] 0.5.3 Implement `migrateState` v0→v1 (port prototype's `migrateState`)
- [ ] 0.5.4 Validate with Zod on hydrate; fall back to initial on failure
- [ ] 0.5.5 Unit tests for migration cases (grid resize, off-board planted goals, default `prioritiesLocked`)

---

## Epic 1 — First-run onboarding (vertical slice 1)

Goal: a user can launch the app, log in, set priorities, and land on a Today tab. End-to-end demoable.

### Story 1.1 — Login page
**As a** new user, **I want** to enter my name, **so that** the app greets me personally.
- [ ] 1.1.1 Port `LoginPage` to `features/login/`
- [ ] 1.1.2 React Hook Form + Zod validation (non-empty)
- [ ] 1.1.3 `LOGIN` action sets `user.name`
- [ ] 1.1.4 Integration test: empty submit blocked; valid name advances state

### Story 1.2 — Set priorities (Wheel of Life)
**As a** new user, **I want** to allocate priority weights across seven life areas, **so that** the app reflects what matters to me.
- [ ] 1.2.1 `WheelOfLife` component (slider + budget meter)
- [ ] 1.2.2 Enforce total budget ≤ 30 with live remaining indicator
- [ ] 1.2.3 `LOCK_PRIORITIES` action sets `wheelOfLife` and `prioritiesLocked = true`
- [ ] 1.2.4 Modal cannot be dismissed except by submitting
- [ ] 1.2.5 Integration test: budget exceedance disables submit

### Story 1.3 — App shell + bottom nav
**As a** user, **I want** four tabs (Today, Garden, History, Profile), **so that** I can navigate the app.
- [ ] 1.3.1 Routes: `/today`, `/garden`, `/history`, `/profile`
- [ ] 1.3.2 Layout-level guard: redirect to login if no name; overlay priorities modal if not locked
- [ ] 1.3.3 `BottomNav` with active-state SVGs from prototype
- [ ] 1.3.4 E2E test: full first-run flow lands on `/today`

---

## Epic 2 — Today tab (vertical slice 2)

Goal: see and complete today's tasks and routines; resources accrue; plant grows.

### Story 2.1 — Today list
**As a** user, **I want** to see today's tasks and routines grouped by goal, **so that** I know what to do.
- [ ] 2.1.1 Selector `selectTodayItems(state, today)` — tasks due today + active routines
- [ ] 2.1.2 `TaskRow`, `RoutineRow` components with checkbox, title, area badge
- [ ] 2.1.3 Empty state copy
- [ ] 2.1.4 Integration test against `midGameState` fixture

### Story 2.2 — Toggle task / routine
**As a** user, **I want** to check off tasks and routines, **so that** my plants get fed.
- [ ] 2.2.1 Domain `applyTaskCompletion`, `applyRoutineCompletion` (pure)
- [ ] 2.2.2 Store actions `toggleTask`, `toggleRoutine`
- [ ] 2.2.3 Coin and resource deltas per the rules table
- [ ] 2.2.4 Resource-fly-to-plant animation (respects reduced motion)
- [ ] 2.2.5 Unit + integration tests

### Story 2.3 — Plant growth on completion
**As a** user, **I want** my plants to advance stages when I feed them enough resources, **so that** I see my progress.
- [ ] 2.3.1 Domain `growPlant` (pure, idempotent)
- [ ] 2.3.2 Hook into completion actions
- [ ] 2.3.3 Visual: stage transition animation
- [ ] 2.3.4 Unit tests covering all 4 stage transitions

---

## Epic 3 — Plans tab

Goal: full CRUD over goals, tasks, and routines.

### Story 3.1 — Goals list
- [ ] 3.1.1 `GoalCard` with title, area, plant emoji, progress, health badge
- [ ] 3.1.2 Filter by area / by status (active/completed/dead)
- [ ] 3.1.3 Sort by recently updated

### Story 3.2 — Create goal
- [ ] 3.2.1 `GoalEditor` modal: title, area, plant kind (defaults from area)
- [ ] 3.2.2 Action `addGoal`
- [ ] 3.2.3 New goals start unplanted (`stage:0`)

### Story 3.3 — Edit / delete goal
- [ ] 3.3.1 Action `editGoal`, `deleteGoal`
- [ ] 3.3.2 Confirmation dialog on delete (destructive)
- [ ] 3.3.3 Free the tile on delete

### Story 3.4 — Manage tasks within a goal
- [ ] 3.4.1 Add / edit / delete tasks; due date picker
- [ ] 3.4.2 Inline checkbox toggles complete (same domain function as Today)

### Story 3.5 — Manage routines within a goal
- [ ] 3.5.1 Add / edit / delete routines; repeat-day picker
- [ ] 3.5.2 Mark routine permanently complete
- [ ] 3.5.3 Streak displays correctly

---

## Epic 4 — Garden tab

Goal: plant goals on tiles, watch them grow, decorate.

### Story 4.1 — Garden grid render
- [ ] 4.1.1 `GardenGrid` 8×6 with terrain map (plantable / non-plantable)
- [ ] 4.1.2 Render planted goals as `PlantSprite` per stage + health
- [ ] 4.1.3 Render placed decorations
- [ ] 4.1.4 Pan/zoom optional v1.5

### Story 4.2 — Plant a goal on a tile
- [ ] 4.2.1 Tap empty tile → "Pick a goal to plant" sheet listing unplanted goals
- [ ] 4.2.2 Action `plantGoal`; rejects occupied tiles
- [ ] 4.2.3 Animation: seed → sprout

### Story 4.3 — Replant / remove a dead plant
- [ ] 4.3.1 Tap a dead plant → modal with Replant / Drop options
- [ ] 4.3.2 Domain `replantGoal` resets stage and reschedules overdue tasks to today

### Story 4.4 — Trophies on goal completion
- [ ] 4.4.1 Action `completeGoal` awards `+50 coins` and `trophyId`
- [ ] 4.4.2 Tile is freed; trophy added to `garden.owned`
- [ ] 4.4.3 Trophy display on the garden (somewhere)

### Story 4.5 — Decoration shop
- [ ] 4.5.1 `DECO_CATALOG` ported from prototype
- [ ] 4.5.2 Buy with coins; rejects insufficient coins or duplicate buy
- [ ] 4.5.3 Place owned decoration on a free tile

---

## Epic 5 — History tab

Goal: a calendar of completion activity.

### Story 5.1 — History calendar
- [ ] 5.1.1 Month view; dot density per day reflects completions
- [ ] 5.1.2 Tap a day → list of completions
- [ ] 5.1.3 Streak summary at top

---

## Epic 6 — Profile tab

Goal: user identity, totals, settings, reset.

### Story 6.1 — Profile basics
- [ ] 6.1.1 Display name, total coins earned, current streak
- [ ] 6.1.2 Edit name

### Story 6.2 — Settings
- [ ] 6.2.1 Toggle resource animations (mirror `tweaks-panel` from prototype)
- [ ] 6.2.2 Accent color picker (CSS var)

### Story 6.3 — Danger zone
- [ ] 6.3.1 Reset all data with double confirmation
- [ ] 6.3.2 Export state as JSON (download)
- [ ] 6.3.3 Import state from JSON (validated)

---

## Epic 7 — Plant health system

Goal: overdue tasks visibly affect plants and Today copy.

### Story 7.1 — Health calculation
- [ ] 7.1.1 Domain `getOverdueCount`, `getHealth`, `getHealthState` (pure, clock injected)
- [ ] 7.1.2 Long-overdue (>7d) doubled; missed routines half-weight (per `domain-model.md`)
- [ ] 7.1.3 Unit tests at every transition

### Story 7.2 — Visual health states
- [ ] 7.2.1 Plant sprite swaps per state (healthy / wilting / ill / critical / dead)
- [ ] 7.2.2 Health badge on `GoalCard`
- [ ] 7.2.3 Today copy nags appropriately

---

## Epic 8 — Polish

Goal: ship-ready details.

- [ ] 8.1 Empty states for every tab
- [ ] 8.2 Error boundary at the app shell + toast for store hydrate failure
- [ ] 8.3 Reduced-motion compliance pass
- [ ] 8.4 Accessibility audit (axe; tap-target check)
- [ ] 8.5 Lighthouse pass (target ≥ 95 PWA-friendly)
- [ ] 8.6 README with run instructions, screenshots, and `docs/` index
- [ ] 8.7 First Playwright run in CI green

---

## Delivery order (recommended)

The order isn't a Gantt chart — it's the sequence that lets us demo something real after each epic:

1. **Epic 0** (foundations) — invisible but unblocks everything.
2. **Epic 1** (onboarding) — first demoable: name + priorities.
3. **Epic 2** (Today + completion + growth) — the core loop. After this we have a real game.
4. **Epic 7** (health) — without this, completion is upside-only and the game has no tension. Slot it here, before Plans, because Today depends on the visual health state.
5. **Epic 3** (Plans) — gives the user CRUD over their world.
6. **Epic 4** (Garden) — the visual payoff. Doable earlier in art-only form, but the *interactive* garden depends on Plans.
7. **Epic 5** (History) — read-only summary of work done; lowest risk.
8. **Epic 6** (Profile) — settings + reset.
9. **Epic 8** (Polish) — runs alongside late epics, not after.

## Definition of Done (every story)

1. Code merged through PR with green CI.
2. New behavior covered by unit + integration tests as applicable; coverage thresholds met.
3. Acceptance criteria demoed in PR description (gif or short clip if visual).
4. No new ESLint warnings, no `any`, no `@ts-ignore`.
5. Updated user-facing copy passes a quick read aloud.
6. Domain rules added to `domain-model.md` if any were introduced.
