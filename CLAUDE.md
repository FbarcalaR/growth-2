# Growth — Project conventions for Claude

## Workflow rules

- **Open a PR when a story is done.** Each backlog story ships as its own PR against `main`. Do not wait for explicit "open the PR" — once a story's commits are pushed, all checks pass, and the backlog is ticked, create the PR. (This overrides the default "do not open a PR unless asked.")
- **Branch name:** all work goes on `claude/implement-bloomly-design-OQxnZ`.
- **Keep docs in sync with code in the same PR** (Definition of Done in `docs/product-backlog.md`).
- **Tag stories with the merging PR number** in the backlog when they ship: `### Story X.Y — Title ✅ (PR #N)`.

## Story checklist before pushing

1. `pnpm format && pnpm format:check`
2. `pnpm lint`
3. `pnpm test:unit`
4. `pnpm build`
5. Tick the story in `docs/product-backlog.md`
6. Commit, push to the feature branch
7. Open the PR
