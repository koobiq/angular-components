# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/split-button/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/split-button`, and verify the split-button unit suite passes on the baseline commit
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/split-button` and verify the split-button e2e suite passes. It backs the truncation requirement and the fallback scenario of "Menu opens toward the start"
- [ ] 1.3 For each requirement in `specs/split-button/spec.md`, name at least one unit or e2e test that asserts it. Verify that every requirement or scenario without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour in the dev app

`package.json` has the `dev:split-button` script (`ng serve dev-split-button --port 3003`). Run each check in `yarn run dev:split-button` (http://localhost:3003), using the docs examples and the e2e scenario embedded there. Read and set properties from the browser console with `ng.getComponent(element)` and `ng.applyChanges(element)`, which the development build exposes. Checks that need markup the dev app does not have use a temporary edit of `packages/components-dev/split-button/template.html`, reverted in 3.1.

- [ ] 2.1 Verify in the DOM:
    - the host of the overview example has `kbq-button_filled` and `kbq-contrast-fade`, though it binds neither `kbqStyle` nor `color`;
    - the "Transparent Theme" host of the styles example has `kbq-theme` and `kbq-button_transparent`;
    - no split-button host has a `tabindex` or an `aria-label`
- [ ] 2.2 Verify with the keyboard in the disabled-state example:
    - in "Primary Disabled", Tab skips the leading button and stops on the trigger;
    - in "Secondary Disabled", Tab stops on the leading button and then leaves the split button
- [ ] 2.3 Verify in the menu-width example:
    - the open menu is exactly as wide as the split button;
    - after the split button's width is changed in DevTools and the menu is reopened, the menu has the new width
- [ ] 2.4 Verify from the console, on a split button of the overview example:
    - `kbqStyle` reads back as `kbq-button_filled`;
    - `disabled` reads `undefined`;
    - `color.set('theme')` followed by `ng.applyChanges` makes both buttons `kbq-theme`
- [ ] 2.5 Verify from the console, on a split button with `kbqStyle` set to `transparent` and no `color`, that `color.set('contrast-fade')` leaves both buttons `kbq-contrast`
- [ ] 2.6 Verify with a temporary edit of the dev app template:
    - `<div kbq-split-button>` with two buttons gets the class `kbq-split-button`;
    - a `<span>` placed beside the buttons is not rendered, and neither is a button wrapped in a `<div>`;
    - with three buttons, the middle one has only `kbq-split-button_item`;
    - the bare `disabled` attribute disables both buttons, and a button with its own `[disabled]="false"` stays disabled;
    - `kbqStyle="custom"` gives the host `kbq-button_custom`;
    - a button added through `@if` after the split button is disabled and given `color="theme"` is disabled and has `kbq-theme`

## 3. Final checks

- [ ] 3.1 Revert any temporary edit of the dev app, run `openspec validate document-split-button-baseline --strict`, and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed

## Workflow follow-up

- Archive with `/opsx:archive document-split-button-baseline` once the checks pass. This creates `openspec/specs/split-button/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The overwritten `xPosition` and the `panelAutoWidth` JSDoc are the ones consumers notice first.
