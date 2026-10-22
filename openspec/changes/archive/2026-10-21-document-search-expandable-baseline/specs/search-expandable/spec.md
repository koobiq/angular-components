# Spec Delta

## Purpose

Describes what `kbq-search-expandable` from `@koobiq/components/search-expandable` guarantees to consumers: how the search expands from an icon button and collapses again, how a typed query reaches the bound form control, how a model value expands the field, and how focus, the disabled state, accessible names and localized strings behave.

## ADDED Requirements

### Requirement: A form directive is required

The component has no value input of its own. Creating it without `[formControl]`, `[formControlName]` or `[(ngModel)]` on the same element MUST throw an error with the message `kbq-search-expandable must be used with the [formControl], [formControlName] or [(ngModel)].`

#### Scenario: Rendered without a form directive

- **WHEN** a template renders `<kbq-search-expandable />` with no form directive on it
- **THEN** creating the component throws that error

#### Scenario: Rendered with ngModel

- **WHEN** a template renders `<kbq-search-expandable [(ngModel)]="search" />`
- **THEN** the component renders without an error

### Requirement: Collapsed by default

When its bound value is empty and `isOpened` is not set, the component SHALL render collapsed: an icon-only button with class `kbq-search-expandable__button` and `type="button"`, and no text field.

#### Scenario: Initial render

- **WHEN** the component renders with an empty model and no `isOpened` binding
- **THEN** it renders one `kbq-search-expandable__button` and no `kbq-search-expandable__search`

### Requirement: Expanded field

While expanded, the component SHALL render, in place of the collapsed button, a form field with class `kbq-search-expandable__search` that holds a search icon, a text input with `type="text"` and `autocomplete="off"`, and a close button.

#### Scenario: Expanded render

- **WHEN** the component is expanded
- **THEN** it renders one `kbq-search-expandable__search` containing an input and a close button
- **AND** no `kbq-search-expandable__button` is rendered

### Requirement: Host classes reflect the state

The host element SHALL always carry the class `kbq-search-expandable`, and SHALL carry `kbq-search-expandable_opened` exactly while the field is expanded.

#### Scenario: Class while collapsed

- **WHEN** the component is collapsed
- **THEN** the host has `kbq-search-expandable` and does not have `kbq-search-expandable_opened`

#### Scenario: Class while expanded

- **WHEN** the component expands
- **THEN** the host has `kbq-search-expandable_opened`

### Requirement: Typed value reaches the bound control after a debounce

Unless `isEmitValueByEnterEnabled` is set, text typed into the field SHALL reach the bound control `emitValueTimeout` milliseconds after the last keystroke, and each keystroke SHALL restart the wait. The default is 200 ms. The timeout is read at each keystroke, so a changed binding applies from the next one. Until the wait ends, the bound control keeps its previous value.

#### Scenario: Default timeout

- **WHEN** the user types `typed` into the expanded field
- **THEN** the bound control still holds its previous value right after the input
- **AND** it holds `typed` 200 ms later

#### Scenario: Custom timeout

- **WHEN** `emitValueTimeout` is `500` and the user types `typed`
- **THEN** the bound control has not changed 300 ms later
- **AND** it holds `typed` 500 ms after the input

#### Scenario: Typing restarts the wait

- **WHEN** the user types a second character before the timeout of the first has passed
- **THEN** the bound control receives only the final text, one timeout after the second character

### Requirement: Unchanged values are not emitted again

The component SHALL hand a value to the bound control only when it differs from the value last exchanged with that control, whether the component emitted it or the control wrote it. The reset on collapse is the only exception. A value the control already holds MUST NOT mark it dirty again.

#### Scenario: Enter repeats an unchanged value

- **WHEN** in Enter mode the user confirms `typed` with Enter, the control is marked pristine, and the user presses Enter again without editing
- **THEN** the control stays pristine

#### Scenario: Retyping a value after a programmatic reset

- **WHEN** the user's `a` has reached the control, code then sets the control to `''`, and the user types `a` again
- **THEN** the control holds `a` after the timeout

#### Scenario: Emptying the field after a programmatic write

- **WHEN** code sets the control to `programmatic` and the user then clears the field
- **THEN** the control holds `''` after the timeout

