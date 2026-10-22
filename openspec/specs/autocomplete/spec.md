# autocomplete Specification

## Purpose

Describes what `@koobiq/components/autocomplete` guarantees to consumers: how a `kbq-autocomplete` panel bound to an input or a textarea opens and closes, how users choose an option with the pointer, the keyboard or assistive technology, how the choice reaches Angular forms, and how the caret-anchored panel, text mode and inline hint behave.

## Requirements

### Requirement: Binding a panel to a field

The `kbqAutocomplete` input on an `input` or `textarea` SHALL bind that field to a `kbq-autocomplete` panel, referenced through its `kbqAutocomplete` export. The `kbq-autocomplete` element itself MUST NOT take part in layout: it renders as `display: none`, and its content is shown only in an overlay panel opened from the field.

#### Scenario: Host element takes no space

- **WHEN** a `kbq-autocomplete` is rendered next to its field
- **THEN** the `kbq-autocomplete` element has `display: none`

#### Scenario: Options appear in the overlay

- **WHEN** the panel of a bound field opens
- **THEN** the overlay container shows the options declared inside `kbq-autocomplete`

### Requirement: The consumer supplies the options

The panel SHALL show the `kbq-option` and `kbq-optgroup` elements the consumer renders inside `kbq-autocomplete`, in their order, including options added or removed while the panel is open. The autocomplete MUST NOT filter or sort options itself: matching options to the typed text, including smart search, is done by the consumer's own filter.

#### Scenario: Consumer filters by the typed text

- **WHEN** the consumer renders only the options that contain the field's text and the user types "d"
- **THEN** the panel shows exactly the options the consumer rendered for "d"

### Requirement: Opening without a bound panel

Calling `open()` on a field whose `kbqAutocomplete` is not bound SHALL throw an error whose message starts with "Attempting to open an undefined instance of `kbq-autocomplete`.". Writing a form value to such a field MUST NOT throw.

#### Scenario: Opening too early

- **WHEN** `kbqAutocomplete` is not bound and `open()` is called
- **THEN** the missing-panel error is thrown

#### Scenario: Initial value without a panel

- **WHEN** `kbqAutocomplete` is not bound and the form control is set to a value
- **THEN** no error is thrown

### Requirement: Focus and click open the panel

When an enabled, editable field receives focus, the panel SHALL open if the panel's `openOnFocus` input is `true`, its default; with `openOnFocus` set to `false`, focus MUST NOT open it. A click on the field while it holds focus SHALL open a closed panel whatever `openOnFocus` says.

#### Scenario: Default focus behaviour

- **WHEN** the user focuses a field whose panel has no `openOnFocus` binding
- **THEN** the panel opens and shows its options

#### Scenario: Focus opening turned off

- **WHEN** `openOnFocus` is `false` and the user focuses the field
- **THEN** the panel stays closed

#### Scenario: Clicking the focused field

- **WHEN** the field holds focus, the panel is closed and the user clicks the field
- **THEN** the panel opens

### Requirement: Field states that prevent opening

When the field is read-only, natively disabled, or has `kbqAutocompleteDisabled` set, focusing it, typing in it, clicking it and pressing Down MUST NOT open the panel. The field otherwise SHALL keep working as a plain text field.

#### Scenario: Read-only field

- **WHEN** the field is read-only and the user focuses it or presses Down
- **THEN** the panel stays closed

#### Scenario: Autocomplete disabled

- **WHEN** `kbqAutocompleteDisabled` is set and the user focuses the field
- **THEN** the panel stays closed

### Requirement: Typing opens the panel

An `input` event that changes the field's text while the field holds focus SHALL open the panel, also when the field is inside a shadow root. An `input` event on a field that does not hold focus, such as browser autofill, MUST NOT open the panel. An `input` event that leaves the text unchanged MUST NOT open it.

#### Scenario: Typing in the focused field

- **WHEN** the panel is closed after a choice and the user types in the focused field
- **THEN** the panel opens again

#### Scenario: Autofill

- **WHEN** the browser fills the field while it does not hold focus
- **THEN** the panel stays closed

#### Scenario: Event without a change

- **WHEN** the panel is closed and an `input` event fires with the same text as before
- **THEN** the panel stays closed

### Requirement: Programmatic control

`open()` SHALL attach the panel and `closePanel()` SHALL detach it; `open()` MUST NOT check whether the field is read-only, disabled or has the autocomplete disabled. `updatePosition()` SHALL reposition an attached panel and do nothing while it is closed. None of the three SHALL make a calling `effect()` depend on the panel's state. Calling `closePanel()` after the field is destroyed MUST NOT throw.

#### Scenario: Opening from code

- **WHEN** `open()` is called on a closed panel that has options
- **THEN** the panel opens and shows the options

#### Scenario: Reposition while closed

- **WHEN** `updatePosition()` is called while the panel is closed
- **THEN** nothing happens and no error is thrown

#### Scenario: Effect that opens the panel

- **WHEN** an effect calls `open()` and the user then closes the panel with Escape
- **THEN** the effect has run only once

#### Scenario: Effect that closes the panel on an options change

