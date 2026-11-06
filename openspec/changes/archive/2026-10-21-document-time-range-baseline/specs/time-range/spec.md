# Spec Delta

## Purpose

Describes what `kbq-time-range` from `@koobiq/components/time-range` guarantees to consumers: how its popover opens and closes, how users pick a preset or a manual range with a pointer, the keyboard or assistive technology, how the value is corrected and reaches Angular forms, and how the trigger, the bounds and the form-field integration behave.

## ADDED Requirements

### Requirement: Opening the editor with the pointer

Clicking the trigger of an enabled time range SHALL open a popover that holds the editor and the Apply and Cancel buttons. The popover SHALL carry the class `kbq-time-range__popover`.

#### Scenario: Click on the built-in trigger

- **WHEN** the user clicks the trigger of an enabled time range
- **THEN** the popover with the editor opens

### Requirement: Opening the editor from the keyboard

Enter and Space on the focused trigger SHALL open the popover. Space MUST NOT scroll the page.

#### Scenario: Enter on the built-in trigger

- **WHEN** the built-in trigger has focus and the user presses Enter
- **THEN** the popover opens

#### Scenario: Space on the built-in trigger

- **WHEN** the built-in trigger has focus and the user presses Space
- **THEN** the popover opens
- **AND** the page does not scroll

### Requirement: Focus inside the open popover

Opening the popover SHALL move focus to the first focusable element inside it, and Tab and Shift+Tab SHALL keep focus inside the popover while it is open.

#### Scenario: Focus after opening

- **WHEN** the user opens the popover
- **THEN** focus is on the first focusable element of the editor
- **AND** pressing Tab repeatedly never moves focus out of the popover

### Requirement: Closing the popover

Cancel, Escape pressed inside the popover and a click outside it SHALL close the popover without changing the value. Picking a day in the calendar of a date field MUST NOT close it.

#### Scenario: Cancel

- **WHEN** the user checks another option and presses Cancel
- **THEN** the popover closes
- **AND** the value and the trigger are unchanged

#### Scenario: Escape

- **WHEN** focus is inside the open popover and the user presses Escape
- **THEN** the popover closes and the value is unchanged

#### Scenario: Picking a day in the calendar

- **WHEN** the user opens the calendar of the `to` date field and clicks a day
- **THEN** the popover stays open and the date field shows that day

### Requirement: Popover placement and arrow

The popover SHALL prefer the placement below the trigger, aligned to its left edge, and SHALL be drawn with an arrow pointing at the trigger. Setting `arrow` to `false` SHALL remove the arrow.

#### Scenario: Default popover

- **WHEN** the user opens a time range without `arrow` bound
- **THEN** the popover opens below the trigger with an arrow

#### Scenario: Arrow turned off

- **WHEN** `arrow` is `false` and the user opens the popover
- **THEN** the popover has no arrow

### Requirement: Default value

Without a bound value and with `nonNullable` left at `true`, the time range SHALL hold the first type of `availableTimeRangeTypes` — by default `lastHour` — with its dates computed from the current time.

#### Scenario: Bare time range

- **WHEN** `<kbq-time-range />` renders with no form control under the default `ru-RU` locale
- **THEN** the trigger reads "последний час"

### Requirement: Trigger label of a duration preset

For a preset measured back from now (`lastMinute` to `last12Months`, or a custom type with a duration unit), the built-in trigger SHALL show the duration from the value's `startDateTime` to the current time, in the preset's unit, formatted with the locale's `durationTemplate.title`.

#### Scenario: Last hour

- **WHEN** the value is `lastHour` with a `startDateTime` one hour ago, under `ru-RU`
- **THEN** the trigger reads "последний час"

#### Scenario: Custom duration

- **WHEN** a custom type `last3Minutes` with `units: { minutes: -3 }` and `translationType: 'minutes'` is the value
- **THEN** the trigger reads "последние 3 минуты"

### Requirement: Trigger label of the other types

The built-in trigger SHALL label `allTime`, `currentQuarter` and `currentYear` with the locale's `editor.allTime`, `editor.currentQuarter` and `editor.currentYear`, and `range` with the long date range from `startDateTime` to `endDateTime`, without the times. A custom type whose `translationType` is `'other'` SHALL get an empty label.

