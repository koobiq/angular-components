# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are `packages/components/tabs/` (the group, tab, label, content, header, paginated header, label wrapper, body and nav bar sources and templates, the stylesheets where they decide behaviour, the four unit specs, `e2e.ts` and `e2e.playwright-spec.ts`), the `tabs.{en,ru}.mdx` and `examples.tabs.{en,ru}.mdx` pages, the examples under `packages/docs-examples/components/tabs/`, the API golden file `tools/public_api_guard/components/tabs.api.md`, and the pieces of other entry points tabs rely on: `KbqStateSaving` and `kbqOptionalNumberAttribute` in `core`, `KBQ_PARENT_ANIMATION_COMPONENT` and its consumer in `textarea`, the scroll strategy tokens of `select` and `dropdown`, and `KBQ_SCROLLBAR_OPTIONS`. Every claim in the spec was checked against the source; the select baseline sets the pattern this change follows.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the components, and every scenario can be checked by an existing test or by hand in the dev app.
- One place to diff against when tabs behaviour changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Internals: the `@docs-private` classes (`KbqTabHeader`, `KbqPaginatedTabHeader`, `KbqTabLabelWrapper`, `KbqTabBody`, `KbqTabBodyPortal`) beyond what the group and the nav bar expose through them, timers below what a user notices, change-detection details, and CSS structure and design tokens beyond the classes a consumer sets or tests against.
- The deprecated `KbqVerticalTabsCssStyler`.
- Changes to tests, docs or examples.

## Decisions

The general decisions of the select baseline apply unchanged: English, the spec describes what ships with its quirks, only behaviour confirmed by a test or read directly in the source goes in, and suspected defects stay out of the spec and go under Findings. The tabs-specific ones:

1. **One capability, `tabs`, for both the group and the nav bar.** They share the paginated header: pagination, drag scrolling, the keyboard, the underline and focus restoration come from one base class, so most changes to one touch the other. Separate `tab-group` and `tab-nav-bar` capabilities were considered and rejected for that reason. The path matches the `packages/components/tabs` entry point.
2. **The `@docs-private` header, label wrapper and body are described through the group.** Their public members (`scrollHeader()`, `updatePagination()`, `focusIndex`, `bodyPosition`, …) are reachable but marked as not for consumers, so the spec states what a user sees — arrows, focus, motion — not the member that produces it. A test of such a member counts as backing the behaviour it produces.
3. **User-noticeable constants are contract, internal ones are not.** The 650 ms hold delay, the 100 ms repeat, the 80% arrow step and the 4 px drag threshold are in the spec; the scroll-correction debounce, the change-detection throttle and the resize audit interval are not.
4. **Behaviour tabs impose on other components is in.** A tab closes the panels of selects and dropdowns on scroll, and the group drives the re-measure of a text area; both come from tabs code and change when tabs change.
5. **Ordered like the docs page**, then the examples page: content and selection, the states (vertical, underlined, disabled, empty, tooltips), scrolling, animation, keyboard and focus, accessibility, the nav bar, state saving.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/tabs` updates `openspec/specs/tabs/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [Some requirements rest on the source rather than on a test] → tasks.md checks each of them by hand before archiving. A mismatch is corrected in the spec, not in the code.
- [A defect gets recorded as intended behaviour] → Suspected defects stay out of the spec. Where the spec states a verified part of a suspicious path (Enter and Space have their default action prevented), the consequence is listed under Findings.
- [Selection quirks are now contract] → Selecting a disabled tab from code and an unknown `tabId` falling back to the first tab are stated as they ship, so a fix shows up as a `MODIFIED` delta.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The overview says a disabled tab "can't be selected", and the JSDoc of `KbqTab.disabled` says the same. Only the default selection, the pointer and the keyboard skip it; `selectedIndex` and `activeTab` select a disabled tab.
2. "Tabs and navigation" calls a nav bar "a navigation landmark by default". The directive adds no role: the landmark comes from the `<nav>` element the author puts it on, and a `<div kbqTabNavBar>` is none.
3. The vertical-icons section says to "add a tooltip for icons". `tooltipTitle` shows only on an `empty` tab or a truncated label, which the docs do not say; the example gets its tooltips by marking every tab `empty`, which also renders their labels in the empty style.
4. The JSDoc of `dynamicHeight` says the group "should grow to the size of the active tab". Judging from the styles, the content area already takes the active content's height without it, and the height the group pins during a switch has no CSS transition, so nothing animates. `dynamicHeight` is not on the docs pages.
5. The JSDoc of `animationDone` says it fires when "the body animation has completed". From the code, it also fires once on the first render, when the initially selected body is centered without any motion (not reproduced).
6. The JSDoc of `KbqTabsConfig.animationDuration` and of `animationDuration` asks for a CSS value; a bare number is accepted too and read as milliseconds.
7. The docs present `KbqTabNavBar` as the component for `routerLink` navigation, but no example uses `routerLink`: the nav bars either bind `tabNavPanel`, or, in `tabs-actionbar`, switch with a `(click)` handler on `<a>` elements without `href`.

