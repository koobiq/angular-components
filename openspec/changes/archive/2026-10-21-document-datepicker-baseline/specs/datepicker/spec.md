# Spec Delta

## Purpose

Describes what `@koobiq/components/datepicker` guarantees to consumers: how an `input[kbqDatepicker]` and its `kbq-datepicker` open and close the calendar, how users pick, type, paste and step dates with a pointer or the keyboard, how the value and its validation reach Angular forms, and how the toggle icon and the calendar behave.

## ADDED Requirements

### Requirement: One input per datepicker

An `input[kbqDatepicker]` bound to a `kbq-datepicker` SHALL register as that datepicker's only input; binding a second input MUST throw "A KbqDatepicker can only be associated with a single input." Opening a datepicker that no input is bound to SHALL throw "Attempted to open an KbqDatepicker with no associated input.", while reading its `disabled` state MUST NOT throw.

#### Scenario: Two inputs for one datepicker

- **WHEN** two inputs bind `[kbqDatepicker]` to the same `kbq-datepicker`
- **THEN** rendering throws the single-input error

#### Scenario: Datepicker without an input

- **WHEN** `open()` is called on a datepicker that no input is bound to
- **THEN** the call throws the missing-input error

#### Scenario: Reading the disabled state

- **WHEN** `disabled` is read on a datepicker without an input
- **THEN** the read does not throw

### Requirement: Date adapter is required

The datepicker, its input and the calendar SHALL require a `DateAdapter` provider. Without one, creating any of them MUST throw an error that starts with "KbqDatepicker: No provider found for DateAdapter".

#### Scenario: No date module imported

- **WHEN** a datepicker is rendered without a date adapter module or `DateAdapter` provider
- **THEN** creation throws an error naming the missing `DateAdapter`

### Requirement: Datepicker assigned after initialization

An input whose `[kbqDatepicker]` binding is empty at first SHALL work as a plain date field, and SHALL connect to the datepicker once the binding gets one. Keyboard shortcuts for the calendar MUST NOT throw while no datepicker is bound.

#### Scenario: Late assignment

- **WHEN** the `[kbqDatepicker]` binding is set after the first render and `select()` is called on that datepicker
- **THEN** the input and the datepicker both hold the selected date

#### Scenario: Alt+Down without a datepicker

- **WHEN** no datepicker is bound and the user presses Alt+Down in the input
- **THEN** nothing is thrown

### Requirement: Opening and closing from code

`open()` SHALL open the calendar in an overlay pane with the class `kbq-datepicker__popup` holding a `.kbq-datepicker__content` element, and `close()` SHALL close it. `toggle()` SHALL open a closed calendar and close an open one. The `opened` input SHALL open or close the calendar when its binding changes, and the `opened` property SHALL read the current state.

#### Scenario: Opening from code

- **WHEN** `open()` is called on an enabled datepicker with an input
- **THEN** a `.cdk-overlay-pane.kbq-datepicker__popup` is rendered and `opened` is `true`

#### Scenario: Opened binding

- **WHEN** `[opened]` is bound to `true` and later to `false`
- **THEN** the calendar opens and then closes

### Requirement: Open and close events

The datepicker SHALL emit `opened` each time the calendar opens and `closed` each time it closes. When the calendar is closed, its content SHALL stay in the page until its exit animation ends. Opening again before that SHALL keep the calendar open, with one `closed` emitted for the earlier close.

#### Scenario: Open and close

- **WHEN** the calendar is opened and then closed
- **THEN** `opened` fires once and then `closed` fires once

#### Scenario: Reopening while closing

- **WHEN** `close()` and `open()` are called in a row
- **THEN** the calendar is open once the exit animation would have ended
- **AND** `closed` has fired exactly once

### Requirement: Disabled datepicker does not open

A disabled datepicker MUST NOT open. Until its own `disabled` is bound or set, a datepicker SHALL follow the disabled state of its input; once it is bound or set to `false`, the datepicker SHALL open even when its input is disabled.

#### Scenario: Disabled datepicker

- **WHEN** `disabled` is bound to `true` on the datepicker and `open()` is called
- **THEN** no overlay pane is rendered

#### Scenario: Enabled datepicker of a disabled input

- **WHEN** the datepicker's `disabled` is bound to `false`, its input is disabled and `open()` is called
- **THEN** the calendar opens

### Requirement: Focus returns on close

Opening the calendar MUST NOT move focus. `close()` SHALL return focus to the element that had it when the calendar opened; `close(false)` SHALL leave focus where it is.

#### Scenario: Close restores focus

- **WHEN** the input has focus, the calendar is opened and `close(true)` is called
- **THEN** the input has focus

#### Scenario: Focus while open

- **WHEN** the input has focus and the calendar opens
- **THEN** the input keeps focus

### Requirement: Outside click closes the calendar

A click outside the calendar's overlay SHALL close the calendar. Focus SHALL return to the element focused before opening only when, after the click, focus is on the page body or still inside the calendar; a click that moved focus elsewhere SHALL leave it there.