#### Scenario: Current year

- **WHEN** the value is `{ type: 'currentYear' }` under `ru-RU`
- **THEN** the trigger reads "текущий год"

#### Scenario: Manual range

- **WHEN** the user picks a `to` day in the calendar and presses Apply
- **THEN** the trigger shows a date range that contains that day

#### Scenario: Custom fixed-range type

- **WHEN** the value is a custom type registered with `translationType: 'other'` and a fixed `range`
- **THEN** the built-in trigger shows no text

### Requirement: Placeholder of an empty trigger

When the time range holds no value, the built-in trigger SHALL show the locale's `title.placeholder`.

#### Scenario: Nullable time range without a value

- **WHEN** `nonNullable` is `false` and `null` is written under `ru-RU`
- **THEN** the trigger reads "Период"

### Requirement: Preset options in the editor

The editor SHALL render one radio option per type of `availableTimeRangeTypes` other than `range`, in list order, followed by the `range` option labelled with the locale's `editor.rangeLabel`, whatever position `range` has in the list.

#### Scenario: Default list of options

- **WHEN** the user opens a time range with the default `availableTimeRangeTypes`
- **THEN** the options are, in order, `lastHour`, `last24Hours`, `last3Days`, `last7Days`, `last14Days`, `currentQuarter`, `currentYear`, `allTime`
- **AND** the last option is "период"

### Requirement: Labels of the preset options

A preset measured back from now SHALL be labelled with its duration in its unit, formatted with the locale's `durationTemplate.option`. `allTime`, `currentQuarter` and `currentYear` SHALL use `editor.allTimeOption`, `editor.currentQuarterOption` and `editor.currentYearOption`, falling back to the trigger labels when those are not set. A custom type whose `translationType` is `'other'` SHALL get an empty label.

#### Scenario: Current year option

- **WHEN** the editor opens under `ru-RU` with `currentYear` among the options
- **THEN** that option reads "текущий год"

#### Scenario: Custom fixed-range option

- **WHEN** a custom type with `translationType: 'other'` is listed and no `optionTemplate` is bound
- **THEN** its radio option has no text

### Requirement: Option checked on open

When the popover opens, the editor SHALL check the option of the applied value's type. When the time range holds no value, it SHALL check the first type of `availableTimeRangeTypes`, or the `range` option when the list is empty.

#### Scenario: Applied value

- **WHEN** the bound value is `{ type: 'currentYear' }` and the user opens the popover
- **THEN** the "текущий год" option is checked

#### Scenario: Default selection

- **WHEN** the time range has the default value and the user opens the popover
- **THEN** the first option is checked

### Requirement: Visibility of the manual range

The `range` option and the from/to fields SHALL be shown when `range` is in `availableTimeRangeTypes` or `showRangeAsDefault` is `true`, its default. With `showRangeAsDefault` set to `false` and `range` not listed, the editor MUST NOT show the `range` option or the fields.

#### Scenario: Range not listed, default setting

- **WHEN** `availableTimeRangeTypes` is `['lastHour', 'last24Hours']` and `showRangeAsDefault` is not bound
- **THEN** the editor shows the two presets, the `range` option and the from/to fields

#### Scenario: Range turned off

- **WHEN** `availableTimeRangeTypes` is `['lastHour', 'last24Hours']` and `showRangeAsDefault` is `false`
- **THEN** the editor shows only the two presets

### Requirement: Editor without presets

When `availableTimeRangeTypes` is empty, the editor SHALL show only the from and to fields, without any radio option.

#### Scenario: Empty list of options

- **WHEN** `availableTimeRangeTypes` is `[]`, no value is bound, and the user opens the popover
- **THEN** the editor has no radio option
- **AND** the from and to fields are shown and editable

### Requirement: Manual range fields

The `from` and `to` ends SHALL each have a time field in `HH:mm:ss` format and a date field with a calendar toggle. The fields SHALL be editable only while the `range` option is checked; while a preset is checked they MUST be disabled.

#### Scenario: Preset checked

- **WHEN** `lastHour` is checked in the editor
- **THEN** the from and to fields are disabled