- **WHEN** an effect closes the panel whenever the options change
- **THEN** the panel can still be opened by focusing the field

### Requirement: Returning to the browser tab

When the browser window loses focus while the field holds focus and the panel is closed, the focus the field receives when the user returns MUST NOT open the panel.

#### Scenario: Switching tabs

- **WHEN** the user closes the panel, switches to another tab and comes back
- **THEN** the panel stays closed

### Requirement: Panel without options is hidden

An attached panel with no options SHALL stay attached but hidden: the panel element has `kbq-autocomplete_hidden` instead of `kbq-autocomplete_visible`, and it SHALL be shown again as soon as options are rendered. The trigger's `panelOpen` and the panel's `isOpen()` SHALL be `true` only while the panel is attached and visible; the trigger's `isAttached` SHALL be `true` while it is attached.

#### Scenario: No option matches

- **WHEN** the panel is open and the user types text for which the consumer renders no options
- **THEN** the panel element has `kbq-autocomplete_hidden`

#### Scenario: Options return

- **WHEN** options are rendered again for the next text
- **THEN** the panel element has `kbq-autocomplete_visible`

#### Scenario: Attached panel with no options

- **WHEN** the panel is opened while there are no options
- **THEN** `isAttached` is `true` and `panelOpen` is `false`

#### Scenario: Opened by focus

- **WHEN** the user focuses the field and the panel shows options
- **THEN** `isOpen()` returns `true`

### Requirement: Open-state events

The panel's `opened` output SHALL fire when the panel becomes visible: on opening with options, or when options arrive for a panel opened without them; it MUST NOT fire while there are no options, or again while typing keeps the panel visible. `closed` SHALL fire when a visible panel closes and MUST NOT fire for a panel that showed no options.

#### Scenario: Opening with options

- **WHEN** `open()` is called and options are rendered
- **THEN** `opened` fires

#### Scenario: Options arrive later

- **WHEN** the panel is opened with no options and options are rendered afterwards
- **THEN** `opened` fires once the options are there

#### Scenario: Typing in an open panel

- **WHEN** the panel is open and the user types while options remain
- **THEN** `opened` has fired only once

#### Scenario: Closing a visible panel

- **WHEN** a panel with options is open and `closePanel()` is called
- **THEN** `closed` fires

#### Scenario: Closing an empty panel

- **WHEN** a panel opened without options is closed
- **THEN** `closed` does not fire

### Requirement: Outside click closes the panel

A click with any mouse button, or the end of a touch, outside the field, outside its `kbq-form-field`, outside a custom origin and outside the panel SHALL close the panel without choosing an option and without moving focus. The text in the field and the form value SHALL stay as typed.

#### Scenario: Click elsewhere on the page

- **WHEN** the panel is open and the user clicks outside it
- **THEN** the panel closes and nothing is chosen

#### Scenario: Click inside the custom origin

- **WHEN** the panel is connected to a `kbqAutocompleteOrigin` element and the user clicks inside that element
- **THEN** the panel stays open

### Requirement: Escape and Alt with Up close the panel

While the panel is attached, Escape and Alt+Up SHALL close it, keep focus in the field and reset the active option: to the first enabled option when `autoActiveFirstOption` is on, otherwise to none. The default action of Escape SHALL be prevented only while the panel is visible, so an enclosing modal or overlay stays open on the Escape that closes the panel.

#### Scenario: Escape

- **WHEN** the panel is open, the field has focus and the user presses Escape
- **THEN** the panel closes and the field still has focus

#### Scenario: Alt with Up

- **WHEN** the panel is open and the user presses Alt+Up
- **THEN** the panel closes and the field still has focus

#### Scenario: Escape on a closed panel

- **WHEN** the panel is closed and the user presses Escape in the field
- **THEN** the key's default action is not prevented

#### Scenario: Field in a modal

- **WHEN** the panel of a field in a modal is open and the user presses Escape twice
- **THEN** the first press closes the panel and the second closes the modal

### Requirement: Tab closes the panel

While the panel is attached, with or without options, Tab SHALL close it without choosing the active option and without preventing the key's default action, so focus moves to the next element. Accepting an inline hint is the exception described by the inline hint requirements.

#### Scenario: Tabbing out of an open panel

- **WHEN** the panel is open and the user presses Tab
- **THEN** the panel closes, no option is chosen and focus moves on

#### Scenario: Tabbing out of a panel without results

- **WHEN** the panel is attached with no options and the user presses Tab
- **THEN** the panel is removed from the overlay

### Requirement: Closing actions stream

The trigger's `panelClosingActions` SHALL emit the option's selection change event when an option is chosen, and `null` when the panel is closed by an outside click, Tab or Escape. Tab on a closed panel MUST NOT emit.

#### Scenario: Closing without a choice

- **WHEN** the panel is open and the user clicks outside it
- **THEN** `panelClosingActions` emits `null`

#### Scenario: Closing by a choice

- **WHEN** the user clicks an option
- **THEN** `panelClosingActions` emits a `KbqOptionSelectionChange`

### Requirement: Scroll strategy