#### Scenario: Click on the page

- **WHEN** the calendar is open and the user clicks the page body
- **THEN** the calendar closes and `closed` fires once

#### Scenario: Click on another focusable element

- **WHEN** focus is inside the calendar and the user clicks a button outside it
- **THEN** the calendar closes and the button keeps focus

### Requirement: Backdrop

By default the calendar SHALL open without a backdrop. With `hasBackdrop` set, it SHALL render a backdrop with the `backdropClass` class, `cdk-overlay-transparent-backdrop` by default, and a click on it SHALL close the calendar.

#### Scenario: Backdrop click

- **WHEN** `hasBackdrop` is set, the calendar is open and the user clicks the backdrop
- **THEN** the calendar closes

### Requirement: Escape closes the calendar

While the calendar is open, Escape pressed in the input or inside the calendar SHALL close it, prevent the key's default action and return focus to the element focused when it opened. While the calendar is closed, Escape in the input MUST NOT be prevented, so an enclosing dialog can handle it. An open month or year list in the calendar header SHALL take the first Escape.

#### Scenario: Escape inside the calendar

- **WHEN** the calendar was opened from the toggle, focus is on a calendar header button and the user presses Escape
- **THEN** the calendar closes, the key's default action is prevented and the input has focus

#### Scenario: Calendar inside a modal

- **WHEN** a datepicker in a modal has its calendar open and the user presses Escape
- **THEN** only the calendar closes
- **AND** a second Escape in the input closes the modal

#### Scenario: Closed calendar

- **WHEN** the calendar is closed and the user presses Escape in the input
- **THEN** the key's default action is not prevented and the value does not change

#### Scenario: Month list open

- **WHEN** the month list of the calendar header is open and the user presses Escape
- **THEN** the list closes and the calendar stays open

### Requirement: Keyboard opens and closes the calendar

In an editable input, Alt+Down SHALL open the calendar and Alt+Up SHALL close it, each preventing the key's default action; Alt+Up on a closed calendar MUST NOT be prevented. Tab and Shift+Tab SHALL close an open calendar without moving focus back, and the browser SHALL move focus as usual.

#### Scenario: Alt+Down

- **WHEN** the calendar is closed and the user presses Alt+Down in the input
- **THEN** the calendar opens and the key's default action is prevented

#### Scenario: Alt+Up

- **WHEN** the calendar is open and the user presses Alt+Up in the input
- **THEN** the calendar closes and the key's default action is prevented

#### Scenario: Tabbing away

- **WHEN** the calendar is open and the user presses Tab in the input
- **THEN** the calendar closes and focus moves to the next focusable element

### Requirement: Read-only input

When the input is read-only, it MUST ignore its keyboard handling, including Alt+Down, and `toggle()` on its datepicker MUST do nothing.

#### Scenario: Alt+Down on a read-only input

- **WHEN** the input has the `readonly` attribute and the user presses Alt+Down
- **THEN** the calendar stays closed and the key's default action is not prevented

### Requirement: Reactive state

`open()`, `close()`, `toggle()` and form control writes MUST NOT make an Angular `effect()` that calls them depend on the datepicker's state, so the effect SHALL NOT run again when the calendar opens, closes or the input gains focus. Changes of the datepicker's `opened` and `disabled` state SHALL notify Angular, so an OnPush view that reads them SHALL re-render.

#### Scenario: Effect that opens the calendar

- **WHEN** an effect calls `open()` and the calendar is later closed
- **THEN** the effect has run once

#### Scenario: Effect that writes the form control

- **WHEN** an effect sets the bound form control's value and the input then gains focus
- **THEN** the effect has run once

#### Scenario: OnPush reader

- **WHEN** an OnPush component renders `opened` and `disabled` and the datepicker is opened, closed and disabled from code
- **THEN** the rendered text follows each change

### Requirement: Calendar position

The calendar SHALL open below the field, aligned to its start edge, and SHALL fall back to above, then to end-aligned below and above, when it does not fit, keeping 8 px from the viewport edges. Inside a `kbq-form-field` it SHALL be positioned against the form field's container, otherwise against the input. The position SHALL stay fixed while the calendar is open. The gap to the field SHALL belong to the overlay pane, so a click there MUST NOT reach the content under it.

#### Scenario: Not enough room below

- **WHEN** the field is near the bottom of the viewport and the calendar is opened
- **THEN** the calendar opens above the field

#### Scenario: Pointer in the gap

- **WHEN** the calendar is open below the field and the user points 2 px below the field's container
- **THEN** the point hits the overlay pane but not the calendar content

### Requirement: Scroll behaviour

By default the open calendar SHALL follow the field when the page scrolls. A strategy provided through `KBQ_DATEPICKER_SCROLL_STRATEGY` anywhere in the injector tree SHALL replace this. The default SHALL also apply where the datepicker module's providers are out of reach, such as in a modal opened from the root injector.