#### Scenario: Range checked

- **WHEN** the user checks the `range` option
- **THEN** the from and to fields become editable

### Requirement: Default manual range

The manual range SHALL start out from the same time yesterday to now, to the second, unless `defaultRangeValue` supplies any of `fromDate`, `fromTime`, `toDate` and `toTime`, each of which replaces the matching part.

#### Scenario: Seeded range

- **WHEN** `defaultRangeValue` sets the `from` parts to 1 September 2024 10:00 and the `to` parts to 20 September 2024 18:30
- **AND** the user opens the popover
- **THEN** the from and to fields show those dates and times

### Requirement: Default manual range within the bounds

When `minDate` or `maxDate` is set, the default manual range SHALL lie inside them: its end is clamped into the bounds, and its start is one day before that end, clamped again. When the bounds leave no room below the clamped end, the range SHALL run from `minDate` to one day after it instead.

#### Scenario: Bounds in the past

- **WHEN** `minDate` is 1 January 2015 and `maxDate` is 31 December 2017
- **AND** the user checks the `range` option and leaves both ends
- **THEN** both ends lie within the bounds, the start is before the end, and no field is marked invalid

#### Scenario: Bounds in the future

- **WHEN** both bounds lie in the next year and carry a time of day
- **AND** the user checks the `range` option
- **THEN** the start equals `minDate`, the end is one day later, and no field is marked invalid

### Requirement: Reversed range is swapped when focus leaves it

When focus leaves the from/to block and the `from` moment is later than the `to` moment, the editor SHALL swap the two ends. Focus moving between the block's own fields, into a datepicker calendar or to the popover buttons, or the whole window losing focus, MUST NOT swap them. A reversed range MUST NOT be reported as an error.

#### Scenario: Leaving the block

- **WHEN** `from` is 10 March 18:00, `to` is 1 March 09:00, and focus leaves the from/to block
- **THEN** `from` becomes 1 March 09:00 and `to` becomes 10 March 18:00
- **AND** no field is marked invalid

#### Scenario: Times reversed within one day

- **WHEN** both ends are on 10 March, `from` at 18:00 and `to` at 09:00, and focus leaves the block
- **THEN** the times are swapped

#### Scenario: Moving into the calendar

- **WHEN** the range is reversed and focus moves into the calendar of a date field
- **THEN** the ends stay as they are

#### Scenario: Pressing Apply

- **WHEN** the range is reversed and focus moves from a field straight to the Apply button
- **THEN** the fields stay as they are while the popover closes

### Requirement: Applied range is ordered

An applied manual range SHALL have its `startDateTime` no later than its `endDateTime`, even when the fields still show the ends reversed.

#### Scenario: Applying a reversed range

- **WHEN** the `from` date is moved to 20 March, past the `to` date of 10 March, and the user presses Apply without leaving the field
- **THEN** the applied `startDateTime` falls on 10 March and `endDateTime` on 20 March

### Requirement: Reversed range with an error is left alone

While either end of the manual range has an error, the editor MUST NOT swap the ends.

#### Scenario: Reversed and out of bounds

- **WHEN** the bounds are 2015 to 2017, `from` is set to June 2020 and `to` to June 2016, and focus leaves both ends
- **THEN** the ends keep the values the user entered
- **AND** the `from` fields are marked invalid

### Requirement: Applying the editor value

When the editor has no error, Apply SHALL make the editor's value the time range's value, show it on the trigger, pass it to the bound form control and close the popover. Apply SHALL pass the value to the form control even when it is unchanged.

#### Scenario: Applying a new end date

- **WHEN** the user changes the `to` date of a manual range and presses Apply
- **THEN** the bound control's `endDateTime` has that day and the time of the `to` time field
- **AND** the popover closes

### Requirement: Shape of the value

The value SHALL be an object with `type` and ISO 8601 date strings that depend on it: `startDateTime` only, now minus the duration, for a duration preset; the start of the current quarter or year for `currentQuarter` and `currentYear`; no dates for `allTime`; the fixed `range` of a custom type that has one; `startDateTime` and `endDateTime` for `range`.

#### Scenario: Applying a preset

