# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/progress-spinner/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/progress-spinner packages/components/core/common-behaviors/color.spec.ts`, and verify both suites pass on the baseline commit. The color suite backs the `theme` fallback and `color.set()`
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/progress-spinner` and verify the `states` screenshots pass in light and dark. They back the text and caption beside the circle, the two sizes and the `contrast` and `contrast-fade` colors
- [ ] 1.3 For each requirement in `specs/progress-spinner/spec.md`, name at least one unit or e2e test that asserts it. Verify that every requirement or scenario without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour in the dev app

`dev:progress-spinner` exists in `package.json`. Run each check in `yarn run dev:progress-spinner` (http://localhost:3003), using the docs examples and the spinners embedded there.

- [ ] 2.1 Verify in the DOM of any spinner:
    - the host has no `role`, no `aria-*` attribute and no `tabindex`;
    - the SVG has `focusable="false"` and no `aria-*` attribute;
    - a `kbq-progress-spinner-text` element has the class `kbq-progress-spinner-text`, a caption element has `kbq-progress-spinner-caption`, and both render beside the circle with the text above the caption
- [ ] 2.2 Verify with the "Basic progress spinner" example, whose value grows every 300 ms:
    - the arc starts at the top of the circle and runs clockwise;
    - each step grows the arc over a short transition rather than in a jump
- [ ] 2.3 Verify with the Mode selector of the dev page. Its own spinners re-render only on such an event: the page updates a plain field from `setInterval` and runs without zone.js, so their arcs do not tick on their own.
    - "Indeterminate" adds `kbq-progress-spinner_indeterminate` to the hosts and the arcs keep turning at a fixed length;
    - switching back to "Determinate" removes the class, and the arcs match the percent the page shows next to them
- [ ] 2.4 Verify reduced motion: turn on "Emulate CSS media feature prefers-reduced-motion: reduce" in the DevTools Rendering panel and reload. The indeterminate spinners stand still, and the "Basic progress spinner" arc jumps from step to step. Verify the `provideNoopAnimations()` path by reading `kbqAnimationsDisabled()` in `packages/components/core/animation/animations-state.ts`, since the dev app has no switch for it
- [ ] 2.5 Verify the color set in code: select a spinner host in DevTools and run `ng.getComponent($0).color.set('error')` in the console. The host gains `kbq-error` and loses `kbq-theme`. Record whether the stroke changes color (suspected defect 3 in `design.md`)
- [ ] 2.6 Verify from sources the dev app cannot show:
    - the `value` transform in `progress-spinner.component.ts` coerces without clamping, so `value()` keeps an out-of-range number;
    - the projection selectors in `tools/public_api_guard/components/progress-spinner.api.md` are only `[kbq-progress-spinner-text]` then `[kbq-progress-spinner-caption]`, with no catch-all slot;
    - the component and both directives are declared standalone in the same file
- [ ] 2.7 Watch the compact "Basic progress spinner" while its label reads 92% and 96%, and record in `design.md` whether its arc is already closed there (suspected defect 1)

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-progress-spinner-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed

## Workflow follow-up

- Archive with `/opsx:archive document-progress-spinner-baseline` once the checks pass. This creates `openspec/specs/progress-spinner/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The compact arc that overstates progress and the missing `progressbar` semantics are the most user-visible ones.
