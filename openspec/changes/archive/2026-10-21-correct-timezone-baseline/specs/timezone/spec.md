# timezone Specification Delta

## MODIFIED Requirements

### Requirement: Pointer opens and closes the panel

Clicking the trigger of an enabled select that has options SHALL open the panel while it is closed and close it while it is open. Clicking an enabled option SHALL select it and close the panel; a click on a disabled option MUST NOT select it and leaves the panel open. A click outside the select and its panel SHALL close the panel.

#### Scenario: Click on the trigger

- **WHEN** the user clicks the trigger of a closed select
- **THEN** the panel opens and lists the options

#### Scenario: Click on an option

- **WHEN** the panel is open and the user clicks an enabled option
- **THEN** the panel closes

#### Scenario: Click outside

- **WHEN** the panel is open and the user clicks elsewhere on the page
- **THEN** the panel closes

### Requirement: Error state colors the arrow

The arrow icon of the trigger SHALL carry the `kbq-empty` color class while the select is disabled, whatever its error state. While the select is enabled, the arrow SHALL carry `kbq-error` in error state and `kbq-contrast-fade` otherwise, and SHALL follow error-state changes made to the form control from outside the select.

#### Scenario: Control becomes invalid and touched

- **WHEN** code sets an error on the control and marks it touched
- **THEN** the arrow has the class `kbq-error`

#### Scenario: Control becomes untouched

- **WHEN** the same control is marked untouched
- **THEN** the arrow has the class `kbq-contrast-fade`

### Requirement: Cleaner

A `kbq-cleaner` placed as a direct child of the select SHALL be rendered in the trigger while the select is enabled and its selected option is one that `clearPredicate` accepts, by default an option that is not disabled. Activating it SHALL clear the value, which a single select reports as `undefined`, as the `select` spec describes.

#### Scenario: Clearing the value

- **WHEN** an enabled zone option is selected and the user clicks the cleaner
- **THEN** the trigger shows the placeholder and the cleaner is hidden

### Requirement: Timezone option layout

`kbq-timezone-option` SHALL have the classes `kbq-timezone-option` and `kbq-option` and `role="option"`, and SHALL render the offset as two columns ("UTC" and the offset as `offset()` writes it: signed, but unsigned for a zero offset and empty for one that does not resolve), then the city, then the other cities of the zone.

#### Scenario: Two offset columns

- **WHEN** an option renders a zone with the offset `03:00:00`
- **THEN** its offset columns read "UTC" and "+03:00"

### Requirement: Collapsing other countries

`collapseOtherCountries(groups, countryCode, label)` SHALL return the group of that country first, when present, followed by one group with `countryCode: null` and `countryName` equal to `label` that holds the zones of every other country, ordered by offset and keeping their own `countryName`. That group SHALL be left out when there is no other zone for it to hold. Without a matching country, every zone SHALL go into that one group.

#### Scenario: Own country and the rest

- **WHEN** groups of seven countries are collapsed with `ru` and "Other countries"
- **THEN** the result is Russia followed by "Other countries" with a `null` country code

#### Scenario: No country

- **WHEN** the groups are collapsed with `undefined` and "All"
- **THEN** the result is one group "All" holding every zone

### Requirement: Panel width

The panel SHALL grow with its content by default, never narrower than the form field or `panelMinWidth` (200 px by default), and stop at `panelMaxWidth` or the `--kbq-panel-size-width-max` token (640 px). `panelWidth="auto"` SHALL match the field but never be narrower than `panelMinWidth`. A numeric `panelWidth` SHALL be used exactly, without a minimum width.

#### Scenario: Sized to the content

- **WHEN** the form field is 300 px wide and the panel opens
- **THEN** the overlay pane has no fixed width

#### Scenario: Wide field

- **WHEN** the form field is 800 px wide
- **THEN** the overlay pane has a minimum width of 800 px

#### Scenario: Matching the field

- **WHEN** `panelWidth` is `'auto'` and the field is 300 px wide
- **THEN** the pane is 300 px wide

#### Scenario: Narrow field

- **WHEN** the form field is 100 px wide
- **THEN** the overlay pane has a minimum width of 200 px

#### Scenario: Explicit width

- **WHEN** `panelWidth` is 400 and the field is 300 px wide
- **THEN** the pane is 400 px wide and has no minimum width

#### Scenario: Maximum width

- **WHEN** `panelMaxWidth` is 500
- **THEN** the panel element has `max-width: 500px`

### Requirement: Arrow keys change the value of a closed select

While the closed select has focus, Down SHALL select the next enabled option and Up the previous one, without opening the panel; Right and Left SHALL act as Down and Up, swapped in a right-to-left layout. A step SHALL start from the active option, not the value: it follows each selection, stays where the panel left it after closing without a choice, and survives a form reset. With no active option, a forward step SHALL select the first enabled option and a backward one SHALL do nothing.

#### Scenario: Stepping over a disabled option

- **WHEN** nothing is selected, the panel has not been opened yet, the second option is disabled and the user presses Down twice
- **THEN** the first and then the third option becomes the value
- **AND** the panel stays closed

#### Scenario: Stepping back

- **WHEN** the third option is selected and the user presses Up
- **THEN** the first option becomes the value

### Requirement: Typeahead matches the city

Without a search field, typeahead SHALL match the typed characters against the beginning of an option's city only, not against its offset or its other cities, and on a closed select typing SHALL select the matching option without opening the panel, except that a typed space opens it. A select that has a `kbqSelectSearch` field when its content initializes MUST NOT run typeahead, whether its panel is open or closed.

#### Scenario: Typing a city name

- **WHEN** a closed select without a search field has focus and the user types `city17`, while `city1` is also an option
- **THEN** the option of `city17` becomes the value
