## MODIFIED Requirements

### Requirement: Tag value

A tag's `value` SHALL be the value last set in code or bound through `[value]`, a binding that changes to `undefined` being ignored, and SHALL be the trimmed text content of the tag host while that value is `null` or `undefined`. The tag list, the tag input's `distinct` check and the form value all read this `value`.

#### Scenario: Bound value

- **WHEN** a tag is rendered with `[value]="item"`
- **THEN** its `value` is `item`, whatever text it shows

#### Scenario: Text fallback

- **WHEN** a tag has no `[value]` and shows the text " Alpha "
- **THEN** its `value` is `Alpha`

#### Scenario: Null value

- **WHEN** a tag is rendered with `[value]="null"` and shows the text "Alpha"
- **THEN** its `value` is `Alpha`

#### Scenario: Binding changed to undefined

- **WHEN** a tag rendered with `[value]="'a'"` is re-bound to `[value]="undefined"`
- **THEN** its `value` is still `a`

### Requirement: Tag list tab stop

A tag list without a tag input SHALL have `tabindex="0"` while it holds tags and `-1` while empty, unless a tab index other than 0 is bound to `tabIndex` or set in code, which it then keeps whatever its tags; a `tabIndex` of 0 counts as unset. A list with a registered tag input, or a disabled list, MUST NOT have a `tabindex` attribute. Tab pressed on one of its tags SHALL set the host's tab index to `-1` at once, so focus leaves the list, and SHALL restore the previous value right after.

#### Scenario: Tabbing away

- **WHEN** a tag of a list with `tabindex="0"` has focus and the user presses Tab
- **THEN** the list has `tabindex="-1"` immediately and `tabindex="0"` again after the current task

#### Scenario: Bound tab index

- **WHEN** a list with `[tabIndex]="4"` is tabbed away from
- **THEN** its tab index is restored to 4

#### Scenario: List with a tag input

- **WHEN** a list has a registered tag input
- **THEN** it has no `tabindex` attribute, before and after tabbing away

#### Scenario: Bound zero on an empty list

- **WHEN** a list without a tag input is rendered with `[tabIndex]="0"` and no tag
- **THEN** it has `tabindex="-1"`

### Requirement: Reduced motion of reordering

Each tag SHALL carry `kbq-animations-disabled`, so it moves into place without a transition, when at its creation animations are turned off through `KBQ_ANIMATIONS_CONFIG`, through `provideNoopAnimations()` or by the user's `prefers-reduced-motion: reduce` setting; otherwise it MUST NOT carry that class. A reduced-motion setting turned on later SHALL still stop the transition through the media query, without the class.

#### Scenario: Animations disabled

- **WHEN** `KBQ_ANIMATIONS_CONFIG` disables animations
- **THEN** every tag has `kbq-animations-disabled`

#### Scenario: Noop animations

- **WHEN** the application uses `provideNoopAnimations()`
- **THEN** every tag has `kbq-animations-disabled`

### Requirement: Tag list reports user changes of its tags

After a user request — a non-empty value ended in the tag input, a `removed` request from a tag, a drop or `notifyPendingTagChange()` — the tag list SHALL, once its tags next re-render, emit `change` and `valueChange` with the array of the tags' values and pass it to its form control, if it differs from the value held (a non-array value counts as empty). A request the consumer drops stays pending, so a later change made in code is reported; otherwise a change made in code MUST NOT emit.

#### Scenario: Tag removed with Backspace

- **WHEN** the user removes a tag with Backspace and the consumer drops it from its data
- **THEN** the bound form control becomes dirty

#### Scenario: Tag added from the input

- **WHEN** the user types a value, presses Enter, and the consumer adds the tag to its data
- **THEN** the bound form control becomes dirty

#### Scenario: Tags changed in code

- **WHEN** no user request is pending and the consumer adds a tag to its data without user interaction
- **THEN** the form control stays pristine

#### Scenario: Consumer rejected the tag

- **WHEN** the user presses Enter on a value that the consumer's handler does not add
- **THEN** the form control stays pristine, also after a later `setValue()`

#### Scenario: Change in code after a rejected tag

- **WHEN** the consumer's handler does not add a value the user ended with Enter, and the consumer later adds a tag to its own data without writing the form control
- **THEN** the bound form control becomes dirty and `valueChange` emits

### Requirement: Trimming on a kbqInput

When the tag input also carries `KbqTrim` — a `kbqInput` in a template that imports `KbqInputModule`, `KbqFormFieldModule` or `KbqTrim` — and has no `no-trim` attribute, every requested value SHALL be trimmed before the duplicate check and the emission. Otherwise, a `kbqInput` imported on its own included, the text SHALL be requested as typed or pasted.

#### Scenario: Trimmed value

- **WHEN** the tag input is a `kbqInput` in a component that imports `KbqInputModule`, holds " tag " and the user presses Enter
- **THEN** `kbqTagInputTokenEnd` emits with value "tag"

#### Scenario: Plain input

- **WHEN** the tag input is not a `kbqInput` and the user pastes " tag " with no separator in it
- **THEN** `kbqTagInputTokenEnd` emits with value " tag "

#### Scenario: kbqInput without the trim directive

- **WHEN** the component imports the standalone `KbqInput` but none of `KbqInputModule`, `KbqFormFieldModule` and `KbqTrim`, the tag input holds " tag " and the user presses Enter
- **THEN** `kbqTagInputTokenEnd` emits with value " tag "

### Requirement: Enter with an active autocomplete option

When an autocomplete attached to the input has its panel open with an active option, Enter MUST NOT request a tag, so the autocomplete picks the option. While the input holds text, the tag input MUST NOT prevent the key's default action; while it is empty and Enter is a separator key, the tag input SHALL prevent it, as it does for every separator key but Tab. Other separator keys SHALL still request the typed text.

#### Scenario: Enter on an active option

- **WHEN** the autocomplete panel is open with an active option and the user presses Enter
- **THEN** `kbqTagInputTokenEnd` does not emit

#### Scenario: Picking an option with the pointer

- **WHEN** `kbqTagInputAddOnBlur` is true, the user types "hi" and clicks an option
- **THEN** only the option's value is added, not the typed text

#### Scenario: Comma with an active option

- **WHEN** comma is a separator, the panel is open with an active option and the user presses comma
- **THEN** `kbqTagInputTokenEnd` emits with the typed text

#### Scenario: Enter on an active option in an empty input

- **WHEN** the input is empty, the panel is open with an active option and the user presses Enter
- **THEN** `kbqTagInputTokenEnd` does not emit, the key's default action is prevented and the autocomplete picks the option
