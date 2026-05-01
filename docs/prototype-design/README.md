# Prototype design — reference

This is the Bloomly design bundle the user mocked up in Claude Design and handed off to coding agents. It is the **authoritative visual reference** for Growth: every user-visible PR is reviewed against the matching screen here. Deliberate drift is allowed, but it must be a noted decision in the PR — not a quiet shortcut. This rule is enforced as Definition-of-Done item #6 in [`../product-backlog.md`](../product-backlog.md) and as the prototype-fidelity check in every between-epic review.

## What's here

| Path | What it is |
|---|---|
| `Bloomly.html` | Entry point — renders the prototype in a browser by importing the JSX files via Babel. |
| `*.jsx` | The screen and shared modules the user iterated on. Read these alongside `Bloomly.html` to see each screen's visual treatment, layout, microcopy, and the data shape the prototype assumes. |
| `screenshots/` | Curated final shots per screen state. The fastest way to compare your implementation: drop the relevant `screenshots/<screen>.png` next to a screenshot of your build in the PR. |
| `chats/` | The 14-chat conversation transcript between the user and Claude Design where the prototype was iteratively shaped. Useful context when something in the prototype looks intentional but isn't obvious from the code alone. |

## What was trimmed from the original bundle

- `uploads/` — 16 MB of the user's source-material reference images (pasted screenshots from inspiration apps, etc.). Useful to see what inspired a choice; not useful for our fidelity check. If you want them, they're in the original design URL referenced at the top of `Bloomly.html`.
- `scraps/` — one napkin sketch file. Same reasoning.

## How to use it for a fidelity check

Per Definition of Done item #6 and the between-epic review:

1. Pull up the prototype screen relevant to your PR — open `Bloomly.html` in a browser, or look at the matching `screenshots/<screen>.png`.
2. Take a screenshot of your implementation in the same state.
3. Place both in the PR description. Match: layout, illustrations, palette application, microcopy, flow steps.
4. Drift is allowed but call it out. "We dropped the iOS frame, so the desktop background uses `surface-frame` directly" is a noted decision; "it just came out different" is a bug.

## Renaming note

The prototype calls the app **Bloomly** throughout. The user renamed the app to **Growth** before any implementation started — see [`../README.md`](../README.md). Do not introduce the name "Bloomly" anywhere in production code, copy, or storage keys; treat the prototype's branding as visual reference only.