- **WHEN** the user checks `lastHour` and presses Apply
- **THEN** the bound control holds `{ type: 'lastHour', startDateTime }` with `startDateTime` one hour before the moment of the selection and no `endDateTime`

#### Scenario: Applying a manual range

- **WHEN** the user applies a manual range
- **THEN** the bound control holds `{ type: 'range', startDateTime, endDateTime }`

### Requirement: Apply refused while the manual range has errors

With the `range` option checked, Apply SHALL leave the popover open and the value unchanged while either end has an error, and SHALL instead show the errors of both ends and move focus to the first field at fault. The Apply button MUST stay enabled whatever the state of the fields.

#### Scenario: End outside the bounds

- **WHEN** the `to` date is set past `maxDate` and the user presses Apply
- **THEN** the popover stays open and the value is unchanged
- **AND** the `to` fields are marked invalid and focus is on the first of them

### Requirement: Closing discards unapplied edits

Closing the popover without Apply SHALL discard the edits: the next opening SHALL show the applied value, or the default selection when the time range holds no value.

#### Scenario: Reopening after a refused Apply

- **WHEN** the user enters an out-of-bounds `to` date, Apply is refused, and the user presses Cancel and reopens the popover
- **THEN** the `to` date is no longer the out-of-bounds date and lies within `maxDate`

### Requirement: Closing marks the control touched

Each time the popover closes, applied or not, the time range SHALL mark the bound form control as touched. Moving focus inside or out of the open editor MUST NOT mark it touched.

#### Scenario: Cancel after opening

- **WHEN** the user opens the popover
- **THEN** the bound control is still untouched
- **AND** after the user presses Cancel it is touched

### Requirement: Value signal

`value` SHALL hold the value the time range shows, or `null` when it holds none. It SHALL change when a value is written, when a change of the option list replaces it, or on Apply, and MUST NOT follow the editor while the user edits.

#### Scenario: Editing without applying

- **WHEN** the user checks another option in the open editor
- **THEN** `value` still holds the previous value until Apply is pressed

### Requirement: Custom trigger

`titleTemplate` SHALL replace the built-in trigger with the given template, rendered inside the element that opens the popover, so that a click on any of its content opens the popover.

#### Scenario: Button as the trigger

- **WHEN** `titleTemplate` renders a `kbq-button` and the user clicks it
- **THEN** the popover opens

### Requirement: Context of the custom trigger

The template context SHALL provide, as `$implicit` and as top-level properties: the value's `type`, `startDateTime`, `endDateTime` and duration units (for example `hours: -1` for `lastHour`); `formattedDate`, the text the built-in trigger would show; and `popover`, the popover trigger with its `isOpen` state. Without a value, the context SHALL hold only `formattedDate` (the placeholder) and `popover`.

#### Scenario: Showing the formatted date

- **WHEN** the template renders `context.formattedDate` and the value is `lastHour` under `ru-RU`
- **THEN** the custom trigger shows "последний час"

#### Scenario: Empty value

- **WHEN** a nullable time range holds no value
- **THEN** `context.type` is undefined and `context.formattedDate` is the placeholder

### Requirement: Trigger inside a form field

`kbq-time-range-title-as-control`, placed in `titleTemplate` inside a `kbq-form-field`, SHALL act as the form field's control: it SHALL have `tabindex="0"`, an id that starts with `kbq-time-range-title-as-control-`, and `aria-labelledby` pointing at the form field's label.

#### Scenario: Two labelled time ranges

- **WHEN** two time ranges each render the control inside a form field with its own label
- **THEN** each control's `aria-labelledby` is the id of its own label

### Requirement: Form-field state of the trigger

The form-field control SHALL be empty when the time range holds no value, required when the bound form control has `Validators.required`, in the error state when the application's `ErrorStateMatcher` says so (by default, invalid and touched or submitted), and disabled with the time range. The form field SHALL show the error state with `kbq-form-field_invalid` and the disabled state with `kbq-disabled`.

#### Scenario: Empty required value after closing

- **WHEN** a required, nullable time range holds no value and the user opens the popover and presses Cancel
- **THEN** the form field has the class `kbq-form-field_invalid`

#### Scenario: Disabled control