### Requirement: Enter mode emits on Enter only

With `isEmitValueByEnterEnabled` set (default `false`), typing SHALL NOT update the bound control. Enter pressed in the input SHALL hand the current text to the control at once and prevent the key's default action, so that an enclosing native form is not submitted.

#### Scenario: Typing does not emit

- **WHEN** Enter mode is on and the user types `typed`
- **THEN** the bound control still holds `''` 300 ms later

#### Scenario: Enter emits immediately

- **WHEN** Enter mode is on, the user types `typed` and presses Enter
- **THEN** the bound control holds `typed` at once
- **AND** the default action of the Enter key is prevented

### Requirement: Enter is not handled outside Enter mode

Without `isEmitValueByEnterEnabled`, the component MUST NOT prevent the default action of Enter and MUST NOT emit on it; the typed text still reaches the control only after the debounce.

#### Scenario: Enter inside a form without Enter mode

- **WHEN** Enter mode is off and the user types `typed` and presses Enter
- **THEN** the default action of the Enter key is not prevented

### Requirement: Collapsed button expands the field

Clicking the collapsed button of an enabled component SHALL expand the field and emit `isOpenedChange` with `true`.

#### Scenario: Click on the collapsed button

- **WHEN** the user clicks the collapsed button
- **THEN** the field expands and the button is no longer rendered
- **AND** `isOpenedChange` emits `true`

### Requirement: Close button collapses the field

Clicking the close button of the expanded field SHALL collapse it and emit `isOpenedChange` with `false`.

#### Scenario: Click on the close button

- **WHEN** the field is expanded and the user clicks its close button
- **THEN** the field collapses and the collapsed button is rendered again
- **AND** `isOpenedChange` emits `false`

### Requirement: Escape in the input collapses the field

Escape pressed in the input of an enabled, expanded component SHALL collapse it and prevent the key's default action, so that an enclosing modal, which leaves alone an Escape already handled, stays open. Escape pressed on the collapsed button or on the close button MUST NOT be handled by the component.

#### Scenario: Escape in the input

- **WHEN** the input has focus and the user presses Escape
- **THEN** the field collapses
- **AND** the default action of the key is prevented

#### Scenario: Escape inside a modal

- **WHEN** the component is expanded inside a modal and the user presses Escape in its input
- **THEN** the field collapses and the modal stays open
- **AND** a second Escape, pressed on the collapsed button, closes the modal

### Requirement: toggle() switches the state

The public `toggle()` method SHALL expand a collapsed component and collapse an expanded one, emitting `isOpenedChange` with the new state, and SHALL hide the tooltip of the collapsed button. While the component is disabled it MUST do nothing.

#### Scenario: Toggled from another control

- **WHEN** a button elsewhere on the page calls `toggle()` on the component twice
- **THEN** the field expands after the first call and collapses after the second
- **AND** `isOpenedChange` emits `true`, then `false`

#### Scenario: Toggle while disabled

- **WHEN** the component is disabled and code calls `toggle()`
- **THEN** the field stays collapsed and `isOpenedChange` does not emit

### Requirement: isOpenedChange reports changes made by the component

`isOpenedChange` SHALL emit the new state synchronously whenever the component changes it itself: through the collapsed button, the close button, Escape, `toggle()`, or expanding from a model value. It MUST NOT emit for the initial state or for a change made through the `isOpened` input or property.

#### Scenario: Auto-expand from a model value

- **WHEN** a collapsed component's bound control is set to `seed`
- **THEN** `isOpenedChange` emits `true`

#### Scenario: State set through the input

- **WHEN** the parent changes `[isOpened]` from `false` to `true`
- **THEN** the field expands and `isOpenedChange` does not emit

### Requirement: isOpened input sets the state directly

`[isOpened]`, or a write to the `isOpened` property, SHALL set the state directly: it applies while disabled and does not clear the query on collapse. A first binding of `false` MUST NOT collapse a field that the bound value has already expanded. Reading `isOpened` SHALL return the current state.

#### Scenario: Expanded by the binding

- **WHEN** `[isOpened]` changes to `true`
- **THEN** the field expands

