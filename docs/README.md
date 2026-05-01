# Growth — Documentation

Growth is a mobile-first, gamified life planner. The user sets life priorities across seven areas, defines goals tied to each area, and watches them grow as plants in a garden as they complete tasks and routines.

This `docs/` folder is the source of truth for what we're building and how. Read in order:

1. [`architecture.md`](./architecture.md) — stack, layering, why light-DDD, folder structure, persistence.
2. [`domain-model.md`](./domain-model.md) — entities, invariants, business rules.
3. [`design-system.md`](./design-system.md) — design tokens (colors, type, motion) lifted from the prototype.
4. [`coding-guidelines.md`](./coding-guidelines.md) — TS/React/Next conventions, accessibility, comments.
5. [`testing-strategy.md`](./testing-strategy.md) — pyramid, fixtures, coverage policy.
6. [`product-backlog.md`](./product-backlog.md) — epics → stories → tasks, ordered for delivery.

If you're a coding agent or new contributor: read `architecture.md` and `domain-model.md` first, then pick up the next unchecked story in `product-backlog.md`.

The original prototype this work is based on is a Bloomly design bundle from Claude Design. We have renamed the app to **Growth**; do not introduce the name "Bloomly" anywhere in production code, copy, or storage keys.
