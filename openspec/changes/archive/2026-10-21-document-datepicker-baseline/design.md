# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are:

- `packages/components/datepicker/`: the `kbq-datepicker` component and its pop-up content, the `input[kbqDatepicker]` / `input[kbqCalendar]` directive, the toggle icon, the calendar, its header, month view and body, and the templates and styles where they define behaviour;
- the unit specs (`datepicker`, `calendar`, `calendar-header`, `month-view`, `calendar-body`), `e2e.ts` and `e2e.playwright-spec.ts`;
- `datepicker.{en,ru}.mdx` (the examples tab is a stub and `structure.ts` does not route to it) and the six examples under `packages/docs-examples/components/datepicker/`;
- the API golden file `tools/public_api_guard/components/datepicker.api.md`;
- what the component relies on elsewhere: the `DateAdapter` base in `@koobiq/date-adapter` (`sameDate`, `compareDate`, `compareDateTime`, `clampDate`), the Luxon adapter module, the locale files and `KbqLocaleOverridesDirective` in `core`, the pop-up constants and overlay layers in `core`, `kbq-form-field`, `kbq-icon`'s `autoColor` and the tooltip's sibling pop-up contract.

The select baseline (`openspec/changes/archive/2026-10-21-document-select-baseline/`) set the pattern; this change follows it.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the component, and every scenario can be checked by an existing test or by hand in the dev app.
- One place to diff against when datepicker behaviour changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Internals: the masking engine's private state, timers, change-detection details, CSS structure and design tokens.
- The date adapters themselves, `kbq-timepicker`, `kbq-form-field`, the filter-bar date pipes, and deprecated APIs.
- Changes to tests, docs or examples.

## Decisions

1. **The general decisions follow the select baseline.** One capability at a flat path (`datepicker`), English, the spec describes what ships with its quirks, only behaviour confirmed by a test or read directly in the source goes in, and the same list of what counts as contract: public inputs, outputs and methods, selectors, host classes, ARIA attributes, thrown error messages and exported constants.
2. **One capability for the whole entry point.** The datepicker, its input directive, the toggle icon and the calendar are covered together. Splitting off `datepicker/calendar` was considered and rejected: the calendar is reached through the datepicker, its range, filter and day classes come from the datepicker and the input, and a change to one of them nearly always touches the others. `KbqCalendarHeader`, `KbqMonthView` and `KbqCalendarBody` are public but are specified through the calendar they render, not as separate APIs. The standalone use of `KbqCalendar` with `input[kbqCalendar]`, found only in the filter-bar date pipes, gets one requirement.
3. **Typing is specified by what the field shows.** The masking engine is about 900 lines of the input directive. The spec states what a user sees: what is rejected, what completes a part, which part is selected next, how parts are clamped and how short years are read. It does not state how the text is parsed. Scenarios use the `dd.MM.yyyy` format of the `ru-RU` Luxon setup the tests run with.
4. **The missing keyboard access to the calendar is stated as shipped.** The focus model depends on it: focus stays in the input while the calendar is open, Tab closes it, and the calendar handles no keys on its days. A change that adds keyboard navigation will be a `MODIFIED` delta of "Calendar controls outside the tab order" and "Focus returns on close". The accessibility gap is also listed under Findings.
5. **Accidental-looking parsing results stay out of the spec.** The January month after a lone day, the month shift in year-first formats, and the model kept or cleared depending on the shape of unparseable text are listed under Findings. Rejecting the format's separator as typed text is stated, because it is consistent across formats and the e2e typing flow relies on digits only.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/datepicker` updates `openspec/specs/datepicker/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [Some requirements rest on the source rather than on a test] → tasks.md checks each of them by hand in `yarn run dev:datepicker` before archiving. A mismatch is corrected in the delta, not in the code.
- [A defect gets recorded as intended behaviour] → Suspected defects stay out of the spec and are listed under Findings. Behaviour the spec does state can change later through `MODIFIED`.
- [Typing rules depend on the format and the adapter] → The scenarios pin `dd.MM.yyyy` with Luxon. The placeholder and locale-switch scenarios name their locale. The Moment adapter is not covered.
- [The spec is long: 70 requirements, 122 scenarios] → It follows the docs page first: the field and its calendar, the disabled state, `required`, the date range and the time kept from the value. The parts the page does not cover come after it: typing, events, validation, the toggle, attributes and locale.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The JSDoc of `panelClass` promises classes for "the date picker panel" with "the same syntax as the `[class]` binding". The type is only `string | string[]`, and the classes land on the inner `kbq-calendar` element, not on the overlay pane.
2. The JSDoc of `yearSelected` and `monthSelected`, on `KbqDatepicker` and on `KbqCalendar`, refers to a "multiyear view" and a "year view". The calendar has only a month view, and both outputs fire from the header's year and month lists. The JSDoc of `KbqCalendar.activeDate` mentions keyboard navigation, which the calendar does not have.
3. The JSDoc of `dateInput` says it emits on an `input` event. The directive does not listen to `input`; it emits when typing, pasting or emptying the text changes the value to a different day. The JSDoc of `dateChange` mentions only the `change` event; it also fires for calendar picks and for Up/Down stepping.
4. The JSDoc of the input's `valueChange` says it emits on any change. It compares by day, so a write that changes only the time emits nothing.
5. The overview page presents `minDate` / `maxDate` as restricting the calendar only. They also bound Up/Down stepping in the input.
6. The `datepicker-inactive` example:
    - labels its second field "Read-only field with data", but disables it;
    - binds `[placeholder]="''"` on the first field, which the input treats as unset, so the locale placeholder still shows.
