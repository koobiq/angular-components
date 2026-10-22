# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are:

- `packages/components/timepicker/`: the directive, the constants, the module, `timepicker.spec.ts`, `e2e.ts` and `e2e.playwright-spec.ts`, `timepicker.{en,ru}.mdx` and the examples tab;
- the docs examples under `packages/docs-examples/components/timepicker/` and the dev app in `packages/components-dev/timepicker/`;
- the API golden file `tools/public_api_guard/components/timepicker.api.md`;
- the pieces of `packages/components/core` the directive relies on: the keycode helpers, `ErrorStateMatcher` and `KbqErrorStateTracker`, the locale data and `KbqLocaleOverridesDirective`, the validation tooltip delays, `KbqDateTimezoneService`;
- how `kbq-form-field` reads a `KbqFormFieldControl`;
- the base and Luxon date adapters in `node_modules/@koobiq/date-adapter`, `node_modules/@koobiq/luxon-date-adapter` and `packages/angular-luxon-adapter`, which the unit tests use;
- the timepicker tests in `inline-edit.spec.ts`, which read `value()` and rely on focus marking the control touched.

Every claim was checked against the source. The `select` baseline set the pattern this change follows.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the directive, and every scenario can be checked by an existing test or by hand in the dev app.
- One place to diff against when timepicker behaviour changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Internals: private members, the regular expressions and helper steps that implement parsing, timers below what a user notices, CSS and design tokens.
- The behaviour of `kbq-form-field`, `kbqTooltip` and the date adapters beyond what the timepicker drives through them.
- `kbq-datepicker`, `kbq-time-range`, `kbq-inline-edit` and the filter-bar date pipes, which compose the timepicker.
- Changes to tests, docs or examples.

## Decisions

The general decisions of the `select` baseline apply unchanged: English, quirks described as they ship, only confirmed behaviour in the spec, suspected defects kept out of it, and the same rule for what counts as contract. The decisions below are specific to the timepicker.

1. **One capability, `timepicker`, at a flat path.** It holds the directive and the constants of the entry point. Splitting typing, the keyboard and validation into separate capabilities was rejected: they all go through the same text-to-time parsing, so a change to one usually touches the others.
2. **The keyboard is described by parts, not characters.** The docs table speaks of moving the caret by one character and of placing it before the first or after the last digit. The code selects whole parts (hours, minutes, seconds). The spec follows the code; the docs wording is listed under Findings.
3. **Parsing is stated as rules, not regular expressions.** `HOURS_MINUTES_SECONDS_REGEXP` and its siblings are exported, but the spec states what text forms a complete time, how parts are clamped and how a separator is handled. A change that keeps the rules but rewrites the expressions should not need a delta.
4. **Quirks stated as they ship.** Examples:
    - Backspace and Delete do not update the value until the next parsed key or blur;
    - in `HH:mm` format the seconds of a value read from text come from the previous value or from the current time;
    - gaining focus already marks the control touched;
    - Left, Right, Up and Down do nothing special while the field has no value.

    The pasted `12:xx am` rule is stated for the time of day only, because the date then moves by a day (Findings).

5. **Adapter-dependent behaviour is stated through the adapter.** The value is "a date of the adapter", and `min` and `max` compare with `compareDateTime`, which includes the date and milliseconds. Scenarios use the Luxon adapter, as the unit tests do. The Moment adapter may differ where an hour of 24 is passed to it.
6. **Form-field and tooltip behaviour only where the timepicker drives it.** The spec states what the timepicker reports to `kbq-form-field` (`empty`, `focused`, `disabled`, `required`, `errorState`, the `kbq-form-field-type-timepicker` class, the container click) and what it does to a bound `kbqValidationTooltip`. How the form field or the tooltip renders that belongs to their own specs.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/timepicker` updates `openspec/specs/timepicker/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [Some requirements rest on the source rather than on a test] → tasks.md checks each of them by hand in `yarn run dev:timepicker` before archiving. A mismatch is corrected in the delta, not in the code.
- [A defect gets recorded as intended behaviour] → Suspected defects stay out of the spec and are listed under Findings. The quirks of decision 4 are in the spec on purpose, so that a fix shows up as a `MODIFIED` delta.
- [The parsing rules depend on timing] → Typed text is read on a timer after the key and the part selection lands on another one. The scenarios describe the settled state, which is what the tests assert.
- [The spec has 43 requirements and 76 scenarios] → It is grouped in the order of the docs page: structure and formats, typing, arrows, validation, keyboard table, attributes, then forms, form field, tooltip, time zone and constants.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. The keyboard table says Left and Right move the caret by one character. The code selects the whole previous or next part, and only when the field has a value.
2. The keyboard table says Home and Page Up place the caret before the first hour digit, and End and Page Down after the last part. The code selects the hours or the last part.
3. "Entering symbols and digits" says a symbol typed after two digits is ignored. The code rejects it and emits `incorrectInput`, which shows the validation tooltip.
4. The Space row says Space after two digits moves to the next part. Reading the code, typing two digits already selects the next part, and Space then moves one part further.
5. "How it works" says time can only be entered in 24-hour format. A paste accepts `h:mm am` and `h:mm pm`.
6. "Validation of copied values" says text dropped with drag and drop is validated as it is entered. There is no drop handler: dropped text is read only on the next parsed key or on blur.
7. "How it works" says only a colon is inserted after two digits. The code rewrites the text as a full time, with `00` in the missing parts.
8. "Design and animation" says the right padding is always 16 px. `timepicker.scss` uses `--kbq-timepicker-size-padding-right`, which design tokens do not define, falling back to `--kbq-size-s` (8 px).
9. The JSDoc of `min` and `max` speaks of the earliest and latest time. The comparison uses the whole date and time, down to milliseconds.
10. These public names do not match their meaning:
    - `kbqTimepickerLowerThenMin` and `kbqTimepickerHigherThenMax` misspell "than";
    - `HOURS_PER_DAY`, `MINUTES_PER_HOUR` and `SECONDS_PER_MINUTE` hold the largest value of a part (23, 59, 59), not a count.
