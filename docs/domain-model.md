# Growth — Domain Model

This is the canonical reference for the entities and rules of Growth. Anything that disagrees with this document — code, design, or copy — is wrong until this document is updated.

The domain lives **server-side** (`src/server/domain/`); the frontend never re-implements these rules. Every persistent entity is scoped by `userId` — the system is multi-user from day 1, even though v1 has no collaboration UX.

## Entities

### User
- `id: UserId` — opaque server-generated identifier; foreign key on every other entity.
- `name: string` — non-empty after onboarding.
- `createdAt: ISODateTime`.

All entities below carry an implicit `userId: UserId`. Repositories enforce that queries filter by it; services reject cross-user reads.

### LifeArea (`Area`)
A fixed enum of seven areas; the user does not create new ones.

| Key | Label | Color | Default Resource |
|---|---|---|---|
| `health` | Health | `#66BB6A` | nutrients |
| `career` | Career | `#42A5F5` | sunlight |
| `finances` | Finances | `#FFA726` | gold |
| `relationships` | Relations | `#EC407A` | love |
| `personal` | Growth | `#AB47BC` | magic |
| `fun` | Fun | `#26C6DA` | magic |
| `spirituality` | Purpose | `#8D6E63` | moonlight |

Each area has a **priority weight** (0..N) set during onboarding. Total weights are budgeted (≤ 30 in the prototype).

### Plant
- `id` (a known plant kind: `herb | sunflower | money_tree | rose | mushroom | crystal | moon_flower`).
- `primary: Resource` and `secondary: Resource` (the two resources it consumes).
- `requirements: ResourceCost[]` — four entries, one per growth step; each is the cumulative resources needed to reach the next stage.
- `stage: 0..4` where `0=Seed, 1=Sprout, 2=Seedling, 3=Mature, 4=Blooming`.

Plant kind is chosen by the user when creating a goal; defaults are suggested per area.

### Resource
Seven kinds: `water, sunlight, gold, love, nutrients, magic, moonlight`. Each has an icon and color. Resources are **scoped to a single goal** (its `plantRes` map) — they are not a global wallet. The global wallet is `shopCoins`.

### Goal
- `id`
- `title`
- `area: Area`
- `plantType: PlantId`
- `planted: boolean` and (if planted) `tileCol`, `tileRow`
- `stage: 0..4`
- `plantRes: Partial<Record<Resource, number>>` (≥ 0 always)
- `tasks: Task[]`
- `routines: Routine[]`
- `completed?: boolean`, `completedAt?: number`, `trophyId?: string`

**Invariants**
- A goal that is `planted` has integer `tileCol ∈ [0,7]` and `tileRow ∈ [0,5]`.
- No two planted goals share a `(tileCol, tileRow)`.
- A `completed` goal has `stage === 4`, has a `trophyId`, and is removed from its tile (its tile becomes free).
- `plantRes[r] ≥ 0` for all resources.

### Task
- `id`, `title`, `completed: boolean`, `dueDate: ISODate | null`.

A task contributes to **plant health** based on whether it is overdue (see Health rules).

### Routine
- `id`, `title`, `completedToday: boolean`, `streak: number ≥ 0`, `repeatDays: boolean[7]` (Mon..Sun), `permanentlyCompleted?: boolean`.

A routine that is `permanentlyCompleted` is "graduated" — it no longer demands daily action but stays visible.

### Garden
- `decoGrid: (DecoItem | null)[8][6]` — 8 columns, 6 rows.
- `owned: DecoId[]` — items the user purchased from the shop.

A tile may hold a planted goal **or** a deco item, not both.

## Rules

### Wheel of Life onboarding
- The user is shown after first login. They allocate weights across the seven areas under a fixed budget (default 30).
- Once submitted, `prioritiesLocked = true`. **One-time only**; re-opening is out of scope for v1.

### Coins and resources from completion
| Action | Coins | Resources |
|---|---|---|
| Complete task | +3 | +4 of the area's primary resource |
| Uncomplete task | -3 | -4 of the area's primary resource (floored at 0) |
| Complete routine | +2 | +2 primary, +2 secondary (per the goal's plant) |
| Uncomplete routine | -2 | -2 primary, -2 secondary (floored at 0) |
| Mark routine permanent | +5 | none |
| Complete a goal | +50 | none; awards a unique `trophyId` |

### Plant growth
After every resource change, the goal's plant is checked:
- If `plantRes` covers `requirements[stage]` for both primary and secondary, advance one stage.
- Stage caps at 4 (Blooming).
- Stage 0 is "Seed" — visible only before planting.

### Plant health (derived, not stored)
`getOverdueCount(goal, now)` counts each incomplete task with `dueDate < today`. Long-overdue (>7 days) counts double. Routines whose `streak === 0` and have at least one repeat day in the current week add a half-point.

| Overdue count | Health | State | Visual |
|---|---|---|---|
| 0 | 100 | Healthy | Plant upright, vivid |
| 1 | 70 | Wilting | Slight droop |
| 2 | 40 | Ill | Yellow tint |
| 3 | 15 | Critical | Wilted, warning ring |
| ≥4 | 0 | Dead | Grey, must replant or drop |

### Replant
A dead plant can be replanted: stage resets to 1, `plantRes` clears, and any overdue (incomplete) task's `dueDate` is set to today. The user keeps their work but the clock resets.

### Garden grid
- **Locked at 8 columns × 6 rows.** Not configurable at v1.
- Some tiles may be non-plantable terrain (paths, water). Non-plantable tiles are defined by the garden art; the domain layer rejects placement on them.
- Plant-or-deco-or-empty per tile.
- Uniqueness `(userId, tileCol, tileRow)` is enforced by the repository (DB-level constraint when on Postgres).

### Trophies
A `trophyId = "trophy_<goalId>"` is added to `garden.owned` when a goal completes. Trophies cannot be sold or removed.

### Persistence schema versioning
- v1: this document.
- For the **in-memory** repository, migrations don't apply (process restarts wipe data).
- For **Postgres**, migrations are managed by Prisma (`prisma/migrations/*`). Each migration is checked into source.
- Domain functions never read or write storage directly — they take values, return values. Repositories are the only persistence boundary.