- **WHEN** the bound form control is disabled
- **THEN** the trigger control loses its `tabindex` and the form field has the class `kbq-disabled`

### Requirement: Form-field container click

A click on the container of the enclosing form field SHALL focus the trigger control. As the form field sits inside the trigger, the same click SHALL also open the popover.

#### Scenario: Clicking the field

- **WHEN** the user clicks the form field around the trigger control
- **THEN** the trigger control receives focus and the popover opens

### Requirement: Placeholder class

`kbqTimeRangeTitlePlaceholder` SHALL add the class `kbq-time-range-title__placeholder` to its element, which `kbq-time-range-title-as-control` renders in the placeholder style.

#### Scenario: Placeholder in a form field

- **WHEN** a nullable time range without a value renders `<span kbqTimeRangeTitlePlaceholder>` inside the trigger control
- **THEN** the span has the class `kbq-time-range-title__placeholder`

### Requirement: Bounds are exact moments

`minDate` and `maxDate` SHALL be compared with each end of the manual range as its date and time together. An end whose day is outside the bounds SHALL mark both of its fields invalid; an end on the boundary day whose time is outside SHALL mark only its time field. An end exactly on a bound MUST be accepted.

#### Scenario: Day before minDate

- **WHEN** `minDate` is 1 January 2015 09:00 and `from` is 15 June 2014 12:00
- **THEN** the `from` time and date fields are marked invalid once the end is left

#### Scenario: Time before minDate on its day

- **WHEN** `minDate` is 1 January 2015 09:00 and `from` is 1 January 2015 06:00
- **THEN** only the `from` time field is marked invalid once the end is left

#### Scenario: End on its bound

- **WHEN** `from` equals `minDate` and `to` equals `maxDate`
- **THEN** no field is marked invalid

### Requirement: Calendars follow the bounds

The calendars of both date fields SHALL offer only the days from the day of `minDate` to the day of `maxDate`.

#### Scenario: Day outside the bounds

- **WHEN** `maxDate` is 31 December 2017 and the user opens the calendar of a date field
- **THEN** days after 31 December 2017 cannot be picked

### Requirement: Incomplete end

An end of the manual range with only one of its two fields filled SHALL mark the empty field invalid, and only that one.

#### Scenario: Time fields cleared

- **WHEN** the user clears the `from` and `to` time fields and leaves both ends
- **THEN** only the two time fields are marked invalid

### Requirement: Empty end after Apply

An end of the manual range with both fields empty SHALL be accepted until Apply is pressed. From then on, during the same opening of the popover, it SHALL mark both of its fields invalid.

#### Scenario: Applying with an empty end

- **WHEN** the user clears both fields of the `to` end and presses Apply
- **THEN** both `to` fields are marked invalid and the popover stays open

### Requirement: When errors are shown

An end's errors SHALL be shown only after focus has left that end's pair of fields — moving between its own date and time, or into its calendar, does not count — and SHALL be hidden again as soon as the user types in either of its fields. Apply SHALL show the errors of both ends at once.

#### Scenario: Error held back while editing the pair

- **WHEN** the user puts the `from` end out of bounds and moves focus from its time field to its date field
- **THEN** no field is marked invalid yet

#### Scenario: Error shown and hidden again

- **WHEN** focus then leaves the `from` end
- **THEN** both `from` fields are marked invalid
- **AND** typing in one of them removes the marks

### Requirement: Out-of-bounds summary

When both ends are outside the bounds and both have been left, the editor SHALL show one error under the `to` end: the locale's `editor.outOfBoundsError` with `{{ value }}` replaced by the bounds caption. It MUST NOT be shown when only one end is outside, and SHALL disappear when the user types in either end.

#### Scenario: Both ends outside

- **WHEN** the bounds are 1 January 2015 09:00 to 31 December 2017 18:30 under `ru-RU`, and both ends are moved outside them and left
- **THEN** a single error reads "Допустимый период: 1 янв 2015, 09:00 — 31 дек 2017, 18:30" under the `to` end

#### Scenario: One end outside

- **WHEN** only the `to` end is outside the bounds
- **THEN** the `to` fields are marked invalid and no summary error is shown

