# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are:

- `packages/components/dropdown/`: the panel, trigger, item, item action, search and lazy-content code, the error helpers, the types and default options, the two templates, the styles where they decide behaviour (`display: contents` on the host, the item overlay, the scroll container), `dropdown.spec.ts`, `dropdown-item.spec.ts`, `e2e.ts`, `e2e.playwright-spec.ts` and `e2e.webkit.playwright-spec.ts`;
- the `dropdown.{en,ru}.mdx` pages (the examples tab is a placeholder and hidden by `hasExamples: false` in `structure.ts`), the examples in `packages/docs-examples/components/dropdown/` and the API golden file `tools/public_api_guard/components/dropdown.api.md`;
- the code the dropdown relies on: the list, focus and active-descendant key managers, `kbqResolvePanelWidth`, `defaultOffsetY` and `isVerticalMovement` in `packages/components/core`, the gesture click guard of `kbqScrollbarViewport`, and the overflow check of `kbq-title`.

The select baseline (`openspec/changes/archive/2026-10-21-document-select-baseline/`) set the pattern this change follows. The dropdown renders no text of its own, so unlike the select spec there is no locale requirement.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the dropdown, and every scenario can be checked by an existing test or by hand in the dev app.
- One place to diff against when dropdown behaviour changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Internals: class and method names, timers below what a user notices, change-detection details, CSS structure and design tokens beyond the ones a consumer sets.
- The components that wrap the dropdown, such as `kbq-split-button`, `kbq-navbar` and `kbq-app-switcher`, and the shared helpers of `core` beyond what the dropdown exposes.
- Changes to tests, docs or examples.

## Decisions

The general decisions follow the select baseline: one capability at the flat path of the entry point, English, the spec describes what ships with its quirks, only confirmed behaviour goes in, and the contract is public names, selectors, consumer-facing classes, ARIA attributes, thrown messages and exported constants. The decisions below are specific to the dropdown.

