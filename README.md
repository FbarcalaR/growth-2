# Growth

A gamified life planner. Set priorities across seven life areas, plant goals as
seeds, and water them with daily action — tasks and routines feed resources to
the plant, growing it through five stages. Overdue work wilts it; finishing the
goal earns a trophy in your garden.

## Stack

Next.js (App Router) · TypeScript (strict) · Tailwind CSS v4 · React 19. Backend
in the same repo via Route Handlers; in-memory repositories now, Postgres + Prisma
planned. See [`docs/`](./docs/) for the full architecture.

## Run

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm typecheck    # tsc --noEmit
pnpm lint         # eslint
pnpm format       # prettier --write
pnpm build        # production build
```

Visit `/styleguide` to see every design token.

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