### Requirement: Bounds caption

When `minDate` or `maxDate` is set, the editor SHALL caption the allowed period: under the `range` option when there are presets, otherwise in the hint area of the `to` fields, where the out-of-bounds summary replaces it while shown. The caption SHALL show dates only, unless a bound has a time other than midnight, in which case it SHALL show dates and times.

#### Scenario: Day-only bounds

- **WHEN** `minDate` is 1 January 2015 and `maxDate` is 31 December 2017 under `ru-RU`
- **THEN** the `range` option is captioned "1 янв 2015 — 31 дек 2017"

#### Scenario: Bounds with a time

- **WHEN** both bounds are at 14:23:45
- **THEN** the caption contains "14:23"

#### Scenario: No presets

- **WHEN** `availableTimeRangeTypes` is `[]` and bounds are set
- **THEN** the caption is shown as the hint of the `to` fields

#### Scenario: No bounds

- **WHEN** neither `minDate` nor `maxDate` is set
- **THEN** the editor shows no caption

### Requirement: Custom option template

`optionTemplate` SHALL replace the label of every preset option. Its `$implicit` context SHALL be an object with the option's `type`, `translationType`, `units` and `formattedValue`, the default label. The `range` option MUST keep its built-in label.

#### Scenario: Labels from the type name

- **WHEN** `optionTemplate` renders the context's `type` through Angular's `TitleCasePipe`, with the default list of options
- **THEN** each preset option shows its title-cased type name instead of its duration label
- **AND** the last option still reads "период"

### Requirement: Application-wide list of options

`KBQ_DEFAULT_TIME_RANGE_TYPES` SHALL replace `defaultTimeRangeTypes` as the default of `availableTimeRangeTypes` for every time range below the provider; a bound `availableTimeRangeTypes` SHALL take precedence. `defaultTimeRangeTypes` SHALL be `lastHour`, `last24Hours`, `last3Days`, `last7Days`, `last14Days`, `currentQuarter`, `currentYear`, `allTime` and `range`.

#### Scenario: Provided list

- **WHEN** `KBQ_DEFAULT_TIME_RANGE_TYPES` provides `['last3Minutes', 'last3Weeks', 'last3Years']`, registered as custom types
- **THEN** a time range without `availableTimeRangeTypes` defaults to `last3Minutes`

### Requirement: Registering custom types

`KBQ_CUSTOM_TIME_RANGE_TYPES` SHALL register types the built-in set lacks, each with its `units` (the duration back from now, as negative numbers), its `translationType` (the unit its labels are formatted in, or `'other'`) and an optional fixed `range`. An entry whose `type` is a built-in one MUST be ignored.

#### Scenario: Custom duration

- **WHEN** `last3Weeks` is registered with `units: { weeks: -3 }` and `translationType: 'weeks'` and is applied
- **THEN** the value's `startDateTime` is three weeks before the moment of the selection

#### Scenario: Custom fixed range

- **WHEN** a type `q1` is registered with `translationType: 'other'` and a fixed `range`, and the user applies it
- **THEN** the value is `{ type: 'q1' }` with that range's `startDateTime` and `endDateTime`

#### Scenario: Built-in name

- **WHEN** an entry with `type: 'lastHour'` and other units is registered
- **THEN** `lastHour` keeps its built-in one-hour duration

### Requirement: Date adapter and formatter are required

Creating a time range without a `DateAdapter` provider SHALL throw "KbqTimeRange: No provider found for DateAdapter. You must import one of the existing modules at your application root or provide a custom implementation or use exists ones." Without a `DateFormatter` provider it SHALL throw the same message naming `DateFormatter`.

#### Scenario: Missing formatter

- **WHEN** a time range is created where a `DateAdapter` is provided but no `DateFormatter`
- **THEN** creation throws the error naming `DateFormatter`

### Requirement: Accepted written values

A value written through the form control SHALL be kept when its `type` is in `availableTimeRangeTypes`, or when that list is empty. Any other value SHALL be replaced with the first type of the list, with its dates computed.

#### Scenario: Type that is not offered

