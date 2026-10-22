# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are:

- `packages/components/tree-select/`: the component, its template and styles, `tree-select.component.spec.ts`, `e2e.ts`, `e2e.playwright-spec.ts` and `e2e.webkit.playwright-spec.ts`;
- the `tree-select.{en,ru}.mdx` and `examples.tree-select.{en,ru}.mdx` pages and the examples under `packages/docs-examples/components/tree-select/`;
- the API golden file `tools/public_api_guard/components/tree-select.api.md`;
- what the tree-select drives in other entry points: `KbqTreeSelection`, `KbqTreeOption` and `FlatTreeControl` in `tree`, `KbqAbstractSelect`, `KbqSelectSearch`, the select-all helpers, the select errors and the locale code in `core`, `KbqCleaner` in `form-field`, `KbqTagRemove` in `tags`, `KbqIcon` and `KbqSelectNoOptions`.

Every claim was read from that source before it went into the spec. The `select` baseline in `openspec/specs/select/spec.md` sets the pattern this change follows.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the component, and every scenario can be checked by an existing test or by hand in the dev app.
- One place to diff against when tree-select behaviour changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Internals: class and method names, timers, change-detection details, CSS structure and design tokens beyond the ones a consumer sets.
- A standalone `kbq-tree-selection`, its data sources, flattener and filters, `kbq-select` and deprecated APIs.
- Changes to tests, docs or examples.

## Decisions

1. **The general decisions follow the select baseline.** One capability at the flat path of the entry point, `tree-select`; the spec is in English; it describes what ships, quirks included; only behaviour confirmed by a test or read directly in the source goes in; public inputs, outputs and methods, selectors, host and panel classes, ARIA attributes, thrown messages and exported tokens count as contract.
2. **The tree's behaviour is in scope where the tree-select drives it.** The tree-select hands the projected `kbq-tree-selection` its selection model and routes every key itself. The resulting behaviour — which keys select, the select-all row, which nodes "select all" covers, the tree roles inside the panel — is only observable through the tree-select, so it is specified here. What a standalone tree does belongs to the `tree` capability, which the `document-tree-baseline` change proposes in parallel; neither spec repeats the other.
3. **The value is described through the tree control.** The tree-select has no `compareWith` and no `[value]` input: values come from `getValue`, labels from `getViewValue` and matching from `compareValues` of the consumer's `FlatTreeControl`. The spec speaks of nodes and their values in those terms rather than of options.
4. **The single-selection keyboard model is specified as it ships.** Up and Down select as they move, Home, End, PageUp and PageDown do not, and Enter closes without selecting. That much is certain from the source, so it is in the spec. Effects of the same code path that could not be pinned down with confidence — other keys re-selecting the active option — are only listed under Findings. A later change that settles the model replaces these requirements through `MODIFIED`.
5. **The shared `kbq-select__*` markup is not contract.** The tree-select reuses the select's trigger markup and classes. Only the host classes and the panel classes a consumer can style or test against are specified.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/tree-select` updates `openspec/specs/tree-select/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [Some requirements rest on the source rather than on a test] → tasks.md checks each of them by hand in `yarn run dev:tree-select` before archiving. A mismatch is corrected in the delta, not in the code.
- [A defect gets recorded as intended behaviour] → Suspected defects stay out of the spec and are listed under Findings; behaviour the spec states, such as the single-selection keyboard model, can change later through `MODIFIED`.
- [Overlap with the `tree` spec] → Requirements about the tree inside the panel are phrased from the tree-select's side, so the `tree` spec can own the standalone behaviour without contradicting them. Whichever of the two changes is archived second is checked against the other for conflicting statements.
- [The spec is long: 70 requirements, 130 scenarios] → It is grouped in the order of the docs page: panel, keyboard, selection, value and forms, trigger, cleaner, select-all, search, footer, layout, accessibility, localization.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The JSDoc of `KbqTreeSelectChange.isUserInput` says it tells a change by the user from one written to the model. Every `selectionChange` is built with `false`, user picks included, and written values emit nothing.
2. The JSDoc of `sortComparator` and `KbqTreeSelectSortComparator` says the values of a multiple tree-select are ordered by the panel or by the comparator. Only written values are sorted; nodes the user selects are appended in selection order, which the `Ctrl`+`A` and "should update the label" tests assert.
3. The host comment and the test "should not announce a popup the panel does not implement" say the panel has no `role="tree"` yet, which is why `aria-haspopup` is left out. The projected `kbq-tree-selection` already has `role="tree"` and its options `role="treeitem"`.
4. The `Ctrl`/`Cmd` + `A` section does not say that the panel has to be open.
5. The docs advise against an `<ng-container>` for `kbq-select-trigger`, but the `tree-select-custom-trigger` example uses `<ng-container kbq-select-trigger>`.
6. "Smart search" describes splitting the query and folding diacritics as if the tree-select did them. They belong to the example's filter; the tree-select does not filter.
7. The JSDoc of `panelMinWidth`, on the input and in `KbqTreeSelectOptions`, says it is ignored when wider than the window. The code drops the minimum only when the pane overflows horizontally.
8. The JSDoc of `searchMinOptionsThreshold` speaks of "available options". The count is the rendered nodes, so expanding or collapsing a branch can show or hide the search field while the panel is open.
9. "Multiple with child selection" has no text, and the cascade from a parent to its children is the example's own `selectionChange` handler, not something the tree-select does.
10. The examples page says `kbq-select-matcher` replaces "the entire contents of kbq-select".
11. These have no place in the tree-select pages:
    - `autoSelect` and the single-selection keyboard model;
    - `hasBackdrop` and `backdropClass`;
    - `kbq-select-no-options`;
    - `[localeOverrides]`;
    - `#kbqSelectTagContent` and `onRemoveSelectedOption`, shown only in the "Deleted nodes" example.

