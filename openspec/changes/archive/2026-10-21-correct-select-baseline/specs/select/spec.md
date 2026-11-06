# Spec Delta

## MODIFIED Requirements

### Requirement: Typeahead

Without a search field, characters typed in quick succession SHALL activate the next option whose label starts with them, ignoring case. On a closed single select this SHALL also select that option. On a closed multiple select typing MUST do nothing. When a search field is projected, typeahead MUST be off, even while the field is hidden or the panel is closed: characters reach the field only while it is shown in the open panel, and typing on a closed select does nothing.

#### Scenario: Typing on a closed single select

- **WHEN** a closed single select has focus and the user types the first letters of an option's label
- **THEN** that option becomes the value without opening the panel

#### Scenario: Typing on a closed multiple select

- **WHEN** a closed multiple select has focus and the user types letters
- **THEN** neither the value nor the panel changes

### Requirement: Values without a rendered option

Without `showPreselectedValues` and without virtual scrolling, a written value that matches no rendered option and no option already selected MUST NOT be shown in the trigger; a selected option that stops being rendered, for example because a search filters it out, SHALL stay selected and shown. With `showPreselectedValues` set, such a value SHALL be shown with the label from `virtualOptionFactory`, or with the raw value when there is no factory.

#### Scenario: Unmatched value by default

- **WHEN** the form writes a value that no option has
- **THEN** the trigger shows the placeholder

#### Scenario: Unmatched value with showPreselectedValues

- **WHEN** `showPreselectedValues` is set and the form writes a value that no option has
- **THEN** the trigger shows that value

### Requirement: Touched and dirty state

The select SHALL mark its form control touched when it loses focus while the panel is closed and each time the panel closes. A disabled select MUST NOT mark it touched when it loses focus. A change of the selection SHALL mark the control dirty, whether the user makes it or code calls `select()` or `deselect()` on an option; a value written through `[value]`, `value.set()`, the form control or `ngModel` MUST NOT.

#### Scenario: Closing the panel

- **WHEN** the user opens and closes the panel without picking anything
- **THEN** the control is touched but not dirty

#### Scenario: Picking a value

- **WHEN** the user picks an option
- **THEN** the control is dirty

### Requirement: Tags for multiple values

In multiple-selection mode the trigger SHALL show one tag per selected value, labelled with the option's `viewValue` (its `viewValue` input, or its trimmed text), in the order described by the ordering requirement. With `triggerValuesLimit` greater than zero, only that many tags SHALL be rendered.

#### Scenario: Two values selected

- **WHEN** two options are selected in a multiple select
- **THEN** the trigger shows two tags with their labels

#### Scenario: Limit on tags

- **WHEN** `triggerValuesLimit` is 2 and four values are selected
- **THEN** the trigger renders two tags

### Requirement: Multiline trigger

With `multiline` set, the select SHALL use multiple selection, wrap its tags onto as many rows as they need, and get the `kbq-select_multiline` class. An empty multiline trigger SHALL have the height of a single-line one. When the panel fits neither below nor above, the trigger is taller than the panel and the panel fits at full height below the first row, the panel SHALL be anchored to that row and drawn over the rest, keeping the first row, the arrow and the cleaner clickable.

#### Scenario: Many selected values

- **WHEN** a multiline select has more tags than fit in one row
- **THEN** the trigger grows to show every tag

#### Scenario: Trigger taller than the available space

- **WHEN** the multiline trigger is so tall that the panel fits neither below nor above it, but the panel fits at full height below the trigger's first row
- **THEN** the panel opens one gap below the trigger's first row, over the remaining rows

### Requirement: Custom tag template

An `<ng-template #kbqSelectTagContent>` inside the select SHALL replace the markup of every tag in multiple-selection mode. It SHALL be rendered once per tag the trigger shows, in the order and up to the `triggerValuesLimit` that apply to tags, with the option as `$implicit` and the select as `select`.

#### Scenario: Custom tags

- **WHEN** a `#kbqSelectTagContent` template is declared and two values are selected
- **THEN** the trigger renders the template twice, once per option

### Requirement: Select-all action

Activating the select-all row by click, Enter or Space SHALL select every enabled, rendered option unless all of them are already selected, in which case it SHALL deselect them. Disabled options MUST NOT change. During a search it SHALL act only on the matching options. Each activation that finds an enabled option to act on SHALL emit one `selectionChange` for the batch, then `onSelectAll`; with no such option it SHALL do nothing.

#### Scenario: Indeterminate row

- **WHEN** some options are selected and the user clicks the row
- **THEN** every enabled option becomes selected

#### Scenario: Acting on search results

- **WHEN** a query is active and the user clicks the row twice
- **THEN** the matching options are selected and then deselected
- **AND** selected options hidden by the query stay selected

### Requirement: Search field