By default, the panel SHALL be repositioned when the page, or a CDK scrollable outside the panel such as a `cdkScrollable` or `kbqScrollbarViewport` element, scrolls, and its own scrolling MUST NOT reposition it. Scrolling any other element does not reposition it. Providing `KBQ_AUTOCOMPLETE_SCROLL_STRATEGY` SHALL replace that behaviour for the fields under the provider.

#### Scenario: Close strategy

- **WHEN** `KBQ_AUTOCOMPLETE_SCROLL_STRATEGY` provides the overlay close strategy and the page scrolls while the panel is open
- **THEN** the panel closes

#### Scenario: Plain scrolling container

- **WHEN** the field is inside an `overflow: auto` element that is not a CDK scrollable, and that element scrolls while the panel is open
- **THEN** the panel is not repositioned

### Requirement: Choosing an option

Clicking or Shift+clicking an enabled option SHALL choose it: the panel closes and focus returns to the field. Outside text mode, the option's value SHALL be written to the bound form control and the field SHALL show `displayWith(value)`, or the value itself when `displayWith` is not set.

#### Scenario: Click on an option

- **WHEN** the panel is open and the user clicks an option
- **THEN** the panel closes and the option is chosen

#### Scenario: Shift with a click

- **WHEN** the user Shift+clicks an option
- **THEN** the form value is that option's value

#### Scenario: Object values with displayWith

- **WHEN** option values are objects, `displayWith` returns their `name` and the user chooses the "California" option
- **THEN** the form value is the option's object and the field shows "California"

#### Scenario: Without displayWith

- **WHEN** `displayWith` is not set and the user chooses an option whose value is "test value"
- **THEN** the field shows "test value"

### Requirement: Option selected event

The panel's `optionSelected` output SHALL fire once for every choice, after the value is written, with a `KbqAutocompleteSelectedEvent` whose `source` is the panel and whose `option` is the chosen option. It SHALL fire for options added while the panel is open.

#### Scenario: Choosing an option

- **WHEN** the user clicks the "Washington" option
- **THEN** `optionSelected` fires once with the panel as `source` and the option whose value is "Washington"

#### Scenario: Option added while open

- **WHEN** an option is added while the panel is open and the user clicks it
- **THEN** `optionSelected` reports that option

### Requirement: Selected state of options

Outside text mode, the chosen option SHALL stay selected (`kbq-selected`) after the panel closes. Choosing another option SHALL deselect the previously selected one. The other options SHALL stay untouched, except after a choice made with Enter while `autoActiveFirstOption` is on: the first enabled option, made active again once the panel has closed, can then be selected as well.

#### Scenario: Choosing a second option

- **WHEN** the user clicks the first option, reopens the panel and clicks the second
- **THEN** the second option is selected and the first is not

### Requirement: Disabled options

A disabled option, or an option inside a disabled `kbq-optgroup`, MUST NOT be chosen by a click, MUST leave the panel open when clicked, MUST NOT become active on hover and SHALL be skipped by keyboard navigation and by `autoActiveFirstOption`.

#### Scenario: First options disabled

- **WHEN** the first two options are disabled and the panel opens with `autoActiveFirstOption` on
- **THEN** the third option is active

#### Scenario: Clicking a disabled option

- **WHEN** the user clicks a disabled option
- **THEN** nothing is chosen and the panel stays open

### Requirement: Option selection stream

The trigger's `optionSelections` SHALL emit every selection change of the bound panel's options, including options added later. A subscriber that subscribes before the panel is bound or rendered SHALL receive the changes once it is.

#### Scenario: Subscribing before the panel exists

- **WHEN** a consumer subscribes to `optionSelections` before the panel is rendered and an option is then chosen
- **THEN** the subscriber receives one `KbqOptionSelectionChange`

### Requirement: Typing writes the text to the form

Every change of the field's text made by the user SHALL be written to the bound form control as the text, also while the autocomplete is disabled and when the browser fills in the field; typing after a choice replaces the option's value with the text, and the same text typed again after the form reset the field is written again. In an input of `type="number"` the text SHALL be written as a number, and an empty field as `null`.

#### Scenario: Typing

- **WHEN** the user types "a" and then "al"
- **THEN** the form value is "a" and then "al"

#### Scenario: Typing after a choice

- **WHEN** the user chooses "California" and then deletes its last letter
- **THEN** the form value is the string the field now shows

#### Scenario: Re-typing after a reset

- **WHEN** the user types "Cal", the form sets the value to an empty string, and the user types "Cal" again
- **THEN** the form value is "Cal"

#### Scenario: Typing a number

- **WHEN** the user types "1337" into a number field bound with `ngModel`
- **THEN** the model value is the number 1337

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

### Requirement: Dirty and touched state

Typing in the field and choosing an option, with the pointer or the keyboard, SHALL mark the bound control dirty. Blurring the field SHALL mark it touched.

#### Scenario: Choosing from the keyboard

- **WHEN** the user moves to an option with Down and presses Enter
- **THEN** the control is dirty

#### Scenario: Blur