**Suspected defects (from reading the code, not reproduced)**

1. The tag remove control is `<i kbq-icon kbqTagRemove>`. `KbqIcon` puts `aria-hidden="true"` on its host by default, so a focusable `role="button"` is hidden from assistive technology (axe `aria-hidden-focus`). No axe test renders tags.
2. Every remove control is named only by `a11y.remove`, without the node's label, and the remove controls of tags clipped behind the "+N" counter keep `tabindex="0"`.
3. Picking an option in single mode, by click or by arrow key, clears the selection model and then selects the node. Switching from one value to another therefore reports `undefined` to the form before the new value, and picking the selected option again re-emits `selectionChange` and marks the control dirty.
4. Removing a tag and using the cleaner report the value to the form twice: once from the model change and once explicitly.
5. In an open single panel, any key that reaches the navigation branch selects the active option on the spot and emits `selectionChange`: a letter meant for typeahead, or Shift on its own. Typeahead then moves the highlight 200 ms later without selecting. Enter right after opening selects nothing, and Home, End, PageUp and PageDown leave the value behind the highlight.
6. PageUp and PageDown pressed in the search field move focus onto the option and leave it there.
7. Hovering an option gives it DOM focus, which takes focus out of the search field.
8. The footer slot projects `kbq-select-footer` and `[kbq-tree-select-footer]`. The attribute form of the footer directive, `[kbq-select-footer]`, is not projected at all, so the custom footer in the dev app is not rendered, and `[kbq-tree-select-footer]` matches no directive and gets no footer styles. Footer controls cannot be reached with Tab, which closes the panel, and Enter or Space on a focused footer control is prevented and acts on the active option.
9. A projected `kbq-select-no-options` is rendered whenever it is projected, also above a tree that has nodes.
10. When `searchMinOptionsThreshold` hides the search, opening still tries to focus the detached search field.
11. `typeAhead` and `autoSelect` are copied to the tree once, when the content initializes. A search field added later with `@if` leaves typeahead on, and a later change of `[autoSelect]` makes the tree-select's Enter handling and the tree's click handling disagree.
12. Writing `null` or `undefined` to a tree whose `getValue` returns that value for a node selects the node instead of clearing the selection.
13. The panel id is built from the generated id and ignores a custom `id`.

