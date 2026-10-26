---
paths:
    - 'packages/**/e2e.ts'
    - '**/*.playwright-spec.ts'
    - 'packages/e2e/**'
    - 'playwright*.config.ts'
    - '**/__screenshots__/**'
---

# E2E and screenshot tests

## Baselines

- The committed baselines under `__screenshots__` are compared with `threshold: 0` and have no platform suffix, so a native run outside Linux fails on font rasterization alone. `e2e:components` is still useful for the assertion-based specs; use `e2e:docker` whenever screenshots are involved, and never regenerate a baseline any other way. Without a local Docker, comment `/approve-snapshots` on the pull request.
- The container runs with `CI=true`, so `test.only` is rejected. Retries are 0 everywhere, CI included, so a flaky test fails the run and is named; set `PLAYWRIGHT_RETRIES=<n>` to absorb a known flake and `PLAYWRIGHT_WORKERS=<n>` to change the worker cap.
- `/approve-snapshots` commits every baseline that differed in the run. Restore the ones the branch cannot affect with `git checkout origin/main -- <png>` instead of approving them.
- `/approve-snapshots` renders the branch as it stands, while the E2E run compares on its merge with the base, so the workflow refuses a branch behind its base: rebase first. A baseline approved from a stale branch fails the next run (#2216, `tabs/01-light.png`).
- Before approving, diff the failed screenshots pixel by pixel: ±1 per channel on rounded corners is anti-aliasing, hundreds of pixels in a glyph or an icon is a regression. The failure message counts only pixels past the threshold, so a small count is no sign of a flake. A CI actual that is byte-identical to `git show origin/main:<png>` proves the branch does not change that render.
- To check the framing of a new shot without Docker, run the spec natively once and look at the `-actual.png` it writes; never commit it.
- Outside Docker, run a new screenshot spec with `--update-snapshots=none`: the default `missing` mode writes a non-Linux baseline.

## Wiring

- `packages/components/<name>/e2e.ts` exports standalone `E2e<Name><Scenario>` components with a `data-testid` host attribute and an inner `data-testid="e2eScreenshotTarget"` for screenshots.
- `packages/e2e/scenarios.ts` re-exports every `e2e.ts`, and `packages/e2e/routes.ts` turns each exported component with the `E2e` prefix into a route whose path is the export name (the production build mangles class names, so the path cannot come from `component.name`); a spec navigates with `page.goto('/E2eButtonStateAndStyle')`, and a new scenario needs no registration.
- Keep helper components local, since lint requires the `E2e` prefix of every export and the router would mount a prefixed helper; a helper Angular forces to export (NG3004 when another template binds its inputs or outputs) drops the prefix under an `eslint-disable` comment, like `TopBarActionsRow` in `top-bar/e2e.ts`.
- Specs locate everything by test id, take the light screenshot, call `e2eEnableDarkTheme(page)` and take the dark one; baselines are named `NN-light.png` / `NN-dark.png` (and `NN-rtl.png` where relevant), with a short name of the scenario after the number when it helps tell the screenshots of one component apart (`04-validation-light.png`).
- Local classes and types in e2e code go without a prefix, and markup copied from a docs example drops its `example` prefixes and suffixes; the `e2e` prefix of selectors, classes and exports (`dev` in dev apps, `docs` in the docs app) is lint-enforced.
- `check-e2e-types` covers only `*.playwright-spec.ts`; type-check the `e2e.ts` scenarios with `npx tsc --noEmit -p packages/e2e/tsconfig.app.json`.

## Stable screenshots

- The per-test timeout is 15 seconds (`playwright.config.ts`), and screenshot flakes almost always come from shooting before the state has settled — assert the settled state first. `docs/e2e-flakiness.md` records the mechanisms found so far and `docs/e2e-performance.md` where the time of a test goes; the helpers in `packages/e2e/utils` (for example `e2eWaitForSettledScrollbars`) exist for that.
- The pointer rests at (0,0), so a scenario whose top-left element has a hover style captures it hovered. Before `toHaveScreenshot`, park the pointer off the scenario (`page.mouse.move(viewport.width - 1, viewport.height - 1)`); `mouse.move(0, 0)` ends a hover elsewhere but leaves the pointer on whatever sits at the origin.
- Keep each screenshot target within `test.use({ viewport })`: Chromium captures a larger target by growing the viewport, which moves the page under the resting pointer.
- When a scenario grows, check that its overlay panel fits inside `e2eScreenshotTarget` on the bottom and the right: Playwright silently crops to that element's box. Size the target element itself, not only `:host`.
- Renders land a task or a frame after an event in the zoneless app, so ESLint forbids `expect(await …)` in the specs: assert on the locator, which retries, or use `expect.poll`. Where a poll would pass on its first sample (nothing changed, nothing arrived), first wait for a sign that the action landed, then read once into a constant.
- On a pull request, the `tests` job runs again the specs the change adds, edits or reaches through its component, ten times over for up to five specs and fewer for more (`tools/e2e/changed-specs.mjs`): a new flake fails its own pull request.
- The suite runs with `reducedMotion: 'reduce'`, so transitions are off. A test about an animation calls `page.emulateMedia({ reducedMotion: 'no-preference' })` before `goto` and asserts on a marker set by a `transitionrun` listener.
- Test a debounced resize handler inside one `evaluate()`: resize a wrapper, dispatch `resize`, await the debounce plus a frame, then read. Do not use `waitForTimeout`.
