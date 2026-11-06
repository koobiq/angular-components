# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are:

- `packages/components/tree/`: `tree-base.ts`, `tree.ts`, `tree-selection.component.ts`, `tree-option.component.ts` with its template, `toggle.ts`, `padding.directive.ts`, `node.ts`, `tree-errors.ts`, the tree controls and filters under `control/`, the flattener and data sources under `data-source/`, and the styles where they decide behaviour (the action visibility rule, the toggle rotation);
- the unit specs of all of these, `e2e.ts` and `e2e.playwright-spec.ts`;
- `tree.{en,ru}.mdx`, `examples.tree.{en,ru}.mdx` and the examples under `packages/docs-examples/components/tree/`;
- the API golden file `tools/public_api_guard/components/tree.api.md`;
- the `core` code the tree relies on: the list and focus key managers, the keyboard helpers, `kbqLeaveTabOrderOnTabOut`, the select-all helpers, `resolveMultipleMode`, `KbqStateSaving`, the locale overrides, `escapeRegExp`, the option action helpers and `kbqFocusAndReveal`, plus the CDK `SelectionModel`.

Every claim was read in the source and checked against the tests. The `select` baseline is the established pattern. The in-flight `document-tree-select-baseline` change leaves the standalone `kbq-tree-selection`, the data sources, the flattener and the filters to this spec.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on. Every requirement is observable from outside the entry point, and every scenario can be checked by an existing test or by hand in the dev app.
- One place to diff against when tree behaviour changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Internals: class and member names that are not public API, timers, change-detection details, CSS structure and design tokens.
- `kbq-tree-select`, `kbq-list` and deprecated APIs.
- Changes to tests, docs or examples.

## Decisions

The general decisions follow the `select` baseline: one capability at a flat path, English, the spec describes what ships with its quirks, only confirmed behaviour goes in, and public names, selectors, host classes, ARIA, error messages and exported constants count as contract. Decisions specific to the tree:

1. **One capability for the whole entry point.** It covers the tree controls, the flattener and the data sources as well as the components. They are public classes a consumer constructs, and they decide what renders, what "select all" targets and what is persisted. A separate `tree/data` capability was considered and rejected: filtering, "select all" and state saving cross that boundary in nearly every change.
2. **Members for an embedding tree-select are not contract.** These exist so `kbq-tree-select` can drive the tree:
    - `ownsKeyboard`, `inSelect`, `initializeForEmbedding` and `handleKeydown`;
    - `optionShouldHoldFocusOnBlur`, `resetFocusedItemOnBlur` and `syncingSelection`.

    The `@docs-private` methods (`setSelectedOptionsByClick`, `setOptionsFromValues`, `getSelectedValues`, `highlightSelectedOption`, `updateScrollSize`) are left out too. The one piece kept is the error a consumer meets when the tree-select owns the selection model.

3. **Deprecated aliases only as companions.** `onSelectAll`, `onCopy` and `onSelectionChange` are mentioned only where they emit next to their replacements, because the unit fixtures still bind `onSelectAll`. `KbqTreeNode.mostRecentTreeNode` is left out.
4. **Settled state, not timing.** An option's own selected state, its `kbq-selected` class, its `aria-selected` and its checkbox catch up with the selection model one task (a zero-delay timer) after a change. The spec states the settled result. It names a delay only where a user or a test observes it:
    - the 200 ms type-ahead debounce;
    - the tab-order restore in the next task (a zero-delay timer);
    - `filterValue` being published a microtask after `filterNodes`.
