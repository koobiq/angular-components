# Spec Delta

## Purpose

Describes what `input[kbqTimepicker]` from `@koobiq/components/timepicker` guarantees to consumers: how it renders a time in one of two formats, how users type, paste and step the time with the keyboard, how the value and the validation errors reach Angular forms, and how it works with `kbq-form-field`, the validation tooltip, the locale and the time zone.

## ADDED Requirements

### Requirement: Directive on a native input

The timepicker SHALL apply to an `input` element with the `kbqTimepicker` attribute, SHALL be exported to templates as `kbqTimepicker`, and SHALL give the input the classes `kbq-input` and `kbq-timepicker`. `KbqTimepickerModule` SHALL export the directive together with `KbqFormFieldModule`, so a template that imports only the module can use `kbq-form-field`.

#### Scenario: Module import

- **WHEN** a component imports `KbqTimepickerModule` and renders `<kbq-form-field><input kbqTimepicker /></kbq-form-field>`
- **THEN** the template compiles and the input has the classes `kbq-input` and `kbq-timepicker`

### Requirement: Date adapter is required

The timepicker MUST throw an error that starts with `KbqTimepicker: No provider found for DateAdapter.` when it is created without a `DateAdapter` provider. The value it holds SHALL be a date of that adapter.

#### Scenario: No adapter

- **WHEN** a timepicker is created in an injector that provides no `DateAdapter`
- **THEN** creating it throws the `No provider found for DateAdapter` error

### Requirement: Time formats

The `format` input SHALL accept `TimeFormats.HHmm` (`HH:mm`) and `TimeFormats.HHmmss` (`HH:mm:ss`) and SHALL default to `HH:mm`. Any other value, `null` or `undefined` SHALL fall back to `HH:mm`, and `format()` SHALL report the format in effect.

#### Scenario: Default format

- **WHEN** no `format` is bound
- **THEN** `format()` is `HH:mm`

#### Scenario: Unsupported format

- **WHEN** `format` is bound to `'Hourglass'`
- **THEN** `format()` is `HH:mm` and the value is rendered as `HH:mm`

### Requirement: Rendering the value

The input SHALL show the value as text in the active format, with two-digit hours from 00 to 23, two-digit minutes and, in `HH:mm:ss`, two-digit seconds. A `null` or invalid value SHALL render as empty text.

#### Scenario: Full format

- **WHEN** the value is 12:18:28 and `format` is `HH:mm:ss`
- **THEN** the input shows `12:18:28`

#### Scenario: Short format

- **WHEN** the value is 12:18:28 and `format` is `HH:mm`
- **THEN** the input shows `12:18`

### Requirement: Changing the format

When `format` or the active locale changes, the timepicker SHALL re-render the current value in the new format. When there is no complete value, it MUST leave the text in the input as it is, so partially typed text survives the change.

#### Scenario: Switching formats

- **WHEN** the value is 00:00:00 and `format` changes to `HH:mm:ss` and then back to `HH:mm`
- **THEN** the input shows `00:00:00` and then `00:00`

#### Scenario: Partially typed text

- **WHEN** the input holds the incomplete text `1` and `format` changes to `HH:mm:ss`
- **THEN** the input still shows `1`

### Requirement: Placeholder

The input SHALL have a `placeholder` attribute. A bound `placeholder` input SHALL be used as is; without one, the placeholder SHALL be the localized pattern of the active format, `чч:мм` for `HH:mm` and `чч:мм:сс` for `HH:mm:ss` in the default `ru-RU` locale. When the localized string is empty, the `ru-RU` pattern from the exported placeholder map SHALL be used.

#### Scenario: Default placeholder

- **WHEN** no `placeholder` is bound and `format` is `HH:mm`
- **THEN** the input has `placeholder="чч:мм"`

#### Scenario: Full format placeholder

- **WHEN** no `placeholder` is bound and `format` is `HH:mm:ss`
- **THEN** the input has `placeholder="чч:мм:сс"`

#### Scenario: Custom placeholder

- **WHEN** `placeholder` is bound to `Start time`
- **THEN** the input has `placeholder="Start time"` whatever the format and locale

### Requirement: Localized placeholder