- **WHEN** `availableTimeRangeTypes` is `['lastHour', 'last24Hours', 'range']` and `{ type: 'currentYear' }` is written
- **THEN** the time range holds `lastHour`
- **AND** the first option is checked when the popover opens

### Requirement: Missing dates are filled in

A kept value with no `startDateTime`, or a `range` value missing either end, SHALL get its dates computed: a preset's `startDateTime` from the current time, and both ends of a `range` from the default manual range, replacing the end it had. A `startDateTime` that is present on a preset SHALL be kept as written.

#### Scenario: Incomplete manual range

- **WHEN** `{ type: 'range' }` is written
- **THEN** the time range holds a `range` value with both `startDateTime` and `endDateTime`
- **AND** the editor opens with both date fields filled

#### Scenario: Preset with its own start

- **WHEN** `{ type: 'last24Hours', startDateTime: '2024-01-01T00:00:00.000Z' }` is written
- **THEN** the value keeps that `startDateTime`

### Requirement: Writing null

With `nonNullable` `true`, its default, writing `null` SHALL give the time range its default value, the first type of `availableTimeRangeTypes`. With `nonNullable` set to `false`, writing `null` SHALL leave the time range without a value and the trigger on its placeholder.

#### Scenario: Null under nonNullable

- **WHEN** `null` is written and `nonNullable` is `true`
- **THEN** the time range holds the first type of the list

#### Scenario: Null when nullable

- **WHEN** `nonNullable` is `false` and `null` is written
- **THEN** the trigger shows the placeholder

### Requirement: Correction event

`valueCorrected` SHALL emit the kept value, once per write, when its `type`, `startDateTime` or `endDateTime` differs from the written value, and when `null` is written under `nonNullable`. It MUST NOT emit when the kept value equals the written one, including `allTime` written without dates, or when `null` is written to a nullable time range.

#### Scenario: Type that is not offered

- **WHEN** `{ type: 'currentYear' }` is written and `currentYear` is not offered
- **THEN** `valueCorrected` emits once, with type `lastHour`

#### Scenario: Preset without a start

- **WHEN** `{ type: 'last24Hours' }` is written and `last24Hours` is offered
- **THEN** `valueCorrected` emits the value with a computed `startDateTime`

#### Scenario: All time written twice

- **WHEN** `{ type: 'allTime' }` is written twice and `allTime` is offered
- **THEN** `valueCorrected` does not emit

#### Scenario: Complete value

- **WHEN** `{ type: 'last24Hours', startDateTime: '2024-01-01T00:00:00.000Z' }` is written
- **THEN** `valueCorrected` does not emit

### Requirement: Corrections are not written back

A correction SHALL change only what the time range shows and holds in `value`. The bound form control MUST keep the value that was written until the user applies one or the option list changes.

#### Scenario: Preset written without a start

- **WHEN** the form control is set to `{ type: 'lastHour' }`
- **THEN** the form control's value is still exactly `{ type: 'lastHour' }`
- **AND** the trigger shows "последний час"

### Requirement: Writing a value from an effect

Writing the bound form control from an `effect()` MUST NOT make that effect depend on the time range's inputs or state.

#### Scenario: Input changed after the write

- **WHEN** an effect sets the form control once and `availableTimeRangeTypes` changes afterwards
- **THEN** the effect does not run again

### Requirement: Replacing the list of options

Once after initialization and whenever `availableTimeRangeTypes` changes, when the list does not contain the type in the editor and that type is not `range`, the time range SHALL switch to the first type of the list, or to `range` when the list is empty, and pass it to the bound form control. A nullable time range holding no value SHALL stay empty, and its form control unchanged.

#### Scenario: List emptied

- **WHEN** the value is `lastMinute` and `availableTimeRangeTypes` changes to `[]`
- **THEN** the bound control's value has type `range`

#### Scenario: Empty list from the start

- **WHEN** `availableTimeRangeTypes` is `[]` from the first render and the bound control holds `{ type: 'lastHour' }`
- **THEN** after initialization the bound control's value has type `range`

#### Scenario: Nullable without a value

- **WHEN** `nonNullable` is `false`, the bound control holds `null`, and `availableTimeRangeTypes` is `[]`
- **THEN** the control still holds `null` and the trigger shows the placeholder

