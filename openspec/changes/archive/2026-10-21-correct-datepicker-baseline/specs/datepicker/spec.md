## MODIFIED Requirements

### Requirement: Calendar controls outside the tab order

The day cells and the hosts of the month and year selects SHALL have `tabindex="-1"`. The previous, current date and next buttons and the buttons that open the month and year lists are native buttons that SHALL render no `tabindex` while enabled, so they stay in the tab order. The calendar MUST NOT handle keys on its days: Enter or an arrow key there does nothing, and the keyboard path to a date is the input.

#### Scenario: Enter on the calendar body

- **WHEN** the calendar is open and Enter is dispatched on its body
- **THEN** the calendar stays open and the value is unchanged

#### Scenario: Header buttons

- **WHEN** the calendar is open and its previous, current date and next buttons are enabled
- **THEN** none of them has a `tabindex` attribute

### Requirement: Normalizing date parts

While parsing typed text, a day or month of 0 SHALL become 1, a month above 12 SHALL become 12, a year of 0 SHALL become 1 and a year above 9999 SHALL keep its first four digits. A day above 31 SHALL be lowered; while the input holds a value, a day past the end of the typed month SHALL become its last day. On blur with all three parts present, a year of one or two digits SHALL be read as 20xx below 30 and as 19xx from 30; a year of three digits SHALL be reported as a parse error.

#### Scenario: Month 13

- **WHEN** the text of a `dd.MM.yyyy` field becomes `15.13.2024` through a key press
- **THEN** the input shows `15.12.2024`

#### Scenario: Two-digit year

- **WHEN** the input shows `01.01.24` and loses focus
- **THEN** the input shows `01.01.2024`

#### Scenario: Year from 30

- **WHEN** the input shows `01.01.85` and loses focus
- **THEN** the input shows `01.01.1985`

#### Scenario: Day past the end of the month

- **WHEN** a `dd.MM.yyyy` field holds a value and its text becomes `31.04.2024` through a key press
- **THEN** the input shows `30.04.2024`

### Requirement: Deleting text

Backspace, Delete, Tab and key combinations with Ctrl or Cmd SHALL keep their default behaviour in the input. The text they change SHALL be parsed on blur or on the next key the input passes to its parser, such as a digit or Enter; Up and Down step the last parsed value instead, and Left or Right render it again when a date part is empty. Text emptied that way and then parsed SHALL set the value to `null`, pass `null` to the form control and clear the datepicker's selection.

#### Scenario: Select all

- **WHEN** the user presses Ctrl+A in the input
- **THEN** the browser selects the input's text

#### Scenario: Emptied field

- **WHEN** a field holding `12.12.2011` is emptied and the user presses Enter
- **THEN** the datepicker's `selected` is `null`
- **AND** `dateChange` fires with a `null` value on the following `change` event

#### Scenario: Up after emptying

- **WHEN** a field holding `12.12.2011` is emptied and the user presses Up with the caret at its start
- **THEN** the input shows `13.12.2011` and the form control holds 13 December 2011

### Requirement: Pasting a date

A paste SHALL replace the whole text of the input with the pasted text, after putting a `0` before text that starts with one digit followed by a non-digit. Text made of three digit groups separated by single non-word characters SHALL have those characters replaced with the format's separator, and SHALL be re-rendered in the input format and update the value when it parses. Pasted text with Latin letters SHALL emit `incorrectInput`; other letters SHALL NOT.

#### Scenario: Date before the minimum

- **WHEN** the user pastes `31.12.2009` into a field with `min` set to 1 January 2010
- **THEN** the value is 31 December 2009 and the control has the `kbqDatepickerMin` error

#### Scenario: Single leading digit

- **WHEN** the user pastes `1/2/2024` into a `dd.MM.yyyy` field
- **THEN** the input shows `01.2.2024` and the value does not change

### Requirement: Stepping a date part

Up and Down without modifiers SHALL be prevented. While the input holds a value they SHALL increase or decrease the date part at the caret by one, keep the selection on that part, pass the new value to the form control and emit `dateChange`. The day and the month SHALL wrap within their month and year, and the year SHALL stop at 1 and 9999, or within the range of the datepicker's `minDate` and `maxDate`. A year step SHALL keep the day: from 29 February into a common year it empties the input.

