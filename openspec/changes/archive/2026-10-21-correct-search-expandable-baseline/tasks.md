# Tasks

## 1. Verify the corrections

- [ ] 1.1 Re-read the evidence for "isOpenedChange reports changes made by the component" (`applyValue` and `setOpened` in `packages/components/search-expandable/search-expandable.ts`, `setUpControl` and the `ngOnChanges` of `FormControlDirective` and `NgModel` in `@angular/forms`) and verify a non-empty initial value reaches `setOpened(true)`, which emits, during the first render for a form control and in a microtask after it for `ngModel`
- [ ] 1.2 Re-read the evidence for "Expanding moves focus into the input" (`ngOnChanges`, `ngAfterViewChecked` and the `isOpened` setter in `search-expandable.ts`, `focus()` in `packages/components/input/input.ts`) and verify `[isOpened]` expands a disabled component whose input is disabled and therefore cannot take the focus `ngAfterViewChecked` hands it
- [ ] 1.3 Re-read the evidence for "Collapsing moves focus to the collapsed button" (`restoreFocusToButton` and `runFocusMonitor` in `search-expandable.ts`, the `[disabled]` binding of the collapsed button in `search-expandable.html`, `focusVia`, `_onBlur` and `_getFocusOrigin` of the CDK `FocusMonitor`) and verify the button is disabled while the component is, and that `lastFocusOrigin` is `null` once focus has left the host
- [ ] 1.4 Re-read the evidence for "A model value expands the field" (`applyValue` in `search-expandable.ts`, `setUpControl` in `@angular/forms`, where `writeValue` precedes `setDisabledState`) and verify a reactive control disabled from the start, or `[disabled]="true"` on the first render next to `[formControl]`, does not keep a non-empty initial value from expanding the field
- [ ] 1.5 Re-read the evidence for "The value signal mirrors the field" (the `effect()` in the constructor of `search-expandable.ts`, the spec "should hand a value written into `value` to the field and, after the timeout, to the control") and verify a write into `value` reaches the internal control only when that effect runs at the next change detection
- [ ] 1.6 Re-read the evidence for "Error state follows the bound control" (`ngDoCheck` and `updateErrorState` in `input.ts`, `BoundControlErrorStateMatcher` and `ChangeDetectionStrategy.OnPush` in `search-expandable.ts`) and verify nothing but a check of the component's view re-evaluates the error state
- [ ] 1.7 Run `openspec validate correct-search-expandable-baseline --strict` and verify it passes

## Workflow follow-up

- Archive the change with `/opsx:archive`.