- **WHEN** the panel is open and the field loses focus
- **THEN** the control is touched

### Requirement: Angular forms integration

The trigger SHALL be the field's control value accessor, so the field works with reactive forms and `ngModel`, and SHALL also work without a forms directive. Disabling the bound control SHALL disable the native field, with or without `kbqInput`; inside a `kbq-form-field` the form field gets `kbq-disabled`.

#### Scenario: Without forms

- **WHEN** a field has `kbqAutocomplete` and no forms directive and the user types
- **THEN** no error is thrown and the panel shows the consumer's options

#### Scenario: Empty ngModel

- **WHEN** the field is bound with `ngModel` to `undefined`
- **THEN** the field is empty

#### Scenario: Disabling a plain input

- **WHEN** a field without `kbqInput` is bound to a form control and the control is disabled
- **THEN** the input element is disabled

### Requirement: Field inside a tag list

When the field is a `kbqInput` that adds tags to a `kbq-tag-list`, a chosen option's text SHALL be written to that input, and the tag list's value MUST NOT change.

#### Scenario: Choosing in a tag input

- **WHEN** the user chooses the "Delta" option from a tag input's panel
- **THEN** the input holds "Delta" and the tag list's value is unchanged

### Requirement: Selection cleared with the field

When `kbq-autocomplete` is placed inside the `kbq-form-field` of its field and that field's control value becomes `null`, `undefined` or an empty string, the selected options SHALL be deselected without emitting selection events.

#### Scenario: Clearing the field

- **WHEN** an option was chosen and the field is cleared with `kbq-cleaner`
- **THEN** no option is selected when the panel opens again

### Requirement: First option active on open

When `autoActiveFirstOption` is on, the first enabled option SHALL become active whenever the panel opens and whenever its options change; when it is off, no option SHALL be active until the user moves to one. It defaults to `true`, and `KBQ_AUTOCOMPLETE_DEFAULT_OPTIONS` sets the default for an injector; the input wins over the token.

#### Scenario: Global default

- **WHEN** `KBQ_AUTOCOMPLETE_DEFAULT_OPTIONS` provides `autoActiveFirstOption: true` and the panel opens
- **THEN** the first option has `kbq-active`

#### Scenario: Input overrides the token

- **WHEN** the token enables it, the input is `false` and the panel opens
- **THEN** the first option is not active

### Requirement: Hover activates an option

Moving the pointer over an enabled option SHALL make it the active option without scrolling the list.

#### Scenario: Pointer on a partly clipped option

- **WHEN** the pointer lands on an option that is only partly visible
- **THEN** the option becomes active and the list does not scroll

### Requirement: Arrow keys

Outside text mode, Down in a field whose panel is closed SHALL open it when the field can open. While the panel is visible, Down SHALL activate the next enabled option, or the first one when none is active, and Up the previous one, without wrapping around, preventing the keys' default action; Up with no active option MUST NOT activate any.

#### Scenario: Down on a closed panel

- **WHEN** the panel is closed and the user presses Down in the field
- **THEN** the panel opens

#### Scenario: Down twice

- **WHEN** the panel is open with no active option and the user presses Down twice
- **THEN** the second option is active and only it has `kbq-active`

#### Scenario: Up from the top

- **WHEN** no option is active and the user presses Up
- **THEN** no option becomes active

### Requirement: Active option stays in view

For the panel bound to the field when the field's view is first rendered, keyboard navigation SHALL scroll the option list so that the active option is fully visible, without scrolling the page, and focus SHALL be back in the field after each key. With a panel bound later, or bound in place of that one, arrow keys move the active option without scrolling the list.

#### Scenario: Navigating past the visible area

- **WHEN** the panel was bound when the field rendered, the list overflows and the user presses Down once per option
- **THEN** the list is scrolled, the active option is fully visible and the page has not scrolled

#### Scenario: Panel bound after the field rendered

- **WHEN** the panel is bound to the field only after the field has rendered, the list overflows and the user presses Down past the visible area
- **THEN** the active option moves and the list does not scroll

### Requirement: Enter chooses the active option

While the panel is visible and an option is active, Enter SHALL choose it and prevent the key's default action, then reset the active option as Escape does. When the active option is no longer among the rendered options, it SHALL be resolved again before Enter acts, so an option the new text filtered out is never chosen. Enter MUST NOT prevent the default action while the panel is closed.

#### Scenario: Enter on an active option

- **WHEN** the user presses Down and then Enter
- **THEN** the field shows the first option's text and the key's default action is prevented

#### Scenario: Enter on a closed panel

- **WHEN** the panel is closed and the user presses Enter
- **THEN** the key's default action is not prevented

#### Scenario: Enter right after typing

- **WHEN** the user types a character that removes the active option and presses Enter before the panel settles
- **THEN** the removed option is not chosen

### Requirement: Shift with an arrow chooses at once

Outside text mode, Shift with Up or Down that changes the active option SHALL choose the newly active option as a user choice.

#### Scenario: Shift with Down

- **WHEN** the panel is open with no active option and the user presses Shift+Down
- **THEN** the first option is selected