A `kbq-form-field` with `kbqSelectSearch` wrapping a `kbqInput` bound to a form control SHALL render above the option list, outside the listbox. The select MUST NOT filter options itself; the consumer filters what it renders. A query changed in code SHALL keep the active option while it is still listed. The search SHALL be reset when the panel closes. Projecting the search without `kbqInput` or without a form control SHALL throw.

#### Scenario: Consumer filters options

- **WHEN** the user types in the search field and the consumer renders only matching options
- **THEN** the list shows those options, and the first enabled selected option becomes active when it is among them, otherwise the first of them

#### Scenario: Closing resets the search

- **WHEN** the user types a query and closes the panel
- **THEN** the search field is empty the next time the panel opens

### Requirement: Footer

A projected `kbq-select-footer` SHALL render below the list and stay in place while the list scrolls. Any click inside it SHALL close the panel and return focus to the select, unless its handler moved focus out of the panel. Tab and Shift+Tab SHALL step through its enabled focusable controls; once they run out, Tab SHALL close the panel and focus the select. While focus is in the footer, Escape and Alt with an arrow SHALL close the panel, and other keys SHALL be left to the focused control.

#### Scenario: Tabbing into the footer

- **WHEN** the panel is open, the footer has two enabled controls and the user presses Tab three times
- **THEN** focus visits both controls, then the panel closes and the select has focus

#### Scenario: Activating a footer action

- **WHEN** the user clicks a `kbq-select-footer-item` button
- **THEN** the panel closes and the select has focus

### Requirement: Virtual scrolling

`*cdkVirtualFor` in a projected `cdk-virtual-scroll-viewport` SHALL switch the select to virtual scrolling, with the viewport as tall as `panelMaxHeight` unless the empty search result is shown. Selected values whose options are not rendered SHALL stay selected, keeping the label their option showed while selected and rendered, else labelled by `virtualOptionFactory` or the raw value. Without a factory, a written value missing from the data source and not already selected MUST NOT be selected.

#### Scenario: Selected option scrolled out of view

- **WHEN** a value is selected and its option is recycled out of the viewport
- **THEN** the trigger keeps showing the label that option rendered

#### Scenario: Filtering the data source

- **WHEN** a search narrows the data and the selected value's item is filtered out
- **THEN** the trigger keeps showing the selected value

### Requirement: Panel position

The panel SHALL open below the trigger, aligned to its start edge, or above it when only that side fits; with neither side fitting, over a multiline trigger's rows when it can, else where more of it shows. A panel overflowing the viewport sideways SHALL be shifted and narrowed. The side SHALL be kept while the page scrolls, but resolved again after a viewport resize, a multiline re-anchor or a search pinning the width. Inside a form field, it SHALL be positioned against the field's container.

#### Scenario: Not enough room below

- **WHEN** the select is near the bottom of the viewport and the panel fits above the trigger but not below it
- **THEN** the panel opens above the trigger

### Requirement: Panel width

With `panelWidth` unset, the panel SHALL grow with its content, never narrower than the trigger or `panelMinWidth` (200 px by default), up to `panelMaxWidth` or the `--kbq-panel-size-width-max` token. `'auto'` SHALL match the trigger width but keep `panelMinWidth`; a number SHALL be used exactly. With a search field, a content-sized panel SHALL keep the width measured on open while filtering. A panel overflowing the viewport horizontally SHALL be narrowed to fit, below any of these widths.

#### Scenario: Fixed width

- **WHEN** `panelWidth` is 400
- **THEN** the panel is 400 px wide whatever `panelMinWidth` is

#### Scenario: Matching the trigger

- **WHEN** `panelWidth` is `'auto'` and the trigger is 300 px wide
- **THEN** the panel is 300 px wide

#### Scenario: Filtering does not resize

- **WHEN** a content-sized panel with search is open and filtering removes the widest option
- **THEN** the panel keeps its width

### Requirement: Panel height

`panelMaxHeight` SHALL cap the height of the scrollable option list, 256 px by default through the `--kbq-select-panel-size-max-height` token; the search field and footer add to it. Under virtual scrolling it SHALL be the exact height of the viewport, except while the empty search result is shown.

#### Scenario: Custom maximum height

- **WHEN** `panelMaxHeight` is 400 and the options need 600 px
- **THEN** the option list is 400 px tall and scrolls

### Requirement: Tooltip for truncated options

When the select is used through `KbqSelectModule`, an option whose text is cut with an ellipsis SHALL show its `viewValue` (its `viewValue` input, or its trimmed text) in a tooltip on hover; an option whose text fits MUST NOT. `kbqTooltipDisabled` set to `true` on the option SHALL suppress the tooltip.

#### Scenario: Long option text

- **WHEN** an option's text is truncated and the user hovers it
- **THEN** a tooltip with the option's `viewValue` appears

#### Scenario: Short option text

- **WHEN** an option's text fits and the user hovers it
- **THEN** no tooltip appears