1. **The trigger, the panel, the item and the content directives form one capability.** They are one entry point, and the nested chain and the search mode couple them: the trigger decides the close reason and the focus restore, the panel decides the reason it emits, the item decides how keys become clicks. Splitting `dropdown/search` or `dropdown/nested` off was considered and rejected for the same reason the select spec stayed whole.
2. **Exported constants count.** `NESTED_HOVER_SWITCH_DELAY` (50 ms) is named in the spec. `NESTED_PANEL_LEFT_PADDING` (8) and `NESTED_PANEL_TOP_PADDING` (4) appear as the pixel offsets the Playwright tests measure, and `defaultOffsetY` (4) of `core` as the gap the unit tests read from the position configuration.
3. **Which classes count.** `kbq-dropdown-trigger`, `kbq-pressed`, the position classes of the panel, `kbq-dropdown__panel_nested`, `kbq-dropdown-item_highlighted`, `kbq-dropdown-item_active`, `kbq-disabled`, `kbq-progress`, `kbq-dropdown-item_has-action`, `kbq-dropdown-item__action`, `kbq-dropdown-item__caption`, `kbq-dropdown__group-header` and `kbq-dropdown-footer` count: consumers style and tests select by them. The safe-area class of the panel (a module-private constant), the item overlay element and `kbq-dropdown__content` do not.
4. **`@docs-private` members count only where the docs page or a test exercises them.** `widthOrigin` (named on the docs page) and `KbqDropdownPanel` (a custom panel has a test) are in the spec. The safe-area hooks, `adoptItems()`, `setOpened()`, `setPositionClasses()`, `hasSearch` and `inSearchMode` are not, and neither is the public `hovered()` stream, which the wrapping components use rather than consumers.
5. **Geometry comes from a browser.** jsdom reports every rectangle as zero, so the pixel offsets and the placement of nested panels are taken from the Playwright tests, the gaps from the position configuration the unit tests spy on, and the top-level fallback from the source. The geometric unit tests are listed under Findings.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/dropdown` updates `openspec/specs/dropdown/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [Some requirements rest on the source rather than on a test, or on a test that cannot fail] → tasks.md checks each of them by hand in `yarn run dev:dropdown` before archiving. A mismatch is corrected in the delta, not in the code.
- [A defect gets recorded as intended behaviour] → Suspected defects stay out of the spec and are listed under Findings. Where the spec states a quirk, such as the content click that closes on a group header, Findings say so.
- [The spec is long: 68 requirements, 158 scenarios] → It is grouped in the order of the docs page: opening and closing, focus, keyboard and pointer, item states and content directives, lazy content, nested panels and the safe area, search, the caret menu, position, width, layering, scrolling, tooltips, accessibility and defaults.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. "Menu Search" says search splits a multi-word query, trims it, ignores case and folds diacritics. The panel does not filter at all; that is `createSearchPredicate` in the `dropdown-with-filter` example.
2. "Panel width" says panels that overlap the trigger vertically are not matched to the trigger. Only panels with `overlapTriggerY` set and `overlapTriggerX` unset are; with the default `overlapTriggerX: true` an overlapping panel is still matched.
3. "Panel width" tells consumers to set `KbqDropdownTrigger.widthOrigin`, whose JSDoc carries `@docs-private`, so the API tab hides it.
4. "Progress state" says `progress` can be combined with `disabled` "to also prevent interaction", implying `progress` alone keeps the item interactive. The item overlay already swallows pointer clicks on an item in progress (see suspected defect 3).
5. The JSDoc of `panelMinWidth` says the panel is never narrower than its trigger. Nested panels, panels with `overlapTriggerY` set and `overlapTriggerX` unset, and panels anchored to a caret rectangle are not sized against the trigger.
6. The JSDoc of `closed` says it is emitted "when the dropdown is closed". It also fires when `close()` is called on a panel that no trigger has open, and its reasons, including no value for a backdrop or outside click, are not documented anywhere.
7. The JSDoc of `hasBackdrop` does not say that nested panels never get a backdrop. `navigationWithWrap` has no JSDoc at all.
8. The `yPosition` error reads "must be either 'above' or below'." with a misplaced quote, and the JSDoc of the internal helper that throws the `xPosition` error lists only `'before'` and `'after'`.
9. These have no text on the dropdown pages; they appear only in examples or nowhere: `kbqDropdownTriggerData` and `kbqDropdownContent`, `navigationWithWrap`, `openByArrowDown`, `kbqDropdownItemCaption` and `kbqDropdownGroupHeader`, `kbqDropdownStaticContent`, `kbqDropdownTriggerRestoreFocus`, `offsetX` and `offsetY`, `overlapTriggerX` and `overlapTriggerY`, `hasBackdrop` and `backdropClass`, `KBQ_DROPDOWN_SCROLL_STRATEGY` and typeahead.

**Suspected defects (from reading the code, not reproduced)**

1. A partial `KBQ_DROPDOWN_DEFAULT_OPTIONS`, such as `{ safeArea: false }` for the global configuration the docs describe, leaves `xPosition` undefined. Validation skips the default, and opening then fails on the positions table: no position matches `undefined`, so the destructuring throws a `TypeError`.
2. An explicit `panelWidth` is ignored on nested panels and on panels with `overlapTriggerY` set and `overlapTriggerX` unset, because the pane size is applied only to panels matched to the trigger. The CSS minimum still drops to `0px` for an explicit width, so such a panel ends up content-sized with no floor.
3. On an item in progress, the full-size item overlay stops pointer clicks before they reach the item, so its handlers do not run and the panel stays open. Enter or Space on a native `button` host is not intercepted and still clicks it.
4. The 8 px horizontal shift of a nested panel is not mirrored for right-to-left layouts: the panel overlaps its trigger item in left-to-right layouts but leaves an 8 px gap in right-to-left ones. When it falls back on both axes, the shift turns back to 8 px left, which leaves a gap in left-to-right layouts too. The Playwright tests assert the right-to-left gap as expected.
5. `offsetY` and `offsetX` set on the trigger are applied as given to the fallback positions too, so an offset that opens a gap below the trigger pushes a panel that falls back above it down into the trigger.
6. Changing `xPosition` or `yPosition` while the panel is open moves the position classes at once but not the panel, so the classes can name a side the panel is not on until it opens again or `updatePosition()` is called.
7. `navigationWithWrap` is read once, when the key manager of the current mode is built. A later change is ignored, and a panel whose search field appears later builds its second manager with the value of that moment, so the two modes can disagree.

