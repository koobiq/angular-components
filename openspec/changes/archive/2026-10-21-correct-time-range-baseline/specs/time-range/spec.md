# time-range Specification Delta

## MODIFIED Requirements

### Requirement: Opening the editor from the keyboard

Enter and Space on the focused built-in trigger SHALL open the popover, and Space on it MUST NOT scroll the page. With a custom trigger, Enter and Space pressed on any focused element inside it SHALL open the popover too, but the time range does not keep Space from scrolling the page.

#### Scenario: Enter on the built-in trigger

- **WHEN** the built-in trigger has focus and the user presses Enter
- **THEN** the popover opens

#### Scenario: Space on the built-in trigger

- **WHEN** the built-in trigger has focus and the user presses Space
- **THEN** the popover opens
- **AND** the page does not scroll

### Requirement: Popover placement and arrow

The popover SHALL prefer the placement below the trigger, aligned to its start edge (the left edge in a left-to-right layout, the right edge in a right-to-left one), and SHALL be drawn with an arrow pointing at the trigger. Setting `arrow` to `false` SHALL remove the arrow.

#### Scenario: Default popover

- **WHEN** the user opens a time range without `arrow` bound
- **THEN** the popover opens below the trigger with an arrow

#### Scenario: Arrow turned off

- **WHEN** `arrow` is `false` and the user opens the popover
- **THEN** the popover has no arrow

### Requirement: Preset options in the editor

When `availableTimeRangeTypes` holds a type other than `range`, the editor SHALL render one radio option per such type, in list order, followed, while the manual range is visible, by the `range` option labelled with the locale's `editor.rangeLabel`, whatever position `range` has in the list. A list with no type other than `range` SHALL render no radio option at all.

#### Scenario: Default list of options

- **WHEN** the user opens a time range with the default `availableTimeRangeTypes`
- **THEN** the options are, in order, `lastHour`, `last24Hours`, `last3Days`, `last7Days`, `last14Days`, `currentQuarter`, `currentYear`, `allTime`
- **AND** the last option is "период"

### Requirement: Option checked on open

When the popover opens, the editor SHALL select the applied value's type if `availableTimeRangeTypes` holds it or is empty, otherwise the first type of the list, as for an applied `range` the list lacks. Without a value it SHALL select the first type of the list, or `range` for an empty list, except on the first opening after `null` is written after initialization: then the first type of the application-wide default list. A preset selected without an option leaves the range fields disabled.

#### Scenario: Applied value

- **WHEN** the bound value is `{ type: 'currentYear' }` and the user opens the popover
- **THEN** the "текущий год" option is checked

#### Scenario: Default selection

- **WHEN** the time range has the default value and the user opens the popover
- **THEN** the first option is checked

### Requirement: Visibility of the manual range

The from/to fields SHALL be shown when `range` is in `availableTimeRangeTypes` or `showRangeAsDefault` is `true`, its default, and the `range` option with them while the list holds a type other than `range`. With `showRangeAsDefault` set to `false` and `range` not listed, the editor MUST NOT show the `range` option or the fields.

#### Scenario: Range not listed, default setting

- **WHEN** `availableTimeRangeTypes` is `['lastHour', 'last24Hours']` and `showRangeAsDefault` is not bound
- **THEN** the editor shows the two presets, the `range` option and the from/to fields

#### Scenario: Range turned off

- **WHEN** `availableTimeRangeTypes` is `['lastHour', 'last24Hours']` and `showRangeAsDefault` is `false`
- **THEN** the editor shows only the two presets

### Requirement: Editor without presets

When `availableTimeRangeTypes` is empty or holds only `range`, the editor SHALL show no radio option: only the from and to fields, or, for an empty list with `showRangeAsDefault` set to `false`, nothing at all.

#### Scenario: Empty list of options

- **WHEN** `availableTimeRangeTypes` is `[]`, no value is bound, and the user opens the popover
- **THEN** the editor has no radio option
- **AND** the from and to fields are shown and editable

### Requirement: Manual range fields