**Suspected defects (from reading the code, not reproduced)**

1. In a nav bar without `tabNavPanel`, Enter on a link does nothing: the strip prevents the default action of Enter on any keydown inside it, and only the panel mode clicks the link itself. A `routerLink` or `href` link cannot be followed from the keyboard. In the `tabs-actionbar` example a keyboard user can focus a dashboard link but not switch to it.
2. The arrow keys ignore right-to-left layouts: Right always moves to the next tab in document order, which is drawn on the left. The key manager is configured with the direction, but the strip never passes keys to it.
3. Removing the selected tab from the middle of the list shows the tab that takes its index without emitting `selectedTabChange`, `selectedIndexChange` or `activeTabChange`, and leaves that tab's `isActive` `false`.
4. Adding or removing tabs keeps the selected tab at a new index without emitting `selectedIndexChange` or `activeTabChange`, so a `[(selectedIndex)]` or numeric `[(activeTab)]` binding is left on the old index. Binding that same old index afterwards then changes nothing.
5. With `activeTab` bound to a string, clicking a tab that has no `tabId` selects the first enabled tab instead of the clicked one and emits `null`.
6. Unbinding `tabNavPanel` at runtime leaves `role="tablist"` on the nav bar and `role="tab"`, `aria-selected` and `aria-controls` on the links: without a panel the attributes are read back from the element, and the panel mode wrote them there.
7. Holding a pagination arrow and releasing the button anywhere but on the arrow, while the pointer stays over the strip, keeps the strip scrolling to its end.

**Tests whose name and body disagree, or that cannot fail**

- "should default to the first tab" asserts index 1: the fixture binds `selectedIndex` to 1.
- "should keep exactly one tab in the tab order when the selected tab is disabled" uses a group whose disabled first tab is not selected; the default picks the enabled second tab, so the disabled-selected case is never reached.
- "should lazy load the second tab" checks only that the content exists after the tab is selected, never that it was absent before; it passes with eager content.
- "should select by number and assign number to …" (the first test of "with selection by activeTab input") reads `typeof selectBy` before the asynchronous `activeTabChange`, so it reads the number the test itself assigned.
- `KbqTabNavBar` "should change active index on click" asserts the test host's own `(click)` handler; no nav bar code is involved.
- "should not crash when setting the selected index to NaN" binds `NaN` through the input, whose transform turns it into `undefined`, so the group's own `NaN` guard is never reached.
- "nested KbqTabGroup with enabled animations" enables no animation; the duration stays at its `0ms` default.

**Behaviour without a test.** The spec states these from the source:

- a numeric string for `selectedIndex`; `activeTab` with an unknown id, with a function, and the number it emits after a click in number mode;
- selecting a disabled tab from code; a click on a disabled label in the group;
- the template label winning over `label`; `kbqTabContent` replacing the projected content and being destroyed when its tab is left;
- `selectedIndexChange` and `activeTabChange` arriving asynchronously, after `selectedTabChange`;
- Up and Down in a vertical group, the keys of the other orientation doing nothing, no wrap-around at the ends, keys with a modifier being ignored;
- the tab stop following keyboard focus, and moving to the first enabled label when the selected tab is disabled; the generated label and region id patterns;
- the strip scrolling back to its start once it fits, the 80% arrow step, press-and-hold with its timings and the ignored non-primary button, the re-check after label text changes;
- drag scrolling not starting on nested controls or with a non-primary button, and a new press stopping a coast;
- the bare-number `animationDuration`, the slide direction at the group level, and no motion with animations disabled;
- the host classes of `transparent`, `onSurface` and `dynamicHeight`, the label classes of `underlined`, `iconOnly` and `empty`, and the stretch and align classes (seen only in screenshots);
- an `empty` tab being selectable; the label tooltip's hover and focus triggers and its default `right` placement;
- the text area re-measure after `animationDone` (only the provider is tested);
- the `kbqTab`, `kbqTabNavBar` and `kbqTabLink` export names;
- select, tree-select and dropdown panels closing on scroll inside a tab;
- in the nav bar: the arrow keys, Home and End, a focused link becoming the arrow keys' starting point, Enter and Space clicking a link with a panel, Enter and Space prevented on a disabled link, author attributes kept without a panel, the panel `id` input, the first active link winning, the host classes other than the vertical one, and no state saving;
- in state saving: restoring after a key change, `saveState()`, selections assigned in code not being written, and the `KBQ_STATE_SAVING_ENABLED` default.
