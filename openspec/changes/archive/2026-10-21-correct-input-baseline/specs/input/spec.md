## MODIFIED Requirements

### Requirement: Fraction separator

The number input SHALL accept the locale's fraction separator, and also `.` in the locales whose group separators include a space and whose fraction separator is `,` (`ru-RU`, `es-LA`, `tk-TM`), SHALL render either as the locale's one, and MUST block a second fraction separator while the text already has one. Where `.` is the group separator, as in `pt-BR`, a typed `.` SHALL be read as a group separator and never start a fraction.

#### Scenario: Separator after the integer part

- **WHEN** the user types `123` and then the locale's fraction separator in `ru-RU`
- **THEN** the field shows `123,`

#### Scenario: Second separator

- **WHEN** the field shows `0,12345` and the user presses `,`
- **THEN** the key's default action is prevented and the text is unchanged

#### Scenario: Dot in pt-BR

- **WHEN** the active locale is `pt-BR` and the user types `123`, then `.`, then `4`
- **THEN** the field shows `123` after the `.` and `1.234` after the `4`, and the value is `1234`

### Requirement: Paste

A paste SHALL be parsed with the shipped data of the locale service's active locale id or, when that fails, when that id is not shipped or when no locale service is provided, with the shipped locales in the order `en-US`, `es-LA`, `pt-BR`, `ru-RU`, `tk-TM`, the first that yields a number winning; locale overrides are ignored. The number SHALL replace the whole text of the field in the locale format. A paste that does not parse MUST be blocked and leave the field unchanged.

#### Scenario: Number in another locale's format

- **WHEN** the locale service's active locale is `ru-RU` and `1.234.567,89` and then `10,000,7` are pasted
- **THEN** the field shows `1 234 567,89` and then `10 000,7`, with thin spaces

#### Scenario: Text that is not a number

- **WHEN** `text_value` is pasted into a field that shows a number
- **THEN** the paste is prevented and the field keeps its number

#### Scenario: Ambiguous separators

- **WHEN** the locale service's active locale is `ru-RU` and `1.2.2` or `2,2,2` is pasted
- **THEN** the field shows `12,2` or `22,2`

#### Scenario: No locale service

- **WHEN** the application provides no locale service and `1,5` is pasted into an empty field
- **THEN** `en-US` parses it first and the field shows `15`

### Requirement: Stepping from the keyboard

Up and Down SHALL add and subtract `step`, which defaults to `1`, and with Shift held they SHALL use `bigStep`, which defaults to `10`. The keys' default action SHALL be prevented, the result SHALL be rendered in the locale format and SHALL be reported at once to the bound form control and through `valueChange`, even when it equals the current value, as at a bound, and the field SHALL get focus.

#### Scenario: Step and big step

- **WHEN** `step` is `0.5`, `bigStep` is `10` and the user types `10` and presses Up, Shift+Up and Down
- **THEN** the field shows `10,5`, then `20,5`, then `20`

#### Scenario: Step at the bound

- **WHEN** `max` is `10`, a `formControl` holds `10` and the user presses Up
- **THEN** the value stays `10`, `valueChange` emits `10` and the form control becomes dirty

### Requirement: Caret position after a reformat

With grouping on, when the reformat after a keystroke changes the length of the text by two characters and the value is 1,000 or more in magnitude, as when a digit and a group separator are added or removed together, the caret SHALL move one position in that direction wherever the separator is, so it stays next to the typed digit only when the separator lands before the caret. Otherwise the caret SHALL stay where the user left it.

#### Scenario: Separator inserted

- **WHEN** the field shows `1234` in `ru-RU` and the user types `5` at the end
- **THEN** the field shows `12 345` and the caret is at position 6

#### Scenario: Separator removed

- **WHEN** the field shows `12 345` and the user deletes the last digit
- **THEN** the field shows `1234` and the caret is at position 4

#### Scenario: No separator involved

- **WHEN** the field shows `12` and the user types `3`
- **THEN** the caret is at position 3

#### Scenario: Digit typed before the separator

- **WHEN** the field shows `1234` in `ru-RU`, the caret is at position 0 and the user types `5`
- **THEN** the field shows `51 234` with a thin space and the caret is at position 2, after the `1` rather than after the `5`

### Requirement: Separators follow the locale

The number input SHALL read typed text with the group and fraction separators of the `input.number` section of the active locale, or of `ru-RU` without a locale service, and SHALL render that fraction separator. As group separator it SHALL render the section's `viewGroupSeparator` or, without one, the one `Intl.NumberFormat` uses for the active locale id. `ru-RU`, `es-LA` and `tk-TM` group with a thin space and use `,` for fractions; `en-US` uses `,` and `.`; `pt-BR` uses `.` and `,`.

#### Scenario: English locale

- **WHEN** the active locale is `en-US` and the value is `99999.999`
- **THEN** the field shows `99,999.999`

#### Scenario: Group separator overridden without a view separator

- **WHEN** the active locale is `en-US`, `kbqInputLocaleConfigurationProvider({ number: { groupSeparator: ['.'], fractionSeparator: ',' } })` is provided and the value `1234.5` is written
- **THEN** the field shows `1,234,5`: the group separator still comes from `Intl.NumberFormat`

### Requirement: Rendering for es-LA

Because `es-LA` is not a valid BCP-47 tag, the number input SHALL hand `Intl.NumberFormat` the default locale id `ru-RU` instead of `es-LA`, and SHALL still apply the `input.number` section of `es-LA`. That section sets no `startFormattingFrom`, so an `es-LA` field SHALL group integer parts from 1,000 to 9,999 and negative values, which a `ru-RU` field leaves ungrouped.

#### Scenario: Same rendering as ru-RU

- **WHEN** the value `1234567.89` is rendered in `es-LA` and in `ru-RU`
- **THEN** both fields show the same text

#### Scenario: Four digits

- **WHEN** the value `1234` is rendered in `es-LA` and in `ru-RU`
- **THEN** the `es-LA` field shows `1 234` with a thin space and the `ru-RU` field shows `1234`
