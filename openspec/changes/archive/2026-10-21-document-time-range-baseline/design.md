# Design

## Context

See proposal.md for why. The spec describes `main` at `c9c196a9b`. Its sources are:

- `packages/components/time-range/`: the component, the editor and its template, the title, `kbq-time-range-title-as-control` and `kbqTimeRangeTitlePlaceholder`, the service, `constants.ts`, `types.ts`, the stylesheet, the unit spec with its snapshots, `e2e.ts` and the Playwright spec;
- the `timeRange` section of the locale data and its type in `packages/components/core`, the pop-up trigger and `kbqPopover`, `kbqLink`, `kbq-form-field` and the default `ErrorStateMatcher`;
- the range and duration formatting of `@koobiq/date-formatter`;
- the `time-range.{en,ru}.mdx` and `examples.time-range.{en,ru}.mdx` pages, the seven docs examples, the dev app and the API golden file `tools/public_api_guard/components/time-range.api.md`.

Every claim was read in the source or in a test before it went into the spec. The general approach follows the archived `document-select-baseline` change.

## Goals / Non-Goals

**Goals:**

- A contract a consumer can rely on: every requirement is observable from outside the component, and every scenario can be checked by an existing test or by hand in the dev app.
- One place to diff against when time-range behaviour changes later.

**Non-Goals:**

- Fixing anything found along the way (see Findings).
- Internals: the editor, title and service classes, the footer-to-editor bridge, timers, change-detection details, CSS structure and design tokens.
- The behaviour of the popover, datepicker, timepicker, radio and form field beyond what a time range wires up.
- Changes to tests, docs or examples.

## Decisions

1. **The general decisions follow the select baseline.** One capability at a flat path, `time-range`, matching the entry point. English. The spec describes what ships, quirks included, and holds only behaviour confirmed by a test or read in the source. Public inputs, outputs, tokens, selectors, host classes, ARIA attributes, thrown error messages and exported constants count as contract; private members do not.
2. **The editor and the title are described by behaviour, not by their API.** `KbqTimeRangeEditor` and `KbqTimeRangeTitle` are exported and listed in `KbqTimeRangeModule`, but they inject a service that only `kbq-time-range` provides, so a consumer cannot render them alone. The spec speaks of "the editor" and "the trigger" and does not name their inputs. `kbq-time-range-title-as-control` and `kbqTimeRangeTitlePlaceholder` are the exception: consumers place them in `titleTemplate` themselves.
3. **Inherited behaviour is in where the time range wires it.** Enter and Space, Escape, the outside click, focus moving into the popover, the ARIA on the trigger wrapper and the form-field classes come from `kbqPopover`, `kbqLink` and `kbq-form-field`. They are stated here because the time range sets them up and consumers rely on them. Placement fallbacks, scroll handling and animations stay with those components.
4. **Time is relative, locale strings are `ru-RU`.** Durations and the default range depend on the clock, so scenarios name moments relative to "now" or the fixed dates the tests use. Quoted strings are the `ru-RU` defaults, as in the unit snapshots.
5. **Quirks kept as they ship.** Examples:
    - a correction is not written back to the bound form control;
    - a preset's trigger label is computed from its stored `startDateTime`;
    - custom types with `translationType: 'other'` have empty built-in labels;
    - Apply is never disabled;
    - `range` is always the last option, wherever the list puts it;
    - with an empty option list any written type is kept.

    A baseline that already "fixed" these would hide the change that fixes them.

6. **The touched state of the internal editor control is left out.** Two unit tests assert it, but nothing a consumer can see depends on it; the bound form control is touched only when the popover closes.

## Risks / Trade-offs

- [The spec drifts from the code] → A change to `packages/components/time-range` updates `openspec/specs/time-range/spec.md` with a delta. Reviewers check it the same way they check the API golden file.
- [Behaviour owned by the popover, link or form field changes there] → A change to `kbqPopover` defaults, `kbqLink` or `kbq-form-field` that alters what a time range does needs a delta here too.
- [Some requirements rest on the source rather than on a test] → tasks.md checks each of them by hand in `yarn run dev:time-range` before archiving. A mismatch is corrected in the delta, not in the code.
- [A defect gets recorded as intended behaviour] → Suspected defects stay out of the spec and are listed under Findings. Behaviour the spec does state can change later through `MODIFIED`.
- [The spec is long: 59 requirements, 95 scenarios] → It is grouped in the order of the docs page: popover, trigger and options, manual range, applying, custom trigger and form field, bounds, custom options and DI, value correction and forms, disabled state, accessibility, localization.

## Findings

These are recorded, not fixed, in this change. Each can become a change of its own.

**Docs and JSDoc that disagree with the code**

1. "Empty value and value correction" lists three reasons for `valueCorrected`. A preset written without `startDateTime` is corrected and reported too, and `{ type: 'lastHour' }` is the form every docs example and the e2e page write. With an empty `availableTimeRangeTypes` any written type is kept, which the section does not say either.
2. The JSDoc of `availableTimeRangeTypes` says the options are offered "in order". `range` is always rendered last, wherever it sits in the list, and with `showRangeAsDefault` it is shown even when it is not listed.
3. "Providing presets through DI" says an entry can carry "a fixed `range` instead of a duration". Such an entry has `translationType: 'other'`, and both the default option label and the built-in trigger render it as empty text. The examples hide this behind their own templates.
4. "Selection restriction" says a `maxDate` at 23:59 makes the whole day available. The time fields include seconds (`HH:mm:ss`), so 23:59:01 to 23:59:59 are still rejected.
5. `KbqTimeRangeOptionContext` declares the duration units flattened onto the context, and `optionTemplate` is typed as a template of that context. At runtime the template gets `{ $implicit: … }`, and the units are nested under `units`.
6. In `types.ts` the JSDoc meant for `KbqCustomTimeRangeType` sits above `KbqTimeRangeUnits`. The golden file shows `KbqTimeRangeUnits` with that text and `KbqCustomTimeRangeType` as undocumented.
7. Exported but unusable:
    - `rangeValidator` takes the service, which the entry point does not export (a TODO in `constants.ts` already says so);
    - `KbqTimeRangeEditor` and `KbqTimeRangeTitle` are in `KbqTimeRangeModule` but throw outside `kbq-time-range`.