### Requirement: Keys left to the field

The panel MUST NOT handle Space, Home, End, Left, Right (except to accept an inline hint) or printable characters: Space never chooses the active option, there is no typeahead, and these keys keep their default editing action in the field.

#### Scenario: Space with an active option

- **WHEN** the user types "New", presses Down and then Space
- **THEN** the field does not show "New York"

#### Scenario: Home in an open panel

- **WHEN** the panel is open and the user presses Home
- **THEN** the active option does not change and the caret moves to the start of the field

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

### Requirement: Width of a caret-anchored panel

A caret-anchored panel SHALL be as wide as its options: neither the field's width nor `panelMinWidth` applies. An explicit `panelWidth` SHALL still apply.

#### Scenario: Minimum width ignored

- **WHEN** `panelMinWidth` is 300 and the caret-anchored panel opens
- **THEN** the overlay pane has no width and a minimum width of 0 px

#### Scenario: Explicit width

- **WHEN** `panelWidth` is 400 and the caret-anchored panel opens
- **THEN** the overlay pane is 400 px wide

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

### Requirement: Query change output

`kbqAutocompleteQueryChange` SHALL emit the query at the caret as a `KbqTextQuery` with `start`, `end`, `text` and `trigger` whenever its text, trigger or start changes, and `null` once there is no query. It MUST NOT emit when nothing changed.

#### Scenario: Leaving the word

- **WHEN** the user types "тек" and then a space
- **THEN** the output emits "тек" and then `null`

#### Scenario: No query at all

- **WHEN** the user only types text that ends with whitespace
- **THEN** the output does not emit

### Requirement: Text mode panel follows the query

In text mode, typing, focusing with `openOnFocus` and clicking the focused field SHALL open the panel when there is a query at the caret, and the panel SHALL close as soon as there is none, whether the text changed or only the caret moved. Moving the caret MUST NOT open the panel.

#### Scenario: Caret leaves the word

- **WHEN** the panel is open for "тек" and the user types a space
- **THEN** the panel closes

### Requirement: Keys in text mode

In text mode, Down on a closed panel MUST NOT open it. Enter on the active option of a visible panel SHALL insert the option and prevent the key's default action, so no line break is inserted. Shift with Up or Down MUST NOT move the active option or choose anything, and its default action MUST NOT be prevented, so it selects text.

#### Scenario: Down in text mode

- **WHEN** the panel is closed in text mode and the user presses Down
- **THEN** the panel stays closed

#### Scenario: Enter in a textarea

- **WHEN** the user types "тек" in a text-mode textarea and presses Enter
- **THEN** the text is "текст песни" with no line break

#### Scenario: Extending a selection

- **WHEN** the panel is open in text mode and the user presses Shift+Down
- **THEN** the active option and the text are unchanged and the key's default action is not prevented

### Requirement: Choosing in text mode inserts the option

In text mode, choosing an option SHALL replace the query, its trigger included, with the option's text — `displayWith(value)` or the value — keep the text after the caret, put the caret right after the inserted text, write the whole text to the form, close the panel and report a `null` query. The field SHALL then dispatch a bubbling `input` event.

#### Scenario: Replacing the word

- **WHEN** the user types "Длинный тек" and chooses "текст песни"
- **THEN** the field and the form value are "Длинный текст песни" and the caret is at the end

#### Scenario: Text after the caret

- **WHEN** the text is "тек и дальше" with the caret after "тек" and the user chooses "текст песни"
- **THEN** the text is "текст песни и дальше"

#### Scenario: Replacing a trigger query

- **WHEN** the triggers are `/` and the user types "hello /bo" and chooses "/bold"
- **THEN** the text is "hello /bold"

### Requirement: Inserting without a query

When there is no query at the caret, as after `open()`, choosing an option in text mode SHALL insert its text at the caret, replacing selected text. In a field without a text selection, such as `type="email"`, it SHALL replace the whole text. Either way the result SHALL be written to the form.

#### Scenario: Opened from code

- **WHEN** the text is "Tags: ", `open()` is called and the user chooses "текст песни"
- **THEN** the field and the form value are "Tags: текст песни"

#### Scenario: Email field

- **WHEN** the user types "jo" in a text-mode email field, opens the panel and chooses "john@x.io"
- **THEN** the field and the form value are "john@x.io"

### Requirement: Options are not kept selected in text mode

In text mode, an option that becomes active when the options arrive MUST NOT be selected, and an inserted option MUST NOT stay selected.

#### Scenario: Options arrive with the first one active

- **WHEN** the user types "тек" and the panel opens with the first option active
- **THEN** no option is selected

### Requirement: Values written by the form in text mode

In text mode, a value written by the form SHALL be shown as it is, without `displayWith`; the query SHALL be dropped and reported as `null`, the panel SHALL close and any inline hint SHALL disappear.

#### Scenario: Form replaces the text

- **WHEN** the panel is open for "Длинный тек" and the form sets the value to an empty string
- **THEN** the panel closes, the query is reported as `null` and the hint is hidden

#### Scenario: displayWith in text mode