#### Scenario: Datepicker in a modal component

- **WHEN** a datepicker is rendered in a modal whose content imports only `KbqDatepickerModule` and its toggle is clicked
- **THEN** the calendar opens without throwing

### Requirement: Text direction

The calendar's overlay SHALL take its `dir` from the `Directionality` injected into the datepicker, and a calendar opened after the direction changed SHALL use the new direction.

#### Scenario: Right-to-left page

- **WHEN** the directionality is `rtl` and the calendar is opened
- **THEN** the overlay's bounding box has `dir="rtl"`

### Requirement: Overlay layer

When the input is inside a `kbqOverlayLayer` element, the calendar's overlay SHALL be rendered into that layer on every opening.

#### Scenario: Reopening inside a layer

- **WHEN** a datepicker inside a `kbqOverlayLayer` is opened, closed and opened again
- **THEN** both times the overlay is rendered inside that layer

### Requirement: Calendar element classes and id

The `panelClass` of the datepicker SHALL be added as classes of the calendar element inside the overlay; the overlay pane itself SHALL always carry `kbq-datepicker__popup`. The calendar element SHALL carry the datepicker's `id`, `kbq-datepicker-<n>` by default.

#### Scenario: Extra classes

- **WHEN** `panelClass` is `'my-calendar'` and the calendar is opened
- **THEN** the `kbq-calendar` element has the class `my-calendar`

### Requirement: Month shown on open

The calendar SHALL open on the month of the datepicker's `startAt`, or of the input's value when `startAt` is not set, or of today when neither is. That date SHALL be the active date, moved into the range of `minDate` and `maxDate` when it lies outside.

#### Scenario: Value as the start

- **WHEN** the input holds 1 January 2020 and no `startAt` is set
- **THEN** `startAt` reads 1 January 2020

#### Scenario: Explicit start

- **WHEN** the input holds 1 January 2020 and `startAt` is 1 January 2010
- **THEN** `startAt` reads 1 January 2010

#### Scenario: Start before the minimum

- **WHEN** `startAt` is 1 January 2000 and `minDate` is 1 January 2016
- **THEN** the active date is 1 January 2016

### Requirement: Month grid

The calendar SHALL show the month of the active date as a table: a header row of weekday names starting at the date adapter's first day of the week, then one cell per day of the month, with the first row offset by a blank cell spanning the weekdays before the 1st.

#### Scenario: January

- **WHEN** the calendar shows January 2017
- **THEN** it renders 31 day cells

#### Scenario: Short first row

- **WHEN** the first week of the month has two days
- **THEN** the first row starts with a blank cell spanning five columns

### Requirement: Day cell states

Each day's content element SHALL have `kbq-calendar__body-today` when it is today, `kbq-selected` when it is the selected date and `kbq-disabled` when it cannot be picked. The cell of the active date SHALL have `kbq-calendar__body_active`.

#### Scenario: Selected day in the shown month

- **WHEN** 10 January 2017 is selected and January 2017 is shown
- **THEN** the content of day 10 has `kbq-selected`

#### Scenario: Selected day in another month

- **WHEN** 10 February 2017 is selected and January 2017 is shown
- **THEN** no day has `kbq-selected`

### Requirement: Picking a day

Clicking an enabled day SHALL select that date, write it to the input and close the calendar. Clicking the day that is already selected SHALL close the calendar without changing the value. Clicking a disabled day MUST do nothing.

#### Scenario: Picking a new day

- **WHEN** the calendar of an input holding 1 January 2020 is open and the user clicks day 2
- **THEN** the input holds 2 January 2020 and the calendar closes

#### Scenario: Picking the selected day

- **WHEN** the user clicks the day that is already selected
- **THEN** `selectedChanged` does not fire and the value is unchanged

#### Scenario: Disabled day

- **WHEN** the user clicks a day that the filter disables
- **THEN** no date is selected

### Requirement: Picking a day keeps the time

A date picked in the calendar or passed to `select()` SHALL take its year, month and day from the picked date and its hours, minutes, seconds and milliseconds from the input's current value. Without a current value it SHALL be used as given.

#### Scenario: Value with a time

- **WHEN** the value is 1 February 2017 01:01:10.100 and 1 February 2018 is selected
- **THEN** the value is 1 February 2018 01:01:10.100

### Requirement: Calendar range

The datepicker's `minDate` and `maxDate` SHALL disable the days before and after them, compared by calendar day. Changing either binding SHALL re-render the shown month, and a binding that becomes unset SHALL lift its limit. They MUST NOT validate the input's value.

#### Scenario: Minimum in the middle of the month

- **WHEN** January 2016 is shown and `minDate` is 15 January 2016
- **THEN** days 1 to 14 are disabled

#### Scenario: Minimum unset

- **WHEN** `minDate` becomes `undefined`
- **THEN** no day is disabled

### Requirement: Date filter

