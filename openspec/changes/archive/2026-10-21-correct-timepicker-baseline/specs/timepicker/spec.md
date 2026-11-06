# Spec Delta

## MODIFIED Requirements

### Requirement: Date adapter is required

The timepicker MUST throw an error that starts with `KbqTimepicker: No provider found for DateAdapter.` when it is created without a `DateAdapter` provider. A value it takes from `[value]`, from the form's `writeValue` or from the user SHALL be read through that adapter, as a date of the adapter or `null`. While a form control is bound, the value SHALL also take every value the control emits as it is, so a control set to a string leaves that string in `value()`.

#### Scenario: No adapter

- **WHEN** a timepicker is created in an injector that provides no `DateAdapter`
- **THEN** creating it throws the `No provider found for DateAdapter` error

#### Scenario: Control set to a string

- **WHEN** the bound form control of an `HH:mm` timepicker is set with `setValue()` to the ISO 8601 string `2024-05-17T10:30:00`
- **THEN** the input shows `10:30` and `value()` is that string

### Requirement: Typed text is parsed after each key

After a key pressed without Ctrl or Cmd that the browser inserts into the input, the timepicker SHALL read the text on the next task. Text that forms a complete time — two-digit hours, optionally followed by a colon and two-digit minutes, then optionally by a colon and two-digit seconds — SHALL become the value, SHALL be reported to the bound form control, and SHALL be rewritten in the active format. Digits not separated by a colon SHALL be read as one part and clamped.

#### Scenario: Typing a full time

- **WHEN** `format` is `HH:mm:ss` and the text becomes `18:08:08` through a key press
- **THEN** the value and the bound model are 18:08:08

#### Scenario: Hours alone, clamped

- **WHEN** `format` is `HH:mm:ss` and the text `24` is typed
- **THEN** the input shows `23:00:00` and the value is 23:00:00

#### Scenario: Digits without a colon

- **WHEN** `format` is `HH:mm` and the text `1230` is typed
- **THEN** the digits are read as hours, the input shows `23:00` and the value is 23:00:00

### Requirement: Typed time keeps the date

A time read from typed or pasted text SHALL keep the year, month, day and milliseconds of the current value. When there is no value, they SHALL come from the adapter's current date and time. A pasted 12-hour time whose hour reaches 24 or more — 12 `am`, or 12 to 19 with `pm` — SHALL be passed to the adapter as it is, and the Luxon adapter rolls it over to the next day.

#### Scenario: Editing an existing value

- **WHEN** the value is 12:18:28 on 1 February 1970 and `10:10:10` is pasted into an `HH:mm:ss` timepicker
- **THEN** the value is 10:10:10 on 1 February 1970

#### Scenario: Empty field

- **WHEN** the bound form control is `null`, the current date is 1 January 2020, and `18:09` is typed
- **THEN** the form control holds 18:09 on 1 January 2020

#### Scenario: Pasting 12 am

- **WHEN** the value is 12:18:28 on 1 February 1970 and `12:3 aM` is pasted
- **THEN** the value is 00:03:00 on 2 February 1970

### Requirement: Rejected keys

A letter key (A to Z) pressed without Ctrl or Cmd SHALL be prevented and SHALL emit `incorrectInput`. Any other key pressed without Ctrl or Cmd that produces a single non-digit character, except Space, SHALL be prevented and SHALL emit `incorrectInput` unless it is a non-word character that follows a single digit of a part, where it is handled as a separator. The underscore is a word character, so it is always rejected.

#### Scenario: Letter

- **WHEN** the user presses the `A` key in the field
- **THEN** no character is inserted and `incorrectInput` fires

#### Scenario: Colon after a complete part

- **WHEN** the input shows `12:00` and the user types `:` after the hours
- **THEN** the text is unchanged and `incorrectInput` fires

#### Scenario: Underscore after a single digit

- **WHEN** the input shows `1` with the caret at the end and the user types `_`
- **THEN** the text is unchanged and `incorrectInput` fires

### Requirement: Separator after a single digit

A single digit followed by a non-word character, such as `:`, `.`, `-`, `*` or a space, in text that otherwise holds only complete parts and colons, SHALL be turned into that digit with a leading zero, and the character SHALL be dropped. The replacement SHALL apply where that digit and that character first occur together in the text, so a colon after a digit that also ends an earlier part rewrites that earlier part instead. The result SHALL then be parsed like typed text.

#### Scenario: Hours with a separator

- **WHEN** `format` is `HH:mm:ss` and the text becomes `1*`
- **THEN** the input shows `01:00:00`

#### Scenario: Minutes with a separator

- **WHEN** `format` is `HH:mm:ss` and the text becomes `01:1*:10`
- **THEN** the input shows `01:01:10`

#### Scenario: Colon after a digit that ends an earlier part

- **WHEN** `format` is `HH:mm` and the user types `:` after the text `12:2`
- **THEN** the hours are rewritten to `1022`, clamped, and the input shows `23:00`

### Requirement: Keys left to the browser

Tab, Backspace, Delete, any key with Ctrl or Cmd, and arrow, Home, End, Page Up or Page Down keys with a modifier SHALL keep their native behaviour. Backspace and Delete MUST NOT update the value by themselves: the text is read on the next parsed key or on blur. Empty text then reaches only a bound form control, as `null`: without one, `value()` SHALL keep the previous time while the input is empty.

#### Scenario: Clearing with Backspace

- **WHEN** the user deletes the whole text with Backspace while the field keeps focus
- **THEN** the bound form control still holds the previous time until the input loses focus

#### Scenario: Clearing without a form control

- **WHEN** a timepicker bound only with `[value]` is cleared with Backspace and then loses focus
- **THEN** the input is empty and `value()` still holds the previous time

### Requirement: Error state

`errorState()` SHALL follow the `errorStateMatcher` input when bound, otherwise the `ErrorStateMatcher` provided through dependency injection, such as by `kbqErrorStateMatcherProvider()`. The default matcher SHALL report an error while the control is invalid and either touched or in a submitted form. While a form control is bound, the state SHALL be re-evaluated on every change detection; without one, it SHALL be evaluated only once, when the timepicker initializes.

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

#### Scenario: No form control

- **WHEN** a timepicker without a form control sits in a `form` and its `errorStateMatcher` reports an error for any submitted form, and the form is submitted
- **THEN** `errorState()` stays `false`

### Requirement: Time zone changes

When the active time zone of `KbqDateTimezoneService` changes, the timepicker SHALL re-read its value through the date adapter and re-render it. It MUST NOT report the change to the bound form control. With the Luxon adapter and its default options, the text SHALL then show the wall-clock time in the new zone, except after a switch to `'system'`: the adapter leaves the date in the zone it was in, so the text keeps the previous wall-clock time.

#### Scenario: Switching the zone

- **WHEN** the value is shown and the application activates a named time zone, such as `Europe/Berlin`, through `setTimezone()`
- **THEN** the input shows the same instant as wall-clock time in the new zone

#### Scenario: Switching back to the system zone

- **WHEN** the value is shown in `Europe/Berlin` and the application calls `setTimezone('system')`
- **THEN** the input still shows the Berlin wall-clock time