7. The `datepicker-range` example declares `minDate` and `maxDate` and never binds them; its two fields are not linked.
8. `labelMinRequiredCells` and `cellAspectRatio` of `KbqCalendarBody` are documented inputs with no effect: the blank cell renders whenever the first row is short, and the cell padding is hard-coded to `0`. The template comment says the blank cell is `aria-hidden`; it is not.
9. The calendar's single-input error names `KbqDatepicker`. The missing-input error reads "Attempted to open an KbqDatepicker".

**Suspected defects (from reading the code, not reproduced)**

1. The calendar cannot be used from the keyboard:
    - days, header buttons and the month and year select hosts have `tabindex="-1"`;
    - days handle no keys, and Tab in the input closes the calendar;
    - the toggle is not focusable: its icon has `tabindex="-1"`, and its host has neither `role` nor `tabindex`.

    Only the native `<button>` triggers of the month and year lists are focusable, which is inconsistent with the rest. The skipped unit test for Enter documents part of this.

2. ARIA gaps that no axe test covers:
    - the input has no `aria-haspopup`, `aria-expanded` or `aria-controls`;
    - `aria-expanded` sits on the toggle host, which has no role;
    - day cells have no `gridcell` role, `aria-selected` or `aria-disabled`;
    - the table has no accessible name.
3. A read-only input still opens from the toggle icon, which calls `open()` rather than `toggle()`. A day picked there writes the read-only input.
4. `monthSelected` and `yearSelected` seem to carry the previously shown date. The calendar re-emits its own `activeDate` before the header's `activeDateChange` has updated it.
5. Typing a lone first part after selecting the whole text:
    - in a day-first format, the month becomes January;
    - in a year-first format (`yyyy-MM-dd`), the month shifts back by one, because a 0-based month from the current value or today is passed where a 1-based one is expected.
6. Separators:
    - the format's own separator is rejected as typed text, while other punctuation after digits completes the part;
    - `onPaste` discards the result of a `replace()` meant to normalize separators.
7. An unusable `dateInput` format builds an `Error` that is never thrown.
8. The form control's `valueChanges` subscription stores the raw control value as the input's `value()`. An ISO string bound through `ngModel` stays a string (skipped unit test), and an invalid date is kept as is.
9. No `input` event is handled:
    - text deleted with Backspace or Delete reaches the model only on the next handled key or on blur;
    - Left, Right, Home and End are prevented and do nothing while the input has no value, so the caret cannot move in a partly typed empty field.
10. Unparseable text usually keeps the previous model value and only adds `kbqDatepickerParse`. Three groups of non-digits instead set the model to `null` on blur.
11. Calendar header:
    - its default minimum is February 1900 (`createDate(1900, 1)`), so January 1900 is out of reach;
    - when `minDate` and `maxDate` fall in the same year, the months after `maxDate` stay enabled in the month list;
    - it ignores a `minDate` or `maxDate` that becomes unset and keeps the old year list and button limits.

**Tests whose name and body disagree, or that cannot fail**

- "should emit VALID via statusChanges on blur" asserts that blur emits nothing.
- "should change selected year in calendar if input year is less than MIN": the typed 2014 is after `min` (2010), and the datepicker has no `minDate`. It checks that the year trigger follows the typed value.
- "should not reopen if the browser fires the focus event asynchronously" cannot fail:
    - it writes `_focusedElementBeforeOpen`, which the datepicker no longer has;
    - it focuses an input that already has focus, so no focus event fires.
- "clicking the currently selected date should close the calendar without firing selectedChanged" never checks that the calendar closed.
- "should reset the datepicker when it is closed externally": its comment promises a stubbed close scroll strategy that triggers a detachment. It clicks the body instead and repeats the outside-click test, so closing on detachment is untested.
- In the `a11y` block of `calendar.spec.ts`, two tests dispatch Enter on a body that handles no keys, so `selected` stays `undefined` whatever the code does:
    - "should not allow selection of disabled date in month view";
    - "should allow entering month view at disabled month", which also names a year view that does not exist.

    The `focus` events in its `beforeEach` do nothing.

- "places label in first row if space is available" (`calendar-body.spec.ts`) names a condition that `labelMinRequiredCells` never applies.
- "open non-touch should open popup" names a touch mode that does not exist.
- Three skipped tests document known defects: Enter in the calendar, ISO strings through `ngModel`, and the `de-DE` locale throwing in the adapter.

**Behaviour without a test.** The spec states these from the source:

- Tab closing the calendar, and `toggle()` ignoring a read-only input;
- `hasBackdrop` and `backdropClass`;
- the end-aligned fallback positions and the locked position;
- following page scroll, and a strategy provided through `KBQ_DATEPICKER_SCROLL_STRATEGY`;
- `panelClass` and the calendar element's `id`;
- `dateClass` bound on the datepicker (the month view test binds it directly);
- in the calendar header:
    - the current date button;
    - the month and year lists: their range, the disabled months, `monthSelected` and `yearSelected`;
    - the accessible names of the buttons;
- the weekday `aria-label`;
- letters and punctuation rejected with `incorrectInput`, and the validation tooltip;
- clamping of typed parts and short years read on blur;
- Up/Down stepping, Space, Right, Home, End, PageUp and PageDown;
- pasting text with letters or with separators other than the format's;
- writes from code emitting neither `dateInput` nor `dateChange`, and `valueChange` comparing by day;
- ISO strings for `[value]`, `min` and `max`;
- `disabledChange` and the blur on disabling;
- the input's `id`, `autocomplete`, `min` / `max` attributes and classes;
- the form field's type class and container click;
- the toggle's `aria-expanded`, its stopped click propagation, its own `disabled` and the muted sibling tooltip;
- `[localeOverrides]` on the input and on the datepicker;
- re-rendering on a locale or time zone change;
- `input[kbqCalendar]`, exercised only through the filter-bar date pipes.
