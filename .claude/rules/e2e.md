---
paths:
    - 'packages/**/e2e.ts'
    - 'packages/**/*.playwright-spec.ts'
    - 'packages/e2e/**'
    - 'playwright*.config.ts'
    - '**/__screenshots__/**'
---

# E2E and screenshot tests

## Baselines

- The committed baselines under `__screenshots__` are compared with `threshold: 0` and have no platform suffix, so a native run outside Linux fails on font rasterization alone. `e2e:components` is still useful for the assertion-based specs; use `e2e:docker` whenever screenshots are involved, and never regenerate a baseline any other way. Without a local Docker, comment `/approve-snapshots` on the pull request.
- The container runs with `CI=true`, so `test.only` is rejected. Retries are 0 everywhere, CI included, so a flaky test fails the run and is named; set `PLAYWRIGHT_RETRIES=<n>` to absorb a known flake and `PLAYWRIGHT_WORKERS=<n>` to change the worker cap.
- `/approve-snapshots` commits every baseline that differed in the run. Restore the ones the branch cannot affect with `git checkout origin/main -- <png>` instead of approving them.
- Before approving, diff the failed screenshots pixel by pixel: ±1 per channel on rounded corners is anti-aliasing, hundreds of pixels in a glyph or an icon is a regression.
- Outside Docker, run a new screenshot spec with `--update-snapshots=none`: the default `missing` mode writes a non-Linux baseline.

## Wiring

- `packages/components/<name>/e2e.ts` exports standalone `E2e<Name><Scenario>` components with a `data-testid` host attribute and an inner `data-testid="e2eScreenshotTarget"` for screenshots. `packages/e2e/scenarios.ts` re-exports every `e2e.ts`, and `packages/e2e/routes.ts` turns each exported component with the `E2e` prefix into a route whose path is the export name (the production build mangles class names, so the path cannot come from `component.name`); a spec navigates with `page.goto('/E2eButtonStateAndStyle')`. A new scenario needs no registration. Lint requires the `E2e` prefix of every exported class, so keep helper components local; a helper Angular forces to export (NG3004 when another template binds its inputs or outputs, fixed in Angular 22.2.3) drops the prefix under an `eslint-disable` comment, like `TopBarActionsRow` in `top-bar/e2e.ts`.
- Specs locate everything by test id, take the light screenshot, call `e2eEnableDarkTheme(page)` and take the dark one; baselines are named `NN-light.png` / `NN-dark.png` (and `NN-rtl.png` where relevant).
- Selectors, CSS classes and exported symbols in e2e code use the `e2e` prefix (lint checks selectors and exports); dev apps use `dev`, the docs app `docs`. Local classes and types go without a prefix, and markup copied from a docs example drops its `example` prefixes and suffixes.
- `check-e2e-types` covers only `*.playwright-spec.ts`; type-check the `e2e.ts` fixtures with `npx tsc --noEmit -p packages/e2e/tsconfig.app.json`.

## Stable screenshots

- The per-test timeout is 15 seconds (`playwright.config.ts`, `docs/guides/06-testing.md`), and screenshot flakes almost always come from shooting before the state has settled — assert the settled state first. `docs/e2e-flakiness.md` records the mechanisms found so far and `docs/e2e-performance.md` where the time of a test goes; the helpers in `packages/e2e/utils` (for example `e2eWaitForSettledScrollbars`) exist for that.
- Before `toHaveScreenshot`, move the pointer off the fixture (`page.mouse.move(viewport.width - 1, viewport.height - 1)`): it rests at (0,0) and hovers the top-left element, and `mouse.move(0, 0)` does not clear that.
- Keep each screenshot target within `test.use({ viewport })`: Chromium captures a larger target by growing the viewport, which moves the page under the resting pointer.
- When a fixture grows, check that its overlay panel fits inside `e2eScreenshotTarget` on the bottom and the right: Playwright silently crops to that element's box. Size the target element itself, not only `:host`.
- Renders land a frame after an event in the zoneless app: read geometry with `expect.poll`.
- The suite runs with `reducedMotion: 'reduce'`, so transitions are off. A test about an animation calls `page.emulateMedia({ reducedMotion: 'no-preference' })` before `goto` and asserts on a marker set by a `transitionrun` listener.
- Test a debounced resize handler inside one `evaluate()`: resize a wrapper, dispatch `resize`, await the debounce plus a frame, then read. Do not use `waitForTimeout`.