- **WHEN** `displayWith` upper-cases values and the form writes "plain тек"
- **THEN** the field shows "plain тек"

### Requirement: Inline hint shows the rest of the active option

In text mode with `kbqAutocompleteInlineHint` on, its default, and the field inside a `kbq-form-field`, the rest of the active option's text SHALL be drawn after the caret in a `.kbq-autocomplete-inline-hint__hint` element of an `aria-hidden` `.kbq-autocomplete-inline-hint` layer placed after the field. Without an active option there is no hint.

#### Scenario: Hint after the caret

- **WHEN** the user types "Длинный тек" and the active option is "текст песни"
- **THEN** the hint layer is shown and the hint reads "ст песни"

#### Scenario: Hint with a caret-anchored panel

- **WHEN** the user types "Suspicious fire" in a textarea whose active option is "firewall"
- **THEN** the hint reads "wall"

### Requirement: Hint only where accepting it reproduces it

The hint MUST NOT be drawn when text other than a line break follows the caret, when the active option does not continue the replaced text (compared without case), when it would be laid out on another row or outside the visible part of the field, or when the field's text is right-to-left, centred or end-aligned.

#### Scenario: Text after the caret

- **WHEN** the text is "тек дальше" with the caret after "тек"
- **THEN** no hint is shown

#### Scenario: Option that does not continue the query

- **WHEN** the query matches the middle of the active option's text but not its start
- **THEN** the panel is open and no hint is shown

#### Scenario: Hint wraps to another row

- **WHEN** the hint would start on the row after the typed word
- **THEN** no hint is shown and Tab keeps its default action

### Requirement: Accepting the inline hint

While a hint is shown, Tab or Right without modifier keys SHALL insert the active option, prevent the key's default action, close the panel and keep focus in the field; without a hint they keep their usual behaviour. The query SHALL be re-read first, so a hint drawn for text that changed without an `input` event is not accepted.

#### Scenario: Tab accepts

- **WHEN** the hint "ст песни" is shown after "Длинный тек" and the user presses Tab
- **THEN** the text is "Длинный текст песни", the hint is hidden and the key's default action is prevented

#### Scenario: Right accepts

- **WHEN** the hint is shown after "тек" and the user presses Right
- **THEN** the text is "текст песни"

#### Scenario: No hint

- **WHEN** the inline hint is off and the user presses Tab in an open text-mode panel
- **THEN** the text is unchanged and the key's default action is not prevented

#### Scenario: Text changed from code

- **WHEN** a hint is shown and the field's text is set to "Длинный" without an `input` event, then the user presses Tab
- **THEN** the text stays "Длинный", the default action is not prevented and the panel closes

### Requirement: Turning the inline hint off

With `kbqAutocompleteInlineHint` off, no hint layer SHALL be created. Turning text mode off, or setting `kbqAutocompleteDisabled`, SHALL hide a hint already drawn, and Tab SHALL then keep its default action.

#### Scenario: Hint disabled

- **WHEN** `kbqAutocompleteInlineHint` is `false` and the user types "тек"
- **THEN** no hint layer exists

#### Scenario: Text mode switched off

- **WHEN** a hint is shown and text mode is switched off
- **THEN** the hint layer is hidden and Tab does not insert anything

### Requirement: Default panel width

Without `panelWidth`, the panel SHALL size to its content and be at least as wide as the larger of `panelMinWidth`, 200 by default, and the width of its origin: the custom origin, otherwise the field's `kbq-form-field` container, otherwise the field.

#### Scenario: Wide origin

- **WHEN** the origin is 400 px wide
- **THEN** the overlay pane has a minimum width of 400 px

#### Scenario: Narrow origin

- **WHEN** the origin is 100 px wide
- **THEN** the overlay pane has a minimum width of 200 px

#### Scenario: Custom minimum

- **WHEN** `panelMinWidth` is 350 and the origin is 100 px wide
- **THEN** the overlay pane has a minimum width of 350 px

### Requirement: Panel width set by panelWidth

With `panelWidth="auto"` the panel SHALL be as wide as its origin, but never narrower than `panelMinWidth`. A number or any other CSS value SHALL be used as the exact width, and `panelMinWidth` MUST NOT apply. Unsetting `panelWidth` SHALL return the panel to the default width at the next open.

#### Scenario: Auto width

- **WHEN** `panelWidth` is `auto` and the origin is 300 px wide
- **THEN** the overlay pane is 300 px wide

#### Scenario: Number

- **WHEN** `panelWidth` is 250 and the origin is 100 px wide
- **THEN** the overlay pane is 250 px wide and has no minimum width

#### Scenario: CSS value

- **WHEN** `panelWidth` is `fit-content`
- **THEN** the overlay pane's width is `fit-content`

#### Scenario: Unset at runtime

- **WHEN** `panelWidth` was 300, is set to `null` and the panel opens again
- **THEN** the overlay pane has no width and a minimum width of 200 px

### Requirement: Maximum panel width

`panelMaxWidth` SHALL cap how wide the panel grows with its content; without it, the `--kbq-panel-size-width-max` token applies, 640 px by default. The cap MUST NOT make the panel narrower than its origin and MUST NOT clamp an explicit `panelWidth`.