The localized placeholder SHALL follow the active locale, under the keys `timepicker.placeholder.short` and `timepicker.placeholder.full`. `kbqTimepickerLocaleConfigurationProvider()` and the `[localeOverrides]` input SHALL override any of these strings, the input for one timepicker only, while the keys left out keep following the locale.

#### Scenario: Switching the locale

- **WHEN** the application switches the locale to `en-US`
- **THEN** the placeholder of an `HH:mm` timepicker becomes `hh:mm` and that of an `HH:mm:ss` timepicker becomes `hh:mm:ss`

#### Scenario: Overriding one timepicker

- **WHEN** a timepicker binds `[localeOverrides]` with its own `timepicker.placeholder.short`
- **THEN** only that timepicker shows the overridden placeholder

### Requirement: Typed text is parsed after each key

After a key the browser inserts into the input, the timepicker SHALL read the text on the next task. Text that forms a complete time — two-digit hours, optionally followed by two-digit minutes and two-digit seconds, with or without colons — SHALL become the value, SHALL be reported to the bound form control, and SHALL be rewritten in the active format.

#### Scenario: Typing a full time

- **WHEN** `format` is `HH:mm:ss` and the text becomes `18:08:08` through a key press
- **THEN** the value and the bound model are 18:08:08

#### Scenario: Hours alone, clamped

- **WHEN** `format` is `HH:mm:ss` and the text `24` is typed
- **THEN** the input shows `23:00:00` and the value is 23:00:00

### Requirement: Incomplete text is kept

Text that does not form a complete time, such as a single hour digit or a single minute digit, SHALL stay in the input as typed, unless clamping changed it. It MUST NOT change the value or notify the form, except that empty text SHALL report `null` to the bound form control.

#### Scenario: Single minute digit

- **WHEN** the text `12:3` is typed
- **THEN** the input still shows `12:3`

#### Scenario: Single hour digit

- **WHEN** the text `1` is typed
- **THEN** the input still shows `1`

### Requirement: Caret moves to the next part

When typing produces a complete time, the timepicker SHALL select the part one character past the caret — the next part when the caret is at the end of a part — so that the user can type over it, and SHALL scroll the input so that the selected part is visible. When the caret is in the last part, that part SHALL stay selected.

#### Scenario: Hours typed

- **WHEN** `format` is `HH:mm:ss`, the caret is after the second hour digit and the text is parsed
- **THEN** the minutes are selected and scrolled into view

### Requirement: Typed time keeps the date

A time read from typed or pasted text SHALL keep the year, month, day and milliseconds of the current value. When there is no value, they SHALL come from the adapter's current date and time.

#### Scenario: Editing an existing value

- **WHEN** the value is 12:18:28 on 1 February 1970 and `10:10:10` is pasted into an `HH:mm:ss` timepicker
- **THEN** the value is 10:10:10 on 1 February 1970

#### Scenario: Empty field

- **WHEN** the bound form control is `null`, the current date is 1 January 2020, and `18:09` is typed
- **THEN** the form control holds 18:09 on 1 January 2020

### Requirement: Seconds in the short format

In `HH:mm` format, a time read from text that has hours and minutes, including text completed on blur, SHALL keep the seconds of the current value, or take the current seconds when there is no value, and MUST ignore seconds present in the text. Typed text with hours only SHALL give zero seconds. Pasted text in 12-hour form SHALL give zero seconds in either format.

#### Scenario: Pasting seconds into the short format

- **WHEN** the value is 12:18:28 and `10:10:10` is pasted into an `HH:mm` timepicker
- **THEN** the value is 10:10:28 and the input shows `10:10`

### Requirement: Up and Down arrows step a part

Up and Down without a modifier SHALL prevent the key's default action and, when there is a value, increase or decrease by one the part under the caret: hours when the caret is at or before the first colon, minutes up to the second colon, seconds after it. A part SHALL wrap within its range (23 to 00, 00 to 59) without changing the other parts or the date. The new value SHALL be reported to the form and the stepped part selected. Without a value the keys MUST do nothing.

#### Scenario: Hours wrap upward

- **WHEN** the value is 23:00:00 and the user presses Up with the caret in the hours
- **THEN** the input shows `00:00:00` and the date is unchanged

#### Scenario: Minutes wrap downward

