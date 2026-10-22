# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are `packages/components/navbar/` (the two navbar components, the item, brand, toggle, divider and marker directives, their templates, the stylesheets where they decide what is visible or reachable, the unit spec, `e2e.ts` and the Playwright spec), the parts of `packages/components/core` the navbar relies on (the list and focus key managers, `kbqLeaveTabOrderOnTabOut`, the movement key helpers, `KbqOverlayLayerExclude`, the locale data and override mechanism), the dropdown trigger's key handling and `aria-expanded`, the `navbar.{en,ru}.mdx` and `examples.navbar.{en,ru}.mdx` pages, the docs examples under `packages/docs-examples/components/navbar/`, the dev app in `packages/components-dev/navbar/` and the API golden file `tools/public_api_guard/components/navbar.api.md`. Every claim in the spec was checked against the source. `openspec/specs/` has no navbar spec yet, and `openspec/config.yaml` sets no project context.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the navbar, and every scenario can be checked by an existing test or by hand in the dev app.
- One place to diff against when navbar behaviour changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Internals: the key manager, the measurement helpers, the item and rectangle bookkeeping, timers below what a user notices, and change-detection details.
- The behaviour of `kbq-dropdown`, `kbq-tooltip` and `kbq-button` beyond what a navbar changes about them.
- Visual styling, such as sizes and spacing, and design tokens other than `--kbq-navbar-z-index`, and the deprecated locale aliases.
- Changes to tests, docs or examples.

## Decisions

The general decisions follow the select baseline (`openspec/changes/archive/2026-10-21-document-select-baseline/design.md`): one capability at the flat path of the entry point, English, quirks described as they ship, only confirmed behaviour in the spec, and the same definition of what counts as contract. These are specific to the navbar:

1. **One capability for both navbar components and every part of them.** The horizontal and vertical navbar share the item, brand and divider directives, the focus model, the tooltip rule and the disabled state, and the toggle cannot exist outside a vertical navbar. Separate capabilities (`navbar/horizontal`, `navbar/vertical`, `navbar/toggle`) were considered and rejected: most changes, such as one to the roving focus or the tooltip rule, would touch several of them at once.
2. **Stylesheet behaviour counts where it decides what a user can see or reach.** The hidden title of a collapsed item, the toggle shown only on hover or keyboard focus, a disabled item ignoring the pointer, the compact brand title, the bento title reveal and the stacking order are in the spec, because a consumer relies on them as much as on a binding. Visual styling such as sizes and spacing is not.
3. **`@docs-private` members are not contract,** even though they are in the published typings: `updateExpandedStateForItems()`, `keyManager`, `focusableItems`, `measureWidths()`, `getCollapsibleWidth()` and the item's focus and blur subjects. Documented public members are: `KbqNavbarItem.collapsed` and `isCollapsed()`, `KbqNavbarFocusableItem.disabled`, `KbqVerticalNavbar.toggle()` and `expanded`.
4. **Other components only where the navbar changes them.** For a dropdown trigger item, the spec states the chevron, the keys that open it, the turned-off Down-arrow opening and the vertical placement; how the dropdown itself behaves belongs to its own spec. For tooltips, the spec states the `tooltipText` alias, the re-exposed inputs, the defaults and the automatic rule; the tooltip overlay does not.
5. **Two widths, two kinds of evidence.** jsdom has no layout, so the unit tests stub the widths for the collapse algorithm and the brand title; the Playwright spec is the only evidence that the real layout neither overflows nor flickers. Requirements about real layout cite the e2e tests in tasks.md.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/navbar` updates `openspec/specs/navbar/spec.md` with a delta, and reviewers check it the way they check the API golden file.
- [Some requirements rest on the source rather than on a test] → tasks.md checks each of them by hand in `yarn run dev:navbar` before archiving. A mismatch is corrected in the delta, not in the code.
- [The dev app renders no `kbqInput` field, no `kbq-form-field` and no `kbq-navbar-toggle` element] → those checks need a temporary edit of `packages/components-dev/navbar/template.html`, reverted before the final `git status` check.
- [Stylesheet behaviour differs between browsers] → it is checked in Chromium, which is what the e2e suite runs.
- [A defect gets recorded as intended behaviour] → Suspected defects stay out of the spec and are listed under Findings. Behaviour the spec does state can change later through `MODIFIED`.
- [The spec is long: 57 requirements, 92 scenarios] → It is grouped in the order of the docs page — structure and the horizontal navbar, the vertical navbar and its toggle, the brand and its long title — followed by what the page does not cover: tooltips, keyboard, disabled state, semantics, layering and localization.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. `examples.navbar.en.mdx` and `examples.navbar.ru.mdx` say to declare the templates inside `<kbq-navbar>` so that the navbar keeps managing "responsive collapsing of the items". The `navbar-template-outlet` example renders a `kbq-vertical-navbar`, which has no responsive collapsing.
2. The same pages say an icon without `kbqNavbarItemSuffix` "is shown before the title, wherever it is written". Only an icon written directly in the item is moved there. An icon wrapped in another element is rendered after the title, yet it still counts as the leading icon when the horizontal navbar decides what can collapse.
3. The JSDoc of `KbqNavbarItem.collapsed` says it "collapses the item regardless of what the ambient navbar decided". In a horizontal navbar the next fitting pass overwrites it. In a vertical navbar it changes `isCollapsed()`, the `aria-label` and the tooltip, but not the presentation, which follows the navbar's `kbq-collapsed` class. The member is also write-only: reading `item.collapsed` returns `undefined`.
4. The JSDoc of `collapsedText` on the item mentions only the tooltip of a collapsed item. It also replaces the title in the tooltip of a cut title and in the accessible name of a collapsed item.
5. The overview page says nothing about:
    - responsive collapsing, `collapsable` and `collapsedText`;
    - `disabled` and the tooltip inputs;
    - keyboard navigation and the `Ctrl` + `/` shortcut;
    - `aria-label` for the landmark and for icon-only items;
    - the toggle strings and `localeOverrides`.
6. `KBQ_NAVBAR_LOCALE_CONFIGURATION` and `KBQ_NAVBAR_DEFAULT_LOCALE_CONFIGURATION` each carry two JSDoc blocks. Only the last one, `@docs-private`, applies, so the tokens that the deprecation notes point to are hidden from the API tab and lose their description.
7. `updateExpandedStateForItems()` is `@docs-private`, yet it is the only way to re-fit a horizontal navbar whose own width changed without a window resize. The navbar dev app calls it through a `KbqNavbar`-typed view query that points at a `kbq-vertical-navbar`, from a method its template never calls.
8. The `exportAs` of the vertical navbar is `KbqVerticalNavbar` with a capital K, while items and brands use `kbqNavbarItem` and `kbqNavbarBrand`; `kbq-navbar` has none.

**Suspected defects (from reading the code, not reproduced)**

1. The vertical navbar passes every key except the vertical arrows and Tab to its key manager, including characters typed into a `kbqInput` field inside it. 200 ms after a letter that starts an item title, focus would jump from the field to that item. The horizontal navbar guards against this.
2. Outside a `kbqInput` field, both navbar components prevent the default action of the arrow keys, Home, End, PageUp, PageDown, Backspace and Delete. A plain `<input>`, or a field of another library, inside a navbar cannot delete text or move its cursor with these keys.
3. Only a projected `kbq-button` is taken out of the tab order. The control of a `kbq-form-field` keeps its tab stop, so Tab from an earlier item lands in it instead of leaving the navbar.
4. An item becomes active only when the item element itself receives focus. Clicking straight into a field inside an item leaves the previous item active, so Left and Right at the edges of the text move relative to that item.
5. The `[kbq-navbar-container]` attribute form is projected but gets no `kbq-navbar-container` class, because the directive selector matches only the element, so it loses the container layout and spacing.
6. The suffix and the dropdown chevron are rendered only while the item has a title: a suffix on an item without a title is dropped, and an icon-only dropdown item shows no chevron.
7. A brand on anything but `<a>` that is interactive by itself, such as `<button kbq-navbar-brand>`, is treated as decorative: it has `tabindex="-1"` and the arrow keys skip it, so it cannot be reached from the keyboard.
8. A disabled item does not cancel clicks; only `pointer-events: none` keeps the pointer away. A click dispatched by code or by assistive technology still runs its click handlers and follows its link, and Enter or Space on a disabled item that has focus clicks it. The disabled brand cancels them.
9. When the navbar widens, collapsed items are expanded starting from the last one, the same order they were collapsed in. A partial widening can expand a later item while an earlier one stays collapsed.
10. Only a window `resize` makes the horizontal navbar fit its items again. A navbar whose own width changes, for example when a sidebar beside it collapses, keeps overflowing or keeps items collapsed until the next window resize.
11. The `Ctrl` + `/` shortcut is caught on the window wherever focus is, text fields and code editors elsewhere on the page included. It does not prevent the default action and does not check Shift or Alt, so a page that uses the same keys for something else also toggles the navbar.
12. The horizontal key manager is fixed to left-to-right, and a vertical dropdown item opens on Right whatever the direction. In a right-to-left layout, Right moves focus to the item on the visual left.
13. `openOver` and `expanded` have no boolean transform. A bare `openOver` attribute passes `''`, which leaves the mode off, and fails type checking under strict templates.
14. In a vertical navbar, every tooltip refresh of an item or brand sets its placement to `right`, overriding a bound `kbqPlacement`.
15. The host's tab index counts every focusable element, enabled or not. A navbar whose only focusable elements are disabled or decorative keeps `tabindex="0"`, and tabbing into it leaves focus on the host.

**Tests whose name and body disagree, or that cannot fail**

- "items should not allow click if disable": the click handler of `TestApp` returns early for a disabled item, and jsdom ignores `pointer-events`, so the test passes whatever the navbar does.
- "a navbar item should stop the dropdown opening on Down Arrow" presses no key and asserts only the trigger's `openByArrowDown` flag. In a horizontal navbar the item opens the dropdown on Down itself; the fixture is a vertical navbar.
- "collapsed elements should have title" collapses the items itself and checks their tooltip content; it neither exercises the navbar's collapse nor checks a title.
- "RIGHT_ARROW key should pass event to keyManager" and "LEFT_ARROW key should pass event to keyManager" spy on the internal key manager; they pass whether or not focus moves.
- "ENTER should activate a bare item" and "SPACE should activate a bare item" use the literal key codes 13 and 32 although `ENTER` and `SPACE` are imported, and do not check that the default action is prevented.
- The `E2eHorizontalNavbarStates` and `E2eVerticalNavbarStates` fixtures mark items disabled with `class="kbq-disabled"`, so the disabled screenshots never go through the `disabled` input and carry no `aria-disabled`.

**Behaviour without a test.** The spec states these from the source:

- content outside a container not being rendered, and the `kbq-navbar-logo` and `kbq-navbar-divider` classes;
- the horizontal dropdown chevron and its absence on a vertical bento item;
- a width change without a window resize not re-fitting the items;
- `expandedChange` being emitted;
- the expanded navbar lying over the content with `openOver`, beyond the host class;
- the toggle's custom icon, its tooltip being placed to the right and hidden on toggle, and the toggle being hidden until the navbar is hovered or holds keyboard focus;
- the missing-provider error of a toggle outside a vertical navbar;
- the shortcut not preventing the default action;
- the bento title being revealed on hover, keyboard focus, `kbq-active` and `kbq-pressed`;
- `kbqTooltipDisabled` on a brand, and the tooltip defaults: hover only, no arrow, no offset, right placement in a vertical navbar;
- a projected `kbq-button` being taken out of the tab order;
- focus actually leaving the navbar on Tab and Shift+Tab, beyond the host's tab index;
- the arrow keys stopping at the ends, Up and Down doing nothing in a horizontal navbar, and Left and Right doing nothing in a vertical one;
- the default action of the navigation keys being prevented, and Home, End, PageUp and PageDown not moving focus;
- a click making a brand or a toggle element the active element;
- typeahead;
- Left and Right at the edges of a `kbqInput` field;
- focus moving into the control of a nested `kbq-form-field`;
- Down opening the dropdown of a horizontal item, Right opening that of a vertical item, and Down not opening it in a vertical navbar;
- a disabled item ignoring the pointer (the unit test cannot fail, see above);
- the `horizontal` orientation of a divider in a vertical navbar;
- the stacking order of the navbar, the open-over navbar and the toggle;
- `[localeOverrides]` on a vertical navbar.