### Requirement: Disabled state

Disabling the bound form control SHALL add the class `kbq-disabled` to the host, give the built-in trigger `tabindex="-1"` and `aria-disabled="true"`, keep the popover from opening and disable the editor. Re-enabling SHALL restore them, with the manual range fields still disabled while a preset is checked. A custom trigger is rendered as is; only the popover is kept closed.

#### Scenario: Disabled from the start

- **WHEN** the form control is created disabled
- **THEN** the host has the class `kbq-disabled` and the trigger link has `tabindex="-1"` from the first render

#### Scenario: Click on a disabled time range

- **WHEN** the control is disabled and the user clicks the trigger
- **THEN** the popover does not open

#### Scenario: Re-enabled with a preset checked

- **WHEN** the popover shows `lastHour` checked and the control is disabled and enabled again
- **THEN** the options are enabled and the from/to fields stay disabled

### Requirement: Disabling while open

Disabling the bound form control while the popover is open SHALL close the popover.

#### Scenario: Disabled during editing

- **WHEN** the popover is open and the bound control is disabled
- **THEN** the popover closes

### Requirement: Trigger semantics

The built-in trigger SHALL be a link that acts as a button, with `role="button"` and `tabindex="0"`. The element wrapping the trigger, with the class `kbq-time-range__trigger`, SHALL carry `aria-haspopup="dialog"`, `aria-expanded` with the open state and, while the popover is open, `aria-controls` with its id.

#### Scenario: Closed time range

- **WHEN** the time range renders with the built-in trigger
- **THEN** the trigger link has `role="button"` and `tabindex="0"`
- **AND** the wrapper has `aria-haspopup="dialog"` and `aria-expanded="false"`

### Requirement: Grouping in the editor

The radio group of the editor SHALL contain only the radio options; the from/to block SHALL be a separate `role="group"` named with the locale's `editor.rangeLabel`. The Apply and Cancel buttons MUST NOT be wrapped in an unnamed group.

#### Scenario: Structure of the open editor

- **WHEN** the editor is open with presets and the manual range
- **THEN** the radio group contains no date or time field
- **AND** the from/to block has `role="group"` and `aria-label="период"` under `ru-RU`
- **AND** the element around the buttons has no `role`

### Requirement: Names of the date and time fields

Each date and time field SHALL be named by its end's prefix, the locale's `editor.from` or `editor.to`, through `aria-labelledby`.

#### Scenario: Field names

- **WHEN** the editor is open
- **THEN** the `from` time and date fields reference the id of the `from` prefix in `aria-labelledby`, and the `to` fields the id of the `to` prefix

### Requirement: Editor passes axe

The open editor SHALL have no axe-core violations among the rules that run without rendering.

#### Scenario: Axe on the open editor

- **WHEN** the editor of a time range bound to a manual range is open
- **THEN** axe-core reports no violations for it

### Requirement: Localized strings

The strings the time range renders SHALL come from the `timeRange` section of the active locale, `ru-RU` by default: the placeholder, the `from` and `to` prefixes, Apply, Cancel, the range label, the out-of-bounds error, the labels of `allTime`, `currentQuarter` and `currentYear` with their option forms, and the duration templates of the trigger and the options.

#### Scenario: Switching the locale

- **WHEN** the application switches the locale to `en-US`
- **THEN** the Cancel button reads "Cancel"

### Requirement: Overriding strings for the application

`kbqTimeRangeLocaleConfigurationProvider` SHALL override only the keys it is given, at any depth; the keys left out SHALL keep following the active locale.

#### Scenario: Overriding the Apply label

- **WHEN** the provider overrides `editor.apply` and the locale switches to `en-US`
- **THEN** Apply keeps the overridden label
- **AND** Cancel follows the locale

### Requirement: Overriding strings for one time range

`[localeOverrides]` with a `timeRange` section SHALL override the given keys for that time range, its trigger and its editor, while keys left out keep following the locale.

#### Scenario: Overriding one instance

- **WHEN** one of two time ranges binds `[localeOverrides]="{ timeRange: { editor: { apply: 'OK' } } }"`
- **THEN** only that time range's Apply button reads "OK"
