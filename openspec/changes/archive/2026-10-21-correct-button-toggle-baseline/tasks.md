# Tasks

No source, test or docs file changes in this change. Each task re-reads the evidence behind one corrected requirement in `specs/button-toggle/spec.md`; all paths are under `packages/components/button-toggle/` unless stated otherwise.

## 1. Verify the corrections

- [ ] 1.1 "Single selection by pointer" and "Multiple selection by pointer": in `button-toggle.component.ts`, verify that `ngOnInit()` creates the `SelectionModel` once with `multiple()`, that no code recreates it when `multiple` changes, and that `toggleByUser()` picks `true` or `!checked` from the current mode, so a switched group selects through a model of the other mode
- [ ] 1.2 "Order of values in multiple mode": verify that `assignValue()` returns silently when the assigned array equals the reported value item by item, and that `emitValueChange()` returns when the reordered value equals `reportedValue`
- [ ] 1.3 "Matching values to toggles": verify that `setSelectionByValue()` keeps only the first match in single mode, that `rawValue` keeps the assigned value after a match, and that `ngOnInit()` of every toggle sets `checked` whenever the group reports that `rawValue` matches the toggle's value, which makes the single-mode model drop the toggle selected before
- [ ] 1.4 "Group change event" and "Touched and dirty state": verify that `toggleByUser()` calls `syncButtonToggle(..., true)` and `onTouched()` whenever the selected state of the toggle changes, without comparing values, that `emitChangeEvent()` then writes the value to the control, and that `onToggleClick()` is the public entry of that path
- [ ] 1.5 "Value change notification": verify that `ngOnChanges()` of the group handles only `valueInput` and `disabledInput`, so a change of `multiple` reaches `currentValue` without a call of `emitValueChange()`
- [ ] 1.6 "Inputs bound to undefined": verify that `checkedInput` and both `disabledInput` members use the `booleanAttribute` transform, that `booleanAttribute(undefined)` in `@angular/core` returns `false`, and that Angular runs the transform on every bound value before `ngOnChanges()` reads it
- [ ] 1.7 "Icon type classes": verify that the `icons` query of the toggle uses `descendants: true` while `updateIconType()` counts the nodes `getContentNodes()` returns for the wrapper, with the label box flattened one level
- [ ] 1.8 "Focus methods and focus ring": in `button-toggle.scss` and `_button-toggle-theme.scss`, verify that every rule reading `.cdk-keyboard-focused` on `.kbq-button-toggle` is nested under `.kbq-button-toggle-group`, and in `packages/components/button/_button-theme.scss` that the inner `transparent` button draws an outline for its own `cdk-keyboard-focused` class
- [ ] 1.9 Run `openspec validate correct-button-toggle-baseline --strict` and verify it passes

## Workflow follow-up

- Archive the change with `/opsx:archive`, which merges the corrected requirements into `openspec/specs/button-toggle/spec.md`.