5. **Numbers come from the test fixtures.** The 17 nodes, the eight rows and the paddings in scenarios are those of the unit-test data, so each scenario maps to a test.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/tree` updates `openspec/specs/tree/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [The tree inherits behaviour from shared code] → The key managers, the select-all helpers, `resolveMultipleMode` and `KbqStateSaving` in `core` are shared with the list and the tree-select. A `core` change that alters what a tree does updates this spec as well.
- [Some requirements rest on the source rather than on a test] → tasks.md checks each of them by hand in `yarn run dev:tree`, or by reading the source, before archiving. A mismatch is corrected in the delta, not in the code.
- [A defect gets recorded as intended behaviour] → Suspected defects stay out of the spec and are listed under Findings. Behaviour the spec does state can change later through `MODIFIED`.
- [The spec is long: 70 requirements, 148 scenarios] → It is grouped in the order of the docs page: rendering and expanding, search, selection, "select all", forms, action buttons, state saving, keyboard, accessibility, localization, rendering performance.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The keyboard table says Enter does nothing on a row with a checkbox. Enter toggles the active row in every mode, exactly like Space.
2. The table says Space does nothing on a row without a checkbox, and selects a row "and all nested items" when it has one. Space toggles only the active node, in every mode; descendants change only through `setStateChildren`.
3. The PgUp and PgDn rows are swapped: the PgUp row describes moving down to the lowest visible item. In the code PageUp moves back and PageDown forward, by the number of options that fit in the tree.
4. Ctrl + C is documented as copying the names of the items, separated by line breaks. The code copies only the `getValue` value of the active option.
5. Ctrl + A is documented without saying it needs multiple selection. In single selection the tree ignores it and does not prevent the browser's own select-all either.
6. "Text matching the search query … is highlighted in bold": the tree highlights nothing. The examples pipe the label through `kbqHighlightBackground`, which is a background highlight.
7. The JSDoc of `noUnselectLast`, "Whether the last selected node can be deselected", is the reverse of what the flag does.
8. The JSDoc of `autoSelect` speaks only of clicks. The flag also makes Up, Down, Home, End, PageUp and PageDown select the active option.
9. The JSDoc of `selectAllHandler` says the default handler toggles. It only selects, unless `selectAll` or `selectAllToggle` is set.
10. The JSDoc of `selectable` says options that are not rendered "are not checked by select all", which reads as if collapsed nodes were left out. "Select all" selects every collapsed node, whatever its option's `selectable` or `disabled` would say.
11. The JSDoc of `KbqTreeOption.selectionChange` says it emits "whenever the selected state … changes". It does not emit for these:
    - `toggle()`, `setSelected()` or assigning `selected`;
    - a Shift range.

    It emits only when the tree re-syncs an option after the selection model changed. Likewise, the tree's `selectionChange`, documented as "Emits when the selection changes", is silent for changes made in code that are reported to the form.

12. `KbqTreeNodeOutletContext.count` is documented as the number of data nodes but is never filled; a TODO in the source points at DS-2196.
13. `viewChange` is documented as a heuristic a data source can use to page. It is the constant `{ start: 0, end: Number.MAX_VALUE }`.
14. Nothing tells consumers that `kbq-tree-node-toggle` needs `[node]` for its `kbq-expanded` class; a click works without it. Most unit fixtures omit the binding.
15. The keyboard table mentions moving Tab to "the next additional action". An option holds a single `kbq-option-action`.
16. The JSDoc of `selectable` lists `select` among the ways to select an option from code. `KbqTreeOption.select()` and `deselect()` change only the option's displayed state and fire its own event. They leave the tree's selection untouched, and the next re-sync undoes them. Only `setSelected`, `toggle` and assigning `selected` reach the selection.

**Suspected defects (from reading the code, not reproduced)**