The `from` and `to` ends SHALL each have a time field in `HH:mm:ss` format and a date field with a calendar toggle. The fields SHALL be editable only while the editor is on the `range` type, whether through its option or, without presets, with no option checked; while a preset is selected they MUST be disabled.

#### Scenario: Preset checked

- **WHEN** `lastHour` is checked in the editor
- **THEN** the from and to fields are disabled

#### Scenario: Range checked

- **WHEN** the user checks the `range` option
- **THEN** the from and to fields become editable

### Requirement: Default manual range

The manual range SHALL start out from the same time yesterday to now, to the second, unless `defaultRangeValue` supplies any of `fromDate`, `fromTime`, `toDate` and `toTime`, each of which replaces the matching part. The clock is read when the time range is created and again only when `minDate`, `maxDate` or `defaultRangeValue` changes, not each time the popover opens.

#### Scenario: Seeded range

- **WHEN** `defaultRangeValue` sets the `from` parts to 1 September 2024 10:00 and the `to` parts to 20 September 2024 18:30
- **AND** the user opens the popover
- **THEN** the from and to fields show those dates and times

### Requirement: Default manual range within the bounds

When `minDate` or `maxDate` is set, the default manual range SHALL lie inside them: its end is clamped into the bounds, and its start is one day before that end, clamped again. When the bounds leave no room below the clamped end, the range SHALL run from `minDate` to one day after it instead, clamped to `maxDate` when that comes sooner.

#### Scenario: Bounds in the past

- **WHEN** `minDate` is 1 January 2015 and `maxDate` is 31 December 2017
- **AND** the user checks the `range` option and leaves both ends
- **THEN** both ends lie within the bounds, the start is before the end, and no field is marked invalid

#### Scenario: Bounds in the future

- **WHEN** both bounds lie in the next year and carry a time of day
- **AND** the user checks the `range` option
- **THEN** the start equals `minDate`, the end is one day later, and no field is marked invalid

### Requirement: Shape of the value

The value SHALL be an object with `type` and ISO 8601 date strings that depend on it: `startDateTime` only, now minus the duration, for a duration preset, a custom type with a duration unit included even when it has a `range`; the start of the current quarter or year for `currentQuarter` and `currentYear`; no dates for `allTime`; the fixed `range` of a custom type whose `translationType` is `'other'`, or no dates when it has none; `startDateTime` and `endDateTime` for `range`.

#### Scenario: Applying a preset

- **WHEN** the user checks `lastHour` and presses Apply
- **THEN** the bound control holds `{ type: 'lastHour', startDateTime }` with `startDateTime` one hour before the moment of the selection and no `endDateTime`

#### Scenario: Applying a manual range

- **WHEN** the user applies a manual range
- **THEN** the bound control holds `{ type: 'range', startDateTime, endDateTime }`

### Requirement: Closing discards unapplied edits

Closing the popover without Apply SHALL discard the edits: the next opening SHALL start again from the applied value, or from the default selection when the time range holds no value, through the same selection as any opening (see Option checked on open), so an applied `range` that `availableTimeRangeTypes` does not hold reopens on the first type of the list.

#### Scenario: Reopening after a refused Apply

- **WHEN** the user enters an out-of-bounds `to` date, Apply is refused, and the user presses Cancel and reopens the popover
- **THEN** the `to` date is no longer the out-of-bounds date and lies within `maxDate`

### Requirement: Bounds caption

When `minDate` or `maxDate` is set and the manual range is shown, the editor SHALL caption the allowed period: under the `range` option when there are presets, otherwise in the hint area of the `to` fields, where the out-of-bounds summary replaces it while shown. The caption SHALL show dates only, unless a bound has a time other than midnight, in which case it SHALL show dates and times.

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

`optionTemplate` SHALL replace the label of every preset option. Its `$implicit` context SHALL be an object with the option's `type`, `translationType`, `units` and `formattedValue`: the duration label of a duration preset, and an empty string for every type whose `translationType` is `'other'`, `allTime`, `currentQuarter` and `currentYear` included. The `range` option MUST keep its built-in label.

