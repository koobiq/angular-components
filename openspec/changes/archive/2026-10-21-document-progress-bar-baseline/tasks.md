# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/progress-bar/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/progress-bar`, and verify the progress-bar unit suite passes on the baseline commit
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/progress-bar` and verify the progress-bar e2e suite passes. It backs the color variant, label and caption placement, indeterminate sweep and reduced-motion width requirements
- [ ] 1.3 For each requirement in `specs/progress-bar/spec.md`, name at least one unit or e2e test that asserts it. Verify that every requirement without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour by hand

`dev:progress-bar` exists in `package.json`. Run checks 2.1 to 2.3 in `yarn run dev:progress-bar` (http://localhost:3003), which renders the two docs examples and four bars with a mode switch and a value that keeps growing.

- [ ] 2.1 Verify in the DOM:
    - every bar host has the `kbq-progress-bar` class and no `tabindex`;
    - the projected label has the `kbq-progress-bar-text` class and the caption the `kbq-progress-bar-caption` class;
    - pressing Tab through the page never puts focus on a bar
- [ ] 2.2 With the operating system's reduced-motion setting off, verify:
    - a value changed with the stepper of the overview example moves the fill through a short transition;
    - after switching the mode to "Indeterminate", the segment sweeps from left to right and keeps its width while the value keeps growing
- [ ] 2.3 With `prefers-reduced-motion: reduce` emulated in the DevTools Rendering panel and the page reloaded, verify:
    - the determinate fill jumps to each new value;
    - the indeterminate segment stays at the start of the track and fades in and out
- [ ] 2.4 The dev app has no way to bind these, so check them in a temporary spec next to the component, run it with `npx vitest run packages/components/progress-bar`, and delete it afterwards. Verify:
    - `value` `Infinity` and `-Infinity` give a `0%` fill and `aria-valuenow="0"`;
    - `color` bound to `undefined` leaves the `kbq-theme` class;
    - a `<span>` projected without either attribute is not rendered;
    - `ANIMATION_MODULE_TYPE` set to `'NoopAnimations'`, as `provideNoopAnimations()` does, turns motion off
- [ ] 2.5 In the same temporary spec, verify the fallback name of an unlabelled bar:
    - it is "Progress" with the `en-US` locale active;
    - it is the `ru-RU` string when no locale service is provided;
    - `kbqA11yLocaleConfigurationProvider({ progressBar })` and an ancestor `[kbqLocaleOverrides]` with `a11y.progressBar` each replace it

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-progress-bar-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed, the temporary spec of 2.4 included

## Workflow follow-up

- Archive with `/opsx:archive document-progress-bar-baseline` once the checks pass. This creates `openspec/specs/progress-bar/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The empty accessible name left by `aria-label=""` is the most user-visible one.