11. `incorrectInput` has no JSDoc. `hasSelection` carries a TODO in the source saying nothing uses it.
12. The examples tab (`examples.timepicker.{en,ru}.mdx`) is a "documentation in progress" stub, while the overview embeds all three examples.
13. The English overview lacks the structure and design images of the Russian one.
14. The overview and variations examples set the Russian tooltip text "Только цифры" on the English page as well.

**Suspected defects (from reading the code, not reproduced)**

1. A time typed into an empty field takes its milliseconds, and in `HH:mm` format often its seconds, from the current time. Typing exactly the `max` of the validation example, a whole hour, then fails `kbqTimepickerHigherThenMax` while the field shows the maximum.
2. Pasted 12-hour times have these problems:
    - `12:xx pm` becomes hour 24, which the Luxon adapter rolls over to `00:xx` of the next day;
    - `12:xx am` also lands on the next day (the unit test checks only the time);
    - hours 13 to 19 are accepted with `am`/`pm`;
    - `1:30PM` without the space is read as 01:30.
3. Pasted text without digits, or with more than three groups of digits, is written into the input as is. The value stays as it was, and nothing re-validates the control, so no `kbqTimepickerParse` error appears.
4. Without a form control, clearing the text and leaving the field reports `null` to nobody: `value()` keeps the previous time while the input is empty.
5. The arrow keys act on the last parsed value, not on the text. With `12:3` typed over `12:18`, Up shows `12:19` and drops what was typed.
6. `value()` takes the bound control's raw `valueChanges` without reading them through the date adapter. A control holding an ISO string leaves `value()` a string, and the arrow keys then compute an invalid date. The subscription is never unsubscribed.
7. Gaining focus marks the control touched. With the default matcher, a required empty timepicker therefore reports its error as soon as it is focused, before the user has typed anything.
8. A time zone change while the field has no value renders empty text over what the user has half typed.

**Tests whose name and body disagree, or that cannot fail**

- "Should ignore SPACE keyDown" dispatches a key event without `key`. It would pass without the Space handler.
- "Manual keyboard input digit-by-digit" asserts the text the test itself wrote. The directive does not listen to the `input` event it dispatches.
- "should emit VALID via statusChanges on blur": `VALID` comes from `setValue`; the blur part only asserts that nothing new is emitted.
- "Should invalidate time lower then min-time after typing while focused and blurring" pastes instead of typing. The paste alone makes the control invalid.
- "Paste am/pm from clipboard: 10:30 Pm" pastes `10:30 pm` in lower case.
- "Paste am/pm from clipboard: 12:3 aM" asserts only the time, so the day it moves by goes unnoticed.
- The two "should call errorStateMatcher and NOT update errorState on blur" tests (`ShowOnFormSubmitErrorStateMatcher`, `ShowOnControlDirtyErrorStateMatcher`) blur without a focus first. That does not touch the control, so they would pass with the default matcher too.
- The comment in "should call errorStateMatcher and update errorState on blur" says the control is touched only on a focus-to-blur transition. Focus alone touches it.
- The `HH:mm` tests with a `null` value check the value only up to the minutes. The seconds and milliseconds taken from the current time are not pinned.

**Behaviour without a test.** The spec states these from the source:

- the error thrown without a `DateAdapter`;
- a bound `placeholder`, the fallback to the exported placeholder map, `[localeOverrides]` and `kbqTimepickerLocaleConfigurationProvider()`;
- rejected letter and symbol keys, `incorrectInput` from a real key press, and the separator typed through a key press (the tests set the text and read it on the timer);
- in `HH:mm` format, ignoring pasted seconds and keeping the previous ones;
- Right and the wrap-around of Left and Right; Home, End, Page Up and Page Down;
- Space (its test cannot fail);
- Backspace and Delete not updating the value, and blur reporting `null` for empty text;
- padding and clamping of pasted text (only full times are pasted in the tests);
- `min` and `max` on another day, unreadable bounds ignored by the validators, and the error payloads;
- the `size`, `autocomplete` and `id` attributes, the `kbq-input` and `kbq-timepicker` classes, and the `kbq-form-field-type-timepicker` class;
- disabling through the form control, and losing focus state when disabled;
- focus alone marking the control touched (only `inline-edit.spec.ts` relies on it);
- the form-field container click;
- the 10 ms show delay, the 3,000 ms hide and no second show while the tooltip is open;
- the time zone change;
- `value()` and `viewValue` (read only in `inline-edit.spec.ts`);
- the values of `HOURS_PER_DAY`, `MINUTES_PER_HOUR` and `SECONDS_PER_MINUTE`.