#### Scenario: Expanded while disabled

- **WHEN** the component is disabled and `[isOpened]` changes to `true`
- **THEN** the field expands with a disabled input

#### Scenario: First false binding with a seeded value

- **WHEN** the component is bound with `[isOpened]="false"` to a form control that already holds `seed`
- **THEN** the field renders expanded

#### Scenario: Collapsed by the binding

- **WHEN** the field is expanded with text in it and `[isOpened]` changes to `false`
- **THEN** the field collapses
- **AND** the bound control keeps its value, and the text is still in the field when it expands again

### Requirement: Expanding moves focus into the input

When the field expands after the first render through the collapsed button, `toggle()` or the `isOpened` input, focus SHALL move to the input. A field that is already expanded on the first render MUST NOT take focus. Expanding from a model value follows its own rule.

#### Scenario: Expanded by a click

- **WHEN** the user clicks the collapsed button
- **THEN** the input has focus

#### Scenario: Expanded on the first render

- **WHEN** the component renders with `[isOpened]="true"`
- **THEN** focus is not moved into its input

### Requirement: Collapsing moves focus to the collapsed button

Whenever the field collapses, by any path, focus SHALL move to the collapsed button, with the focus origin last seen inside the component, and the button's tooltip MUST NOT open on the way.

#### Scenario: Collapsed with Escape

- **WHEN** the user expands the field, types, and presses Escape
- **THEN** the input is removed and the collapsed button has focus

#### Scenario: Collapsed from outside

- **WHEN** the field is expanded and another control on the page calls `toggle()`
- **THEN** focus moves to the collapsed button

### Requirement: Collapsing clears the query

Collapsing through the close button, Escape or `toggle()` SHALL empty the field and hand `''` to the bound control synchronously, even when the control already holds `''`, and SHALL drop an emission still waiting for the debounce. The reset goes through the change callback, so the control is updated and marked dirty as for a user edit. In Enter mode, unconfirmed text is discarded the same way.

#### Scenario: Collapse after typing

- **WHEN** the field holds `some value` and the user collapses it
- **THEN** `value()` is `''`

#### Scenario: Collapse right after a model write

- **WHEN** the bound control is set to `alpha`, which expands the field, and `toggle()` is called at once
- **THEN** the bound control holds `''` right after the call

#### Scenario: Collapse before the debounce ends

- **WHEN** the user types `abc` and collapses the field before `emitValueTimeout` has passed
- **THEN** the bound control holds `''` and does not change to `abc` afterwards

#### Scenario: Collapse of an empty field

- **WHEN** the user expands and collapses the field without typing
- **THEN** the bound control receives `''` and is marked dirty

### Requirement: Programmatic writes reach the field without an echo

A value written to the bound control SHALL appear in the field at once. It MUST NOT be sent back through the change callback, so the control stays pristine and its `valueChanges` fires once per write. `null` and `undefined` SHALL show as an empty field. A write SHALL drop an emission still waiting from earlier typing.

#### Scenario: Write through the form control

- **WHEN** the field is expanded and code sets the bound control to `form value`
- **THEN** `value()` is `form value`
- **AND** after the debounce the control is still pristine and its `valueChanges` fired once

#### Scenario: Write while the user is typing

- **WHEN** the user types `typed` and code sets the control to `programmatic` before the debounce ends
- **THEN** the control holds `programmatic` after the debounce

### Requirement: A model value expands the field

When a non-empty value is written to the bound control while the component is collapsed and enabled, it SHALL expand and emit `isOpenedChange` with `true`. Focus SHALL move into the input only when focus was already inside the component. Writing an empty value MUST NOT collapse the field, and a disabled component MUST NOT expand.

#### Scenario: Initial model value

- **WHEN** the component renders bound to an `ngModel` or a form control that holds `seed`
- **THEN** the field is expanded and no collapsed button is rendered
- **AND** focus is not moved into the input

#### Scenario: Value set later while collapsed

- **WHEN** the component is collapsed and code sets the bound control to `later`
- **THEN** the field expands

#### Scenario: Focus already inside the component

- **WHEN** focus is on the collapsed button and the bound control is set to `seed`
- **THEN** the field expands and the input has focus

