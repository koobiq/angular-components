# Tasks

No source, test or docs file changes in this change. Every task checks the spec against the code. When a check disagrees, correct `specs/datepicker/spec.md`, not the code, and move the behaviour to the Findings in `design.md` if it looks like a defect. A temporary binding added to the dev app for a check stays uncommitted and is reverted before 3.2.

## 1. Check the spec against the existing tests

- [ ] 1.1 Run `yarn run styles:build-all`, then `npx vitest run packages/components/datepicker`, and verify the datepicker unit suites pass on the baseline commit, with only the three known skipped tests skipped
- [ ] 1.2 Run `yarn run e2e:docker yarn playwright test packages/components/datepicker` and verify the datepicker e2e suite passes. It backs the calendar position, the gap, typing digits only and the selected part kept in view
- [ ] 1.3 For each requirement in `specs/datepicker/spec.md`, name at least one unit or e2e test that asserts it. Verify that every requirement or part of one without such a test is listed under "Behaviour without a test" in `design.md`

## 2. Check code-only behaviour in the dev app

`dev:datepicker` exists in `package.json`. Run each check in `yarn run dev:datepicker` (http://localhost:3003), on the "Default datepicker toggle" field unless another is named. That field has `min`/`max` and `minDate`/`maxDate` from 5 June to 20 August 2024, a validation tooltip, and logs `onDateChange`, `onDateInput` and `selectedChanged` to the console. The docs examples are embedded above it.

- [ ] 2.1 Verify the keyboard around the calendar:
    - Tab in the input closes an open calendar and moves focus to the next field;
    - with `readonly` added to the input in devtools, Alt+Down and a click on the form field do not open the calendar;
    - a click on the toggle icon of that read-only field still opens it, as Finding 3 says
- [ ] 2.2 Verify typing in a field holding a date:
    - the A key inserts nothing, and the validation tooltip appears and hides about 3 seconds later;
    - `.` is rejected after a lone digit, while `/` after it completes the day;
    - text that becomes `15.13.2024` turns into `15.12.2024`;
    - `01.01.24` becomes `01.01.2024` on blur and `01.01.85` becomes `01.01.1985`;
    - a three-digit year leaves the field invalid once it loses focus
- [ ] 2.3 Verify the editing keys:
    - Up on the day of `31.01.2024` gives `01.01.2024`, and Up on its month gives `29.02.2024`;
    - each step logs `onDateChange` but not `onDateInput`;
    - Right, Home, End, PageUp and PageDown select the next, first and last parts;
    - Space over the selected day selects the month;
    - in an emptied field, Left and Right do nothing
- [ ] 2.4 Verify pasting:
    - `31/12/2009` becomes `31.12.2009` and makes the field invalid;
    - pasted text with letters shows the validation tooltip and is inserted as pasted
- [ ] 2.5 Verify the calendar header:
    - the year list holds only 2024, and the months before June are disabled, while September to December stay enabled, as Finding 11 says;
    - the current date button is disabled, because today is outside the range;
    - with the locale selector on `en-US`, the header buttons are named "Previous month", "Current date" and "Next month", and each weekday header has the full weekday name as `aria-label`
- [ ] 2.6 With temporary bindings on `myDatepicker1`, verify:
    - `hasBackdrop` renders a `cdk-overlay-transparent-backdrop` whose click closes the calendar;
    - `panelClass="dev-x"` lands on the `kbq-calendar` element, and the calendar element's `id` starts with `kbq-datepicker-`;
    - a `dateClass` returning a class for even days marks their cells;
    - `(monthSelected)` and `(yearSelected)` fire when a month or a year is picked, and the value does not change
- [ ] 2.7 Verify the overlay:
    - in a narrow window, with the field near the right edge, the calendar aligns to the field's end;
    - when the page scrolls, the open calendar follows the field;
    - with a temporary `KBQ_DATEPICKER_SCROLL_STRATEGY` provider returning a close strategy, a page scroll closes the calendar
- [ ] 2.8 Verify in the DOM:
    - the input has `autocomplete="off"`, an `id` starting with `kbq-datepicker-input-`, the classes `kbq-input` and `kbq-datepicker`, and `min` and `max` attributes in ISO 8601;
    - the form field has `kbq-form-field-type-datepicker`, and a click on its container outside the input focuses the input;
    - the "Disabled empty field" example's input has the `disabled` attribute and its toggle has `aria-disabled="true"`
- [ ] 2.9 Verify the toggle:
    - its host's `aria-expanded` follows the calendar;
    - a click on it opens the calendar once despite the field's own `(click)="myDatepicker1.toggle()"`;
    - with a temporary `kbqTooltip` on the toggle, the tooltip hides when the calendar opens and does not show while it is open
- [ ] 2.10 Verify writes and locale:
    - changing the time in the timepicker that shares the model re-renders the date without logging `onDateInput` or `onDateChange`;
    - switching the locale selector from `ru-RU` to `en-US` re-renders the value as `yyyy-MM-dd` and changes the placeholder;
    - a temporary `[localeOverrides]` with its own `datepicker.placeholder` on one input changes only that input's placeholder;
    - a temporary `[localeOverrides]` with its own `a11y.nextMonth` on its `kbq-datepicker` renames only that calendar's next-month button
- [ ] 2.11 Verify `input[kbqCalendar]`: in the custom period of a filter-bar date pipe (`yarn run dev:filter-bar`), a date typed into the "from" field is shown selected in the calendar under it

## 3. Final checks

- [ ] 3.1 Run `openspec validate document-datepicker-baseline --strict` and verify it reports the change as valid
- [ ] 3.2 Run `git status --short` and verify that nothing outside `openspec/` has changed

## Workflow follow-up

- Archive with `/opsx:archive document-datepicker-baseline` once the checks pass. This creates `openspec/specs/datepicker/spec.md`.
- Decide which Findings in `design.md` become changes of their own. The calendar's missing keyboard access and its ARIA gaps are the most user-visible ones. The read-only input opening from the toggle is the smallest fix.
