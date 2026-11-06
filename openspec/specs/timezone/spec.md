# timezone Specification

## Purpose

Describes what `@koobiq/components/timezone` guarantees to consumers: how `kbq-timezone-select` behaves as a single-selection select of time zones, how `kbq-timezone-option` labels a zone and narrows its city list for a search, when the overflow tooltip appears, and what the exported offset, sorting and grouping helpers return.

## Requirements

### Requirement: Behaviour inherited from the select

`kbq-timezone-select` SHALL accept the inputs, outputs and methods of `kbq-select` and SHALL behave as a single-selection `kbq-select`, as the `select` spec describes, for keyboard handling of the open panel, value comparison, change events, touched and error state, accessible name, panel position and application-wide defaults, except where this spec states otherwise.

#### Scenario: Escape closes the open panel

- **WHEN** the panel is open and the user presses Escape on the select
- **THEN** the panel closes

### Requirement: Multiple selection is rejected

`kbq-timezone-select` MUST NOT support multiple selection. When `multiple` is `true` or `multiline` is set at the first change detection, the select SHALL throw the error "`kbq-timezone-select` does not support multiple selection.", which `getKbqTimezoneSelectMultipleError()` returns.

#### Scenario: Multiple bound in the template

- **WHEN** a template renders `<kbq-timezone-select [multiple]="true" />`
- **THEN** the first change detection throws that error

#### Scenario: Multiline attribute

- **WHEN** a template renders `<kbq-timezone-select multiline />`
- **THEN** the first change detection throws the same error

### Requirement: Module and standalone use

`KbqTimezoneModule` SHALL export `kbq-timezone-select`, `kbq-timezone-option`, the overflow tooltip directive, `kbq-timezone-select-trigger` and the `utcOffset` and `citiesByFilter` pipes, and SHALL re-export the option module (`kbq-option`, `kbq-optgroup`) and the form-field module. Importing `KbqTimezoneSelect` alone as a standalone component, without the select module, SHALL render a working select.

#### Scenario: Bare standalone import

- **WHEN** a component imports only `KbqTimezoneSelect` and renders `<kbq-timezone-select />`
- **THEN** the select renders without a missing-provider error

#### Scenario: Form field from the timezone module

- **WHEN** a component imports `KbqTimezoneModule` and wraps the select in `kbq-form-field`
- **THEN** the form field renders without importing its own module

### Requirement: Options and groups

The select SHALL treat every `kbq-timezone-option` and every plain `kbq-option` at any depth of its content as an option, including options inside `kbq-optgroup`.

#### Scenario: Options grouped by country

- **WHEN** the options are rendered inside `kbq-optgroup` elements, one per country
- **THEN** opening the panel lists the options of every group under its label

#### Scenario: Plain option

- **WHEN** a plain `kbq-option` with a value is projected among the timezone options
- **THEN** it can be selected like any other option

### Requirement: Option value is the zone id

The value of a `kbq-timezone-option` SHALL be the `id` of its `timezone`. A `value` bound on the same option MUST NOT change it.

#### Scenario: Selecting by zone id

- **WHEN** the options bind only `[timezone]` and the select is bound with `[(value)]` to `Europe/Moscow`
- **THEN** the option whose zone id is `Europe/Moscow` is selected

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

### Requirement: Selecting an option

Selecting an option by click or by calling its `select()` method SHALL give the option the `kbq-selected` class, make `selected` of the select return that option, and emit a `KbqOptionSelectionChange` through `optionSelectionChanges`.

#### Scenario: Selection through the option API

- **WHEN** the panel is open and code calls `select()` on the third option
- **THEN** that option has `kbq-selected` and the select's `selected` is that option

#### Scenario: Selection stream

- **WHEN** code subscribes to `optionSelectionChanges` and the user clicks an option
- **THEN** the subscriber receives a `KbqOptionSelectionChange`

### Requirement: Selected zone in the trigger