8. The docs pages do not say that a `DateAdapter` and a `DateFormatter` must be provided. Every example provides its own `DateFormatter`.
9. Custom types are not part of `KbqTimeRangeType`, so a list that includes them needs a cast (the custom range types example uses `as KbqTimeRangeType[]`).
10. Smaller things in the examples:
    - the examples tab calls the popover "a dialog";
    - the custom trigger example names its button with a fixed English `aria-label`.

**Suspected defects (from reading the code, not reproduced)**

1. When the popover closes, `kbqPopover` hands focus back to its host, the `kbq-time-range__trigger` wrapper. The wrapper is not focusable, so after Apply, Cancel or Escape focus probably falls to `<body>`.
2. The wrapper, not the focusable link, button or form-field control, carries `aria-expanded`, `aria-haspopup="dialog"` and `aria-controls`. The popover has no header and no `kbqPopoverAriaLabel`, so the panel has neither `role="dialog"` nor a name, although `aria-haspopup` promises a dialog.
3. `kbq-time-range-title-as-control` is focusable and named through `aria-labelledby` but has no role, and naming a generic element is prohibited. It also sets no `aria-invalid` or `aria-required`. The only axe test renders the editor, not the trigger.
4. Both fields of one end are named only by the end's prefix ("с" or "по"), so a screen reader cannot tell the time field from the date field.
5. With `showRangeAsDefault` on and `range` absent from `availableTimeRangeTypes`, the user can apply a manual range. Writing that value back, for example when it is restored from a URL, replaces it with the first type, because only listed types are kept.
6. With an empty `availableTimeRangeTypes`:
    - a preset such as `{ type: 'lastHour' }` written after initialization is kept, and the editor then opens with the range fields disabled and no option to switch them on;
    - the switch to `range` made once after initialization reaches the bound control as a user change, which marks it dirty, and is not reported through `valueCorrected`;
    - adding `[showRangeAsDefault]="false"` leaves the editor empty.
7. `valueCorrected` at initialization:
    - the component writes the control's value in `ngOnInit`, and the forms layer writes it again when it connects, so an initial value that needs correction is probably reported twice;
    - `ngModel` writes its value asynchronously, so under `nonNullable` a correction of `null` is probably reported before the model's own value arrives.
8. A type that neither the built-in set nor `KBQ_CUSTOM_TIME_RANGE_TYPES` knows fails with a bare `TypeError` (reading `units` or `translationType` of `undefined`) instead of a named error.
9. The built-in label of a duration preset is computed from the stored `startDateTime` to now:
    - a stale `startDateTime`, such as one restored from a URL, shows a different duration;
    - a `startDateTime` in the future or one that does not parse makes the date formatter throw while the trigger renders.
10. The `ru-RU` and `en-US` `durationTemplate.title.YEARS` use "# год" and "# year" for the singular, where every other unit says "последний" or "Last". A custom one-year preset reads "1 год" on the trigger.

**Tests whose name and body disagree, or that cannot fail**

- "should select first radio if availableTimeRangeTypes provided": the bound value is the first type as well, so the test cannot tell "the first option" from "the option of the value".
- "should disable the editor form together with the control": disabling closes the popover. The assertion holds only because the fake clock never runs the hide timer, so a user never sees a disabled editor.
- "should caption the bounds even with no preset option to hang them off" looks for a radio button inside the from/to block, which never holds one, so that assertion cannot fail.
- "should take focus from a click on its form field" does not check that the same click opens the popover, or where focus is once it has.
- "should check range as default if nothing provided" empties a bound list after initialization; "nothing provided" does not describe that.
- The `TestTimeRangeCustomOption` fixture carries the selector of the `time-range-custom-range-types-example` docs example.

**Behaviour without a test.** The spec states these from the source:

- opening with Enter and Space; Escape and an outside click closing the popover; focus moving into the popover and staying there;
- the popover placement and `arrow`;
- `showRangeAsDefault`;
- the default manual range without bounds ("yesterday to now");
- the empty labels of custom `'other'` types, on the trigger and in the options;
- the shape of applied presets (`startDateTime` only, the start of the quarter or year, no dates for `allTime`, a custom fixed range);
- Apply passing an unchanged value, the error of a wholly empty end after Apply, and focus moving to the first field at fault;
- `value` not following unapplied edits;
- a custom trigger opening the popover, and the `popover` and `formattedDate` properties of its context;
- the form-field container click opening the popover;
- the calendars limited to the bounds;
- a custom type with a built-in name being ignored;
- the missing `DateAdapter` or `DateFormatter` error;
- any written type kept when the list is empty, the switch to `range` once after initialization with an empty list, and `valueCorrected` for a preset written without `startDateTime`;
- disabling while the popover is open;
- the `role="button"` of the trigger link and the ARIA on the trigger wrapper;
- a rendered locale switch (the test reads the configuration, not the component) and `[localeOverrides]`;
- the `kbqTimeRangeTitlePlaceholder` class (covered only by an e2e screenshot).