#### Scenario: Labels from the type name

- **WHEN** `optionTemplate` renders the context's `type` through Angular's `TitleCasePipe`, with the default list of options
- **THEN** each preset option shows its title-cased type name instead of its duration label
- **AND** the last option still reads "период"

### Requirement: Date adapter and formatter are required

Creating a time range with neither a `DateAdapter` nor a `DateFormatter` provider SHALL throw "KbqTimeRange: No provider found for DateAdapter. You must import one of the existing modules at your application root or provide a custom implementation or use exists ones." With a `DateAdapter` but no `DateFormatter` it SHALL throw the same message naming `DateFormatter`. With a `DateFormatter` but no `DateAdapter`, creating the formatter SHALL fail first with Angular's missing-provider error.

#### Scenario: Missing formatter

- **WHEN** a time range is created where a `DateAdapter` is provided but no `DateFormatter`
- **THEN** creation throws the error naming `DateFormatter`

### Requirement: Missing dates are filled in

A kept value with no `startDateTime`, or a `range` value missing either end, SHALL get its dates computed as applying its type computes them, in place of those it had: a `startDateTime` from the current time for a duration preset, `currentQuarter` and `currentYear`, the fixed `range` of a custom `'other'` type if it has one, both ends of a `range` from the default manual range, and none for `allTime`. A `startDateTime` that is present on a preset SHALL be kept as written.

#### Scenario: Incomplete manual range

- **WHEN** `{ type: 'range' }` is written
- **THEN** the time range holds a `range` value with both `startDateTime` and `endDateTime`
- **AND** the editor opens with both date fields filled

#### Scenario: Preset with its own start

- **WHEN** `{ type: 'last24Hours', startDateTime: '2024-01-01T00:00:00.000Z' }` is written
- **THEN** the value keeps that `startDateTime`

### Requirement: Writing null

With `nonNullable` `true`, its default, writing `null` SHALL give the time range its default value, the first type of `availableTimeRangeTypes`, or, for an empty list, the first type of the application-wide default list, which only the switch made once after initialization replaces with `range`. With `nonNullable` set to `false`, writing `null` SHALL leave the time range without a value and the trigger on its placeholder.

#### Scenario: Null under nonNullable

- **WHEN** `null` is written and `nonNullable` is `true`
- **THEN** the time range holds the first type of the list

#### Scenario: Null when nullable

- **WHEN** `nonNullable` is `false` and `null` is written
- **THEN** the trigger shows the placeholder

### Requirement: Corrections are not written back

A correction SHALL change only what the time range shows and holds in `value`. The bound form control MUST keep the value that was written until the user applies one or the time range replaces it for its option list: when the list changes, or once after initialization when the list is empty (see Replacing the list of options).

#### Scenario: Preset written without a start

- **WHEN** the form control is set to `{ type: 'lastHour' }`
- **THEN** the form control's value is still exactly `{ type: 'lastHour' }`
- **AND** the trigger shows "последний час"

### Requirement: Disabled state

Disabling the bound form control SHALL add the class `kbq-disabled` to the host, give the built-in trigger `tabindex="-1"` and `aria-disabled="true"`, keep the popover from opening and disable the editor. Re-enabling SHALL restore them, with the manual range fields still disabled while a preset is checked. A custom trigger gets no disabled state; besides the closed popover, only a `kbq-time-range-title-as-control` in it drops its `tabindex` and marks its form field `kbq-disabled`.

#### Scenario: Disabled from the start

- **WHEN** the form control is created disabled
- **THEN** the host has the class `kbq-disabled` and the trigger link has `tabindex="-1"` from the first render

#### Scenario: Click on a disabled time range

- **WHEN** the control is disabled and the user clicks the trigger
- **THEN** the popover does not open

#### Scenario: Re-enabled with a preset checked

- **WHEN** the popover shows `lastHour` checked and the control is disabled and enabled again
- **THEN** the options are enabled and the from/to fields stay disabled
