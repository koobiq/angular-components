# Tasks

No source, test or docs file changes in this change. Each task re-reads the evidence behind one corrected requirement in `specs/form-field/spec.md`.

## 1. Verify the corrections

- [ ] 1.1 "Clicking the container": in `packages/components/form-field/form-field.html`, verify that `.kbq-form-field__container` holds the prefix, the infix and the suffix with the cleaner and binds `(click)` to `onContainerClick()`; in `cleaner.ts`, verify that `clear()` calls `event.stopPropagation()` for a shown cleaner and then focuses the control
- [ ] 1.2 "Stepping with the mouse": in `packages/components/form-field/stepper.ts`, verify that `handleStep()` calls `stepUp()` or `stepDown()` of the number input with its `step` and calls `preventDefault()` on the mouse press event; in `packages/components/input/input-number.ts`, verify that `stepUp()` and `stepDown()` focus the native input and clamp the result to `min` and `max`
- [ ] 1.3 "Stepper is mouse only": in `stepper.ts`, verify that both arrows carry `aria-hidden="true"`, bind `[tabindex]="-1"` and `[disabled]` to the number input's `disabled`; in `packages/components/icon/icon-button.component.ts`, verify that the `tabindex` getter returns `null` while the button is disabled, so the `[attr.tabindex]` binding drops the attribute
- [ ] 1.4 Run `openspec validate correct-form-field-baseline --strict` and verify it passes

## Workflow follow-up

- Archive the change with `/opsx:archive`, which merges the corrected requirements into `openspec/specs/form-field/spec.md`.
