# Tasks

No source, test or docs file changes in this change. Each task re-reads the evidence behind one corrected requirement in `specs/filter-bar/spec.md`.

## 1. Verify the corrections

- [ ] 1.1 "Pipe host classes" and "Pipe fill state": in `packages/components/filter-bar/pipes/base-pipe.ts` and `pipe-state.ts`, verify that `kbq-pipe_empty` and the filled or outline style follow `isEmpty`; then verify in `pipe-date-base.ts`, `multi-select-pipe-state.ts` and the `pipe-date.spec.ts` test "should be empty when custom range is incomplete" that a pipe holding a value can read as empty
- [ ] 1.2 "Pipe options follow the templates": in `updateTemplates` of `pipes/base-pipe.ts`, verify that `valueTemplate` is assigned only together with `values`, while `compareWith`, `lockedValues`, `panelMaxHeight`, `multilineOptions` and `noOptionsText` are assigned from every matching template
- [ ] 1.3 "Clear and remove button visibility": verify that `showRemoveButton` in `pipes/base-pipe.ts` reads `isEmpty`, and that the template of `pipes/pipe-input.ts` renders no `kbq-pipe-button`
- [ ] 1.4 "Focus returns to the pipe trigger": verify that `onSelect` of `pipes/pipe-multi-select.ts` and `pipes/pipe-multi-tree-select.ts` never calls `restoreTriggerFocus`, and that their `onClose` does
- [ ] 1.5 "All selected equals nothing selected": verify that `onClose` refreshes the snapshot through `updateInternalSelected` in `pipes/multi-select-pipe-state.ts`, and that the tests "should update internalSelected on close when all options selected" and "should keep the locked option selected after "select all" and reopening the panel" expect `selected` to hold only the locked values
- [ ] 1.6 "Multi-tree-select pipe": in `toggleSelectAllNode` of `pipes/pipe-multi-tree-select.ts`, verify that a non-empty search query toggles only the rendered options
- [ ] 1.7 "Search in pipes": verify in `pipes/select-pipe-search.ts` and `createSearchPredicate` in `packages/components/core/search/search-base.ts` that each word may match the name or the caption on its own
- [ ] 1.8 "Date pipe period list": verify that `formattedValue` in `pipes/pipe-date-base.ts` formats the range whenever `start` and `end` both parse, before it falls back to `name`
- [ ] 1.9 "Save popover" and "Submitting the save popover": in `filter-save-popover.ts`, verify that `preparePopover` clears the errors of the name control after focusing it, so an untouched empty field is valid, and that `saveAsNew` disables the control before it emits `save`
- [ ] 1.10 "State saving switch and key": in `filter-bar.ts`, verify that `ngAfterContentInit` returns without setting `hasRead` while `persists` is false, and that `persistState` and the `keyChanges` path never read or write afterwards
- [ ] 1.11 "Restore waits for data": in `applyPendingState` of `filter-bar.ts`, verify that the state waits only while no stored pipe can be rebuilt and is otherwise applied without the missing ones
- [ ] 1.12 "Pipe registry and custom pipes": verify that `KbqPipeDirective` in `pipe.directive.ts` reads the nearest `KBQ_FILTER_BAR_PIPES` map as is, and that the custom pipe docs example spreads `defaultFilterBarPipes` into its own map
- [ ] 1.13 Run `openspec validate correct-filter-bar-baseline --strict` and verify it passes

## Workflow follow-up

- Archive the change with `/opsx:archive`, which merges the corrected requirements into `openspec/specs/filter-bar/spec.md`.
