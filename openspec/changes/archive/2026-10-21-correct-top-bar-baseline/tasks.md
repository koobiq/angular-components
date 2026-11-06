# Tasks

## 1. Verification

- [ ] 1.1 Re-read the position rules of `top-bar.scss` and the position tokens of `top-bar-tokens.scss`, and verify that the bar is a plain `position: sticky` box, which sticks only within its parent element, as "Sticky positioning needs an inset" now states; `E2eTopBarSticky` in `e2e.ts` renders the bar as a direct child of its scroller
- [ ] 1.2 Re-read `top-bar-tokens.scss` and verify that the defaults are declared in `:where(.kbq-top-bar)` outside any `@layer`, and that no stylesheet of `packages/components` declares a cascade layer, as "Custom properties are read from the bar element" now states
- [ ] 1.3 Run `openspec validate correct-top-bar-baseline --strict` and verify that it reports the change as valid

## Workflow follow-up

- Archive the change with /opsx:archive.