Without a custom trigger or matcher, the trigger SHALL show the `viewValue` of the selected option on one line: for a timezone option the formatted offset, the city and the other cities, such as "UTC+03:00 Moscow, Kazan, Kirov". With no value it SHALL show the `placeholder`, or a non-breaking space when there is none.

#### Scenario: Value selected

- **WHEN** the user picks the zone of `city1` whose other cities are `city4, city5`
- **THEN** the trigger text contains "city4, city5"

#### Scenario: No value

- **WHEN** a select with `placeholder="Timezones"` has no value
- **THEN** the trigger shows "Timezones"

### Requirement: Angular forms

The select SHALL work as a form control with reactive forms and `ngModel`, and with `[(value)]` without Angular forms. A value written by the form SHALL select the matching option and show it in the trigger; resetting the control SHALL clear the selection and show the placeholder.

#### Scenario: Initial value of a form control

- **WHEN** the select is bound to `new FormControl('Europe/city17')`
- **THEN** the trigger shows `city17` and that option has `kbq-selected` when the panel opens

#### Scenario: Resetting the control

- **WHEN** the control holds a zone id and is reset
- **THEN** the trigger shows the placeholder and no longer shows the zone

### Requirement: Disabled select and tab index

The select SHALL have `tabindex="0"`, or the value bound to `tabIndex`. When disabled through `disabled` or its form control it SHALL have `tabindex="-1"` and MUST NOT open; once enabled again it SHALL restore its tab index and open on click.

#### Scenario: Disabling through the form control

- **WHEN** the bound form control is disabled and the user clicks the trigger
- **THEN** the select has `tabindex="-1"` and the panel stays closed

#### Scenario: Enabling again

- **WHEN** the control is enabled again and the user clicks the trigger
- **THEN** the select has `tabindex="0"` and the panel opens

### Requirement: Error state colors the arrow

The arrow icon of the trigger SHALL carry the `kbq-empty` color class while the select is disabled, whatever its error state. While the select is enabled, the arrow SHALL carry `kbq-error` in error state and `kbq-contrast-fade` otherwise, and SHALL follow error-state changes made to the form control from outside the select.

#### Scenario: Control becomes invalid and touched

- **WHEN** code sets an error on the control and marks it touched
- **THEN** the arrow has the class `kbq-error`

#### Scenario: Control becomes untouched

- **WHEN** the same control is marked untouched
- **THEN** the arrow has the class `kbq-contrast-fade`

### Requirement: Opening a select without options

When the select has no options, opening it MUST NOT attach the panel at once; the panel SHALL be attached after `delayBeforeDisplayingResultWithoutOptions` (101 ms), as in `kbq-select`.

#### Scenario: Click on an empty select

- **WHEN** the select has no options and the user clicks the trigger
- **THEN** `panelOpen` is still `false` right after the click

### Requirement: Imperative methods do not track signals

`open()`, `close()` and `toggle()` SHALL read the select's state without tracking it, so that a consumer's `effect()` that calls them MUST NOT run again when the panel later opens or closes.

#### Scenario: Opened from an effect

- **WHEN** a consumer's effect calls `open()` once and the user then closes the panel with Escape
- **THEN** the panel is closed and the effect has run only once

### Requirement: Cleaner

A `kbq-cleaner` placed as a direct child of the select SHALL be rendered in the trigger while the select is enabled and its selected option is one that `clearPredicate` accepts, by default an option that is not disabled. Activating it SHALL clear the value, which a single select reports as `undefined`, as the `select` spec describes.

#### Scenario: Clearing the value

- **WHEN** an enabled zone option is selected and the user clicks the cleaner
- **THEN** the trigger shows the placeholder and the cleaner is hidden

### Requirement: Footer

A projected `kbq-select-footer` SHALL be rendered in the panel below the option list, outside the scrollable list, and a click inside it SHALL close the panel.

#### Scenario: Footer placement

- **WHEN** the panel of a select with a `kbq-select-footer` opens
- **THEN** the footer is visible and is not inside `.kbq-select__content`

