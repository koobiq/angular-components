# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/breadcrumbs/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/breadcrumbs`, and verify the breadcrumbs unit suite passes on the baseline commit
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/breadcrumbs` and verify the breadcrumbs e2e suite passes. It backs the `max` cap, the dropdown rows, the expand button hiding once everything fits, Shift+Tab out of the trail and Enter in a form field, and its screenshots show the sizes, wrap modes, first-item offset and disabled trail
- [ ] 1.3 For each requirement in `specs/breadcrumbs/spec.md`, name at least one unit or e2e test that asserts it. Verify that every requirement without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour by hand

Run `yarn run dev:breadcrumbs` (http://localhost:3003), which embeds the docs examples, for 2.1–2.4. Run `yarn run dev:e2e` (http://localhost:4200) and open `/E2eBreadcrumbsStateAndStyle` for 2.5. For 2.6, add the bindings to the dev app's template or module for the check only, and revert them before 3.2.

- [ ] 2.1 In the overview example, verify the routing and collapsing:
    - every entry's `href` carries the item's query parameters and fragment;
    - narrowing the window collapses the middle items first, starting after the first item, then the first item, never the last;
    - every collapsed list item has `aria-hidden="true"`;
    - the rows of the expand dropdown link to the same destinations;
    - nothing projected into a `kbq-breadcrumb-item` outside its template is visible
- [ ] 2.2 In the overview example, verify the keyboard:
    - Tab onto the trail focuses the first entry;
    - ArrowRight moves forward and wraps from the last reachable entry to the first;
    - Shift+ArrowRight does not move focus;
    - Home and End reach the first entry and the one before the current page;
    - ArrowDown still scrolls a scrollable page
- [ ] 2.3 In the overview example, verify how focus comes back:
    - after focusing the second entry, Tab out and Shift+Tab back, then verify focus lands on the second entry;
    - after a pointer press on the second entry, focus re-entering the trail lands on it too
- [ ] 2.4 In the "Truncation by Name Length" example, verify the tooltip:
    - hovering a clipped entry shows its full text below it, without an arrow;
    - hovering an entry that fits shows no tooltip
- [ ] 2.5 On `/E2eBreadcrumbsStateAndStyle`, verify in the DOM:
    - each row carries its `kbq-breadcrumbs_<size>` class;
    - the `wrap` row has `kbq-breadcrumbs_wrap` and wraps without an expand button;
    - the `none` row stays on one line without an expand button;
    - the rows with the offset have `kbq-breadcrumbs_first-item-negative-margin`;
    - the `max` 2 row shows only the last entry and the expand button;
    - default entries have the transparent style and the contrast color;
    - in the disabled row, the host has `tabindex="-1"` and a click on an entry does not navigate
- [ ] 2.6 With bindings added for the check, verify:
    - `[max]="1"` collapses nothing;
    - a trail without `max` caps five items at three plus the expand button;
    - `kbqBreadcrumbsConfigurationProvider({ max: null })` keeps the other defaults, and a bound `size` wins over a configured one;
    - `dir="rtl"` writes `dir` on the host and reverses the arrow keys;
    - `[loop]="false"` stops the arrow keys at either end;
    - a disabled or `current` collapsed item gives a disabled row or a row with `aria-current="page"`;
    - a one-item trail renders no expand button;
    - `[localeOverrides]` and the `en-US` locale rename the landmark and the expand button

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-breadcrumbs-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed

## Workflow follow-up

- Archive with `/opsx:archive document-breadcrumbs-baseline` once the checks pass. This creates `openspec/specs/breadcrumbs/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The `tabindex` written by `kbq-button` after re-enabling an entry, and the link nested in the dropdown row of a templated item, are the most user-visible ones.