**Tests whose name and body disagree, or that cannot fail**

- "should close the dropdown when a click occurs outside the dropdown" clicks the backdrop. No unit test clicks outside a panel without a backdrop; only a context-menu event and an auxiliary-button click on the trigger are covered.
- "should restore focus to the trigger when the dropdown was opened by keyboard" and "should set the proper focus origin when restoring focus after opening by keyboard" open with a click that has no mouse press before it, which is the `program` origin, and the second asserts `cdk-program-focused`.
- "should close immediately on a sibling hover when disabled (default)": the fixture turns `safeArea` off, while the component's default is on.
- "should honor a `safeArea: true` default without setting the input explicitly" cannot fail: `true` is also the built-in default.
- The "fallback positions" and "overlapping trigger" tests, and "should open above trigger when yPosition is above and there is space above", compare `getBoundingClientRect()` values that jsdom reports as zero, so they cannot fail.
- "should scroll the panel to the top on open, when it is scrollable" cannot fail: jsdom never scrolls, so `scrollTop` is always 0.
- "does not close when a scrollbar gesture produces a panel click" dispatches the click on the panel, an ancestor of the content element where closing is bound, so it cannot reach the close handler.
- "should not emit an event when a disabled dropdown item is clicked" clicks a disabled `button`, which jsdom, like a browser, does not dispatch the click to, so the item's own guard is probably never exercised.
- The two "with KbqTitle directive" unit tests assert that no tooltip appears; jsdom measures no overflow, so they probably cannot fail. The positive cases live in the Playwright suite.
- "should close the initial dropdown if the user moves away while animating": the panel has no animation.
- "should navigate by active descendant without a search field" asserts only the `@docs-private` `inSearchMode()` signal, not a highlight or focus.
- The comment in "should close the dropdown when using the CloseScrollStrategy" says `KbqDropdownModule` declares its own provider for `KBQ_DROPDOWN_SCROLL_STRATEGY`. The module has no providers; the token has a root factory.

**Behaviour without a test.** The spec states these from the source, or rests them on a test listed above that cannot fail:

- a second click on a top-level trigger closing the panel, Space on the trigger, and `openByArrowDown` set to `false`;
- `openedChange`, and the trigger on a disabled native button;
- no value in `closed` for an outside click, and a plain outside click without a backdrop closing the panel;
- a click on a group header, a divider or another non-item element of the content closing the whole chain, which may be unintended;
- Escape not propagating past the panel;
- repositioning on scroll with the default strategy;
- the item list scrolled to the top on opening;
- `kbqDropdownTriggerRestoreFocus` set to `false`, and Escape or the arrow key back returning focus to the trigger item of a panel without a search field;
- stopping at the ends without `navigationWithWrap`, and `navigationWithWrap` itself;
- a disabled item ignoring hover in a panel without a search field;
- `progress` leaving `aria-disabled` and `tabindex` alone, and an inactive action getting its `tabindex` back;
- Space on a nested trigger item, `kbq-dropdown__panel_nested`, and the shift of a nested panel that falls back on both axes;
- `safeArea: false` through `KBQ_DROPDOWN_DEFAULT_OPTIONS`;
- a nested panel of a search panel taking no focus on opening;
- the highlight and the missing `aria-activedescendant` of `activeDescendantNavigation`;
- the panel moving only on its next opening after a position input changes, and the `yPosition` error;
- the top-level fallback positions, `overlapTriggerX`, and the `offsetX` and `offsetY` inputs;
- `panelMaxWidth` and the 640 px cap of the width token;
- `kbqDropdownStaticContent`;
- the defaults of `KBQ_DROPDOWN_DEFAULT_OPTIONS` other than the position and overlap ones.