- **WHEN** the value is 23:00:00 and the user presses Down with the caret in the minutes
- **THEN** the input shows `23:59:00`

#### Scenario: Empty field

- **WHEN** the field has no value and the user presses Up
- **THEN** nothing changes

### Requirement: Rejected keys

A letter key (A to Z) pressed without Ctrl or Cmd SHALL be prevented and SHALL emit `incorrectInput`. Any other key that produces a single non-digit character, except Space, SHALL be prevented and SHALL emit `incorrectInput` unless it follows a single digit of a part, where it is handled as a separator.

#### Scenario: Letter

- **WHEN** the user presses the `A` key in the field
- **THEN** no character is inserted and `incorrectInput` fires

#### Scenario: Colon after a complete part

- **WHEN** the input shows `12:00` and the user types `:` after the hours
- **THEN** the text is unchanged and `incorrectInput` fires

### Requirement: Separator after a single digit

A single digit followed by a non-word character, such as `:`, `.`, `-`, `*` or a space, SHALL be turned into that digit with a leading zero, and the character SHALL be dropped. The result SHALL then be parsed like typed text.

#### Scenario: Hours with a separator

- **WHEN** `format` is `HH:mm:ss` and the text becomes `1*`
- **THEN** the input shows `01:00:00`

#### Scenario: Minutes with a separator

- **WHEN** `format` is `HH:mm:ss` and the text becomes `01:1*:10`
- **THEN** the input shows `01:01:10`

### Requirement: Out-of-range parts are clamped

When the text holds only digits and colons, hours above 23 SHALL become 23, minutes and seconds above 59 SHALL become 59, and a part longer than two digits SHALL be reduced to two digits, before the text is parsed. This SHALL also apply to incomplete text, so digits typed in front of a part cannot make it grow.

#### Scenario: Minutes above the maximum

- **WHEN** `format` is `HH:mm:ss` and the text becomes `23:99`
- **THEN** the input shows `23:59:00`

#### Scenario: Incomplete text with long hours

- **WHEN** the text becomes `911:1`
- **THEN** the input shows `23:1`

#### Scenario: Digits typed repeatedly in front

- **WHEN** the input shows `11:1`, the caret is at the start and the user presses `9` ten times
- **THEN** the input still shows one or two digits on each side of the colon

### Requirement: Pasting a time

A paste SHALL be handled by the timepicker instead of the browser. Up to three groups of digits in the pasted text SHALL be read as hours, minutes and seconds, each padded to two digits, missing ones taken as `00`, and clamped as typed text is. The result SHALL replace the text, become the value and be reported to the form.

#### Scenario: Full time

- **WHEN** `format` is `HH:mm:ss` and `19:01:08` is pasted
- **THEN** the bound model is 19:01:08

#### Scenario: Pasting into an empty field

- **WHEN** the bound form control is `null`, the current date is 1 January 2020, `format` is `HH:mm:ss` and `19:01:02` is pasted
- **THEN** the form control holds 19:01:02 on 1 January 2020

### Requirement: Pasting a 12-hour time

Pasted text of the form `h:mm am` or `h:mm pm`, with one space before `a`, `am`, `p` or `pm` in any case, SHALL be read as a 12-hour time: `pm` SHALL add 12 hours, `am` SHALL keep the hours, and 12 `am` SHALL become hour 00.

#### Scenario: Afternoon

- **WHEN** `07:15 pm` is pasted
- **THEN** the value is 19:15:00

#### Scenario: Short suffix

- **WHEN** `11:3 p` is pasted
- **THEN** the value is 23:03:00

#### Scenario: Midnight hour

- **WHEN** `12:3 aM` is pasted
- **THEN** the value's time is 00:03:00

### Requirement: Minimum and maximum time

When `min` is set and the control's value is earlier, the timepicker SHALL report `kbqTimepickerLowerThenMin` with `{ min, actual }`. When `max` is set and the value is later, it SHALL report `kbqTimepickerHigherThenMax` with `{ max, actual }`. The comparison SHALL use the whole date and time, down to milliseconds, not the time of day alone.

#### Scenario: Earlier than the minimum

- **WHEN** the value is 12:18:28 and `min` is 13:59:00 on the same day
- **THEN** the input is invalid with `kbqTimepickerLowerThenMin`

#### Scenario: Later than the maximum

