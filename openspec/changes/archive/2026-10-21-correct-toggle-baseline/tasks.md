# Tasks

No source, test or docs file changes in this change. Each task re-reads the evidence behind one corrected requirement in `specs/toggle/spec.md`; all paths are under `packages/components/toggle/` unless stated otherwise.

## 1. Verify the corrections

- [ ] 1.1 "Pointer click switches the toggle": in `toggle.component.ts`, verify that `onInputClick()` resolves the click as `noop` while `loading()` is `true`, and in `packages/components/core/common-behaviors/checkable.ts` that `resolveClick()` returns `shouldToggle: false` for a disabled toggle and for the `noop` click action
- [ ] 1.2 "Indeterminate state": verify that `onInputClick()` with the `check` click action calls `transitionCheckState()` with `Checked` or `Unchecked` and never resets the native checkbox, that the `effect()` in the constructor reads only `indeterminate` while it is `true` and so does not run again, that the `[indeterminate]` binding in `toggle.component.html` stays `true` and is not written again, and in `toggle.scss` that only the `kbq-toggle__circle_indeterminate` class hides the knob while `.kbq-indeterminate` shows the dash
- [ ] 1.3 "Indeterminate change event": verify that the microtask scheduled by `onInputClick()` sets `indeterminate` to `false` and emits `indeterminateChange` without comparing it with the current value, and that `emitChangeEvent()` runs before that microtask, while the `indeterminate` setter emits only on a change
- [ ] 1.4 "Big size": verify in `e2e.ts` that `E2eToggleHeight` measures toggles without a hint only, and in `toggle.scss` that `.kbq-toggle__content` stacks the label and the `.kbq-toggle__hint` container in one column, as the `toggle-multiline` example under `packages/docs-examples/components/toggle/` shows
- [ ] 1.5 "ARIA naming inputs": verify in `toggle.component.html` that `aria-label` is bound as `ariaLabel() || null` and `aria-labelledby` as `ariaLabelledby()`, and in `@angular/core` that an attribute binding removes the attribute only for `null` or `undefined`
- [ ] 1.6 "Tab order": verify that the host of `KbqToggleComponent` has no binding that clears `tabindex`, and in `@angular/core` that `setupStaticAttributes()` writes every static attribute of the element, inputs included
- [ ] 1.7 "Motion": verify in `toggle.scss` that the transitions are `left` on the knob and the dash and `background` on the bar, and in `packages/components/core/animation/animations-state.ts` that `kbqAnimationsDisabled()` reads `prefers-reduced-motion` once, when the toggle is created
- [ ] 1.8 Run `openspec validate correct-toggle-baseline --strict` and verify it passes

## Workflow follow-up

- Archive the change with `/opsx:archive`, which merges the corrected requirements into `openspec/specs/toggle/spec.md`.