A function bound to the input's `kbqDatepickerFilter` SHALL disable every day of the calendar for which it returns `false`, and SHALL give the control the `kbqDatepickerFilter` error while it returns `false` for the value. Binding `undefined` SHALL remove the filter and its error.

#### Scenario: Filtered days

- **WHEN** the filter rejects the 1st of each month and the calendar is opened
- **THEN** day 1 is disabled and day 2 is not

#### Scenario: Rejected value

- **WHEN** the filter rejects the 1st and the value is 1 January 2017
- **THEN** the input has `ng-invalid`, and with 2 January 2017 it does not

#### Scenario: Filter removed

- **WHEN** the filter binding becomes `undefined`
- **THEN** the input is no longer `ng-invalid`

### Requirement: Custom day classes

A `dateClass` function bound on the datepicker SHALL be called for each day of the shown month, and the classes it returns, as a string, array, Set or object, SHALL be added to that day's cell.

#### Scenario: Even days

- **WHEN** `dateClass` returns `'even'` for even days
- **THEN** the cell of day 2 has the class `even` and the cell of day 1 does not

### Requirement: Header buttons

The calendar header SHALL have previous-month and next-month buttons that move the shown month by one calendar month, keeping the day or the last day of a shorter month, disabled in the month of `minDate` and of `maxDate` respectively. A current date button SHALL show today's month with today active, without selecting it, and SHALL be disabled when today's month is outside the months of `minDate` and `maxDate`.

#### Scenario: Through a short month

- **WHEN** the active date is 31 January 2017 and the user clicks next and then previous
- **THEN** the active date is 28 February 2017 and then 28 January 2017

#### Scenario: At the maximum

- **WHEN** `maxDate` is 1 January 2018 and the user moves from December 2017 to January 2018
- **THEN** the next button is disabled and further clicks do not move the month

#### Scenario: Back to today

- **WHEN** the calendar shows another month and the user clicks the current date button
- **THEN** the calendar shows today's month

### Requirement: Month and year lists

The calendar header SHALL show the active month's short name, title-cased, and its year as triggers of a month list with the full month names and a year list from the year of `minDate` to the year of `maxDate` (1900 to 2099 by default). Picking from either SHALL change the shown month, keep the day where the month allows, and emit the datepicker's `monthSelected` or `yearSelected` without changing the value.

#### Scenario: Picking a year

- **WHEN** the calendar shows 31 March 2017 and the user picks 2016 in the year list
- **THEN** the calendar shows March 2016 and `yearSelected` fires
- **AND** the input's value is unchanged

#### Scenario: Months outside the range

- **WHEN** the calendar shows a month in the year of `minDate`
- **THEN** the months before the month of `minDate` are disabled in the month list

### Requirement: Calendar follows the input value

While the calendar is open, a new value of the input, whether typed or written by code, SHALL become the calendar's selected date and active date, and the calendar SHALL show its month and year.

#### Scenario: Typing a year

- **WHEN** the calendar is open and the user types a date in 2014
- **THEN** the header's year trigger shows 2014

### Requirement: Calendar controls outside the tab order

The day cells, the month and year selects and the previous, current date and next buttons SHALL have `tabindex="-1"`. The calendar MUST NOT handle keys on its days: Enter or an arrow key there does nothing, and the keyboard path to a date is the input.

#### Scenario: Enter on the calendar body

- **WHEN** the calendar is open and Enter is dispatched on its body
- **THEN** the calendar stays open and the value is unchanged

### Requirement: Display format

The input SHALL render its value with the `dateInput` format of `KBQ_DATE_FORMATS`, or of the date adapter when that token is not provided, and SHALL take the date-part order and the separator for typing from the same format.

#### Scenario: Russian format

- **WHEN** the format is `dd.MM.yyyy` and the value is 24 January 2024
- **THEN** the input shows `24.01.2024`

### Requirement: Forms integration

The input SHALL work as a form control with `ngModel`, `formControl` and `formControlName`, and SHALL accept a value through its `[value]` binding without Angular forms. A value from any of them SHALL be shown in the input and become the datepicker's selection, and a picked date SHALL reach the bound model.

#### Scenario: Model to input

- **WHEN** the bound form control is set to 1 January 2017
- **THEN** the input's `value()` and the datepicker's `selected` are 1 January 2017

#### Scenario: Calendar to model

- **WHEN** `select()` is called with 1 January 2017
- **THEN** the form control's value is 1 January 2017

### Requirement: Values written by code

A value written through `[value]` or the form control SHALL be converted with the date adapter and rendered in the input format, an invalid date as empty text, and the write MUST NOT mark the control dirty or emit `dateInput` or `dateChange`. `valueChange` SHALL fire only when the new value falls on a different day.

#### Scenario: Model change keeps the control pristine

- **WHEN** the `ngModel` value is changed in code
- **THEN** the input is still `ng-pristine`

#### Scenario: Value of the wrong type

