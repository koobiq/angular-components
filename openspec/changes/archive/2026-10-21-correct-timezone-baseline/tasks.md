# Tasks

No source, test or docs file changes in this change. Each task re-reads the evidence behind one corrected requirement in `specs/timezone/spec.md`.

## 1. Verify the corrections

- [ ] 1.1 "Pointer opens and closes the panel": in `packages/components/select/select.component.ts`, verify that the host binds `(click)` to `toggle()`, which closes an open panel, and that `resetOptions()` closes the panel only on a user selection; in `packages/components/core/option/option.ts`, verify that `selectViaInteraction()` does nothing for a disabled option
- [ ] 1.2 "Error state colors the arrow": in `select.component.ts`, verify that `colorForState` returns `KbqComponentColors.Empty` for a disabled select before it checks `errorState()`, and that `timezone-select.component.html` binds it to the arrow's `[color]`
- [ ] 1.3 "Cleaner": in `packages/components/form-field/cleaner.ts`, verify that `canShow` requires `canClear()`, and in `select.component.ts` that `canClear` applies `clearPredicate`, whose default keeps disabled options
- [ ] 1.4 "Timezone option layout": in `packages/components/timezone/timezone.utils.ts`, verify that `offset()` writes `00:00` without a sign and returns an empty string for an empty offset, and that `timezone-option.component.html` renders its result as the second column
- [ ] 1.5 "Collapsing other countries": in `timezone.utils.ts`, verify that `collapseOtherCountries()` adds the bucket only when `rest.length` is not zero
- [ ] 1.6 "Panel width": in `packages/components/core/overlay/panel-width.ts`, verify that `kbqResolvePanelWidth()` gives `'auto'` the larger of the trigger width and `panelMinWidth`
- [ ] 1.7 "Arrow keys change the value of a closed select": in `select.component.ts`, verify that `initKeyManager()` and `close()` set the horizontal orientation from `isRtl()`, that `highlightCorrectOption()` makes the first option active on an empty open, and that nothing resets the active option on close or on an empty value; in `packages/components/core/a11y/key-manager/list-key-manager.ts`, verify that `setPreviousItemActive()` does nothing with no active item and that `LEFT_ARROW` moves forward in `rtl`
- [ ] 1.8 "Typeahead matches the city": in `select.component.ts`, verify that `initKeyManager()` passes `-1` to `withTypeAhead()` when `search()` is set, which `list-key-manager.ts` treats as typeahead off, and that `handleClosedKeydown()` opens the panel on Space; in `timezone-option.component.ts`, verify that `getLabel()` returns the city
- [ ] 1.9 Run `openspec validate correct-timezone-baseline --strict` and verify it passes

## Workflow follow-up

- Archive the change with `/opsx:archive`, which merges the corrected requirements into `openspec/specs/timezone/spec.md`.
