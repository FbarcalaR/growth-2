# Growth

A gamified life planner. Set priorities across seven life areas, plant goals as
seeds, and water them with daily action — tasks and routines feed resources to
the plant, growing it through five stages. Overdue work wilts it; finishing the
goal earns a trophy in your garden.

## Stack

Next.js 16 (App Router) · TypeScript (strict) · Tailwind CSS v4 · React 19 ·
TanStack Query. Backend in the same repo via Route Handlers; in-memory
repositories now, Postgres + Prisma planned (Epic A). See [`docs/`](./docs/)
for the full architecture.

## Tabs

| Tab | Route | What it does |
|---|---|---|
| Today | `/today` | Daily to-do list — toggle tasks/routines, plant grows on completion |
| Garden | `/garden` | 8×6 isometric plot — plant goals on tilled tiles, place decorations on grass, view trophies + shop |
| History | `/history` | Month calendar — per-day completion bubbles, streak summary, day-detail panel |
| Profile | `/profile` | Display name + edit, total coins / streak / goals, reset all data |

## Run

```bash
pnpm install
pnpm dev            # http://localhost:3000
pnpm typecheck      # tsc --noEmit
pnpm lint           # eslint
pnpm format         # prettier --write
pnpm test:unit      # vitest run
pnpm test:e2e       # playwright (requires `pnpm exec playwright install`)
pnpm build          # production build
```

Visit `/styleguide` to see every design token. Visual reference for every
user-visible PR is the prototype bundle under
[`docs/prototype-design/`](./docs/prototype-design/README.md) (the
`screenshots/` subfolder shows each tab as designed).

## Docs

| Doc | What it covers |
|---|---|
| [`docs/architecture.md`](./docs/architecture.md) | Stack rationale, layering, folder structure, persistence plan |
| [`docs/domain-model.md`](./docs/domain-model.md) | Entities, invariants, business rules |
| [`docs/design-system.md`](./docs/design-system.md) | Design tokens (colors, type, motion) |
| [`docs/coding-guidelines.md`](./docs/coding-guidelines.md) | TS/React/Next conventions |
| [`docs/testing-strategy.md`](./docs/testing-strategy.md) | Test pyramid + coverage philosophy |
| [`docs/product-backlog.md`](./docs/product-backlog.md) | Epics → stories → tasks, ordered for delivery |
| [`docs/prototype-design/`](./docs/prototype-design/README.md) | The original design bundle — authoritative visual reference for every user-visible PR |