- **WHEN** the value is 12:18:28 and `max` is 11:00:00 on the same day
- **THEN** the input is invalid with `kbqTimepickerHigherThenMax`

#### Scenario: Minimum on a later day

- **WHEN** the value is 23:00 today and `min` is 10:00 tomorrow
- **THEN** the input is invalid with `kbqTimepickerLowerThenMin`

### Requirement: Unreadable bounds

`min()` and `max()` SHALL return the values bound to them. A bound value the date adapter cannot read SHALL be treated as no bound by the validators.

#### Scenario: Unparseable minimum

- **WHEN** `min` is bound to `'not a time'`
- **THEN** `min()` returns `'not a time'` and no `kbqTimepickerLowerThenMin` error is reported

### Requirement: Validation follows the bounds

When `min` or `max` changes, the timepicker SHALL re-run the validators of the bound form control. When no bound is set, the first render MUST NOT emit value or status changes on the bound control or its form group.

#### Scenario: Raising the minimum

- **WHEN** the control holds 10:00 without errors and `min` changes to 12:00
- **THEN** the control has `kbqTimepickerLowerThenMin`

#### Scenario: First render without bounds

- **WHEN** a timepicker in a form group renders for the first time without `min` or `max`
- **THEN** neither the control nor the group emits a value or status change

### Requirement: Parse error

When the bound control is validated while the input is not focused, shows text, and the last text it read did not parse into a time, the timepicker SHALL report `kbqTimepickerParse` with `{ text }` holding that text. Text the browser flags as bad input SHALL count as text. While the input is focused, or when it is empty, the parse error MUST NOT be reported.

#### Scenario: Bad input

- **WHEN** the browser reports bad input, the text is read and the control is re-validated
- **THEN** the control has `kbqTimepickerParse`

### Requirement: Required attribute

The `required` input SHALL set the native `required` attribute while it is `true` and remove it while it is `false`, and SHALL be reported to the enclosing form field. Unbound, `required()` SHALL be `false`.

#### Scenario: Toggling required

- **WHEN** `required` changes from `false` to `true` and back
- **THEN** the input gains and then loses the `required` attribute, and its native validity follows

### Requirement: Left and Right arrows select parts

When there is a value, Left SHALL select the part that holds the character before the selection start, and from the start of the text SHALL select the last part. Right SHALL select the part after the next colon, and from the last part SHALL select the hours. A key pressed before the previous key's selection has landed SHALL move on from where that selection goes. Without a value the keys SHALL keep their native caret movement.

#### Scenario: Two quick presses

- **WHEN** the seconds of `23:00:00` are selected and the user presses Left twice within one task
- **THEN** the hours are selected

#### Scenario: Right from the last part

- **WHEN** the minutes of `12:30` are selected in `HH:mm` format and the user presses Right
- **THEN** the hours are selected

### Requirement: Home and End select the outer parts

Home and Page Up SHALL select the hours. End and Page Down SHALL select the last part, the minutes in `HH:mm` and the seconds in `HH:mm:ss`.

#### Scenario: End in the full format

- **WHEN** `format` is `HH:mm:ss` and the user presses End
- **THEN** the seconds are selected

### Requirement: Space

Space MUST NOT insert a space. With a selection, it SHALL select the part after the next colon, and from the last part the hours. With a caret right after a single digit of a part, it SHALL act as a separator. Otherwise it SHALL do nothing and MUST NOT emit `incorrectInput`.

#### Scenario: Selection in the hours

- **WHEN** the hours of `12:30` are selected and the user presses Space
- **THEN** the minutes are selected

#### Scenario: Caret in a complete value

- **WHEN** the input shows `23:00:00` with the caret at the end and the user presses Space
- **THEN** the text is unchanged

### Requirement: Keys left to the browser

Tab, Backspace, Delete, any key with Ctrl or Cmd, and arrow, Home, End, Page Up or Page Down keys with a modifier SHALL keep their native behaviour. Backspace and Delete MUST NOT update the value by themselves: the value follows the text on the next parsed key or on blur.

#### Scenario: Clearing with Backspace

- **WHEN** the user deletes the whole text with Backspace while the field keeps focus
- **THEN** the bound form control still holds the previous time until the input loses focus

### Requirement: Blur completes the text

