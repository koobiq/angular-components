# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are:

- `packages/components/breadcrumbs/`: the component, its template and styles, the types, the two roving-focus directives and their helpers, the unit spec, `e2e.ts` and the Playwright spec, and the `breadcrumbs.{en,ru}.mdx` and `examples.breadcrumbs.{en,ru}.mdx` pages;
- the docs examples in `packages/docs-examples/components/breadcrumbs/`;
- the API golden file `tools/public_api_guard/components/breadcrumbs.api.md`;
- the parts of other entry points the trail is built from: `kbqOverflowItems` (collapsing), `kbq-button` (disabled state, `tabindex`, style and color seams), `kbq-dropdown` (the expand dropdown), `kbq-title` (the tooltip) and the `a11y` locale section with `KbqLocaleOverridesDirective` in `core`.

Every claim was checked against the source before going into the spec. The general pattern comes from the archived `document-select-baseline` change.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the trail, and every scenario can be checked by an existing test or by hand in the dev app.
- One place to diff against when breadcrumbs behaviour changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Internals: class and method names, the roving-focus bookkeeping, timers, change-detection details, CSS structure and design tokens.
- The roving-focus directives `rdxRovingFocusGroup` and `rdxRovingFocusItem` used on their own. They are exported but marked `@docs-private`.
- The behaviour of `kbqOverflowItems`, `kbq-dropdown`, `kbq-button` and `kbq-title` beyond what a trail exposes through them.
- Changes to tests, docs or examples.

## Decisions

1. **The general decisions follow the select baseline.** One capability at the flat path `breadcrumbs`, matching the entry point. The spec is in English. It describes what ships, quirks included. Only behaviour backed by a test or read directly from the source goes in. Suspected defects and unsupported docs claims go to Findings.
2. **Keyboard behaviour is specified through the trail, not through the roving-focus directives.** The trail applies them itself and exposes three of their inputs: `dir` and `loop` on `kbq-breadcrumbs`, and `focusable` on `kbqBreadcrumb`. The rest of their public surface is `@docs-private`, so the spec leaves it out:
    - the outputs `entryFocus` and `currentTabStopIdChange`;
    - the inputs `orientation`, `active`, `tabStopId`, `allowShiftKey` and `preventScrollOnEntryFocus`;
    - the registration methods.

    Rejected alternative: a second capability for the roving focus. Its only consumer is this trail, so the two would always change together.

3. **Borrowed behaviour is stated as the trail exposes it.** The spec states these only as far as the trail shows them:
    - the collapse order and the hidden state from `kbqOverflowItems`;
    - the rows from `kbq-dropdown`;
    - the disabled entry from `kbq-button`;
    - the tooltip from `kbq-title`.

    Their own rules belong to their own specs. A change there that alters what the trail shows still needs a delta here.

4. **What counts as contract.** These count:
    - the inputs of `kbq-breadcrumbs`, `kbq-breadcrumb-item` and `kbqBreadcrumb`;
    - the selectors `kbqBreadcrumbView` and `kbqBreadcrumbsSeparator`;
    - `KBQ_BREADCRUMBS_CONFIGURATION` and `kbqBreadcrumbsConfigurationProvider`;
    - the host classes `kbq-breadcrumbs`, `kbq-breadcrumbs_<size>`, `kbq-breadcrumbs_wrap`, `kbq-breadcrumbs_first-item-negative-margin` and `kbq-disabled`;
    - the classes `kbq-breadcrumb-item`, `kbq-breadcrumb__expand` and `kbq-breadcrumb__separator`, which tests and consumers select on;
    - the ARIA attributes and the `a11y.breadcrumbs` and `a11y.expandBreadcrumbs` locale keys.

    The wrapper classes (`kbq-breadcrumbs__list`, `kbq-breadcrumb-item__container`), the overflow-item classes and the `data-*` attributes of the roving focus do not count.

5. **Quirks the spec states as they ship.** A baseline that already "fixed" them would hide the change that fixes them:
    - the expand button takes one `max` slot;
    - a `max` below 2 applies no cap;
    - `max` is ignored outside `auto` mode;
    - the last default entry is disabled;
    - a `kbqBreadcrumbView` entry bypasses the trail's `disabled`, the item's `disabled` and `current`, and the current-page state of the last item.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/breadcrumbs` updates `openspec/specs/breadcrumbs/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [Some requirements rest on the source rather than on a test] → tasks.md checks each of them by hand in `yarn run dev:breadcrumbs` before archiving. A mismatch is corrected in the spec, not in the code.