1. A plain click, and a vertical key with `autoSelect`, clear the selection model and then select. Each clear is reported, so the form briefly receives `undefined` or `[]` before the new value. Clicking or arrowing onto the node that is already selected (Down on the last row, for one) reports the value twice and emits `selectionChange`, marking the control dirty without a change.
2. An empty query reaches the default matcher as `null`, and the matcher builds the regular expression `/null/gi`. A node whose view value contains "null" (for example "Nullable") therefore matches when the search field is cleared, and the tree stays filtered down to it.
3. With `autoSelect` off, a plain click on the only selected node deselects it although `noUnselectLast` is on: the click path skips that guard. The `tree-action-button`, `tree-selection-separate-from-focus` and `tree-toggle-on-click` examples are affected.
4. The keyboard does not check whether the active option is disabled. Space and Enter test only `selectable`, and vertical keys re-select the active option. An option that becomes disabled while active, or a tree disabled while focus is inside it, can still change the selection from the keyboard. A custom `selectAllHandler` also runs on a disabled tree.
5. The padding corrections are pixel amounts applied in the indent's units. The first level loses 2, and a row without a toggle gains 24, so with `'10em'` a root row gets 8em with a toggle and 32em without one.
6. "Select all" emits `selectionChange` only for rendered options. When every rendered option is already selected and only collapsed nodes change, the value changes but no `selectionChange` is emitted.
7. Saved expansion values that never match a node are kept as pending forever and written back on every save, so storage keeps them indefinitely.
8. `navigationChange` probably does not fire for a pointer click. The focus event already moves the active index without an event, so the click's `setActiveItem` sees no change.
9. A bound `tabIndex` of 0 is treated as unbound, so an empty tree drops to `tabindex="-1"` despite the binding.
10. The anchor of a Shift click is the option that was active before the last keyboard or programmatic move, not the one active now. After Down moves from row 1 to row 2, a Shift click on row 4 spans rows 1 to 4 and applies row 1's state, not row 2's.

**Tests whose name and body disagree, or that cannot fail**

- "should filter nodes and but not their parents" asserts that the parent `Pictures` is rendered.
- "should select all visible options and values" selects all 17 nodes, collapsed ones included. It also asserts that the event's `option.selected` is `false`, which pins the lagging mirror rather than a behaviour.
- "should select the active option with ENTER" cannot fail on Enter. The preceding Down already selects the option in single selection, and Enter on the only selected node is then a no-op because of `noUnselectLast`.
- "should combine the disabled input with the filter state" starts with the input already disabled. It cannot tell whether the filter overrides the input, and it never clears the filter.
- "drops a saved value that names no node" checks only the expansion. The value is not dropped: it stays pending and is persisted again on the next save.
- "should keep narrowing the level across a chain of disabled ancestors" asserts that the focus does not move at all.
- "should hand the selected values to the registered change callback" drives the `@docs-private` `setOptionsFromValues`, not a form write. A form write reports nothing.
- `it.skip('should not blur on focused option when copying')` documents an open defect (DS-5079): copying blurs the active option.
- `describe('with when node template')` carries a stale `// todo need recover`, though its test runs.
- `nested-tree-control.spec.ts` names its suite `CdkNestedTreeControl`.

**Behaviour without a test.** The spec states these from the source:

- the errors for an invalid data source, two default node definitions, a node without a matching definition and a missing tree control;
- a single node definition being used whatever its `when`;
- array data sources, `level` in the node template context and `count` staying unset;
- the roles and `aria-level` of `kbq-tree` and `kbq-tree-node`;
- the `kbqTreeNodeToggle` directive, the toggle's `aria-disabled`, and `kbq-expanded` never appearing without `[node]`;
- `expand`, `collapse` and `toggle` doing nothing while a filter is active;
- special characters matched literally, a custom `compareViewValues`, and the warning for an unknown `multiple` value;
- a plain click with `autoSelect` off;
- `[showCheckbox]` on an option and a projected `kbq-pseudo-checkbox`;
- a click on a tri-state option toggling only its own node, and `setStateChildren` reporting to the form;
- `selectionChange` carrying only the acted-on option after a Shift range;
- Ctrl/Cmd + A in single selection, and the error for a `selectAllHandler` that is not a function;
- the select-all row:
    - not being rendered in single selection or for an empty tree;
    - Space and Enter on it;
    - `selectAllOptions()` called from code;
    - `selectAllChange` itself (the fixtures bind only `onSelectAll`);
- the selection order of the value in multiple selection;
- expansion made by the application not being persisted until `saveState()`;
- PageUp and PageDown;
- vertical keys not selecting with `autoSelect` off, in `checkbox` mode or with Ctrl/Cmd;
- the `copyChange`/`onCopy` path and Ctrl/Cmd + C without an active option;
- `navigationChange` for keys other than Left;
- `aria-labelledby`, scrolling the active option into view, and `tabindex="-1"` for an empty tree;
- the `kbq-tree-option_multiple` class;
- the `en-US` label and `[localeOverrides]`;
- re-indenting on a direction change, and rows rebuilt without `trackBy`.