- **WHEN** `[value]` is bound to the string `'1/1/2017'`
- **THEN** rendering does not throw

### Requirement: ISO 8601 strings

The datepicker's `startAt` and the input's `[value]`, `min` and `max` SHALL accept ISO 8601 strings and convert them with the date adapter.

#### Scenario: Start as a string

- **WHEN** `startAt` is bound to an ISO string for 1 July 2017
- **THEN** `startAt` reads 1 July 2017 as a date

### Requirement: Touched and dirty state

The input SHALL mark its form control touched when it gains focus, when it loses focus and when a date is picked in the calendar. Typing a different date and picking a date SHALL mark the control dirty.

#### Scenario: Focus

- **WHEN** an untouched input receives focus
- **THEN** it has `ng-touched`

#### Scenario: Picking a date

- **WHEN** a date is picked in the calendar
- **THEN** the input has `ng-touched` and `ng-dirty`

### Requirement: Disabled input

The input SHALL be disabled through its `disabled` input or its form control. A disabled input SHALL have the `disabled` attribute, lose focus, emit `disabledChange`, and disable its datepicker and toggle unless the datepicker's own `disabled` is set.

#### Scenario: Disabling through the form control

- **WHEN** the bound form control is disabled
- **THEN** the input's `disabled` property is `true` and the toggle's `disabled` is `true`

### Requirement: Empty state

The input SHALL report `empty` as `true` only while it renders no text and the browser reports no bad input, also right after a value is written by a form or a binding. A `kbq-cleaner` in the enclosing form field SHALL follow it.

#### Scenario: Clearing by code

- **WHEN** a form control and a `[value]` binding both set their inputs to `null`
- **THEN** both inputs report `empty` and no cleaner is shown

#### Scenario: Value written back

- **WHEN** both are set to a date again
- **THEN** both inputs report not empty and both cleaners are shown

### Requirement: Typing a date

When the text in the input parses as a date in the input format, the input SHALL re-render it as a full date, filling in the parts not typed yet, select the next date part, and update the value, keeping the time of the current value.

#### Scenario: Typing digits only

- **WHEN** the field uses `dd.MM.yyyy`, its text is selected and the user types `24012024`
- **THEN** the input shows `24.01.2024` with the year selected

#### Scenario: Typed date reaches the model

- **WHEN** the text of a field bound with `ngModel` becomes `01.01.2001` through a key press
- **THEN** the model holds 1 January 2001 and the input is `ng-dirty`

### Requirement: Normalizing date parts

While parsing typed text, a day or month of 0 SHALL become 1, a day above 31 SHALL become 31, a month above 12 SHALL become 12, a year of 0 SHALL become 1 and a year longer than four digits SHALL keep its first four. When the input loses focus with all three parts present, a year of one or two digits SHALL be read as 20xx below 30 and as 19xx from 30; a year of three digits SHALL be reported as a parse error.

#### Scenario: Month 13

- **WHEN** the text of a `dd.MM.yyyy` field becomes `15.13.2024` through a key press
- **THEN** the input shows `15.12.2024`

#### Scenario: Two-digit year

- **WHEN** the input shows `01.01.24` and loses focus
- **THEN** the input shows `01.01.2024`

#### Scenario: Year from 30

- **WHEN** the input shows `01.01.85` and loses focus
- **THEN** the input shows `01.01.1985`

### Requirement: Non-digit keys

A key with a letter key code, A to Z, pressed without Ctrl or Cmd, MUST NOT be typed: it SHALL be prevented and the input SHALL emit `incorrectInput`. Any other typed character that is not a digit MUST NOT be inserted as typed: right after the digits of a date part, a character other than the format's separator SHALL complete that part; otherwise, the separator included, it SHALL be rejected with `incorrectInput`.

#### Scenario: Typing a letter

- **WHEN** the user presses the A key in the input
- **THEN** no character is inserted and `incorrectInput` fires

#### Scenario: Typing the separator

- **WHEN** the field uses `.` as its separator, holds `1` and the user types `.`
- **THEN** the text stays `1` and `incorrectInput` fires

### Requirement: Unparseable text

Text that does not parse as a date SHALL be left in the input as typed, also when the input loses focus, and the input SHALL report a parse error once it has lost focus.

#### Scenario: Invalid text on blur

- **WHEN** the input's text is `very-valid-date` and the input loses focus
- **THEN** the input still shows `very-valid-date`

### Requirement: Deleting text

Backspace, Delete, Tab and key combinations with Ctrl or Cmd SHALL keep their default behaviour in the input. The text they change SHALL be parsed on the next key handled by the input or on blur; text emptied that way SHALL then set the value to `null`, pass `null` to the form control and clear the datepicker's selection.

#### Scenario: Select all

- **WHEN** the user presses Ctrl+A in the input
- **THEN** the browser selects the input's text

#### Scenario: Emptied field

- **WHEN** a field holding `12.12.2011` is emptied and the user presses Enter
- **THEN** the datepicker's `selected` is `null`
- **AND** `dateChange` fires with a `null` value on the following `change` event

