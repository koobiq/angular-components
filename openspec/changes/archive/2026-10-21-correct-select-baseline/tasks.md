# Tasks

No source, test or docs file changes in this change. Each task re-reads the evidence behind one corrected requirement in `specs/select/spec.md`; paths are relative to `packages/components/`.

## 1. Verify the corrections

- [ ] 1.1 "Typeahead": in `select/select.component.ts`, verify that `withTypeAhead` gets `-1` whenever a search is projected (line 2445) and that `handleClosedKeydown` (lines 2123-2135) only hands letters to the key manager; in `select/select.html` verify the search is rendered only inside the open overlay and only while `shouldShowSearch()` holds
- [ ] 1.2 "Values without a rendered option": verify that `getCorrespondOption` (`select.component.ts` line 2347) also matches the previously selected options, and that the unit test "should keep the options filtered out by the search selected when deselecting" keeps filtered-out values selected
- [ ] 1.3 "Touched and dirty state": verify that `onSelect` (line 2487) calls `propagateChanges` (line 2550), and so the form control's `onChange`, whether or not the change came from the user; the unit test "should select all options when pressing ctrl + a when some options are selected" shows `option.select()` writing the control; verify that `onBlur` (line 1692) checks `disabled` while `close` (line 1579) does not
- [ ] 1.4 "Tags for multiple values": verify that the built-in tag in `select.html` renders `option.viewValue` and that `KbqOption.viewValue` in `core/option/option.ts` prefers the `viewValue` input over the text
- [ ] 1.5 "Multiline trigger": verify the three conditions of `kbqShouldAnchorPanelToFirstRow` (`core/overlay/panel-height.ts` line 171) and the e2e test "should anchor the panel once a resize leaves no room beside the trigger", which expects no anchor in a 400 px viewport where neither side fits
- [ ] 1.6 "Custom tag template": verify that `select.html` renders the template inside `@for (option of triggerValues)` and that the unit test "should limit triggerValues to triggerValuesLimit when more items are selected", whose fixture declares a `#kbqSelectTagContent` template, renders two tags for four values
- [ ] 1.7 "Select-all action": verify that `toggleSelectAll` returns before `propagateChanges` and `onSelectAll.emit` when it has no target (`select.component.ts` line 1423)
- [ ] 1.8 "Search field": verify that a keystroke in the open panel schedules `highlightCorrectOption` (line 2242), which activates the first enabled selected option when it is listed and the first option otherwise, and that a query changed in code only reactivates through the stale-item check of the `search().changes` subscription
- [ ] 1.9 "Footer": verify that `handleClick` restores focus only when `shouldRestoreFocus` holds (line 1876), that is when focus is on nothing, on the body or inside the panel
- [ ] 1.10 "Virtual scrolling": verify that the mode follows `cdkVirtualForOf` (line 1354), that `captureSelectedOptionCopy` and `resolveSelectedOption` (lines 2423-2438) keep the label a rendered option showed, that `getCorrespondOption` keeps a previously selected value without a factory, and that the viewport rule in `select/select.scss` (line 39) is skipped next to `.kbq-select__no-options-message`
- [ ] 1.11 "Panel position": verify the horizontal shift and narrowing in `setOverlayPosition` and `calculateOverlayOffsetX` (`core/select/common.ts` lines 261-313), that the CDK flexible position strategy falls back to the position with the largest visible area and resolves the position again after a viewport resize or when `CdkConnectedOverlay` rebuilds its positions on an input change, and the e2e test "should move the panel onto the first row once the trigger outgrows it"
- [ ] 1.12 "Panel width": verify that `setOverlayPosition` (`core/select/common.ts` lines 279-284) caps `maxWidth` and clears `minWidth` when the pane overflows the viewport horizontally
- [ ] 1.13 "Panel height": verify the `:not(:has(> .kbq-select__no-options-message))` condition on the pinned viewport height in `select/select.scss` (line 39) and that the empty search result carries that class (`core/select/common.ts` line 52)
- [ ] 1.14 "Tooltip for truncated options": verify that `KbqOptionTooltip` takes its content from `option.viewValue` (`select/select-option.directive.ts` lines 83 and 96) and that the unit test "should display tooltip when a two-line option clips one of its lines" expects the `viewValue` without the caption
- [ ] 1.15 Run `openspec validate correct-select-baseline --strict` and verify it reports the change as valid

## Workflow follow-up

- Archive the change with /opsx:archive.