- [Borrowed behaviour changes in another entry point without a delta here] → Decision 3 names the four entry points involved. A change to collapsing, dropdown rows, disabled buttons or the title tooltip is checked against this spec too.
- [A defect gets recorded as intended behaviour] → Suspected defects stay out of the spec and are listed under Findings. Behaviour the spec does state can change later through `MODIFIED`.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The keyboard table says Tab moves focus to the first item. Focus returns to the entry that last had focus, and goes to the first entry only when none has.
2. The keyboard table says Enter and Space activate an item. Default entries are `<a>` elements, and neither the trail nor `kbq-button` turns Space into a click. As read from the source, Space scrolls the page instead of following the link. This is not reproduced.
3. The "Disabled State" section and the JSDoc of `disabled` say every item stops navigating and leaves the tab order. Entries rendered from a `kbqBreadcrumbView` template are not disabled. The item's own `disabled` likewise reaches only default entries and dropdown rows.
4. The "Accessibility" section says the last item is marked `aria-current="page"`, and the JSDoc of `current` says the last item is current regardless of the input. Both hold only for default entries. A templated last item gets no `aria-current`, and `current` on a templated item affects only its dropdown row. The custom-template examples set `aria-current` themselves.
5. The JSDoc of `max` says it is the maximum number of visible items. The expand button takes one of the slots, so `max - 1` items stay visible. A value below 2 applies no cap. `wrap` and `none` ignore `max`. The docs page explains the slot but not the other two.
6. The JSDoc of `text` says the text is shown when the item is hidden in the dropdown. The docs page says the dropdown rebuilds collapsed items from `text` and `routerLink`. Both are true only for items without a `kbqBreadcrumbView` template. The row of a templated item renders the template.
7. The JSDoc of `size` says it affects the font size. `compact` also changes the entry height and the expand button padding.
8. The "Line Breaks" section never names `wrapMode` and never shows `none`. Its "No Line Break Mode" heading shows an example with `wrapMode="auto"`.
9. `breadcrumbs-dropdown-example.ts` has the title "Breadcrumbs sizes".
10. Two examples nest a button inside a link: `breadcrumbs-truncate-by-abbrev-items` and `breadcrumbs-truncate-center-items` place a `<button kbq-button kbqBreadcrumb>` inside an `<a routerLink>`. Docs examples are expected to pass axe, which reports `nested-interactive` for such markup. This is not reproduced.
11. "Truncation by Name Length" says the name is cut after the first 14 characters. Its example cuts the entries at a width of 124 px.

**Suspected defects (from reading the code, not reproduced)**

1. `kbq-button` and the roving focus both bind `tabindex` on every entry, and each writes only when its own value changes. Suppose an entry goes from disabled to enabled, because the trail's or the item's `disabled` is turned off. The button then writes `tabindex="0"`. The roving value is still `-1`, so it does not write back. The entry looks to stay an extra Tab stop until it gains and loses focus.
2. A collapsed item whose template holds an `<a kbq-button kbqBreadcrumb>` is rendered inside the row's `<a kbq-dropdown-item>` in the expand dropdown. That is a link inside a link. The custom-template example and the unit fixture both do this. No axe test opens the dropdown.
3. `kbqBreadcrumb` injects the trail's roving-focus group without `optional`. Used outside `kbq-breadcrumbs`, it throws a dependency-injection error, and no docs say it needs a trail.
4. Before the first overflow measurement, the expand button has no hidden state yet. That measurement runs in a zero-delay timer after the render. A trail with nothing to collapse may show the button for a frame.
5. A disabled default entry keeps the `href` from its `routerLink`; only `click` and the activation keys are halted. A middle click or "open in new tab" still follows it. This includes the last entry, which always renders disabled.

**Tests whose name and body disagree, or that cannot fail**

- "should not set max-width when max more than actual items": the trail never sets an inline `max-width`, so the test cannot fail.
- "should apply the disabled state correctly to specific breadcrumb items" checks the last item. That item is disabled whatever its own `disabled` says, so the test would pass if the item input stopped working.
- "should not modify focusableItems when fewer than two items are registered": the name and its comment describe an effect returning early with fewer than two items. The body checks that a lone last item is not registered.
- "should render all items inside the overflow container when max is exceeded": its first assertion compares the fixture's own array with `max`. The cap itself is not asserted; the "max changes" tests cover it. The test also keeps a comment about the earlier Karma version.
- "should open dropdown on ArrowDown if item is Dropdown trigger" dispatches an event that carries only `keyCode`. The roving handler reads `key`, so it never sees an arrow key. The test does not show that the trail leaves ArrowDown alone.
- "should apply the size class to the breadcrumbs container" binds `normal`, which is also the default. It covers neither the default path nor the other sizes.

**Behaviour without a test.** The spec states these from the source, or from the screenshots only:

- the destination of default entries and dropdown rows, including `queryParams` and `fragment`;
- item content outside a `kbqBreadcrumbView` template being hidden;
- a click on a disabled entry not navigating;
- the transparent style and contrast color that `kbqBreadcrumb` applies by default (screenshots only);
- the collapse order by width, and `aria-hidden` on collapsed entries;
- the default `max` of 4, and a `max` below 2 applying no cap;
- the `disabled` and `aria-current` states of dropdown rows;
- the classes `kbq-breadcrumbs_compact`, `kbq-breadcrumbs_big`, `kbq-breadcrumbs_wrap` and `kbq-breadcrumbs_first-item-negative-margin`, and the rendering of `wrap` and `none` (screenshots only);
- the tooltip of a clipped entry;
- no expand button in a trail of fewer than two items;
- `tabindex="-1"` on the host when no entry is reachable (the tests check only the registered set);
- focus returning to the entry that last had focus, and pointer focus;
- arrow-key movement in left-to-right, wrapping with `loop`, `loop` set to `false`, Home and End movement, ignored modifier keys, and ArrowUp and ArrowDown not prevented;
- the `dir` input;
- `kbqBreadcrumbsConfigurationProvider` merging over the defaults, and a bound input winning over it;
- `[localeOverrides]` and switching the locale at runtime.
