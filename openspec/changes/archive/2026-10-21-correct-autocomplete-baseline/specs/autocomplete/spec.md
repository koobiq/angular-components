# Spec Delta

## MODIFIED Requirements

### Requirement: Scroll strategy

By default, the panel SHALL be repositioned when the page, or a CDK scrollable outside the panel such as a `cdkScrollable` or `kbqScrollbarViewport` element, scrolls, and its own scrolling MUST NOT reposition it. Scrolling any other element does not reposition it. Providing `KBQ_AUTOCOMPLETE_SCROLL_STRATEGY` SHALL replace that behaviour for the fields under the provider.

#### Scenario: Close strategy

- **WHEN** `KBQ_AUTOCOMPLETE_SCROLL_STRATEGY` provides the overlay close strategy and the page scrolls while the panel is open
- **THEN** the panel closes

#### Scenario: Plain scrolling container

- **WHEN** the field is inside an `overflow: auto` element that is not a CDK scrollable, and that element scrolls while the panel is open
- **THEN** the panel is not repositioned

### Requirement: Selected state of options

Outside text mode, the chosen option SHALL stay selected (`kbq-selected`) after the panel closes. Choosing another option SHALL deselect the previously selected one. The other options SHALL stay untouched, except after a choice made with Enter while `autoActiveFirstOption` is on: the first enabled option, made active again once the panel has closed, can then be selected as well.

#### Scenario: Choosing a second option

- **WHEN** the user clicks the first option, reopens the panel and clicks the second
- **THEN** the second option is selected and the first is not

### Requirement: Values written by the form

A value written by the form, `null` and `undefined` included, SHALL be shown in the field as `displayWith(value)`, or as the value itself when `displayWith` is not set. A shown value of `null` or `undefined` SHALL leave the field empty, and the number zero SHALL show "0". Such a write MUST NOT mark the control dirty.

#### Scenario: Object written by the form

- **WHEN** the form control is set to the object for Alabama and `displayWith` returns its `name`
- **THEN** the field shows "Alabama" and the control stays pristine

#### Scenario: Reset

- **WHEN** the user has typed text and the form control is reset, with no `displayWith` or one that returns `null` for `null`
- **THEN** the field is empty

#### Scenario: Zero

- **WHEN** the bound value is the number 0 and `displayWith` is not set
- **THEN** the field shows "0"

#### Scenario: displayWith receives null

- **WHEN** `displayWith` returns "None" for `null` and the form control is reset
- **THEN** the field shows "None"

### Requirement: Active option stays in view

For the panel bound to the field when the field's view is first rendered, keyboard navigation SHALL scroll the option list so that the active option is fully visible, without scrolling the page, and focus SHALL be back in the field after each key. With a panel bound later, or bound in place of that one, arrow keys move the active option without scrolling the list.

#### Scenario: Navigating past the visible area

- **WHEN** the panel was bound when the field rendered, the list overflows and the user presses Down once per option
- **THEN** the list is scrolled, the active option is fully visible and the page has not scrolled

#### Scenario: Panel bound after the field rendered

- **WHEN** the panel is bound to the field only after the field has rendered, the list overflows and the user presses Down past the visible area
- **THEN** the active option moves and the list does not scroll

### Requirement: Panel anchored to the caret

With `kbqAutocompleteRelativeToCaret`, the panel SHALL be positioned from the caret: start edge at the caret, right below its line, falling back to above it and to ending at the caret. Without a measurable caret, the field's box is used, or, in a field without a text selection, the field-anchored origin's box. While attached, the panel SHALL be repositioned on input, key release, click, text selection and scrolling in the field, measuring the caret again each time, and MUST stop once closed.

#### Scenario: Panel at the caret

- **WHEN** the user types in a textarea with `kbqAutocompleteRelativeToCaret` and the panel opens
- **THEN** the panel's left edge is within 2 px of the caret and its top is at most 8 px below the caret's line

#### Scenario: Fallback positions

- **WHEN** the caret-anchored panel is positioned
- **THEN** it tries below-start, above-start, below-end and above-end, in that order

#### Scenario: Caret moves

- **WHEN** the panel is open and a key is released in the field
- **THEN** the panel is repositioned

#### Scenario: Panel closed

- **WHEN** the panel is closed and a key is released in the field
- **THEN** the panel is not repositioned

#### Scenario: Field without a text selection

- **WHEN** a caret-anchored input of type `email`, which has no text selection, opens its panel inside a `kbq-form-field`
- **THEN** the panel is positioned against the box of the form field's container, the origin a panel without `kbqAutocompleteRelativeToCaret` uses, and not against the input's own box

#### Scenario: Right-to-left text

- **WHEN** the text of a caret-anchored field is right-to-left and the panel opens
- **THEN** the panel is positioned against the field's own box

### Requirement: Text mode query is the word before the caret

With `kbqAutocompleteTextMode` and no triggers, the query SHALL be the word ending at the caret, made of letters, combining marks and digits of any script, `_` and `-`; there is none while text is selected. `kbqAutocompleteMinLength` SHALL set the shortest query, 1 by default for a word and 0 after a trigger: by default there is no query after whitespace, while with 0 an empty query starts there. The form value SHALL stay the whole text of the field.

#### Scenario: Word before the caret

- **WHEN** the user types "Длинный тек" with the caret at the end
- **THEN** the panel opens, the query text is "тек" and the form value is "Длинный тек"

#### Scenario: After whitespace

- **WHEN** `kbqAutocompleteMinLength` is not set and the text before the caret ends with a space
- **THEN** there is no query and the panel stays closed

#### Scenario: Minimum of three

- **WHEN** `kbqAutocompleteMinLength` is 3 and the user types "те" and then "тек"
- **THEN** the panel stays closed for "те" and opens for "тек"

#### Scenario: Minimum of zero

- **WHEN** `kbqAutocompleteMinLength` is 0 and the user types "текст "
- **THEN** `kbqAutocompleteQueryChange` emits a query with empty text that starts after the space

### Requirement: Trigger characters start a query

With `kbqAutocompleteTriggers`, only the last occurrence of each trigger before the caret SHALL be considered, and the query SHALL run from the closest of those occurrences that count to the caret. An occurrence counts only at the start of a line or after whitespace, and only when no whitespace stands between it and the caret; a plain word is then not a query.

#### Scenario: Right after a trigger

- **WHEN** the triggers are `/` and the user types "hello /"
- **THEN** the panel opens with an empty query whose trigger is `/`

#### Scenario: Trigger inside a word

- **WHEN** the triggers include `@` and the user types "mail@host"
- **THEN** the panel stays closed

#### Scenario: Plain word with triggers

- **WHEN** triggers are set and the user types a word without one
- **THEN** the panel stays closed

#### Scenario: Trigger repeated inside the query

- **WHEN** the triggers are `/` and the user types "/docs/api"
- **THEN** there is no query once the second `/` is typed, and the panel is closed