#### Scenario: Footer click

- **WHEN** the user clicks the footer
- **THEN** the panel closes

### Requirement: Timezone option layout

`kbq-timezone-option` SHALL have the classes `kbq-timezone-option` and `kbq-option` and `role="option"`, and SHALL render the offset as two columns ("UTC" and the offset as `offset()` writes it: signed, but unsigned for a zero offset and empty for one that does not resolve), then the city, then the other cities of the zone.

#### Scenario: Two offset columns

- **WHEN** an option renders a zone with the offset `03:00:00`
- **THEN** its offset columns read "UTC" and "+03:00"

### Requirement: Option view value

The `viewValue` of a timezone option SHALL be the formatted offset followed by the city and the other cities joined with ", ", whatever the option's `viewValue` input says, and MUST NOT be narrowed by `highlightText`.

#### Scenario: Composed view value

- **WHEN** an option renders a zone with offset `03:00:00`, city `city3` and cities `city1, city2`
- **THEN** its `viewValue` is "UTC+03:00 city3, city1, city2"

#### Scenario: With a search token

- **WHEN** the same option has `highlightText` set to `city2`
- **THEN** its `viewValue` is still "UTC+03:00 city3, city1, city2"

### Requirement: Option as a title text reference

A timezone option SHALL resolve `KBQ_TITLE_TEXT_REF` to itself and SHALL expose its city label as `textElement`, so `kbq-title` measures the city.

#### Scenario: Text element

- **WHEN** a timezone option has rendered
- **THEN** its `textElement` is the element with the class `kbq-timezone-option__city`

### Requirement: Overflow tooltip appears only for a clamped city list

The overflow tooltip on a `kbq-timezone-option` SHALL be enabled only while the rendered city list takes more than `TOOLTIP_VISIBLE_ROWS_COUNT` (3) lines, which is where the option clamps it. It SHALL re-check this when the list is resized or its content changes, without waiting for a hover, and SHALL then show on hover after the tooltip's enter delay.

#### Scenario: List that fits

- **WHEN** the city list of an option takes three lines or fewer and the user hovers the option
- **THEN** no tooltip is shown

#### Scenario: Clamped list

- **WHEN** the city list takes four lines and the user hovers the option
- **THEN** a tooltip with the option's text appears

#### Scenario: Resize without hover

- **WHEN** the city list of an option grows past three lines because the panel is resized
- **THEN** the tooltip becomes enabled without the pointer entering the option

### Requirement: Overflow tooltip content

The overflow tooltip SHALL show the formatted offset, the city and the other cities narrowed by `highlightText` exactly as the rendered list is, and SHALL re-read that text whenever the pointer enters the option.

#### Scenario: Narrowed by a search

- **WHEN** an option of `city3` with cities `city1, city2` has `highlightText` set to `city2` and the pointer enters it
- **THEN** the tooltip content is "UTC+03:00 city3, city2"

### Requirement: Disabling the overflow tooltip

`kbqTooltipDisabled` set to `true` on a timezone option SHALL keep the overflow tooltip hidden even when the city list is clamped. `kbqTooltipDisabled` set to `false` MUST NOT show a tooltip for a city list that fits.

#### Scenario: Disabled by the consumer

- **WHEN** an option with `kbqTooltipDisabled` set to `true` has a clamped city list and the user hovers it
- **THEN** no tooltip is shown

### Requirement: Overflow tooltip placement and triggers

The overflow tooltip SHALL be placed to the right of the option, SHALL let pointer events pass through to the options under it unless `ignoreTooltipPointerEvents` is set to `false`, SHALL also show when the option gets keyboard focus, and SHALL hide when the pointer leaves the option.

#### Scenario: Keyboard focus

- **WHEN** the user moves focus with the keyboard onto an option whose city list is clamped
- **THEN** the tooltip appears to the right of the option

### Requirement: Offset of a zone