### Requirement: Pasting a date

A paste SHALL replace the whole text of the input with the pasted text. Text made of three digit groups separated by single punctuation characters SHALL be re-rendered in the input format with its own separator and SHALL update the value when it parses. Pasted text with letters SHALL emit `incorrectInput`.

#### Scenario: Date before the minimum

- **WHEN** the user pastes `31.12.2009` into a field with `min` set to 1 January 2010
- **THEN** the value is 31 December 2009 and the control has the `kbqDatepickerMin` error

### Requirement: Moving between date parts

While the input holds a value, Left and Right SHALL select the previous and next date part, wrapping around at either end, Home and PageUp SHALL select the first part, and End and PageDown the last. These keys SHALL be prevented, and while the input holds no value they SHALL do nothing. A key pressed before the previous one's selection lands SHALL move on from where that selection goes.

#### Scenario: Two quick Left presses

- **WHEN** the year is selected and the user presses Left twice in quick succession
- **THEN** the day is selected

### Requirement: Selected part kept in view

When a key or a typed part moves the selection to another date part in a field too narrow for its text, the input SHALL scroll just far enough to show that part.

#### Scenario: Back to the day

- **WHEN** a 96 px wide field is scrolled to the end of `24.01.2024` and the user presses Left twice
- **THEN** the day is selected and the field is scrolled back to its start

### Requirement: Stepping a date part

Up and Down SHALL be prevented. While the input holds a value they SHALL increase or decrease the date part at the caret by one, keep the selection on that part, pass the new value to the form control and emit `dateChange`. The day and the month SHALL wrap within their month and year, and the year SHALL stop at 1 and 9999, or within the range of the datepicker's `minDate` and `maxDate`.

#### Scenario: Last day of the month

- **WHEN** the input shows `31.01.2024` with the day selected and the user presses Up
- **THEN** the input shows `01.01.2024`

#### Scenario: Month into a shorter month

- **WHEN** the input shows `31.01.2024` with the month selected and the user presses Up
- **THEN** the input shows `29.02.2024`

### Requirement: Space key

Space SHALL be prevented. With text selected or the caret right after a separator, it SHALL select the next date part, going from the last part to the first. Otherwise it SHALL be inserted at the caret and the text parsed as typed.

#### Scenario: Space over the selected day

- **WHEN** the day is selected and the user presses Space
- **THEN** the month is selected

### Requirement: dateInput event

The input SHALL emit `dateInput` with a `KbqDatepickerInputEvent` when typing, pasting or emptying the text changes the value to a different day. It MUST NOT emit it for a date picked in the calendar, a value written by code, or text that leaves the day unchanged.

#### Scenario: Same date typed twice

- **WHEN** the user types `12.12.2011` twice in a row
- **THEN** `dateInput` has fired once

#### Scenario: Calendar pick

- **WHEN** a day is picked in the calendar
- **THEN** `dateInput` does not fire

### Requirement: dateChange event

The input SHALL emit `dateChange` with a `KbqDatepickerInputEvent` carrying the input, its element and its current value one tick after each native `change` event, when a date is picked in the calendar, and when Up or Down steps a date part.

#### Scenario: Committing typed text

- **WHEN** the input fires a native `change` event
- **THEN** `dateChange` fires and `dateInput` does not

#### Scenario: Calendar pick

- **WHEN** a day is picked in the calendar
- **THEN** `dateChange` fires

### Requirement: Selection from code

`select(date)` on the datepicker SHALL make that date the selection. When it falls on a different day than the previous selection, it SHALL emit `selectedChanged` and write the date to the input as a user change: the control becomes dirty and touched and `dateChange` fires. `selected` and `value` SHALL read the current selection.

#### Scenario: Selecting from code

- **WHEN** `select()` is called with 1 January 2017 on a datepicker bound to an `ngModel` input
- **THEN** the model holds 1 January 2017 and the input is `ng-dirty` and `ng-touched`

### Requirement: Range validation

The input's `min` and `max` SHALL validate the bound form control: a value before `min` SHALL produce `kbqDatepickerMin` with `min` and `actual`, and one after `max` SHALL produce `kbqDatepickerMax` with `max` and `actual`. Bounds SHALL be inclusive, compared down to the millisecond, and re-checked at once when a binding changes. The out-of-range value SHALL still reach the control. An invalid date as a bound or as the value MUST NOT produce a range error.

#### Scenario: Value before the minimum

- **WHEN** `min` is 1 January 2010 and the value is set to 31 December 2009
- **THEN** the input has `ng-invalid` and the control has `kbqDatepickerMin`

#### Scenario: Value equal to the maximum

- **WHEN** `max` is 1 January 2020 and the value is set to the same date
- **THEN** the input is not `ng-invalid`

#### Scenario: Typed date after the maximum

- **WHEN** the text becomes `02.01.2020` through a key press with `max` set to 1 January 2020
- **THEN** the control has `kbqDatepickerMax`

