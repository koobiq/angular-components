# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are `packages/components/timezone/` (the select, the option, the overflow tooltip directive, the pipes, the helpers and models, the templates, the three unit specs, `e2e.ts` and the Playwright spec), the parts of `kbq-select` it inherits (`packages/components/select/select.component.ts` and `select.html`, of which the timezone template is a fork), `KbqOption`, the highlight pipe, `kbqResolveTimezoneOffset`, the locale data and the locale overrides directive in `packages/components/core`, `KbqTooltipTrigger`, the `timezone.{en,ru}.mdx` pages, the three docs examples under `packages/docs-examples/components/timezone/` and the API golden file `tools/public_api_guard/components/timezone.api.md`. Every requirement was checked against the source; `openspec/specs/select/spec.md` already describes the select this component extends.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the entry point, and every scenario can be checked by an existing test or by hand.
- One place to diff against when timezone behaviour changes later, with the inherited select behaviour left to the `select` spec.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Internals: the forked template's structure, the placeholder bookkeeping, the tooltip's resize and content observers and their timings, the hidden-items measurer, CSS structure and design tokens.
- `kbq-select` behaviour that the timezone select does not change, beyond the umbrella requirement that points at the `select` spec.
- Changes to tests, docs or examples.

## Decisions

The general decisions follow the select baseline (`openspec/changes/archive/2026-10-21-document-select-baseline/design.md`): one capability at a flat path named after the entry point, English, the spec describes what ships with its quirks, only confirmed behaviour goes in, and public names, selectors, host classes, ARIA attributes, error messages and exported constants count as contract. The decisions below are specific to this component.

1. **Inherited behaviour is referenced, not restated.** `kbq-timezone-select` extends `KbqSelect` and inherits its inputs, outputs, host bindings and keyboard handling. Restating the 70 select requirements would make two specs drift apart on every select change. The spec has one umbrella requirement that points at the `select` spec and restates only what the timezone tests assert on their own or what differs from the select: the rejected multiple selection, the trigger and panel of the forked template, the `kbq-timezone-select-trigger` slot and the listbox without `aria-multiselectable`. Copying every select requirement was considered and rejected for the drift it invites.
2. **The helpers belong to the same capability.** `getZonesGroupedByCountry`, `promoteCountry`, `collapseOtherCountries`, `kbqResolveHostCountry`, the offset functions, `timezonesSortComparator` and `filterCitiesBySearchString` are exported from the same entry point, documented on the same page and used by every example to build the option list. A separate `timezone-data` capability was considered; it would split a change to the option's offset label from the helper that computes it.
3. **Time-dependent behaviour is written with fixed dates.** An offset resolved from an IANA id depends on the moment it is resolved. Scenarios name the date (15 January, 15 July), as the unit tests do with faked `Date`, so they stay true all year.
4. **Quirks stay in, for example:**
    - a zero offset is written `UTC00:00`, without a sign;
    - a search token that matches no city empties the city list of an option, even when the option matched on its city or offset;
    - `[value]` on a timezone option is ignored, and the option's `viewValue` input does not change its label;
    - multiple selection is rejected only at the first change detection.

## Risks / Trade-offs

- [A change to `kbq-select` changes the timezone select without touching this spec] → The umbrella requirement makes the dependency explicit. A select change that touches the template or the providers the timezone select re-declares also updates this spec through a delta; reviewers check the forked `timezone-select.component.html` against `select.html`, as its header comment asks.
- [The overflow tooltip depends on layout that jsdom does not have] → The unit tests stub the measured line count. tasks.md checks the tooltip by hand in `yarn run dev:timezone`.
- [Some requirements rest on the source rather than on a test] → tasks.md checks each of them by hand before archiving. A mismatch is corrected in the spec delta, not in the code.
- [A defect gets recorded as intended behaviour] → Suspected defects stay out of the spec and are listed under Findings, except the shipped quirks named in Decision 4.
- [The spec is long: 51 requirements, 93 scenarios] → It is grouped in the order of the docs page: the select and the option, the overflow tooltip, zone data and helpers, panel size, search, keyboard and accessibility, custom trigger, localization.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The "Search" section of `timezone.{en,ru}.mdx` says the search splits the query into words, trims it, ignores case and folds diacritics. The select does not filter at all; that is `createSearchPredicate` in the example. What the option does itself, narrowing its city list, ignores case but does not fold diacritics or split the query.
2. The docs page says grouping is done by "three pure helpers, so the same data produces the same list on the server and in the browser", and the JSDoc of `getZonesGroupedByCountry` says the same input gives the same groups "on any machine". Zones without `offset` are sorted by the offset they are on at `Date.now()`, and the country names are compared with `localeCompare` in the host's default locale.
3. The docs page says `KbqTimezoneOptionTooltip` shows "the full city list". With `highlightText` set, it shows the narrowed list.
4. The JSDoc of `offset()` promises a signed `±HH:MM`. A zero offset comes out unsigned (`00:00`), and a value written with a leading `+` (`+03:00:00`) comes out negative (`−03:00`).
5. The JSDoc of `parseOffset` says it converts a "formatted offset". It cannot read the negative offsets `offsetFormatter` writes, because they use U+2212: `parseOffset(offsetFormatter('-03:00:00'))` is `NaN`, with an "Unknown time zone" warning in dev mode.
6. The JSDoc of `KbqTimezoneSelect.ngOnInit` relies on `KbqSelect` refusing a later change of `multiple`. Neither class refuses a later change of `multiline` (see suspected defect 2).
7. `KBQ_TIMEZONE_LOCALE_CONFIGURATION` is `@docs-private`, yet the search example injects it to read `otherCountriesLabel`. The docs page mentions neither `otherCountriesLabel` nor `kbqTimezoneLocaleConfigurationProvider`.
8. The `timezone` input of the option is `@docs-private` (only the getter is documented), and `highlightText` has no description, although both are needed by every search example.
9. The keyboard section says typing letters "in the field or in the open menu" moves to the matching city. With a search field projected, typing in the open panel goes to the search; on a closed select typing selects the option rather than only moving to it.
10. `examples.timezone.{en,ru}.mdx` is the "Documentation in progress" stub, although three examples exist; `structure.ts` sets `hasExamples: false`, so the tab is not routed.

