# Tasks

## 1. Verification

- [ ] 1.1 Re-read the evidence for "Checked state is reflected": the `[checked]="checked"` binding in `checkbox.html` line 15, which Angular writes only when the value differs from the last rendered one, and the synchronous `toggle()` then `change` emission in `onInputClick` (`checkbox.ts` lines 285-293); verify the delta states that a click undone before the next render leaves the native input as the click set it
- [ ] 1.2 Re-read the evidence for "Pointer toggles the checkbox": `KbqCheckable.resolveClick` returns no toggle for `noop` (`core/common-behaviors/checkable.ts` lines 109-118) and `onInputClick` only resets the native input then (`checkbox.ts` lines 294-298); verify the delta excludes `noop`
- [ ] 1.3 Re-read the evidence for "Clickable area and cursor": the `&:hover` rule of `kbq-checkbox-color` in `_checkbox-theme.scss` lines 24-30, included on `.kbq-checkbox` itself (lines 89-95), against the `cursor: pointer` of `.kbq-checkbox__layout` in `checkbox.scss` line 36; verify the delta ties the hover style to the whole host
- [ ] 1.4 Re-read the evidence for "Indeterminate state is reflected": the `check` path of `onInputClick` (`checkbox.ts` lines 274-293) leaves `indeterminate` unchanged, so the `[indeterminate]="indeterminate"` binding in `checkbox.html` line 18 does not rewrite the flag the click cleared; verify the delta states the exception and its scenario
- [ ] 1.5 Re-read the evidence for "Indeterminate change notification": the microtask in `checkbox.ts` lines 279-282 sets `false` and emits without comparing, while `setIndeterminate` (lines 209-225) emits only on a change; verify the delta limits the no-repeat rule to the binding and the property
- [ ] 1.6 Re-read the evidence for "Required flag on the native input": the `[required]="required()"` binding in `checkbox.html` line 19 and the HTML rule that a required, unchecked checkbox suffers from being missing; verify the delta keeps "no Angular validator" and names the native constraint validation
- [ ] 1.7 Re-read the evidence for "Required validation with a form directive": `KbqCheckboxRequiredValidator` extends Angular's `CheckboxRequiredValidator`, whose `requiredTrueValidator` accepts only `control.value === true`, while `KbqCheckable.writeValue` checks the box for any truthy value (`checkable.ts` lines 134-136); verify the delta states the exact-`true` rule and its scenario
- [ ] 1.8 Run `openspec validate correct-checkbox-baseline --strict` and verify it reports the change as valid

## Workflow follow-up

- Archive the change with /opsx:archive.