#### Scenario: Raising the minimum

- **WHEN** the value is 15 June 2015 and `min` changes to 1 January 2016
- **THEN** the control has `kbqDatepickerMin`

#### Scenario: Invalid bound

- **WHEN** `min` is an invalid date and the value is 15 June 2015
- **THEN** the control has no errors

### Requirement: Unsetting a bound

A `min` or `max` binding that becomes unset SHALL lift its bound. A bound written in code SHALL stay in force until its own binding changes.

#### Scenario: Minimum unset

- **WHEN** the value is before `min` and the `min` binding becomes `undefined`
- **THEN** the control has no errors

#### Scenario: Maximum written in code

- **WHEN** `max` is set in code below the value and then only the `min` binding changes
- **THEN** the control has `kbqDatepickerMax`

### Requirement: Parse validation

While the input does not have focus, is not empty, meaning it renders text or the browser reports bad input, and its last text did not parse, the control SHALL have `kbqDatepickerParse` with the rendered `text`. While the input has focus the error MUST NOT be reported.

#### Scenario: Bad input on blur

- **WHEN** the browser reports bad input and the input loses focus
- **THEN** the control has `kbqDatepickerParse`

### Requirement: Error state

When a form directive is bound, the input SHALL be in error state when its control is invalid and either touched or in a submitted form, unless the `errorStateMatcher` input or an injected `ErrorStateMatcher` decides otherwise; the input wins over the injected one. The error state SHALL be re-evaluated on every change detection.

#### Scenario: Untouched invalid control

- **WHEN** the control is required, empty and untouched
- **THEN** `errorState()` is `false`

#### Scenario: Submitted form

- **WHEN** the control is invalid and its form is submitted
- **THEN** `errorState()` is `true`

#### Scenario: Matcher for dirty controls

- **WHEN** `ShowOnControlDirtyErrorStateMatcher` is bound and the invalid control is focused and blurred
- **THEN** `errorState()` stays `false`

### Requirement: Blur re-validation

When the input loses focus, it SHALL re-parse its text and re-validate the control. Re-validation on blur of a value that did not change MUST NOT emit on `statusChanges`.

#### Scenario: Async validator

- **WHEN** a control with an async validator is `VALID` and the input loses focus
- **THEN** `statusChanges` emits nothing new and the control stays `VALID`

### Requirement: Required attribute

The `required` input SHALL be reflected as the `required` attribute of the input element, and SHALL be absent when it is `false`. The datepicker MUST NOT add a required validator of its own.

#### Scenario: Toggling required

- **WHEN** `required` is bound to `true` and then to `false`
- **THEN** the attribute is present and the empty input fails `checkValidity()`, then the attribute is gone

### Requirement: Validation tooltip

When a `kbqTooltip` is bound to the input's `kbqValidationTooltip`, the input SHALL switch that tooltip to manual trigger and, on each `incorrectInput` while the tooltip is closed, SHALL show it and hide it 3,000 ms later.

#### Scenario: Letter typed

- **WHEN** a validation tooltip is bound and the user types a letter
- **THEN** the tooltip appears and hides after 3 seconds

### Requirement: Toggle opens and closes the calendar

Clicking an enabled `kbq-datepicker-toggle-icon` bound with `[for]` SHALL focus the datepicker's input and open the calendar. Clicking it while the calendar is open SHALL close the calendar and return focus to the input.

#### Scenario: Second click

- **WHEN** the user clicks the toggle twice and then once more
- **THEN** the calendar opens, closes and opens again
- **AND** `opened` and `closed` fired once each for the first two clicks

#### Scenario: Picking a day after opening from the toggle

- **WHEN** the calendar was opened from the toggle and the user clicks a day
- **THEN** the calendar closes and the input has focus

### Requirement: Toggle keeps focus in the input

A press on the toggle SHALL be prevented from moving focus, and its click MUST NOT propagate past the toggle, so a click handler on the enclosing form field does not run for it.

#### Scenario: Form field with its own toggle handler

- **WHEN** the form field has `(click)="datepicker.toggle()"` and the user clicks the toggle icon
- **THEN** the calendar opens once and stays open

### Requirement: Toggle disabled state

The toggle SHALL be disabled when its datepicker is disabled, including through the input or its form control, or when its own `disabled` is set. A disabled toggle SHALL have `aria-disabled="true"`, render its icon disabled, and MUST NOT open the calendar.

#### Scenario: Disabled input

- **WHEN** the input is disabled and the user clicks the toggle
- **THEN** the toggle has `aria-disabled="true"` and the calendar stays closed

### Requirement: Toggle reflects the calendar state

The toggle host SHALL have `aria-expanded` following the calendar's state. Its default icon SHALL have `kbq-active` while the calendar is open, and SHALL take the error color (`kbq-error`) while the input inside a form field is in error state.

#### Scenario: Open calendar