#### Scenario: Custom cap

- **WHEN** `panelMaxWidth` is 800 and the options are wider than 640 px
- **THEN** the panel grows up to 800 px

### Requirement: Panel width follows the origin

The origin's width SHALL be measured again on every open, once more after the panel has rendered, and whenever the viewport is resized while the panel is open.

#### Scenario: Origin grows before the panel renders

- **WHEN** the origin is 300 px wide when the panel is opened and 500 px wide when it has rendered
- **THEN** the overlay pane has a minimum width of 500 px

#### Scenario: Window resize

- **WHEN** the panel is open and the window is resized so that the origin is 400 px wide
- **THEN** the overlay pane has a minimum width of 400 px

### Requirement: Panel position

The panel SHALL open below its origin, aligned to its start edge, and above it when there is no room below; the pane carries `kbq-connected-overlay_below` or `kbq-connected-overlay_above`. The gap between origin and panel SHALL belong to the overlay pane, so a click there neither reaches the page nor closes the panel. When the options change while the panel is attached, it SHALL be positioned again for its new size.

#### Scenario: No room below

- **WHEN** the field is at the bottom of the viewport and the panel opens
- **THEN** the panel's bottom edge is at or above the origin's top edge

#### Scenario: Gap between field and panel

- **WHEN** the panel is open and a point 2 px past the origin's edge is hit-tested
- **THEN** it hits the overlay pane and not the panel's content

#### Scenario: More results

- **WHEN** the panel shows one option and the user types text that matches more options
- **THEN** the panel grows taller

### Requirement: Custom origin

`kbqAutocompleteConnectedTo` with an element marked `kbqAutocompleteOrigin` (exported as `kbqAutocompleteOrigin`) SHALL make that element the panel's origin for position and width. A change of the origin SHALL take effect at the next open.

#### Scenario: Changing the origin

- **WHEN** the panel is closed, `kbqAutocompleteConnectedTo` is set to another origin and the panel opens
- **THEN** the panel is positioned against the new origin

### Requirement: Text direction

The panel SHALL take the text direction of the field's `Directionality`, read again at every open.

#### Scenario: Direction changes between opens

- **WHEN** the panel opened in right-to-left, is closed, the direction becomes left-to-right and the panel opens again
- **THEN** the panel's bounding box has `dir="ltr"`

### Requirement: Overlay layer

When the field is inside an element with `kbqOverlayLayer`, the panel SHALL be rendered into that element's overlay layer.

#### Scenario: Field in an overlay layer

- **WHEN** a field inside a `kbqOverlayLayer` element is focused
- **THEN** the panel's overlay host is inside that element's `.kbq-overlay-layer`

### Requirement: Panel element

Classes set on `kbq-autocomplete`, statically or through a `[class]` binding of any shape Angular accepts, SHALL be applied to the `.kbq-autocomplete-panel` element instead of `kbq-autocomplete`, and a changed binding SHALL replace them. The panel element SHALL have the panel's `id`, and its `role="listbox"` element that id followed by `-listbox`.

#### Scenario: Static classes

- **WHEN** `kbq-autocomplete` has `class="class-one class-two"` and the panel opens
- **THEN** the panel has both classes and the `kbq-autocomplete` element has neither

#### Scenario: Binding shapes

- **WHEN** the `[class]` binding changes to `undefined`, then to `{ 'class-map': true, 'class-off': false }`, then to an array
- **THEN** no error is thrown and the panel carries exactly the classes the current value enables

#### Scenario: Panel id

- **WHEN** the panel is open
- **THEN** the panel element's id equals the `kbq-autocomplete` component's `id`

### Requirement: Footer

A `kbq-autocomplete-footer` element, or an element with `kbqAutocompleteFooter`, inside `kbq-autocomplete` SHALL get the `kbq-autocomplete-footer` class and be rendered below the option list, outside the scrolling area and outside the `role="listbox"` element. Clicks inside the footer MUST NOT close the panel.

#### Scenario: Footer with a link

- **WHEN** the panel has a footer and opens
- **THEN** the footer is shown below the options and is not inside the listbox

### Requirement: Scrollbar of the panel

The option list SHALL scroll in a Koobiq scrollbar viewport: the native scrollbar is hidden, the custom track flashes when the panel opens and then fades, it shows on hover, and a list that does not overflow shows no scrollbar. Clicking the scrollbar thumb MUST NOT close the panel.

#### Scenario: Panel opens

- **WHEN** the panel with an overflowing list opens
- **THEN** the track is visible and then fades out

#### Scenario: Thumb click

- **WHEN** the user clicks the scrollbar thumb
- **THEN** the panel stays open

### Requirement: Combobox role only on text inputs

An `input` of type `text` with the autocomplete enabled SHALL have `role="combobox"` and `aria-expanded`, `"true"` only while the panel is visible, also in OnPush views when the panel is opened from code. A `textarea` and inputs of type `search`, `email`, `tel` and `url` MUST keep their native role, without `aria-expanded`. All of these fields SHALL have `aria-autocomplete`.