#### Scenario: Last day of the month

- **WHEN** the input shows `31.01.2024` with the day selected and the user presses Up
- **THEN** the input shows `01.01.2024`

#### Scenario: Month into a shorter month

- **WHEN** the input shows `31.01.2024` with the month selected and the user presses Up
- **THEN** the input shows `29.02.2024`

#### Scenario: Year step from 29 February

- **WHEN** the input shows `29.02.2024` with the year selected and the user presses Up
- **THEN** the input is empty and the form control receives an invalid date

### Requirement: Parse validation

While the input does not have focus, is not empty, meaning it renders text or the browser reports bad input, and its last text did not parse, the control SHALL have `kbqDatepickerParse` with the rendered `text`. A validation run while the input has focus MUST NOT report the error, but gaining focus SHALL NOT re-validate the control: an error reported on blur stays until the next validation, such as on the next key the input parses.

#### Scenario: Bad input on blur

- **WHEN** the browser reports bad input and the input loses focus
- **THEN** the control has `kbqDatepickerParse`

#### Scenario: Focus after a parse error

- **WHEN** the control has `kbqDatepickerParse` and the input gains focus
- **THEN** the control keeps the error until the user presses a key that the input parses

### Requirement: Blur re-validation

When the input loses focus, it SHALL re-parse its text and re-validate the control. Re-validation on blur of text that parses to the current value, or of an empty input without a value, MUST NOT emit on `statusChanges`. Text that does not parse SHALL be re-validated with events, so `statusChanges` and `valueChanges` emit although the value did not change.

#### Scenario: Async validator

- **WHEN** a control with an async validator is `VALID` and the input loses focus
- **THEN** `statusChanges` emits nothing new and the control stays `VALID`

#### Scenario: Unparseable text

- **WHEN** the input shows `12.1` and loses focus
- **THEN** `statusChanges` emits although the control's value did not change

### Requirement: Toggle keeps focus in the input

A press on the toggle SHALL be prevented from moving focus. The click of an enabled toggle bound to a datepicker MUST NOT propagate past the toggle, so a click handler on the enclosing form field does not run for it; the click of a disabled toggle SHALL propagate.

#### Scenario: Form field with its own toggle handler

- **WHEN** the form field has `(click)="datepicker.toggle()"` and the user clicks the toggle icon
- **THEN** the calendar opens once and stays open

#### Scenario: Disabled toggle

- **WHEN** the toggle's own `disabled` is set, the form field has `(click)="datepicker.toggle()"` and the user clicks the toggle icon
- **THEN** the form field's handler runs and opens the calendar

### Requirement: Placeholder

The placeholder SHALL be the non-empty `placeholder` input. Otherwise, with a locale service, it SHALL be `datepicker.placeholder` of the service's locale whatever the input format; without one, that of the locale of the input's date adapter when the input format is that locale's own, or else the input format in lower case. Strings passed to `kbqDatepickerLocaleConfigurationProvider` SHALL win; strings provided for `KBQ_DATEPICKER_LOCALE_CONFIGURATION` win only without a locale service.

#### Scenario: Locale with shipped strings

- **WHEN** no locale service is provided and the date locale is `es-LA`
- **THEN** the placeholder is `dd/mm/aaaa`

#### Scenario: Locale without shipped strings

- **WHEN** no locale service is provided and the date locale is `zh-CN`
- **THEN** the placeholder is `yyyy/mm/dd`

#### Scenario: Format set by the application

- **WHEN** no locale service is provided, the locale is `en-US` and `KBQ_DATE_FORMATS` sets `dateInput` to `dd.MM.yyyy`
- **THEN** the placeholder is `dd.mm.yyyy`

#### Scenario: Locale service

- **WHEN** `KBQ_DATE_LOCALE` is `en-US` and the locale service is set to `pt-BR`
- **THEN** the placeholder is `dd/mm/yyyy`

#### Scenario: Locale service with a format set by the application

- **WHEN** the locale service is set to `en-US` and `KBQ_DATE_FORMATS` sets `dateInput` to `dd.MM.yyyy`
- **THEN** the placeholder is `yyyy-mm-dd`