- **WHEN** the calendar is open
- **THEN** the default icon has `kbq-active`, and loses it once the calendar closes

#### Scenario: Invalid touched input

- **WHEN** the input's control is invalid and touched
- **THEN** the default icon has `kbq-error`

### Requirement: Custom toggle icon

Content marked with `kbqDatepickerToggleIcon` inside the toggle SHALL replace the default icon button.

#### Scenario: Custom icon

- **WHEN** an element with `kbqDatepickerToggleIcon` is projected into the toggle
- **THEN** that element is rendered and the default icon button is not

### Requirement: Tooltip on the toggle

A tooltip with a pointer or focus trigger on the toggle element SHALL hide when the calendar opens and MUST NOT show while it is open, so it does not compete with the calendar for the same anchor.

#### Scenario: Hovering the toggle of an open calendar

- **WHEN** the toggle has a `kbqTooltip` and the calendar is open
- **THEN** the tooltip is not shown

### Requirement: Input attributes

The input element SHALL have the classes `kbq-input` and `kbq-datepicker`, `autocomplete="off"`, an `id` from its `id` input or a generated `kbq-datepicker-input-<n>`, a `placeholder` attribute, and `min` and `max` attributes with its bounds in ISO 8601 while they are set.

#### Scenario: Default attributes

- **WHEN** an input with `[kbqDatepicker]` and no `id` is rendered
- **THEN** it has `autocomplete="off"` and an `id` starting with `kbq-datepicker-input-`

### Requirement: Form field integration

Inside a `kbq-form-field`, the input SHALL report the control type `datepicker`, so the form field gets `kbq-form-field-type-datepicker`, SHALL report its focus and empty state to the form field, and a click on the form field's container SHALL focus the input.

#### Scenario: Clicking the field around the input

- **WHEN** the user clicks the form field's container outside the input
- **THEN** the input has focus

### Requirement: Accessible names in the calendar

The previous-month, current date and next-month buttons SHALL be named by `a11y.previousMonth`, `a11y.currentDate` and `a11y.nextMonth` of the active locale. Each weekday column header SHALL have the full weekday name as `aria-label`. The toggle's default icon SHALL be hidden from assistive technology.

#### Scenario: English locale

- **WHEN** the locale is `en-US` and the calendar is open
- **THEN** the header buttons are named "Previous month", "Current date" and "Next month"

### Requirement: Placeholder

The placeholder SHALL be the non-empty `placeholder` input, or else `datepicker.placeholder` of the active locale when the input format is that locale's own, or else the input format in lower case. The active locale SHALL be the locale service's when one is provided, otherwise `KBQ_DATE_LOCALE`, and a date adapter provided on a component SHALL decide for inputs under it. Strings provided for `KBQ_DATEPICKER_LOCALE_CONFIGURATION`, also through its provider function, SHALL win.

#### Scenario: Locale with shipped strings

- **WHEN** the date locale is `es-LA`
- **THEN** the placeholder is `dd/mm/aaaa`

#### Scenario: Locale without shipped strings

- **WHEN** the date locale is `zh-CN`
- **THEN** the placeholder is `yyyy/mm/dd`

#### Scenario: Format set by the application

- **WHEN** the locale is `en-US` and `KBQ_DATE_FORMATS` sets `dateInput` to `dd.MM.yyyy`
- **THEN** the placeholder is `dd.mm.yyyy`

#### Scenario: Locale service

- **WHEN** `KBQ_DATE_LOCALE` is `en-US` and the locale service is set to `pt-BR`
- **THEN** the placeholder is `dd/mm/yyyy`

### Requirement: Locale overrides

`[localeOverrides]` on the input SHALL override the `datepicker` strings it renders, and `[localeOverrides]` on the `kbq-datepicker` SHALL override the strings of its calendar; keys left out SHALL keep following the locale.

#### Scenario: Placeholder of one input

- **WHEN** an input binds `[localeOverrides]` with its own `datepicker.placeholder`
- **THEN** only that input shows the overridden placeholder

### Requirement: Locale and time zone changes

When the active locale changes, the input SHALL re-derive its format and re-render its value. When the time zone of `KbqDateTimezoneService` changes, the input SHALL re-render its value and the calendar SHALL re-mark today.

#### Scenario: Switching the locale

- **WHEN** `KbqLuxonDateModule` is used and the locale service switches from `ru-RU` to `en-US` while the input holds 24 January 2024
- **THEN** the input shows `2024-01-24`

### Requirement: Calendar linked to an input

An `input[kbqCalendar]` bound to a `kbq-calendar` SHALL make that calendar show the input's value as its selected and active date whenever the value changes. A second input bound to the same calendar MUST throw "A KbqDatepicker can only be associated with a single input." A day picked in such a calendar MUST NOT write the input by itself.

#### Scenario: Input value changes

- **WHEN** the user types a date into an input bound with `[kbqCalendar]`
- **THEN** the linked calendar shows that date's month with the date selected
