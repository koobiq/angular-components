# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/button/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/button`, and verify the button unit suite passes on the baseline commit
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/button` and verify the button e2e suite passes. It backs the truncation, icon centring, right-to-left, style and color pair, forced state, loading look, `kbq-title` tooltip, many-icon-buttons and group layout requirements
- [ ] 1.3 For each requirement in `specs/button/spec.md`, name at least one unit or e2e test that asserts it. Verify that every requirement without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour by hand

`yarn run dev:button` exists in `package.json` (`ng serve dev-button` on http://localhost:3003) and embeds the docs examples, the slot and ellipsis demos and the stress scenario. It renders no `<a kbq-button>`, no dropdown and no bare `kbqButtonGroupRoot`, so 2.5 uses `yarn run dev:dropdown` and 2.6 a throwaway spec.

- [ ] 2.1 In `yarn run dev:button`, verify in the DOM:
    - a `<button kbq-button>` has no `type` attribute;
    - with "disabled" checked in the overview example, the button has `kbq-disabled`, `disabled` and `tabindex="-1"`;
    - tabbing onto a button gives it `cdk-focused`, `cdk-keyboard-focused` and the focus outline, while clicking it gives `cdk-mouse-focused` and no outline
- [ ] 2.2 In `yarn run dev:button`, verify the loading class with "progress" checked in the overview example:
    - a click listener added from the console still runs;
    - the stripes stop with `prefers-reduced-motion: reduce` emulated in the browser's rendering tools
- [ ] 2.3 In `yarn run dev:button`, edit classes in the browser's element inspector and verify:
    - a `filled` button given `kbq-theme` instead of `kbq-contrast-fade` keeps the `filled` default look;
    - a disabled button given `kbq-active` or `kbq-hover` keeps the disabled look
- [ ] 2.4 In `yarn run dev:button`, verify on the group examples:
    - each `kbq-button-group` has `role="group"`, `kbq-button-group_horizontal` or `_vertical`, and no `aria-orientation`;
    - the groups of the style example have `kbq-button-group-root_<style>`, and the overview group, which binds no `kbqStyle`, has no such class
- [ ] 2.5 In `yarn run dev:dropdown`, open and close a dropdown from one of its `kbq-button` triggers and verify that the button has `kbq-active` only while the dropdown is open
- [ ] 2.6 Write a temporary spec under `packages/components/button/`, run it with `npx vitest run` and delete it afterwards. Verify:
    - a disabled `<a kbq-button>` prevents the default action of Left and Right key presses and lets Tab and Escape through;
    - `KbqButton` imported without `KbqButtonCssStyler` throws a missing-provider error;
    - an icon wrapped in a `<span>` leaves the host with `kbq-button`;
    - `kbq-button-group` with `disabled` disables its buttons;
    - a group without a `kbqStyle` binding leaves its buttons' styles alone;
    - a group color set in code reaches its buttons;
    - a button inside a `<div>` in the group's content is not styled by the group

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-button-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed, including the temporary spec from 2.6

## Workflow follow-up

- Archive with `/opsx:archive document-button-baseline` once the checks pass. This creates `openspec/specs/button/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The stale English overview page and the disabled link that a middle click may still open are the most user-visible ones.
