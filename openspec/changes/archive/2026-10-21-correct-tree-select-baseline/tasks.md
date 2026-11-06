# Tasks

## 1. Verification

- [ ] 1.1 Re-read the evidence for "Focus moves into the open panel" and confirm a disabled active option refuses focus: `KbqTreeOption.focus` returns early while `disabled` (`packages/components/tree/tree-option.component.ts`), reached through `highlightCorrectOption` in `packages/components/tree-select/tree-select.component.ts`
- [ ] 1.2 Re-read the evidence for "Active option on open" and confirm `firstSelected` filters only through the tree control's `isDisabled` and `highlightCorrectOption` activates that option without checking its `disabled` state (`tree-select.component.ts`)
- [ ] 1.3 Re-read the evidence for "Selection mode and value type" and confirm a multiplicity change of the projected tree throws `getKbqTreeSelectionOwnedMultipleError` (`packages/components/tree/tree-errors.ts`, `setMultipleMode` in `tree-selection.component.ts`, test "should throw when the multiplicity is changed on a model owned by a tree-select")
- [ ] 1.4 Re-read the evidence for "Disabled and non-selectable options" and confirm `toggleFocusedOption` in `tree-selection.component.ts` checks `selectable` but not `disabled`, and that the Enter and Space branch of `panelKeydownHandler` reaches it in multiple-selection mode
- [ ] 1.5 Re-read the evidence for "Values are matched by the tree control" and confirm `FlatTreeControl.hasValue` returns the first matching node only and `setOptionsFromValues` selects one node per value (`packages/components/tree/control/flat-tree-control.ts`, `tree-selection.component.ts`)
- [ ] 1.6 Re-read the evidence for "Select-all scope and state" and confirm `selectAllTargets` drops only rendered options that are disabled or not selectable and nodes `isDisabled` reports (`tree-selection.component.ts`)
- [ ] 1.7 Re-read the evidence for "Select-all action" and confirm `selectAllOptions` emits `selectionChange` only for changed selectable rendered options (`tree-selection.component.ts`)
- [ ] 1.8 Re-read the evidence for "Keys in the search field" and confirm the Enter branch of `panelKeydownHandler` closes the panel and focuses the host when `autoSelect` is on, and that the search field is refocused from the tree's `selectionChange` (`tree-select.component.ts`)
- [ ] 1.9 Run `openspec validate correct-tree-select-baseline --strict` and confirm it reports the change as valid

## Workflow follow-up

- Archive the change with /opsx:archive.