When the input loses focus and its text differs from the rendering of the value, the timepicker SHALL complete the text — each group of digits padded to two digits, missing parts taken as `00` — parse it and report the result to the form. Empty text SHALL report `null` to the bound form control. When the text already matches the value, blur MUST NOT change the value or re-validate the control.

#### Scenario: Single digit

- **WHEN** the text is `1` and the input loses focus
- **THEN** the input shows `01:00`

#### Scenario: Unchanged text

- **WHEN** the text matches the value and the input loses focus
- **THEN** the bound model keeps the same time and the control's status does not change

### Requirement: Input size follows the format

The input SHALL have a `size` attribute of 5 in `HH:mm` format and 8 in `HH:mm:ss` format.

#### Scenario: Full format

- **WHEN** `format` is `HH:mm:ss`
- **THEN** the input has `size="8"`

### Requirement: Autocomplete is off

The input SHALL always have `autocomplete="off"`.

#### Scenario: Any timepicker

- **WHEN** a timepicker renders
- **THEN** the input has `autocomplete="off"`

### Requirement: Element id

The input SHALL carry the `id` input as its `id` attribute, and a generated id starting with `kbq-timepicker-` when none is bound. `id()` SHALL report the id in effect.

#### Scenario: Generated id

- **WHEN** no `id` is bound
- **THEN** the input's `id` starts with `kbq-timepicker-`

### Requirement: Forms integration

The timepicker SHALL act as a control value accessor and a validator for `ngModel`, `formControl` and `formControlName`. A value written by the form SHALL be read through the date adapter and rendered. Values the user enters by typing, pasting, the arrow keys or blur SHALL be reported to the form. The date part of a written value SHALL be kept.

#### Scenario: Model written by the form

- **WHEN** `ngModel` holds 12:18:28 and `format` is `HH:mm`
- **THEN** the input shows `12:18`

#### Scenario: Blur without changes

- **WHEN** the input loses focus without the text having changed
- **THEN** the bound model is the same time as before

### Requirement: Value input

A bound `[value]` SHALL be applied whenever the binding changes, rendered like a value written by the form, and MUST NOT be reported to a bound form control. Until the binding first holds a value other than `undefined`, the timepicker SHALL leave the value to the form.

#### Scenario: Clearing through the binding

- **WHEN** `[value]` changes from a time to `null`
- **THEN** the input is empty and `empty()` is `true`

### Requirement: Reading the current state

`value()` SHALL return the time the timepicker holds, as set by `[value]`, the form or the user, or `null`. `viewValue` SHALL return the text the input shows. `isFullFormat` and `isShortFormat` SHALL report whether the format in effect is `HH:mm:ss` or `HH:mm`.

#### Scenario: After typing

- **WHEN** a timepicker bound with `[value]` gets the text `22:15` and reads it
- **THEN** `value()` is 22:15 on the date of the previous value and `viewValue` is `22:15`

### Requirement: Disabled state

The `disabled` input and the bound form control's disabled state SHALL both disable the timepicker, set the native `disabled` attribute and be reported by `disabled()`. Unbound, `disabled()` SHALL be `false`. When the timepicker becomes disabled, it SHALL stop reporting itself as focused.

#### Scenario: Toggling the input

- **WHEN** `disabled` changes from `false` to `true` and back
- **THEN** the native input is disabled and then enabled

#### Scenario: Disabling the form control

- **WHEN** the bound form control is disabled
- **THEN** the native input is disabled and `disabled()` is `true`

### Requirement: Touched state

The timepicker SHALL report itself as focused while the input has focus. Gaining focus and losing it SHALL each mark the bound control touched. A blur without a preceding focus MUST NOT mark it touched.

#### Scenario: Focus and blur

- **WHEN** the input gains and then loses focus
- **THEN** the bound control is touched

#### Scenario: Focus alone

- **WHEN** the input gains focus
- **THEN** the bound control is touched and `focused()` is `true`

### Requirement: Error state

`errorState()` SHALL follow the `errorStateMatcher` input when bound, otherwise the `ErrorStateMatcher` provided through dependency injection, such as by `kbqErrorStateMatcherProvider()`. The default matcher SHALL report an error while the control is invalid and either touched or in a submitted form. The state SHALL be re-evaluated on every change detection.