The offset an option shows SHALL be the zone's `offset` string, kept verbatim and never recomputed, when the zone has one. Without it the offset SHALL be resolved from the IANA `id` each time the option renders, for the current moment, so a zone with daylight saving time shows the offset in force. `resolveZoneOffset(zone, timestamp)` SHALL return the same value, or an empty string when nothing resolves.

#### Scenario: Summer time from the id

- **WHEN** an option renders `Europe/Berlin` without `offset` on 15 July
- **THEN** it shows "UTC+02:00"

#### Scenario: Winter time from the id

- **WHEN** `resolveZoneOffset` is called for `Europe/Berlin` without `offset` at a timestamp on 15 January
- **THEN** it returns `01:00:00`

#### Scenario: Explicit offset

- **WHEN** the zone `Europe/Berlin` carries `offset: '05:00:00'`
- **THEN** `resolveZoneOffset` returns `05:00:00` at any timestamp

### Requirement: Offset formatting

`offset(value)` SHALL turn an `HH:MM:SS` offset into `+HH:MM` for a positive offset, `−HH:MM` with U+2212 for a negative one and an unsigned `00:00` for zero, and SHALL return an empty string for a value without minutes. `offsetFormatter` SHALL prefix the result with "UTC", and `offsetFormatterAsObject` and the `utcOffset` pipe SHALL return `{ UTC: <offset> }`.

#### Scenario: Negative offset

- **WHEN** `offsetFormatter('-03:00:00')` is called
- **THEN** it returns "UTC−03:00", with U+2212 as the minus sign

#### Scenario: Unresolved offset

- **WHEN** `offsetFormatter('')` is called
- **THEN** it returns "UTC"

#### Scenario: Zero offset

- **WHEN** `offsetFormatter('00:00:00')` is called
- **THEN** it returns "UTC00:00", without a sign

### Requirement: Parsing an offset

`parseOffset(value)` SHALL return the offset in minutes east of UTC for a fixed offset such as `03:00:00` or `-03:00:00`, and `NaN` when the value resolves to no offset.

#### Scenario: Negative offset

- **WHEN** `parseOffset('-03:00:00')` is called
- **THEN** it returns -180

### Requirement: Sorting zones

`timezonesSortComparator` SHALL order zones by the offset each is on at the moment of the call and then by city name, SHALL place a zone whose offset does not resolve after every zone whose offset does, and SHALL be antisymmetric for every pair.

#### Scenario: World-wide list

- **WHEN** zones of Los Angeles, New York, London, Berlin, Moscow, Mumbai, Tokyo and Sydney are sorted with it in any order
- **THEN** they come out in that order, west to east

#### Scenario: Same offset

- **WHEN** two zones have the same offset
- **THEN** they are ordered by city name

#### Scenario: Unresolvable offset

- **WHEN** one zone's offset cannot be resolved
- **THEN** it sorts after the other zone

### Requirement: Grouping zones by country

`getZonesGroupedByCountry(zones)` SHALL return one group per country code, compared case-insensitively, ordered by country name, each with the zones of that country ordered as `timezonesSortComparator` orders them. It MUST NOT mutate its input and MUST NOT read the host time zone.

#### Scenario: Groups in name order

- **WHEN** zones of seven countries are grouped
- **THEN** the groups are ordered by `countryName`

#### Scenario: Mixed-case country codes

- **WHEN** one zone has `countryCode: 'RU'` and another `countryCode: 'ru'`
- **THEN** both zones end up in one group

### Requirement: Promoting a country

`promoteCountry(groups, countryCode)` SHALL return a new array with the group of that country, matched case-insensitively, moved to the front and the other groups in their original order. An unknown country or no country SHALL return a copy in the original order.

#### Scenario: Known country

- **WHEN** groups ordered by name are promoted with `ru`
- **THEN** Russia comes first and the rest keep their order
- **AND** the input array keeps its own order

#### Scenario: Unknown country

- **WHEN** they are promoted with `zz` or `undefined`
- **THEN** the result has the groups in their original order

### Requirement: Collapsing other countries

