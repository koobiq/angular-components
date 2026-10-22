# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are `packages/components/filter-bar/` (the bar, `kbq-filters` and its save popover, `kbq-pipe-add`, `kbq-filter-reset`, `kbq-filter-refresher`, `*kbqPipe`, the nine pipe components and their templates, the unit specs and spec helpers, `e2e.ts` and the Playwright spec), the `filterBar` locale section and the state-saving directive and search predicate in `packages/components/core`, the parts of `kbq-select` and `kbq-tree-select` a pipe relies on, the `filter-bar.{en,ru}.mdx` and examples pages, the examples under `packages/docs-examples/components/filter-bar/`, and the API golden file `tools/public_api_guard/components/filter-bar.api.md`. Claims were checked against the source before going into the spec. `openspec/specs/` holds only the select baseline, and `openspec/config.yaml` sets no project context.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the entry point, and every scenario can be checked by an existing test or by hand in the dev app.
- One place to diff against when filter-bar behaviour changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Restating the behaviour of `kbq-select`, `kbq-tree-select`, `kbq-popover`, `kbq-dropdown`, the datepicker and timepicker inside a pipe, such as keyboard navigation in an open panel; the spec covers what a pipe adds or changes.
- Internals: class and method names, the `KbqFilterBarHost` plumbing (`internalFilterChanges`, `internalTemplatesChanges`, `openPipe`, `onResetFilter`), timers and change-detection details, CSS structure and design tokens other than `--kbq-filter-bar-pipe-max-width` and `--kbq-filter-bar-pipe-input-width`.
- Deprecated APIs and changes to tests, docs or examples.

## Decisions

The general decisions follow the select baseline (`openspec/changes/archive/2026-10-21-document-select-baseline/design.md`): English, the spec describes what ships, only confirmed behaviour goes in, and suspected defects stay out of the spec. The decisions below are specific to the filter bar.

1. **One capability, `filter-bar`, for the whole entry point.** The bar, `kbq-filters`, `kbq-pipe-add`, the reset control and the pipes all read and write the same `filter` model, and state saving persists what all of them change. Separate capabilities (`filter-bar/pipes`, `filter-bar/saved-filters`, …) were considered and rejected: a change to how a pipe reports a value touches the bar, the saved-filter flags and the persisted state at once. If the spec outgrows one review, it can be split later with `REMOVED` and `ADDED` deltas.
2. **Pipe types are described by what the user sees, not by their components.** A requirement names the pipe type (`select`, `date`, …) and the template option that drives it. The component classes stay out of the spec, except where a consumer extends them (`KbqBasePipe`, `kbqPipeState`, `kbq-pipe-button` for custom pipes).
3. **Quirks are documented as they ship.** Examples:
    - Enter and blur do not apply an `input` pipe before its debounce ends, although the docs say they do;
    - clearing leaves `[]` in a `multiselect` pipe but `null` in a `multi-tree-select` pipe;
    - the bar never sets `changed` back to `false` on its own;
    - `kbq-filter-reset`, "Reset" in the actions menu and saving a new filter only report; the application changes the filter;
    - `onChangeFilter` is never emitted.

    Each fix belongs in its own change, with a `MODIFIED` delta.

4. **What counts as contract here, in addition to the select list:** the `kbq-pipe`, `kbq-pipe__<type>` and `kbq-pipe_*` host classes, the multiline panel classes, the two width properties a consumer sets, the shape of the persisted state, the `KbqSaveFilterStatuses` values, the `filterBar` locale keys and the error thrown by `*kbqPipe`. Scenarios quote the `ru-RU` default text where the tests assert it.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/filter-bar` updates `openspec/specs/filter-bar/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [Some requirements rest on the source rather than on a test] → tasks.md checks each of them by hand in `yarn run dev:filter-bar` before archiving. A mismatch is corrected in the delta, not in the code.
- [A defect gets recorded as intended behaviour] → Suspected defects stay out of the spec and are listed under Findings. Behaviour the spec does state can change later through `MODIFIED`.
- [The spec is long: 78 requirements, 118 scenarios, above the usual range] → The entry point bundles about a dozen public components. The spec follows the docs page: the bar and its model, rendering pipes, clearing and removing, adding and resetting, each pipe type, search, select-all, locked values, panel height, captions, empty options, dates, saved filters, state saving, localization and accessibility, custom pipes.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. `filter-bar.{en,ru}.mdx` says the `input` pipe applies text "only from 3 characters on (`minLength`)". `minLength` defaults to 1.
2. The same section says Enter and blur apply the value at once and ignore the threshold. The pipe has no Enter or blur handler; the text is applied only after the 200 ms debounce or by a clear. The JSDoc of `debounceTime`, `minLength` and `KbqPipeTypes.Input` ("Commits … on Enter and on blur") say the same and are wrong too.
3. The same section calls the cleaner the `input` pipe's "only clear affordance". The cleaner is rendered only with `cleanable: true`; otherwise the pipe has no clear affordance at all.
4. The JSDoc of `filterSavedSuccessfully` and `filterSavedUnsuccessfully` says to call them from `onSave` or `onChangeFilter`. `onChangeFilter` is declared but never emitted; renames arrive through `onSave` with `newName`. The dev app still binds it.
5. The JSDoc of `onClosePipe` says it fires when "the select or multiselect pipe" closes. It also fires for the `text`, `date`, `datetime`, `tree-select` and `multi-tree-select` pipes.
6. "Parameter not specified" reads as if the bar puts a localized option at the top of the list. The option, its text and its position belong to the example's own `values`.
7. "Inactive filter" describes a filter that cannot be changed or deleted, but the example sets `disabled` on each pipe. `KbqFilter.disabled` and `isDisabled()` have no effect anywhere in the bar.
8. The "Search" section describes word splitting and diacritic folding as if the bar searched. The bar does not filter data; the example does, with `createSearchPredicate`.
9. The `filterBar.search.tooltip` locale string is not used by any part of the filter bar.
10. `kbq-filter-refresher` is exported and has a slot in the bar, but the docs page does not mention it, it has no inputs or outputs, and its two buttons do nothing. The dev app keeps it commented out.

