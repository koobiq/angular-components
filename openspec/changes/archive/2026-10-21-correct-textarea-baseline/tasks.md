# Tasks

## 1. Verify the corrections

- [ ] 1.1 Re-read the evidence for "Height grows with the content by default" (`grow()` in `packages/components/textarea/textarea.component.ts`, which measures a clone that keeps the element's `rows`, and the one-line "Textarea" field of `packages/components/core/forms/__screenshots__/01-light.png`) and verify a growing textarea with one line is as tall as one with two lines
- [ ] 1.2 Re-read the evidence for "Free space below the last line" (the same `grow()` arithmetic and baseline) and verify a single line is followed by one empty line and then `freeRowsHeight`, while three lines are followed by `freeRowsHeight` only
- [ ] 1.3 Re-read the evidence for "Height is measured after each change renders" (the sizing `effect` in the constructor and the `canGrow()` guard at the top of `grow()` in `textarea.component.ts`) and verify no measurement runs while `canGrow` is `false`
- [ ] 1.4 Re-read the evidence for "Resizable mode" (`growing`, `maxRowLimitReached` and `grow()` in `textarea.component.ts`, `.kbq-textarea_max-row-limit-reached` in `packages/components/textarea/textarea.scss`) and verify that switching `canGrow` off at the row limit keeps the limit class, whose `resize: unset` hides the handle, and the inline minimum height
- [ ] 1.5 Re-read the evidence for "Form control disabled state wins" (`ngDoCheck` and `disabled` in `textarea.component.ts`, `FormControlName` and the `disabled` getter of `AbstractControlDirective` in `@angular/forms`) and verify `ngControl.disabled` is `null`, so the input applies, until `formControlName` has connected its control
- [ ] 1.6 Re-read the evidence for "Focusing does not scroll" (`focus()` in `textarea.component.ts`, `focus()` in `packages/components/form-field/form-field.ts`, the `E2eTextareaScrollOnFocus` test in `packages/components/textarea/e2e.playwright-spec.ts`) and verify the options are dropped and the test scrolls the textarea into view before clicking it
- [ ] 1.7 Run `openspec validate correct-textarea-baseline --strict` and verify it passes

## Workflow follow-up

- Archive the change with `/opsx:archive`.