`collapseOtherCountries(groups, countryCode, label)` SHALL return the group of that country first, when present, followed by one group with `countryCode: null` and `countryName` equal to `label` that holds the zones of every other country, ordered by offset and keeping their own `countryName`. That group SHALL be left out when there is no other zone for it to hold. Without a matching country, every zone SHALL go into that one group.

#### Scenario: Own country and the rest

- **WHEN** groups of seven countries are collapsed with `ru` and "Other countries"
- **THEN** the result is Russia followed by "Other countries" with a `null` country code

#### Scenario: No country

- **WHEN** the groups are collapsed with `undefined` and "All"
- **THEN** the result is one group "All" holding every zone

### Requirement: Host country

`kbqResolveHostCountry(zones)` SHALL return the `countryCode` of the zone whose `id` is the time zone of the host the code runs on, or `undefined` when no zone has that id.

#### Scenario: Host zone listed

- **WHEN** the list contains a zone whose `id` is the host's time zone, with `countryCode: 'hz'`
- **THEN** the function returns `hz`

#### Scenario: Host zone missing

- **WHEN** no zone in the list has the host's time zone as its `id`
- **THEN** the function returns `undefined`

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

### Requirement: Panel height

`panelMaxHeight` SHALL cap the height of the scrollable option list by setting `--kbq-select-panel-size-max-height` on the panel.

#### Scenario: Custom maximum height

- **WHEN** `panelMaxHeight` is 400
- **THEN** the panel carries `--kbq-select-panel-size-max-height: 400px`

### Requirement: Overlay and panel classes

The overlay pane SHALL have the class `kbq-select-overlay`. The panel SHALL have the classes `kbq-select__panel` and `kbq-timezone-select__panel` and the classes given in `panelClass`.

#### Scenario: Extra panel classes

- **WHEN** `panelClass` is `['custom-one', 'custom-two']` and the panel opens
- **THEN** the panel has `kbq-select__panel`, `custom-one` and `custom-two`, and the pane has `kbq-select-overlay`

### Requirement: Overlay layer

When the select is inside an element with `kbqOverlayLayer`, its panel SHALL be rendered into that element's overlay layer instead of the global overlay container.

#### Scenario: Select inside an overlay layer

- **WHEN** the select is rendered inside `<div kbqOverlayLayer>` and opened
- **THEN** the overlay host of its panel is inside that element's `.kbq-overlay-layer`

### Requirement: Panel stays in the viewport

When the trigger sits at the bottom edge of the viewport, the open panel SHALL be placed so that it lies entirely inside the viewport.

#### Scenario: Trigger on the bottom edge

- **WHEN** the select is at the bottom of the viewport and the user opens it
- **THEN** the panel's top is at or below 0 and its bottom at or above the viewport height

### Requirement: Option list scrollbar

The option list SHALL hide the native scrollbar and show the library's scrollbar track, which flashes when the panel opens, then fades, and reappears while the pointer is over the list. Clicking the scrollbar thumb MUST NOT close the panel. A list that does not overflow SHALL show no scrollbar.

#### Scenario: Flash on open

- **WHEN** the panel of a long list opens
- **THEN** the scrollbar track is shown and then fades out

#### Scenario: Thumb click

- **WHEN** the user clicks the scrollbar thumb
- **THEN** the panel stays open

#### Scenario: Short list

- **WHEN** the panel of a list with three options opens
- **THEN** no scrollbar is shown

### Requirement: Search field

A projected `kbq-form-field` with `kbqSelectSearch` SHALL be rendered above the option list and SHALL receive focus when the panel opens. The select MUST NOT filter options itself; the consumer renders only the matching ones. Escape in the field SHALL clear a non-empty query and keep the panel open, and SHALL close the panel when the query is empty.

#### Scenario: Focus on open

- **WHEN** the panel of a select with a search field opens
- **THEN** the search input has focus

#### Scenario: Consumer filtering

- **WHEN** the user types `city1` and the consumer renders only the zones that match it
- **THEN** the panel lists the options of `city1` and `city17` only