**Tests whose name and body disagree, or that cannot fail**

- "should be able to preselect an array value in single-selection mode" preselects the string `'Pictures'`.
- "should clear the selection when a nonexistent option value is selected" and "should clear the selection when the control is reset" first write `'pizza-1'`, which is not a node either, so nothing is ever selected before the clear; their "Pizza" assertions cannot fail.
- "should update the trigger based on the value" (with OnPush) ends by asserting that the trigger does not contain "Pizza" after resetting `rootNode_1`.
- "should show empty message" and "should have search input" call `toBeDefined()` on the result of `query()`, which is `null`, not `undefined`, when nothing matches.
- "should not scroll to options that are completely in the view" reads `scrollTop` of `.kbq-tree-select__panel`, which never scrolls, under jsdom, which has no layout.
- "should scroll to selected element on panel open" compares rectangles that are all zero under jsdom, so the option always counts as in view.
- "should calculate hidden items and output in show more button" runs where every width is zero, so the counter is always 0 and the assertion only finds a "0" in the text.
- The e2e "keyboard scrolling" tests press Space in an open single panel to "expand subtrees", but Space closes the panel. "should scroll down …", "… to the bottom when pressing END" and "should scroll up …" then compare a scroll offset of 0 with 0. "should scroll to the top when pressing HOME" opens five collapsed roots that never overflow.
- "should set the tabindex of each option according to disabled state" checks an enabled and a disabled option; every option has `tabindex="-1"` whatever its state.
- "should render the id the form-field label points at": the label does not point at the id; the tree-select points at the label through `aria-labelledby`.
- The describe "without Angular forms" binds every fixture with `[(ngModel)]`.
- "should select children with parent" and "should select parent when all children are selected" exercise the fixture's own `selectionChange` handler, not the tree-select.
- The skipped "when resetting the value by setting null or undefined" block asserts on `kbq-form-field-should-float`, which nothing sets any more.

**Behaviour without a test.** The spec states these from the source:

- the single-selection keyboard model: Up and Down selecting, Home, End, PageUp and PageDown not selecting, Enter closing without selecting, and the `autoSelect` input;
- Enter and Space toggling an option and Shift with an arrow in multiple mode;
- typeahead, PageUp and PageDown, and Left and Right expanding or collapsing a branch (only the focus returning to the search field is tested);
- a second click closing the panel, the backdrop, and the side staying fixed while the panel is open;
- picking the selected option again re-emitting `selectionChange`;
- `selectable` set to `false`;
- the tag of a disabled tree-select having no remove control, and removing a tag not toggling the panel;
- `#kbqSelectTagContent` and the focus and blur part of `useDefaultHandlers`;
- the cleaner moving focus to the tree-select, and a throwing `clearPredicate`;
- `selectAllHandler` and its error;
- the search control being reset on close, the errors for a search without `kbqInput` or a form control, and PageUp and PageDown from the search field;
- the footer;
- positioning against the form field container and following page scroll;
- `panelMaxWidth`, and an explicit `null` for it in the provider;
- the `role="tree"` and `treeitem` attributes, as seen through a tree-select;
- the `disabled` attribute and the `kbq-select_multiple` and `kbq-select_multiline` host classes;
- the `tabIndex` input given `null` or a non-integer;
- the form-field container click;
- `[localeOverrides]`;
- the number of hidden items, which jsdom always measures as 0;
- Tab moving focus on to the next control (only the key not being prevented is tested);
- the `selectionChange` payload of a removed tag and of "select all".