**Suspected defects (from reading the code, not reproduced)**

1. The bar's reset stream is a `BehaviorSubject` that stays `true` after the first reset. A pipe with `openOnReset` that is rendered later for any other reason, such as selecting a saved filter or a locale change, opens on its own. Only a comment in the overview example warns about it.
2. The `select` and `multiselect` pipes read `filterBar!.internalTemplatesChanges` while being constructed. Rendered outside a `kbq-filter-bar`, where the base pipe treats the bar as optional, they throw a `TypeError` instead.
3. When "all selected equals nothing selected" applies, the multi-select pipes emit `onChangePipe` with a copy of the pipe (`{ ...data, value: [] }`), not the pipe object in the filter. A handler that compares it with `filter.pipes` or passes it to `removePipe` finds nothing.
4. The `text` pipe never resets its textarea from the value. Text typed and then abandoned by closing the popover is still there on the next open, although the value did not change.
5. `numberOfSelectedLeaves`, which feeds the multi-tree-select count badge, counts every selected node, branches included, not only leaves.
6. Escape in the saved-filter search calls `closePopover()`, which hides the save popover (not open at that moment) and moves focus back to the trigger. Closing the menu itself is left to the dropdown.
7. The `tree-select` pipe template projects a `kbq-cleaner` into `kbq-tree-select`, but the custom matcher replaces the slot that would render it, so it never shows.

**Tests whose name and body disagree, or that cannot fail**

- `filter-bar.spec.ts` "should mark filter as changed when onRemovePipe emits" calls `removePipe`; nothing in the bar listens to `onRemovePipe`.
- `filter-bar.spec.ts` "selectedAllEqualsSelectedNothing › should reflect the bound value" binds `true`, the default, so it cannot tell a working binding from none.
- `filters.spec.ts` "should show save button when filter is changed and not saved" and "should show filter actions button when filter is saved" both look for `.kbq-button_action`, which both buttons carry, so each would pass with the other button.
- `pipe-date.spec.ts` "should use today as defaults when pipe is empty" asserts that the default end is tomorrow.
- `pipe-multi-tree-select.spec.ts` "should count selected items excluding selectAll value" recomputes the getter's own formula, so it cannot fail.
- `e2e.playwright-spec.ts` "should apply panelMaxHeight from the pipe template to a select pipe" opens the `multiselect` pipe.
- `filters.spec.ts` "should call closePopover when Escape is pressed" checks only that the method was called, not that the menu closed.

**Behaviour without a test.** The spec states these from the source:

- the order of `kbq-filters`, the pipes, `kbq-pipe-add` and `kbq-filter-reset` in the left section;
- `changed` staying `true` after the values are reverted;
- `*kbqPipe` ignoring later binding changes, and its error for an unregistered type;
- the default `KBQ_FILTER_BAR_PIPES` map, `kbqFilterBarPipesProvider()` and custom pipe registration (shown only by a docs example);
- `kbq-active` on an open pipe trigger;
- the names and tooltips of the clear and remove buttons, removal through the button, a disabled pipe's button, and both `cleanable` and `removable` set;
- focus staying where the user moved it when a pipe closes;
- `openOnAdd` being deleted from the pipe object;
- the name and tooltip of the `kbq-pipe-add` button;
- the projected label of `kbq-filter-reset`, and `openOnReset`;
- the `readonly` pipe, which has no unit spec;
- the `text` pipe's hot-key label and five-row limit;
- the `input` pipe ignoring `removable`, emitting nothing for an unchanged value, and not applying on Enter or blur;
- the multi-select trigger name and count badge (screenshots only), and a multi-tree-select branch following its children;
- the select-all row hidden while a search finds nothing;
- `kbqBuildTree`, used in the specs only to build fixtures;
- word-by-word matching and diacritic folding in pipe search (tested in `core`), the tree highlight and the `pipe.emptySearchResult` text;
- in `kbq-filters`: the trigger disabled while saving, `kbq-selected` on the current filter, the search and list hidden for an empty list, the read-only actions menu, focus in the popover field, the bar's filter left alone by a new save, focus on the trigger after Delete, and `onChangeFilter` never firing;
- restoring an unnamed state over the current filter, restoring after a key change, and a bar outside the document persisting nothing;
- `[localeOverrides]` on the bar (tested in `core`);
- the accessible names of the add, save-as-new, actions, clear and remove buttons and of the pipe search fields;
- `kbq-filter-refresher`.