#### Scenario: Value cleared

- **WHEN** the field was expanded by a model value and the control is then set to `''`
- **THEN** the field stays expanded

#### Scenario: Disabled control

- **WHEN** the bound control is disabled and then set to `seed`
- **THEN** the field stays collapsed

### Requirement: The value signal mirrors the field

The public writable signal `value` SHALL hold the current text of the field. Writing it SHALL update the field at once and the bound control the way typing does. A write MUST NOT expand a collapsed field.

#### Scenario: Write into value

- **WHEN** the field is expanded and code sets `value` to `written`
- **THEN** the input shows `written` at once while the bound control keeps `''`
- **AND** the bound control holds `written` after `emitValueTimeout`

#### Scenario: Write into value while collapsed

- **WHEN** the component is collapsed and code sets `value` to `written`
- **THEN** the field stays collapsed

### Requirement: Leaving the input marks the control touched

The blur of the input SHALL mark the bound control as touched.

#### Scenario: Blur of the input

- **WHEN** the input loses focus
- **THEN** the bound control is touched

### Requirement: Error state follows the bound control

The expanded field SHALL show the error state of the bound control, as decided by the `ErrorStateMatcher` provided in DI; by default an invalid control shows it once touched or once its form is submitted. In the error state the form field SHALL carry `kbq-form-field_invalid` and the input SHALL have `aria-invalid="true"`.

#### Scenario: Invalid but untouched

- **WHEN** the bound control has a failing `Validators.required` and is untouched
- **THEN** the form field has no `kbq-form-field_invalid` and the input has `aria-invalid="false"`

#### Scenario: Invalid and touched

- **WHEN** the input then loses focus
- **THEN** the form field has `kbq-form-field_invalid` and the input has `aria-invalid="true"`

### Requirement: Disabled state

The component SHALL be disabled by `[disabled]` or by disabling the bound control. While disabled, the collapsed button, the input and the close button SHALL be disabled, and the collapsed button, `toggle()` and Escape SHALL do nothing. Disabling MUST NOT change whether the field is expanded.

#### Scenario: Disabled through the input

- **WHEN** `[disabled]` is `true`
- **THEN** the collapsed button has the `disabled` attribute

#### Scenario: Click while disabled

- **WHEN** the component is disabled and the user clicks the collapsed button
- **THEN** the field stays collapsed

#### Scenario: Disabled through the form control

- **WHEN** the bound control is disabled and the field is expanded
- **THEN** the component reports `disabled` as `true` and the input has the `disabled` attribute

#### Scenario: Disabled while expanded

- **WHEN** the field is expanded and then disabled
- **THEN** it stays expanded with a disabled input and a disabled close button

### Requirement: Tab index

`tabIndex`, `0` by default, SHALL be applied to the collapsed button and to the expanded input. A bound `null`, `undefined` or non-numeric value SHALL restore `0`. While the component is disabled, `tabIndex` SHALL read `-1`, and both elements get `-1`.

#### Scenario: Binding reset to null or undefined

- **WHEN** `[tabIndex]` changes from `3` to `null` or `undefined`
- **THEN** `tabIndex` reads `0`

#### Scenario: Disabled

- **WHEN** the component is disabled
- **THEN** `tabIndex` reads `-1`

### Requirement: Tooltip of the collapsed button

The collapsed button SHALL show a tooltip with the `tooltipText` string. The tooltip SHALL be disabled while the component is disabled, including after a disabled field collapses.

#### Scenario: Disabled field collapses

- **WHEN** a disabled, expanded field is collapsed through `[isOpened]`
- **THEN** the tooltip of the collapsed button is disabled

### Requirement: Custom tooltip text and placeholder

`tooltipText` SHALL replace the locale tooltip of the collapsed button and `placeholder` the locale placeholder of the input. Setting either to `null`, or binding `undefined`, SHALL fall back to the locale string. Any other value, the empty string included, is used as given.

#### Scenario: Custom placeholder

- **WHEN** `placeholder` is `Custom search...` and the field expands
- **THEN** the input's placeholder is `Custom search...`

#### Scenario: Custom tooltip text

