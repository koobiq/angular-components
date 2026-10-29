# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/timezone/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/timezone`, and verify the select, option and helper unit suites pass on the baseline commit
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/timezone` and verify the timezone e2e suite passes. It backs the footer, viewport edge, scrollbar and search narrowing requirements
- [ ] 1.3 For each requirement in `specs/timezone/spec.md`, name at least one unit or e2e test that asserts it, or a `select` requirement whose test covers the inherited behaviour. Verify that every requirement without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour in the dev apps

`yarn run dev:timezone` exists in `package.json` and serves the three docs examples on http://localhost:3003. The cleaner, `ngModel`, the `disabled` input and an empty select are only in the e2e scenarios: run `yarn run dev:e2e` (http://localhost:4200) and open `/E2eTimezoneStates`.

- [ ] 2.1 Verify in the DOM of the overview example:
    - the select host has the class `kbq-select`, `role="combobox"` and `aria-haspopup="listbox"`;
    - while the panel is open it has `aria-expanded="true"` and an `aria-controls` equal to the id of the `listbox`, which has no `aria-multiselectable` attribute;
    - each option has `role="option"` and the classes `kbq-timezone-option` and `kbq-option`;
    - the trigger shows the selected zone on one line, cut with an ellipsis when it does not fit
- [ ] 2.2 Verify the overflow tooltip in the overview example, after narrowing an option in the developer tools until its city list wraps past three lines:
    - hovering the option then shows the tooltip to the right of it, with the offset, the city and the whole city list;
    - a click on the option under the tooltip selects that option;
    - moving to the clamped option with the arrow keys shows the tooltip, and leaving it with the pointer hides it
- [ ] 2.3 Verify in the search example:
    - typing `Kaz` marks the match in the city list of Moscow, and typing `+03` marks it in the offset column while the city lists stay whole;
    - typing `Moscow` leaves the city line of that option empty;
    - a query that matches nothing shows "Nothing found" inside the option list;
    - a query is gone after the panel is closed and reopened
- [ ] 2.4 Verify in `/E2eTimezoneStates`:
    - the cleaner of the first select clears it and shows the placeholder;
    - the select bound with `[disabled]="true"` has `tabindex="-1"` and does not open;
    - the `ngModel` select shows its zone;
    - in the browser console, `ng.getComponent(<empty select>).open()` leaves `panelOpen` `false` at once and `true` about 100 ms later

## 3. Check helper and option behaviour that no dev app shows

Write these checks into a scratch spec, for example `packages/components/timezone/baseline-check.spec.ts`, run it with `npx vitest run packages/components/timezone/baseline-check.spec.ts`, and delete it before 4.2.

- [ ] 3.1 Verify that `offsetFormatter('00:00:00')` returns `UTC00:00` and that `parseOffset('not-an-offset')` returns `NaN`
- [ ] 3.2 Verify that `promoteCountry` matches `RU` against a group with `countryCode: 'ru'`, and that `collapseOtherCountries` with an unknown country puts every zone into the one labelled group
- [ ] 3.3 Verify on a rendered select that:
    - a timezone option bound with both `[value]="'other'"` and `[timezone]` reports the zone id as its value;
    - its `viewValue` input does not change its `viewValue`;
    - a plain `kbq-option` among the timezone options can be selected
- [ ] 3.4 Verify that `highlightText` set to `zurich` with `foldDiacritics` marks `Zürich` in the city label (and note whether a zone that lists `Zürich` among its other cities keeps it in the list, suspected defect 4), and that an element with the attribute `kbq-timezone-select-trigger` does not replace the trigger value
- [ ] 3.5 Verify that `kbqTimezoneLocaleConfigurationProvider({ searchPlaceholder: 'Where?' })` changes the placeholder of a projected search, and that `otherCountriesLabel` is "Other countries" under `en-US`

## 4. Final checks

- [ ] 4.1 Run `openspec validate document-timezone-baseline --strict` and verify it reports the change as valid
- [ ] 4.2 Run `git status --short` and verify that nothing outside `openspec/` has changed

## Workflow follow-up

- Archive with `/opsx:archive document-timezone-baseline` once the checks pass. This creates `openspec/specs/timezone/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The missing `KBQ_PARENT_POPUP` provider and the `+` offset labelled as negative are the most user-visible ones.