**Suspected defects (from reading the code, not reproduced)**

1. `KbqTimezoneSelect` re-declares the providers of `KbqSelect` but not `KBQ_PARENT_POPUP`. Tooltips inside its panel, including the overflow tooltip, do not get the "parent pop-up closed" signal that hides them in `kbq-select`.
2. `multiline` turned on after the first change detection is not rejected. The select then seems to handle keys, clicks and the value as in multiple selection (arrows open the panel, a click keeps it open, the value is reported as an array) while its selection model stays single.
3. A `kbq-timezone-option` without `[timezone]` throws while rendering: the template and `viewValue` read the city and offset of an undefined zone. The `value` getter falls back to `[value]` as if a missing zone were supported.
4. With `foldDiacritics`, the highlight folds diacritics but the city list is narrowed without folding, so an option found through a folded city (`zurich` for `Zürich`) shows an empty city list.
5. Offsets west of UTC are rendered with U+2212. A query typed with a hyphen-minus (`-03`) marks nothing in such an offset, although the search example normalizes the dash to find the zone.
6. Only the `<kbq-timezone-select-trigger>` element is a trigger slot. A `kbq-select-trigger`, as used with `kbq-select`, matches no slot and seems to be projected into the default slot, which is inside the option list.
7. An explicit `offset` written with a leading `+` is labelled as negative (see docs finding 4) but sorted as positive, so the label and the position in the list disagree.

**Tests whose name and body disagree, or that cannot fail**

- "should keep the selected option as the active one after click selection": the clicked option is the last enabled one, and Down from the first option skips the disabled one and lands on it too, so the value is the same whichever option is active.
- "should clear the selection when the control is reset" ends by checking that the second option is not selected; that option is disabled and was never selected. The trigger assertions before it do check the reset.
- "should not display the tooltip when option text fits within the visible-rows clamp" cannot fail in jsdom: jsdom measures no line boxes, so the list always "fits", the width it sets has no effect, and no time passes for the 400 ms enter delay.
- "should filter options by the search input value" asserts the test host's own filter; the select does no filtering.
- "should not attempt to open a select that does not have any options" checks only the moment after the click; the panel opens 101 ms later.
- "should show the search input when option count is at or above the threshold" tests 3 options against a threshold of 2; the "at" boundary is not tested.
- "should not re-assign its state when the measured line count is unchanged" (option spec) spies on the `disabled` setter, which the directive never calls: it records its state through `setDerivedDisabled`, so the spy stays silent whatever happens.

**Behaviour without a test.** The spec states these from the source:

- `[value]` ignored on a timezone option, a plain `kbq-option` inside the timezone select, and the option's `viewValue` input being ignored;
- the trigger value on one line, `ngModel`, and the `disabled` input (the Playwright states screenshot renders the last two without asserting them);
- the panel of an empty select appearing after 101 ms;
- the cleaner (rendered in a screenshot, never activated);
- `role="option"` and the host classes of the option, the combobox ARIA of the select, its `kbq-select` host class and the listbox without `aria-multiselectable`;
- the zero offset written `UTC00:00` and `parseOffset` returning `NaN`;
- `promoteCountry` matching the country case-insensitively, and `collapseOtherCountries` with an unknown country;
- the overflow tooltip: re-checking on a content change, the right-hand placement, pointer events passing through, showing on keyboard focus, hiding on pointer leave, and `kbqTooltipDisabled="false"` not forcing it;
- the highlight in the offset columns and the city, and `foldDiacritics`;
- the empty-search-result slot, and a query keeping the search visible below the threshold;
- the attribute form of `kbq-timezone-select-trigger` not being matched;
- `kbqTimezoneLocaleConfigurationProvider` and the `otherCountriesLabel` strings.
