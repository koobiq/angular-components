# Tasks

## 1. Verification

- [ ] 1.1 Re-read the evidence for "Tag value" and verify that `ngOnChanges` and the `value` getter in `packages/components/tags/tag.component.ts` ignore a binding of `undefined` and fall back to the text content for `null`
- [ ] 1.2 Re-read the evidence for "Tag list tab stop" and verify that `updateTabIndex()` in `packages/components/tags/tag-list.component.ts` treats a `tabIndex` of 0 as unset
- [ ] 1.3 Re-read the evidence for "Reduced motion of reordering" and verify that `kbqAnimationsDisabled()` in `packages/components/core/animation/animations-state.ts` also checks `NoopAnimations` and reads the reduced-motion setting once
- [ ] 1.4 Re-read the evidence for "Tag list reports user changes of its tags" and verify in `packages/components/tags/tag-list.component.ts` that the pending flag is cleared only on a re-render of the tags and that `hasTagsValueChanged()` compares a non-array value as empty
- [ ] 1.5 Re-read the evidence for "Trimming on a kbqInput" and verify that `KbqTrim` in `packages/components/form-field/form-field.ts` matches `[kbqInput]` only when imported, through `KbqFormFieldModule` or `KbqInputModule`, and that `KbqInput` does not apply it
- [ ] 1.6 Re-read the evidence for "Enter with an active autocomplete option" and verify that `onKeydown()` in `packages/components/tags/tag-input.ts` prevents the default action of every separator key but Tab in an empty input, before the autocomplete check
- [ ] 1.7 Run `openspec validate correct-tags-baseline --strict` and verify it passes

## Workflow follow-up

- Archive the change with /opsx:archive.