#### Scenario: Invalid but untouched

- **WHEN** a required control is empty and untouched
- **THEN** `errorState()` is `false`

#### Scenario: Form submitted

- **WHEN** the form holding an invalid control is submitted
- **THEN** `errorState()` is `true`

#### Scenario: Matcher from the injector

- **WHEN** `kbqErrorStateMatcherProvider()` supplies a matcher that reports untouched controls
- **THEN** `errorState()` is `true` before the control is touched and `false` after

#### Scenario: Prefix icon

- **WHEN** a form field holds a prefix clock icon and an invalid, touched timepicker
- **THEN** the icon has the class `kbq-error`

### Requirement: Form-field integration

Inside `kbq-form-field`, the timepicker SHALL report whether it is focused, empty, disabled, required and in an error state, SHALL give the form field the class `kbq-form-field-type-timepicker`, and SHALL focus the input when the form field's container is clicked. `empty()` SHALL be `true` exactly while the input shows no text and the browser reports no bad input.

#### Scenario: Cleaner follows the value

- **WHEN** a form field with `kbq-cleaner` holds a timepicker whose value is set to `null` by the form control or by `[value]`
- **THEN** `empty()` is `true` and the cleaner is hidden, and it is shown again once a time is set

#### Scenario: Container click

- **WHEN** the user clicks the form field's container outside the input
- **THEN** the input has focus

### Requirement: Safe to drive from an effect

Writing the bound form control from a consumer's `effect()` MUST NOT make that effect depend on the timepicker's state, so that it does not run again when the user focuses or edits the timepicker.

#### Scenario: Effect sets the control

- **WHEN** an effect sets the form control once and the user then focuses the timepicker
- **THEN** the effect has run once and `focused()` is `true`

### Requirement: Validation tooltip

While a tooltip is bound to `kbqValidationTooltip`, the timepicker SHALL switch it to the `manual` trigger with a 10 ms show delay, SHALL show it on every `incorrectInput` while it is closed, and SHALL hide it 3,000 ms later. An `incorrectInput` while the tooltip is open MUST NOT show it again or extend the timer.

#### Scenario: Rejected key

- **WHEN** a tooltip is bound and a letter key is pressed
- **THEN** the tooltip is shown and hides 3,000 ms later

#### Scenario: Trigger while bound

- **WHEN** a tooltip is bound
- **THEN** its trigger is `manual`

### Requirement: Rebinding the validation tooltip

When `kbqValidationTooltip` is rebound or unbound, the previous tooltip SHALL get its own trigger and show delay back and SHALL no longer react to `incorrectInput`. If the timepicker opened it and its hide is pending, it SHALL be hidden at once and the pending hide dropped.

#### Scenario: Switching tooltips

- **WHEN** the binding moves from the first tooltip to the second and `incorrectInput` fires
- **THEN** only the second tooltip is shown

#### Scenario: Unbinding an open tooltip

- **WHEN** the timepicker opened the tooltip and the binding is removed before it hides
- **THEN** the tooltip is hidden once and no later hide reaches it

### Requirement: Time zone changes

When the active time zone of `KbqDateTimezoneService` changes, the timepicker SHALL re-read its value through the date adapter and re-render it, so that the text shows the wall-clock time in the new zone. It MUST NOT report the change to the bound form control.

#### Scenario: Switching the zone

- **WHEN** the value is shown and the application activates another time zone through `setTimezone()`
- **THEN** the input shows the same instant as wall-clock time in the new zone

### Requirement: Exported constants

The entry point SHALL export `TimeFormats` (`HHmm = 'HH:mm'`, `HHmmss = 'HH:mm:ss'`), `DEFAULT_TIME_FORMAT` equal to `HH:mm`, a placeholder map holding the `ru-RU` pattern of each format, `TimeFormatToLocaleKeys` mapping `HH:mm` to `short` and `HH:mm:ss` to `full`, and `HOURS_PER_DAY` = 23, `MINUTES_PER_HOUR` = 59 and `SECONDS_PER_MINUTE` = 59 as the largest value of each part.

#### Scenario: Placeholder table

- **WHEN** a consumer reads the exported placeholder of `TimeFormats.HHmmss`
- **THEN** it is `чч:мм:сс`
