# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are `packages/components/overflow-items/` (`overflow-items.ts`, `module.ts`, the unit spec `overflow-items.spec.ts`, the Playwright spec `e2e.playwright-spec.ts` and its scenarios in `e2e.ts`), the `overflow-items.{en,ru}.mdx` and `examples.overflow-items.{en,ru}.mdx` pages, the six docs examples under `packages/docs-examples/components/overflow-items/`, the dev app in `packages/components-dev/overflow-items/`, the API golden file `tools/public_api_guard/components/overflow-items.api.md`, the `KbqOrientation` and `KbqFlexWrap` types in `packages/components/core`, and Angular's `numberAttribute`, `booleanAttribute` and content-query code where the directives depend on them. Every claim was checked against the source. The entry point has no deprecated sub-entry point.

All unit tests run in jsdom, where every element measures 0 px, so no unit test can make the container hide an item. The hiding itself is covered only by the Playwright spec, whose fixtures use fixed pixel sizes, `flex-shrink: 0` and `box-sizing: border-box`.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the directives, and every scenario can be checked by an existing test or by hand.
- One place to diff against when overflow-items behaviour changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Internals: the shared base class, private members, the RxJS pipeline and the measuring helpers.
- The components that build on the directives (`kbq-breadcrumbs`, top-bar layouts) and their styles.
- Changes to tests, docs or examples.

## Decisions

The general decisions follow the select baseline (`openspec/changes/archive/2026-10-21-document-select-baseline/design.md`): a flat capability path named after the entry point, English, the spec describes what ships with its quirks, only confirmed behaviour goes in, and the same list of what counts as contract. The decisions below are specific to this component.

1. **One capability for three directives.** `kbqOverflowItem` and `kbqOverflowItemsResult` do nothing without a `kbqOverflowItems` container, and every requirement involves the container. Splitting them was rejected.
2. **Scenario numbers come from the e2e fixtures.** Each pixel size and count in a scenario is the one a Playwright test asserts, so a scenario maps to a test without recomputing. The fixtures use `flex-shrink: 0` and `box-sizing: border-box`; the scenarios inherit those assumptions.
3. **Inline styles are contract.** The container writes `display`, `position`, `overflow`, `flex-grow`, `flex-direction` and `flex-wrap` as inline styles, and hidden elements get inline `visibility` and `position`. A consumer cannot override them with class styles, and they decide layout, so the spec states them. The shared base class is not named; its members (`hidden`, `hide()`, `show()`, `element`) are described as members of the item and the result element.
4. **Only the triggers that exist go into the spec.** The spec lists what makes the container recalculate. Inputs whose changes do not trigger a recalculation (`wrap`, `order`, `alwaysVisible`, the item value) look like defects, so they are listed under Findings rather than written down as intended behaviour.
5. **The direct-child rule is stated.** Items nested in another element are not managed. This follows from the content query the container uses, not from a test, and it is the first thing a consumer trips over, so it is in the spec and checked by hand in tasks.md.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/overflow-items` updates `openspec/specs/overflow-items/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [The measuring requirements rest on Playwright only] → jsdom cannot measure, so tasks.md runs the e2e suite in Docker, where the baselines and fonts match CI.
- [Some requirements rest on the source rather than on a test] → tasks.md checks each of them by hand in `yarn run dev:overflow-items` before archiving. A mismatch is corrected in the delta, not in the code.
- [A defect gets recorded as intended behaviour] → Suspected defects stay out of the spec and are listed under Findings. Behaviour the spec does state can change later through `MODIFIED`.
- [Exact counts depend on fixture CSS] → Each scenario names the sizes it assumes; a consumer with shrinkable items, gaps or borders gets different counts (see Findings).

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The JSDoc of `changes` says it "emits when the set of hidden items changes". It emits a new set after every recalculation, also when the hidden items are the same; a unit test relies on that.
2. The overview page calls the entry point a "component" that adapts "to the container width". It is three directives, and in the vertical orientation the height counts.
3. "Order of hiding" and the JSDoc of `order` do not say the direction: the item with the highest order is hidden first, the lowest first with `reverseOverflowOrder`. Nor do they say that an item without `order` takes its index, so explicit values compete with indices; the example works around it with `±Infinity`.
4. The `@title` of the `overflow-items-with-order` example is "Overflow items result offset".
5. The ResizeObserver section talks about the browser window being resized. The container observes itself and `document.body`, not the window, and binding `additionalResizeObserverTargets` replaces `document.body` instead of adding to it, which the page does not say.
6. These have no place in the overview page:
    - `kbqOverflowItemsResult`, `hiddenItemIDs` and `changes`, which appear only inside the examples;
    - `wrap`, which appears only on the examples tab;
    - the inline layout styles the container forces on its host;
    - the rule that items must be direct children of the container;
    - that items should not shrink: every test fixture sets `flex-shrink: 0`, and because rendered sizes are measured, shrinkable items are squeezed before any is hidden (not reproduced).