#### Scenario: Closed panel

- **WHEN** the panel of a text input is closed
- **THEN** the input has `role="combobox"`, `aria-autocomplete="list"` and `aria-expanded="false"`

#### Scenario: Opened from code in an OnPush view

- **WHEN** the field is in an OnPush view and `open()` and then `closePanel()` are called
- **THEN** `aria-expanded` is `"true"` and then `"false"`

#### Scenario: Search input

- **WHEN** the field is an input of type `search`
- **THEN** it has no `role` and no `aria-expanded`, and has `aria-autocomplete="list"`

### Requirement: Fields without autocomplete semantics

Inputs of other types, such as `number`, and any field with `kbqAutocompleteDisabled` MUST NOT get `role`, `aria-expanded`, `aria-autocomplete`, `aria-controls` or `aria-activedescendant` from the autocomplete.

#### Scenario: Number input

- **WHEN** the field is an input of type `number`
- **THEN** it has none of the autocomplete ARIA attributes

#### Scenario: Autocomplete disabled

- **WHEN** `kbqAutocompleteDisabled` is set on a text input
- **THEN** it has no `role`, no `aria-expanded` and no `aria-autocomplete`

### Requirement: Option list and active option are referenced while open

While the panel is visible, a field with autocomplete semantics SHALL have `aria-controls` pointing at the `role="listbox"` element and `aria-activedescendant` pointing at the active option. Both MUST be absent while the panel is closed or attached without options. When the active option is replaced by another at the same position, `aria-activedescendant` SHALL follow, also in OnPush views.

#### Scenario: Open with an active option

- **WHEN** the panel is open and the user presses Down
- **THEN** `aria-controls` references the listbox and `aria-activedescendant` references the first option

#### Scenario: Closed again

- **WHEN** the panel is closed
- **THEN** the field has neither `aria-controls` nor `aria-activedescendant`

#### Scenario: Options replaced in text mode

- **WHEN** the query changes in an OnPush view so that a single different option is rendered in the active position
- **THEN** `aria-activedescendant` references that option

### Requirement: Accessible name of the option list

When the panel is attached, the `role="listbox"` element SHALL take its name from the field: its `aria-labelledby`, else its `aria-label`, else its labels — referenced by id when every label has one, else by their text — else its `title`, else its placeholder.

#### Scenario: Placeholder only

- **WHEN** the field has the placeholder "State" and no label
- **THEN** the listbox has `aria-label="State"`

#### Scenario: Form-field label

- **WHEN** the field has a `kbq-label` "State" and a placeholder
- **THEN** the listbox's `aria-labelledby` references the label

#### Scenario: Wrapping label without an id

- **WHEN** the field is wrapped in a `label` with the text "State" and no id
- **THEN** the listbox has `aria-label="State"`

### Requirement: Inline completion is announced

In text mode with `kbqAutocompleteInlineHint` on, the field SHALL have `aria-autocomplete="both"`; with the hint off it SHALL have `aria-autocomplete="list"`.

#### Scenario: Text-mode textarea

- **WHEN** a text-mode textarea has the inline hint on and then off
- **THEN** `aria-autocomplete` is `"both"` and then `"list"`

### Requirement: Option list structure

The `role="listbox"` element SHALL contain only the options and option groups; the scrollbar track and the footer SHALL be rendered outside it. The field, the open panel and a text-mode field MUST have no axe violations.

#### Scenario: Scrollbar track

- **WHEN** the panel is open
- **THEN** the scrollbar track is inside the panel but not inside the listbox

#### Scenario: Axe on the open panel

- **WHEN** the panel is open with an active option
- **THEN** axe reports no violations for the field and for the overlay container

### Requirement: Native autocomplete attribute

The field SHALL have `autocomplete="off"` unless an `autocomplete` value is bound, which SHALL replace it.

#### Scenario: Custom value

- **WHEN** `autocomplete="changed"` is set on the field
- **THEN** the field's `autocomplete` attribute is "changed"

### Requirement: Blur predicate for tag inputs

`kbqAutocompleteOnBlur` SHALL hold a function that tells whether a blur of the field happened outside the panel. By default it returns `false` when focus moves to a `kbq-option` and `true` otherwise, including when nothing receives focus. A bound function SHALL replace it. The autocomplete itself MUST NOT act on it.

#### Scenario: Focus moves to an option

- **WHEN** the default predicate gets a blur event whose related target is a `kbq-option`
- **THEN** it returns `false`

#### Scenario: Custom predicate

- **WHEN** a function is bound to `kbqAutocompleteOnBlur`
- **THEN** the trigger's `onInputBlur()` returns that function

### Requirement: Pop-up state for a tooltip on the same field

The trigger SHALL report itself as a pop-up of its field: `isAttached` follows the overlay synchronously, and `openedChange` emits `true` when `opened` fires and `false` when `closed` fires, also when the panel is bound after the subscription.

#### Scenario: Open and close

- **WHEN** a consumer subscribes to `openedChange` and the panel opens and closes
- **THEN** it receives `true` and then `false`