#### Scenario: Escape with a query

- **WHEN** the search field holds `city1` and the user presses Escape
- **THEN** the field is empty

#### Scenario: Escape without a query

- **WHEN** the search field is empty and the user presses Escape
- **THEN** the panel closes

### Requirement: Hiding the search for short lists

With `searchMinOptionsThreshold` set, the search field SHALL be rendered only while the number of options is at least the threshold or the field holds a query.

#### Scenario: Below the threshold

- **WHEN** the threshold is 10 and the select has 3 options
- **THEN** the panel opens without a search field

#### Scenario: Above the threshold

- **WHEN** the threshold is 2 and the select has 3 options
- **THEN** the panel opens with the search field

### Requirement: Empty search result

When a non-empty query leaves no option, the select SHALL render a projected `[kbq-select-search-empty-result]` element inside the option list. The select MUST NOT provide text for it.

#### Scenario: Query matches nothing

- **WHEN** the query matches no zone and a `kbq-select-search-empty-result` element is projected
- **THEN** that element is shown in the option list

### Requirement: Localized search placeholder

When the projected search input has no placeholder of its own, the select SHALL give it `searchPlaceholder` from the `timezone` section of the active locale, and SHALL replace it when the locale changes.

#### Scenario: Default locale

- **WHEN** the panel of a select with a search field opens under the default locale
- **THEN** the search input's placeholder is the `ru-RU` `searchPlaceholder`

#### Scenario: Locale switched

- **WHEN** the application switches the locale to `en-US`
- **THEN** the placeholder becomes "City or time zone"

### Requirement: Consumer placeholder wins

A placeholder the consumer binds on the search input, before or after the first render, MUST NOT be overwritten by the locale placeholder, also when the locale changes. When the consumer's placeholder is removed, the locale placeholder SHALL apply again.

#### Scenario: Placeholder bound from the start

- **WHEN** the search input binds `placeholder="Consumer placeholder"` and the locale switches to `en-US`
- **THEN** the placeholder is still "Consumer placeholder"

#### Scenario: Placeholder removed

- **WHEN** the consumer sets its placeholder to `undefined`
- **THEN** the placeholder becomes the locale's `searchPlaceholder`

### Requirement: Highlighting the search in an option

`highlightText`, a string or an array of strings, SHALL wrap each case-insensitive match in the offset columns, the city and the city list of a timezone option in `<mark class="kbq-highlight-background">`. With `foldDiacritics` set to `true`, matches SHALL be found with diacritics folded, as `createSearchPredicate` matches them.

#### Scenario: Match in the city list

- **WHEN** an option with cities `city1, city2` has `highlightText` set to `city2`
- **THEN** the city list contains a `mark` with the class `kbq-highlight-background` and the text "city2"

### Requirement: Option narrows its city list

With `highlightText` set, a timezone option SHALL render only the entries of its city list that match it, as `filterCitiesBySearchString` returns them; the city itself and the offset stay.

#### Scenario: One matching city

- **WHEN** an option with cities `city1, city2` has `highlightText` set to `city2`
- **THEN** its city list reads "city2"

### Requirement: Filtering a city list

`filterCitiesBySearchString(cities, pattern)` and the `citiesByFilter` pipe SHALL return the entries of a ", "-separated list that contain the pattern, or any one of several patterns, ignoring case and treating special characters literally, joined with ", ". Patterns that look like a bare UTC offset, such as `+3`, `−05:30` or a lone `+`, SHALL be ignored, but a lone hyphen-minus SHALL not. With no usable pattern the list SHALL be returned unchanged.

#### Scenario: Several patterns

- **WHEN** the list is "Kaliningrad, Kazan, Kirov, Moscow" and the patterns are `kazan` and `moscow`
- **THEN** the result is "Kazan, Moscow"

#### Scenario: Offset-like pattern

- **WHEN** the pattern is `+3`
- **THEN** the whole list is returned

