# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are `packages/components/select/` (component, template, the unit spec and the Playwright spec), the shared option, optgroup, select and locale code in `packages/components/core`, `kbq-form-field` and `kbqTagRemove`, the `select.{en,ru}.mdx` pages, and the API golden file `tools/public_api_guard/components/select.api.md`. Six read-only surveys covered separate areas, and their key claims were checked against the source before going into the spec. `openspec/specs/` is empty and `openspec/config.yaml` sets no project context, so this change also sets the pattern for later component specs.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the component, and every scenario can be checked by an existing test or by hand in the dev app.
- One place to diff against when select behaviour changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Internals: class and method names, timers, change-detection details, CSS structure and design tokens beyond the ones a consumer sets.
- `kbq-tree-select`, `kbq-autocomplete`, `kbq-timezone-select` and deprecated APIs.
- Changes to tests, docs or examples.

## Decisions

1. **One capability, `select`, at a flat path.** The path matches the `packages/components/<name>` entry point, which is the unit a change touches and reviews. Split capabilities (`select/search`, `select/keyboard`, …) were considered and rejected: search, select-all, virtual scrolling and the keyboard share the selection and the active option, so most changes would touch several of them at once. If the spec outgrows one review, it can be split later by moving requirements with `REMOVED` and `ADDED` deltas.
2. **English.** Code comments, commits and the `SHALL` / `WHEN` / `THEN` keywords are English. The bilingual docs pages stay the user-facing documentation.
3. **The spec describes what ships, quirks included.** Examples:
    - clearing a single select leaves `undefined`;
    - `required` adds no validator of its own;
    - Tab closes the panel but keeps focus on the select;
    - there is no default text for the empty search result.

    A baseline that already "fixed" these would hide the change that fixes them. Each fix belongs in its own change, with a `MODIFIED` delta.

4. **Only confirmed behaviour goes in.** A requirement either has a test behind it or was read directly from the source. Anything the surveys marked unverified, suspected defects, and docs claims the code does not back are left out of the spec and listed under Findings.
5. **What counts as contract.** These count:
    - public input, output and method names;
    - element and attribute selectors;
    - host classes a consumer can style or test against (`kbq-disabled`, `kbq-invalid`, `kbq-select_multiline`);
    - ARIA attributes;
    - thrown error messages;
    - exported constants.

    Internal class names, private members and timings below what a user notices do not count, with one exception: the 101 ms open delay is exported as `delayBeforeDisplayingResultWithoutOptions`.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/select` updates `openspec/specs/select/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [Some requirements rest on the source rather than on a test] → tasks.md checks each of them by hand in `yarn run dev:select` before archiving. A mismatch is corrected in the delta, not in the code.
- [A defect gets recorded as intended behaviour] → Suspected defects stay out of the spec and are listed under Findings. Behaviour the spec does state can change later through `MODIFIED`.
- [The spec is long: 70 requirements, 116 scenarios] → It is grouped in the order of the docs page: panel, keyboard, value, trigger, cleaner, select-all, search, layout, accessibility, localization.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The tag template snippet in `select.en.mdx` and `select.ru.mdx` uses `select.disabled` without calling it. `disabled` is a signal, so as written every tag renders disabled and no remove control appears. The live example correctly calls `select.disabled()`.
2. The JSDoc of `required` says it "affects validation and display of placeholder". It only sets `aria-required`.
3. The JSDoc of `selectionChange` says the value was "changed by the user". The output also fires for `option.select()` and `option.deselect()` called in code.
4. The JSDoc of `onSelectAll` mentions only the shortcut. The output also fires when the select-all row is clicked.
5. "Customized selection" reads as if the select can pin selected options to the top. That is the example reordering its own data on close.
6. "List with search" describes tokenizing and diacritic folding as if the select did them. They belong to the example's filter; the select does not filter.
7. The Ctrl/Cmd + A section does not say that the panel has to be open.
8. The examples page says the delay is "100 ms"; the constant is 101. It also says loading is shown for "at least 300 ms". `minimumTimeToDisplayLoading` is exported, but the select never applies it.
9. The accessibility section says reduced motion turns off the fade of the panel. The select panel has no fade animation at all.
10. The docs advise against an `<ng-container>` for `kbq-select-trigger`, but the `select-custom-trigger` example uses `<ng-container kbq-select-trigger>`.
11. The JSDoc of `panelMinWidth` says it is ignored when wider than the window. The code drops the minimum only when the pane overflows horizontally.
12. These have no place in the select pages:
    - `panelMaxWidth` and `clearPredicate` among the provider keys;
    - `triggerValuesLimit`, `hiddenItemsText`, `hiddenItemsTextFormatter` and `hiddenItems()`;
    - the tooltip on truncated options.

**Suspected defects (from reading the code, not reproduced)**

1. The tag remove control is `<i kbq-icon kbqTagRemove>`. `KbqIcon` puts `aria-hidden="true"` on its host by default, and nothing overrides it, so a focusable `role="button"` is hidden from assistive technology (axe `aria-hidden-focus`). No axe test renders tags.
2. With `#kbqSelectTagContent`, a remove control falls back to `tabindex="-1"` and the bare name "Remove". The docs template does not show how to restore the tab stop or the value-specific name.
3. Choosing a `null`-valued reset option seems to emit `selectionChange`, `valueChange` and the form change twice, through a re-entrant deselect. It emits even when the value is already empty.
4. Calling `close()` during the 101 ms delay of an empty select does not cancel the pending open.
5. With `selectAll`, the row also renders over the loading, error and no-options content. `aria-busy` is then not set, and activating the row does nothing.
6. Under virtual scrolling, one lookup calls `compareWith` without the guard that turns a throwing comparator into "no match".
7. A custom `id` is not written to the host element, and the panel id ignores it.
8. `useDefaultHandlers` of `kbq-select-matcher` has no effect on `kbq-select`.
9. When `searchMinOptionsThreshold` hides the search, opening may try to focus the detached field instead of the active option.

**Tests whose name and body disagree, or that cannot fail**

- "should update FormControl value to null after clear on single select" asserts `undefined`.
- "should not attempt to open a select that does not have any options" checks only the moment after the click; the panel opens 101 ms later.
- "should restore focus to the host before tabbing away": focus stays on the host; it does not tab away.
- "should allow providing custom tag content" probably runs `.every()` over an empty view query.
- The `kbq-form-field-should-float` assertions always pass, because nothing sets that class any more.
- "should be able to render options inside groups with an ng-container" uses a fixture without an `ng-container`.
- "should drop aria-busy once the options render" never goes through the loading-to-options transition.
- The e2e "positioning — ample/limited space" names refer to option centring, which the select does not have.
- `select.component.spec.ts:7057` keeps a commented-out `finishInit(fixture);`.

**Behaviour without a test.** The spec states these from the source:

- `aria-invalid`, `aria-required` and `aria-describedby` on the select;
- `panelMaxWidth`;
- the `'auto'` threshold and the provider path of `searchMinOptionsThreshold`;
- resetting the search on close;
- closing on a backdrop click;
- the long single value cut with an ellipsis;
- the select-all row being hidden under virtual scrolling.
