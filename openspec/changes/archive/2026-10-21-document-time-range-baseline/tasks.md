# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/time-range/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/time-range`, and verify the time-range unit suite and its snapshots pass on the baseline commit
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/time-range` and verify the time-range e2e suite passes. It backs the calendar pick, the seeded default range, the option labels, the placeholder class and the disabled-trigger requirements
- [ ] 1.3 For each requirement in `specs/time-range/spec.md`, name at least one unit or e2e test that asserts it. Verify that every requirement without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour in the dev app

Run each check in `yarn run dev:time-range` (http://localhost:3003; the script is in `package.json`), using the docs examples embedded there. Read and change a bound control from the browser console through `ng.getComponent(document.querySelector('time-range-overview-example')).control`. A check that needs an input the examples do not bind is made with a temporary local edit of that example, reverted before 3.2.

- [ ] 2.1 Verify the keyboard and focus rules in the overview example:
    - the trigger link has `role="button"` and `tabindex="0"`, and its wrapper has `aria-haspopup="dialog"` and `aria-expanded`;
    - Enter and Space open the popover, Space without scrolling the page;
    - focus moves into the popover and Tab keeps it there;
    - Escape and a click outside close the popover without changing the value
- [ ] 2.2 Verify the popover opens below the trigger, aligned to its left edge, with an arrow in the overview example and without one in the custom trigger example (`[arrow]="false"`)
- [ ] 2.3 Verify the applied values from the console in the overview example:
    - `lastHour` gives `{ type, startDateTime }` one hour back and no `endDateTime`;
    - `currentQuarter` gives the start of the quarter, and `allTime` gives no dates;
    - Apply with nothing changed still emits on the control's `valueChanges`;
    - checking another option without Apply leaves the time range's `value` as it was
- [ ] 2.4 Verify the manual range in the overview example: with no bounds, checking `range` shows the same time yesterday to now. In the min-max example verify:
    - the calendars offer only days in 2017;
    - clearing both `to` fields and pressing Apply marks both of them, keeps the popover open and moves focus to the `to` time field
- [ ] 2.5 Verify the custom trigger example: clicking the button opens the popover. Record whether the button's `kbq-active` class, bound to `context.popover.isOpen`, follows the open state, and add a finding to `design.md` if it does not
- [ ] 2.6 Verify the form-field example: a click on the field focuses the trigger control and opens the popover
- [ ] 2.7 Verify the custom option example with its `optionTemplate` and `titleTemplate` removed: the `q1` to `q4` options and the built-in trigger show no text, and applying `q1` gives that quarter's `startDateTime` and `endDateTime`
- [ ] 2.8 Verify from the console in the overview example:
    - `control.disable()` while the popover is open closes it;
    - `control.setValue({ type: 'last24Hours' })` fires `valueCorrected` with a computed `startDateTime` (with a temporary `(valueCorrected)` log)
- [ ] 2.9 Verify with temporary edits:
    - `[showRangeAsDefault]="false"` with `['lastHour', 'last24Hours']` shows only the two presets;
    - a `KBQ_CUSTOM_TIME_RANGE_TYPES` entry named `lastHour` with other units leaves the `lastHour` label unchanged;
    - in the empty type list example, a bound control holding `{ type: 'lastHour' }` at first render ends up with a `range` value, and `{ type: 'lastHour' }` written after the page has loaded keeps "последний час" on the trigger;
    - removing the overview example's `DateFormatter` provider logs the "No provider found for DateFormatter" error
- [ ] 2.10 Verify the localization: switching the dev locale selector to `en-US` changes the Apply and Cancel labels and the trigger texts, and a temporary `[localeOverrides]="{ timeRange: { editor: { apply: 'OK' } } }"` on one time range changes only its Apply button

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-time-range-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed

## Workflow follow-up

- Archive with `/opsx:archive document-time-range-baseline` once the checks pass. This creates `openspec/specs/time-range/spec.md`.
- Decide which Findings in `design.md` become changes of their own. Focus falling to `<body>` after the popover closes and the popover state sitting on a non-focusable wrapper are the most user-visible ones.