7. `ElementVisibilityManager` is in the public API golden file without the `Kbq` prefix the conventions require. It is marked `@docs-private` but can be imported.

**Suspected defects (from reading the code, not reproduced)**

1. The available space is the container's border-box size minus its padding. Its borders are not subtracted, so a bordered container (every docs example has a 1 px border) overestimates the space by the border widths, and the last visible item can be clipped.
2. A CSS `gap` between items is not counted, so with a gap the visible items can overflow the container and be clipped.
3. Changing `wrap`, `order`, `alwaysVisible` or an item's `kbqOverflowItem` value does not trigger a recalculation. An item that is hidden and then made always visible stays hidden, and `hiddenItemIDs` keeps a stale ID, until something else triggers one.
4. Only the container and the resize targets are observed. An item or the result element that changes size on its own (new text, late content, a font loading) does not trigger a recalculation. The e2e test of `additionalResizeObserverTargets` changes the result width together with the target and relies on the target.
5. `[order]="null"` or `[order]="undefined"` goes through `numberAttribute` and becomes `NaN`, not `null`. The item then does not fall back to its index, the sort comparator returns `NaN`, and the processing order is unspecified. A non-numeric string does the same.
6. `show()` removes the inline `visibility` and `position` of the element, including values the consumer set, for example through a `[style.position]` binding on an item.
7. Before the first recalculation, and for good on the server, every item and the result element are shown, so the result reads "and 0 more" and the row overflows until the browser recalculates.
8. Duplicate `kbqOverflowItem` values collapse in the set, so a counter built on `hiddenItemIDs().size` shows too few items. The JSDoc asks for unique values, but nothing warns.

**Tests whose name and body disagree, or that cannot fail**

- The two `sortItemsByOrder` tests pass their items already in the expected order, so they also pass if sorting is removed. Both call a private method with hand-made objects.
- "should recalculate hidden items without kbqOverflowItemsResult and emit hidden IDs" wraps the trigger in `expect(...).resolves.not.toThrow()`. On a promise that resolves to `undefined` that assertion returns without checking anything; only a rejected promise would fail it. In jsdom nothing is hidden, so the "hidden IDs" are always an empty set.
- "should keep hiddenItemIDs empty before first recalculation and update after resize": the "update" is a new empty set object; nothing can be hidden in jsdom.
- "should render result" only checks that the result element is an `HTMLDivElement`.
- The `orientation` and `reverseOverflowOrder` tests spy on the private `getHiddenItems` and count calls; they do not check the outcome.
- "should reflect the set emitted by changes output" emits on the output by hand and does not go through a recalculation.
- The e2e "should recalculate hidden items on resize when debounceTime is configured" does not observe the delay; it also passes with `debounceTime` 0.
- The e2e "should prevent hiding item with alwaysVisible attribute when reverseOverflowOrder is enabled (vertical orientation)" checks only the first visible item, not how many are visible.
- `e2e.playwright-spec.ts:163` keeps a change-history comment about a Karma copy-paste bug.

**Behaviour without a test.** The spec states these from the source:

- an item nested inside another element is not managed, and only the first result element is used;
- a plain `kbqOverflowItem` attribute gives a string ID, and the set holds the item values in processing order (no test checks the IDs of a real recalculation);
- the inline `display`, `position`, `overflow`, `flex-grow` and `flex-direction` of the container;
- the hidden state of the result element: `aria-hidden`, inline styles;
- the result element staying shown when only always-visible items are left and the content still overflows;
- the first recalculation running asynchronously with `debounceTime` 0;
- binding `additionalResizeObserverTargets` replacing `document.body`;
- `hide()` and `show()` on the result element, and the next recalculation overwriting a state set by hand;
- every item and the result element shown before the first recalculation;
- the server rendering every item and the result element shown.