- **WHEN** `tooltipText` is `Custom tooltip`
- **THEN** `tooltipText` reads `Custom tooltip`

#### Scenario: Binding turns undefined

- **WHEN** a bound `tooltipText` or `placeholder` changes to `undefined`
- **THEN** the locale string is rendered again

### Requirement: Accessible names

The collapsed button SHALL take its accessible name from `tooltipText` through `aria-label`, and the input from `placeholder` through `aria-label`. The close button SHALL be a native `<button type="button">`, so Enter and Space activate it, named by the `close` string of the `a11y` locale section.

#### Scenario: Names with default strings

- **WHEN** the component renders with no overrides and no locale service
- **THEN** the collapsed button's `aria-label` is `Поиск`
- **AND** once expanded, the input's `aria-label` is `Поиск` and the close button's is `Закрыть`

### Requirement: No axe violations

The component SHALL pass the axe-core checks of the unit suite collapsed, expanded, and with two expanded instances on one page.

#### Scenario: Two instances expanded

- **WHEN** two expanded search-expandable components render on the same page
- **THEN** axe reports no violations

### Requirement: Default strings follow the active locale

Without overrides, the tooltip and placeholder SHALL come from the `searchExpandable` locale section and the close button's name from the `a11y` section. Without a locale service the `ru-RU` strings SHALL be used. With one, the strings SHALL follow the active locale, including a later `setLocale()`.

#### Scenario: English locale

- **WHEN** a locale service is provided and `en-US` is active
- **THEN** the tooltip and the placeholder are `Search` and the close button is named `Close`

### Requirement: Locale overrides through DI

`kbqSearchExpandableLocaleConfigurationProvider()` SHALL override only the strings it is given, the others following the active locale. Without a locale service, a provided `KBQ_SEARCH_EXPANDABLE_LOCALE_CONFIGURATION` SHALL replace the default strings. `localeConfiguration()` SHALL return the resolved `searchExpandable` strings.

#### Scenario: Token provided without a locale service

- **WHEN** `KBQ_SEARCH_EXPANDABLE_LOCALE_CONFIGURATION` is provided as `{ tooltip: 'Provided tooltip', placeholder: 'Provided placeholder' }`
- **THEN** `tooltipText` reads `Provided tooltip` and `placeholder` reads `Provided placeholder`

#### Scenario: Partial provider

- **WHEN** `kbqSearchExpandableLocaleConfigurationProvider({ tooltip: 'Find' })` is provided
- **THEN** the tooltip is `Find` and the placeholder follows the active locale

### Requirement: Per-instance locale overrides

`[localeOverrides]` SHALL override strings for one instance, merged over the DI sources; both the `searchExpandable` and the `a11y` sections apply.

#### Scenario: Override on one instance

- **WHEN** an instance has `[localeOverrides]="{ searchExpandable: { placeholder: 'Find' }, a11y: { close: 'Hide' } }"`
- **THEN** its input's placeholder is `Find` and its close button is named `Hide`
- **AND** other instances keep their strings

### Requirement: Calls from an effect do not re-run it

Calling `toggle()`, or writing the bound control, from a consumer's `effect()` MUST NOT make that effect run again when the component expands or collapses.

#### Scenario: Effect calls toggle

- **WHEN** an effect calls `toggle()` once
- **THEN** the field expands and the effect has run once

#### Scenario: Effect writes the control, then the field closes

- **WHEN** an effect sets the bound control to `query`, which expands the field, and `toggle()` then collapses it
- **THEN** the effect has still run once

### Requirement: Exported defaults

The entry point SHALL export `defaultValue`, the empty string held by an empty or collapsed field, and `defaultEmitValueTimeout`, `200`, the default of `emitValueTimeout`.

#### Scenario: Values of the constants

- **WHEN** a consumer imports the constants
- **THEN** `defaultValue` is `''` and `defaultEmitValueTimeout` is `200`

### Requirement: NgModule

`KbqSearchExpandableModule` SHALL import and export the standalone `KbqSearchExpandable` component for NgModule consumers.

#### Scenario: Use through the module

- **WHEN** a component imports `KbqSearchExpandableModule`
- **THEN** its template can render `kbq-search-expandable`