#### Scenario: Hyphen-minus

- **WHEN** the list is "Baden-Baden, Kazan" and the pattern is `-`
- **THEN** the result is "Baden-Baden"

#### Scenario: No city matches

- **WHEN** the pattern matches no entry of the list
- **THEN** the result is an empty string

### Requirement: Arrow keys change the value of a closed select

While the closed select has focus, Down SHALL select the next enabled option and Up the previous one, without opening the panel; Right and Left SHALL act as Down and Up, swapped in a right-to-left layout. A step SHALL start from the active option, not the value: it follows each selection, stays where the panel left it after closing without a choice, and survives a form reset. With no active option, a forward step SHALL select the first enabled option and a backward one SHALL do nothing.

#### Scenario: Stepping over a disabled option

- **WHEN** nothing is selected, the panel has not been opened yet, the second option is disabled and the user presses Down twice
- **THEN** the first and then the third option becomes the value
- **AND** the panel stays closed

#### Scenario: Stepping back

- **WHEN** the third option is selected and the user presses Up
- **THEN** the first option becomes the value

### Requirement: Alt with an arrow opens the panel

While the closed select has focus, Alt with Down or Up SHALL open the panel without changing the value.

#### Scenario: Alt and Down

- **WHEN** the closed select has no value and the user presses Alt+Down
- **THEN** the panel opens and the value is still empty

### Requirement: Typeahead matches the city

Without a search field, typeahead SHALL match the typed characters against the beginning of an option's city only, not against its offset or its other cities, and on a closed select typing SHALL select the matching option without opening the panel, except that a typed space opens it. A select that has a `kbqSelectSearch` field when its content initializes MUST NOT run typeahead, whether its panel is open or closed.

#### Scenario: Typing a city name

- **WHEN** a closed select without a search field has focus and the user types `city17`, while `city1` is also an option
- **THEN** the option of `city17` becomes the value

### Requirement: Combobox semantics

The select host SHALL have the class `kbq-select`, `role="combobox"`, `aria-haspopup="listbox"`, an `aria-expanded` that follows the panel and an `aria-controls` pointing at the option list only while the panel is open. The option list SHALL have `role="listbox"` and no `aria-multiselectable` attribute.

#### Scenario: Open panel

- **WHEN** the panel is open
- **THEN** the select has `aria-expanded="true"` and an `aria-controls` equal to the id of the `listbox`

### Requirement: Custom trigger content

A projected `<kbq-timezone-select-trigger>` element SHALL replace the value text of the trigger while a value is selected; the placeholder, cleaner and arrow stay. The directive SHALL match only that element, not an attribute of the same name.

#### Scenario: Custom label for the value

- **WHEN** a `kbq-timezone-select-trigger` containing "Custom trigger" is projected and a zone is selected
- **THEN** the trigger shows "Custom trigger" and no default value text

### Requirement: Custom matcher

A projected `kbq-select-matcher` SHALL replace the whole content of the trigger, including the placeholder, the value, the cleaner and the arrow.

#### Scenario: Matcher projected

- **WHEN** a `kbq-select-matcher` containing "Custom matcher" is projected
- **THEN** the trigger shows only that matcher

### Requirement: Localized strings

The `timezone` section of the locale SHALL provide `searchPlaceholder` and `otherCountriesLabel`, following the active locale with `ru-RU` as the default. The select SHALL render only `searchPlaceholder`; `otherCountriesLabel` is for consumers to pass to `collapseOtherCountries`. `[localeOverrides]` SHALL override the strings for one select and `kbqTimezoneLocaleConfigurationProvider()` for an injector.

#### Scenario: Override for one select

- **WHEN** a select binds `[localeOverrides]="{ timezone: { searchPlaceholder: 'Where?' } }"`
- **THEN** its `timezoneLocaleConfiguration().searchPlaceholder` is "Where?"

#### Scenario: English locale

- **WHEN** the active locale is `en-US`
- **THEN** `otherCountriesLabel` is "Other countries"
