# toggle Specification

## Purpose

Describes what `kbq-toggle` from `@koobiq/components/toggle` guarantees to consumers: how its checked, indeterminate, disabled and loading states are set and reported, how users switch it with a pointer, the keyboard or assistive technology, and how its value reaches Angular forms.

## Requirements

### Requirement: Checked state set by the consumer

The `checked` input and the `checked` property SHALL set whether the toggle is on, `false` by default. The native checkbox inside SHALL follow it, and the host SHALL have the `kbq-active` class while the toggle is on. Setting `checked` this way MUST NOT emit `change` and MUST NOT pass a value to a bound form control.

#### Scenario: Binding checked

- **WHEN** the bound `checked` value changes from `false` to `true`
- **THEN** the native checkbox is checked and the host has `kbq-active`
- **AND** no `change` event fires

#### Scenario: Setting the property in code

- **WHEN** code sets `checked` to `true` on the toggle instance
- **THEN** the native checkbox is checked

### Requirement: Pointer click switches the toggle

A click anywhere on a toggle that is neither disabled nor loading — the switch, the label text or the hint — SHALL flip `checked`, unless the click action is `noop`, because the whole toggle is a `<label>` for its native checkbox.

#### Scenario: Two clicks

- **WHEN** the user clicks a toggle that is neither disabled nor loading, with the default click action, twice
- **THEN** `checked` becomes `true` and then `false` again

### Requirement: Change event

Each switch made by the user SHALL emit `change` once, with a `KbqToggleChange` whose `source` is the toggle and whose `checked` is the new state. The native `change` event of the inner checkbox MUST NOT propagate out of the toggle, so a `(change)` listener on the toggle receives only the `KbqToggleChange`.

#### Scenario: Clicking the toggle

- **WHEN** the user clicks an unchecked toggle
- **THEN** `change` fires once, with `checked` set to `true`

### Requirement: No two-way binding of checked

The toggle SHALL report a user switch only through `change` and a bound form control. It has no `checkedChange` output, so a property bound to `checked` MUST NOT be updated by a click; a consumer that binds `checked` updates its own value from `change`, as the docs examples do.

#### Scenario: One-way checked binding

- **WHEN** `checked` is bound to a property that is `false` and the user clicks the toggle
- **THEN** the toggle is on and the bound property is still `false`

### Requirement: Click events reach the host once

A pointer click on the toggle SHALL reach a `(click)` listener on the host, and its ancestors, exactly once. The click the browser dispatches on the inner checkbox MUST NOT propagate, so switching the toggle from the keyboard dispatches no click event on the host.

#### Scenario: Click inside a counting parent

- **WHEN** the user clicks a toggle placed inside an element that counts clicks
- **THEN** the host's `(click)` handler runs once and the parent counts one click

### Requirement: Keyboard switching

While the inner checkbox has focus, Space SHALL switch the toggle as a native checkbox does, and Enter SHALL switch it too and prevent the key's default action, so an enclosing form is not submitted. Both MUST go through the same path as a click, so the click action, `disabled` and `loading` apply to them.

#### Scenario: Enter inside a form

- **WHEN** a toggle inside a `<form>` has focus and the user presses Enter
- **THEN** the toggle is on and the default action of the keydown is prevented

#### Scenario: Space

- **WHEN** the toggle has focus and the user presses Space
- **THEN** the toggle switches and `change` fires

### Requirement: Programmatic focus

`focus()` SHALL move DOM focus to the inner native checkbox, with keyboard as the focus origin.

#### Scenario: Calling focus

- **WHEN** code calls `focus()` on the toggle
- **THEN** the inner checkbox is the active element

### Requirement: Focus origin classes

While focus is inside the toggle, the host SHALL carry the focus classes of the CDK focus monitor: `cdk-focused` and one of `cdk-keyboard-focused`, `cdk-mouse-focused`, `cdk-touch-focused` or `cdk-program-focused`. The focus outline of the switch SHALL be drawn only with `cdk-keyboard-focused`.

#### Scenario: Tabbing to the toggle

- **WHEN** the user moves focus to the toggle with Tab
- **THEN** the host has `cdk-focused` and `cdk-keyboard-focused` and the switch shows its focus outline

### Requirement: Disabled toggle

When disabled through the `disabled` input, the `disabled` property or a bound form control, the toggle SHALL get the `kbq-disabled` class, and its native checkbox SHALL be disabled, with `tabindex="-1"` and `aria-disabled="true"`. A click MUST NOT switch it or emit `change`. Enabling it again SHALL remove all of these.

#### Scenario: Disabling through the input

- **WHEN** `disabled` is bound to `true`
- **THEN** the host has `kbq-disabled` and the native checkbox is disabled
- **AND** a click leaves `checked` unchanged and emits no `change`

#### Scenario: Disabling through the form control

- **WHEN** the bound form control is disabled and then enabled
- **THEN** the toggle and its native checkbox are disabled and then enabled again

#### Scenario: Disabling through the property

- **WHEN** code sets `disabled` to `true` on the toggle instance and then back to `false`
- **THEN** the host has `kbq-disabled` and then loses it, and the native checkbox has `tabindex="0"` again

### Requirement: Boolean inputs accept attributes

The `disabled`, `checked`, `indeterminate` and `loading` inputs SHALL coerce attribute values as Angular's `booleanAttribute` does: a bare attribute is `true` and the string `"false"` is `false`. The `big` input MUST NOT be coerced: it takes a boolean binding, and a bare `big` attribute does not apply the big size.

#### Scenario: Bare attributes

- **WHEN** the toggle is written as `<kbq-toggle disabled checked />`
- **THEN** it is disabled and on, with `kbq-disabled` and `kbq-active` on the host

### Requirement: Color

The `color` input SHALL add a `kbq-<color>` class to the host, replacing the class of the previous color and keeping classes set by others. With `error` (`KbqComponentColors.Error`) the switch SHALL use the error palette; any other value, or no value, SHALL leave it with the theme palette.

#### Scenario: Error color

- **WHEN** `color` is `error`
- **THEN** the host has `kbq-error` and the switch uses the error colors

#### Scenario: Changing the color

- **WHEN** the host has a class added by someone else and `color` changes from one value to another
- **THEN** the class of the old color is gone, and the class of the new color and the other class remain

### Requirement: No error state from forms

The toggle MUST NOT derive an error state from its form control: an invalid, touched control changes neither its classes nor its ARIA attributes. The error look SHALL come only from `color`.

#### Scenario: Invalid control

- **WHEN** the bound form control is invalid and touched
- **THEN** the toggle has no `kbq-error` class and its native checkbox has no `aria-invalid`

### Requirement: Indeterminate state

The `indeterminate` input and property SHALL put the toggle in a mixed state, `false` by default: the host SHALL get `kbq-indeterminate`, the native checkbox SHALL be indeterminate, and the switch SHALL show a dash instead of its knob. `checked` SHALL keep its own value meanwhile. A click with the `check` click action is the exception: the toggle stays indeterminate, but its native checkbox no longer is, and the switch shows its knob next to the dash.

#### Scenario: Setting indeterminate

- **WHEN** `indeterminate` is bound to `true`
- **THEN** the host has `kbq-indeterminate` and the native checkbox has `aria-checked="mixed"`

#### Scenario: Default

- **WHEN** a toggle renders without `indeterminate`
- **THEN** the host has no `kbq-indeterminate` class

#### Scenario: Click with the check action

- **WHEN** the click action is `check` and the user clicks an indeterminate toggle
- **THEN** the host still has `kbq-indeterminate`, but the native checkbox is not indeterminate
- **AND** the knob of the switch is shown next to the dash

### Requirement: Indeterminate change event

`indeterminateChange` SHALL emit the new value every time `indeterminate` changes, whether through the input, the property or a click, and MUST NOT emit when the input or the property sets `indeterminate` to the value it already has. The clearing that follows a click emits `false` without that check, so it emits again when `indeterminate` was already set to `false` after the click, for example by a `change` handler. With the `indeterminate` input it SHALL support `[(indeterminate)]`.

#### Scenario: Set in code

- **WHEN** code sets `indeterminate` from `false` to `true`
- **THEN** `indeterminateChange` emits `true`

#### Scenario: Same value

- **WHEN** code sets `indeterminate` to `true` while it is already `true`
- **THEN** `indeterminateChange` does not emit

#### Scenario: Cleared by the change handler

- **WHEN** the user clicks an indeterminate toggle with the default click action and a `change` handler sets `indeterminate` to `false` on the toggle instance
- **THEN** `indeterminateChange` emits `false` twice

### Requirement: Click on an indeterminate toggle

With the default click action, a user click on an indeterminate toggle SHALL flip `checked` and emit `change` first, and then, in a microtask, SHALL clear `indeterminate` and emit `indeterminateChange` with `false`.

#### Scenario: Unchecked and indeterminate

- **WHEN** an unchecked, indeterminate toggle is clicked and the microtask has run
- **THEN** the toggle is checked and not indeterminate, and its native checkbox has `aria-checked="true"`
- **AND** `indeterminateChange` has emitted `false` once

### Requirement: Loading state

While `loading` is `true`, the host SHALL have `kbq-toggle_loading` and `kbq-disabled`, and the native checkbox SHALL have `aria-busy="true"` and `aria-disabled="true"` but stay enabled and keep its tab index. Clicks and keys MUST NOT switch the toggle or emit `change`, and the native checkbox SHALL stay in step with the toggle. When the toggle is neither loading nor disabled, both attributes SHALL be absent.

#### Scenario: Clicking while loading

- **WHEN** `loading` is `true` and the user clicks the toggle
- **THEN** `checked` stays `false` and the native checkbox stays unchecked
- **AND** the host's `(click)` handler runs once

#### Scenario: Still focusable

- **WHEN** `loading` is `true`
- **THEN** the native checkbox is not disabled and has `tabindex="0"`

#### Scenario: Back to idle

- **WHEN** `loading` turns `false` again
- **THEN** the native checkbox has neither `aria-busy` nor `aria-disabled`

### Requirement: Big size

The `big` input SHALL add the `kbq-toggle_big` class and switch the label to the big text style and the hint to the normal one; the switch itself MUST keep its size of 28 by 16 px. Without a hint, a toggle with no label or with a label that fits on one line SHALL be one line of text tall: 20 px normally and 24 px when big. A hint, or a label that wraps, makes the toggle taller.

#### Scenario: Turning big on

- **WHEN** `big` is bound to `true` on a toggle without a hint
- **THEN** the host has `kbq-toggle_big` and is 24 px tall, and the switch is still 28 by 16 px

#### Scenario: Default size

- **WHEN** a toggle without `big` and without a hint is rendered with no label or with a one-line label
- **THEN** it is 20 px tall

#### Scenario: Toggle with a hint

- **WHEN** a toggle has a label text and a `kbq-hint`
- **THEN** it is taller than one line of text

### Requirement: Label content

Content projected into the toggle, other than `kbq-hint`, SHALL be rendered as its label text inside the `<label>` element of the native checkbox, so that it names the control and a click on it switches the toggle.

#### Scenario: Label text

- **WHEN** the toggle is written as `<kbq-toggle>Simple toggle</kbq-toggle>`
- **THEN** "Simple toggle" is rendered as the label text of the toggle

### Requirement: Hint

A projected `kbq-hint` SHALL be rendered under the label text inside a container with `aria-hidden="true"` and the id `<host id>-hint`, so it stays out of the accessible name. The native checkbox SHALL reference that container through `aria-describedby`, also when no hint is projected.

#### Scenario: Toggle with a hint

- **WHEN** the toggle contains a label text and `<kbq-hint>Hint text</kbq-hint>`
- **THEN** the `aria-describedby` of the native checkbox is the id of the hint container
- **AND** that container has `aria-hidden="true"` and contains "Hint text"

### Requirement: Label position

`labelPosition` SHALL place the label and the hint to the right of the switch with `right`, the default, and to the left of it with `left`. With `left` the inner label element SHALL have the `kbq-toggle-layout_left` class; with `right` it MUST NOT.

#### Scenario: Label on the left

- **WHEN** `labelPosition` is `left`
- **THEN** the switch follows the label text and the label element has `kbq-toggle-layout_left`

#### Scenario: Label on the right

- **WHEN** `labelPosition` is `right`
- **THEN** no element of the toggle has `kbq-toggle-layout_left`

### Requirement: Switch semantics

The native checkbox SHALL have `role="switch"` and an `aria-checked` of `"true"` or `"false"`. While the toggle is indeterminate it MUST NOT have a `role` attribute, so it falls back to the checkbox role, and `aria-checked` SHALL be `"mixed"`, or `"true"` when the toggle is also checked. `getAriaChecked()` SHALL return the same value as `aria-checked`.

#### Scenario: Unchecked toggle

- **WHEN** an unchecked toggle renders
- **THEN** the native checkbox has `role="switch"` and `aria-checked="false"`

#### Scenario: Entering and leaving the mixed state

- **WHEN** `indeterminate` becomes `true` and then `false` again
- **THEN** the native checkbox first has no `role` and `aria-checked="mixed"`
- **AND** then has `role="switch"` and `aria-checked="false"` again

### Requirement: ARIA naming inputs

The `aria-label` and `aria-labelledby` inputs SHALL be written to the native checkbox. When `aria-label` is empty or not given, the native checkbox MUST NOT have it; when `aria-labelledby` is not given, `null` or `undefined`, the native checkbox MUST NOT have it either. An empty `aria-labelledby` is written as is, so the native checkbox gets an empty `aria-labelledby` attribute.

#### Scenario: aria-label given

- **WHEN** the toggle has `aria-label="Super effective"`
- **THEN** the native checkbox has `aria-label="Super effective"`

#### Scenario: aria-labelledby given

- **WHEN** the toggle has `aria-labelledby="some-id"`
- **THEN** the native checkbox has `aria-labelledby="some-id"`

#### Scenario: Neither given

- **WHEN** the toggle has neither input
- **THEN** the native checkbox has neither attribute

#### Scenario: Empty aria-labelledby

- **WHEN** `aria-labelledby` is bound to an empty string
- **THEN** the native checkbox has `aria-labelledby=""`

### Requirement: Native form submission

The `name` and `value` inputs SHALL be written to the `name` and `value` attributes of the native checkbox, so a checked toggle is serialized by native form submission. Without them the native checkbox MUST NOT have these attributes.

#### Scenario: Name given

- **WHEN** the toggle has `name="test-name"`
- **THEN** the native checkbox has `name="test-name"`

#### Scenario: Neither given

- **WHEN** the toggle has no `name` and no `value`
- **THEN** the native checkbox has neither attribute

### Requirement: Click action

The `clickAction` input or property SHALL decide what a user switch does: `check-indeterminate` and `undefined` flip `checked` and clear `indeterminate`; `check` flips `checked` and keeps `indeterminate`; `noop` changes nothing and emits no event, and the native checkbox SHALL stay in step with the toggle.

#### Scenario: noop

- **WHEN** the click action is `noop` and the user clicks an unchecked toggle
- **THEN** the toggle and its native checkbox stay unchecked

#### Scenario: check keeps the mixed state

- **WHEN** the click action is `check` and the user clicks an indeterminate toggle
- **THEN** `checked` flips and `indeterminate` stays `true`

#### Scenario: check-indeterminate set in code

- **WHEN** code sets `clickAction` to `check-indeterminate` while a token provides `noop`, and the user clicks twice
- **THEN** the toggle turns on and then off, and is never indeterminate

### Requirement: Default click action

Without a bound `clickAction`, the toggle SHALL use `KBQ_CHECKABLE_CLICK_ACTION`, then the legacy `KBQ_CHECKBOX_CLICK_ACTION` from `@koobiq/components/checkbox`, then `check-indeterminate`. A bound `clickAction` SHALL win over both tokens, and binding it to `undefined` SHALL give `check-indeterminate`, not the value of a token.

#### Scenario: Application-wide token

- **WHEN** `KBQ_CHECKABLE_CLICK_ACTION` is provided as `noop` and the user clicks the toggle
- **THEN** the toggle stays off

#### Scenario: Both tokens

- **WHEN** `KBQ_CHECKABLE_CLICK_ACTION` is `noop`, `KBQ_CHECKBOX_CLICK_ACTION` is `check-indeterminate` and the user clicks the toggle
- **THEN** the toggle stays off

#### Scenario: Legacy token only

- **WHEN** only `KBQ_CHECKBOX_CLICK_ACTION` is provided, as `noop`, and the user clicks the toggle
- **THEN** the toggle stays off

#### Scenario: Binding turns undefined

- **WHEN** a token provides `noop`, `clickAction` is bound to `check` and then to `undefined`, and the user clicks the toggle
- **THEN** the toggle turns on

### Requirement: Angular forms

The toggle SHALL work as a form control with `ngModel`, `formControl` and `formControlName`. A value written by the form SHALL turn the toggle on when truthy and off otherwise, without emitting `change`. A user switch SHALL pass `true` or `false` to the form and mark the control dirty.

#### Scenario: ngModel follows a click

- **WHEN** the toggle is bound with `[(ngModel)]` to `false` and the user clicks it
- **THEN** the bound property is `true` and the control is dirty

#### Scenario: Form writes a value

- **WHEN** the bound form control is set to a truthy value in code
- **THEN** the toggle is on and no `change` fires

#### Scenario: Initial state

- **WHEN** a toggle bound with `ngModel` has rendered
- **THEN** the control is pristine, untouched and valid

### Requirement: Form value is current in the change handler

On a user switch the toggle SHALL pass the new value to the bound form control, then mark the control touched, and only then emit `change`, so a `change` handler reads the new value from the control.

#### Scenario: Reading the control in the handler

- **WHEN** the user clicks a toggle bound to a form control and a `change` handler reads the control
- **THEN** the control already holds the new value

### Requirement: Touched state

The toggle SHALL mark its form control touched when focus leaves it and when the user switches it. Receiving focus MUST NOT mark the control touched, and losing focus MUST NOT change the value.

#### Scenario: Focus alone

- **WHEN** a toggle bound with `ngModel` receives keyboard focus
- **THEN** the control is still untouched

#### Scenario: Focus leaves the toggle

- **WHEN** focus leaves the toggle
- **THEN** the control is touched and its value is unchanged

### Requirement: Element ids

The host SHALL carry the `id` input, or a generated `kbq-toggle-<n>` that is unique per toggle when `id` is not bound, is empty or is `undefined`. The native checkbox SHALL have the id `<host id>-input`, which `inputId` returns.

#### Scenario: Custom id

- **WHEN** `id` is `simple-check`
- **THEN** the host id is `simple-check` and the native checkbox id is `simple-check-input`

#### Scenario: Id turns undefined

- **WHEN** the bound `id` becomes `undefined`
- **THEN** the host id is `kbq-toggle-<n>` and the native checkbox id is that id followed by `-input`

#### Scenario: Two toggles

- **WHEN** two toggles without `id` are rendered
- **THEN** their native checkboxes have different ids

### Requirement: Tab order

The native checkbox SHALL be the tab stop of the toggle, with `tabindex="0"` by default and the value of the `tabIndex` input when given. Binding `tabIndex` to `null`, `undefined` or a value that is not a number SHALL give `0`. While disabled the native checkbox SHALL have `tabindex="-1"`, and enabling the toggle SHALL restore the last given tab index. A static `tabIndex` attribute also stays on the host element, which a value of `0` or more makes a second tab stop.

#### Scenario: Custom tab index

- **WHEN** `tabIndex` is 7
- **THEN** the native checkbox has `tabindex="7"`

#### Scenario: Index changed while disabled

- **WHEN** the toggle is disabled, `tabIndex` changes to 13 and the toggle is enabled again
- **THEN** the native checkbox has `tabindex="13"`

#### Scenario: Index unbound

- **WHEN** `tabIndex` is bound to `null` or `undefined`
- **THEN** the native checkbox has `tabindex="0"`

#### Scenario: Static attribute

- **WHEN** the toggle is written as `<kbq-toggle tabIndex="2">`
- **THEN** both the native checkbox and the host element have `tabindex="2"`

### Requirement: Motion

The switch SHALL animate the move of its knob and of its dash and the change of the background of its bar, and MUST NOT animate when `KBQ_ANIMATIONS_CONFIG` sets `animationsDisabled`, when noop animations are provided, or when the user prefers reduced motion. When motion is off in any of these ways as the toggle is created, the bar, the knob and the dash SHALL carry `kbq-animations-disabled`; reduced motion turned on later takes effect through the styles only.

#### Scenario: Animations disabled by configuration

- **WHEN** `KBQ_ANIMATIONS_CONFIG` provides `{ animationsDisabled: true }`
- **THEN** the bar, the knob and the dash of the switch have `kbq-animations-disabled`

#### Scenario: Reduced motion

- **WHEN** the user prefers reduced motion
- **THEN** the bar and the dash of the switch have a transition duration of `0s`

#### Scenario: Reduced motion turned on later

- **WHEN** the user turns on reduced motion after the toggle is created
- **THEN** the switch does not animate, and its bar, knob and dash do not have `kbq-animations-disabled`

### Requirement: State written from an effect

Writing `checked` or `indeterminate` on the toggle from inside an Angular `effect()` MUST NOT make that effect depend on the state of the toggle, so a later click on the toggle does not run the effect again.

#### Scenario: Effect that turns the toggle on

- **WHEN** an effect sets `checked` to `true` and the user then clicks the toggle
- **THEN** the toggle is off and the effect has run once

#### Scenario: Effect that sets indeterminate

- **WHEN** an effect sets `indeterminate` to `true` and the user then clicks the toggle
- **THEN** the toggle is no longer indeterminate and the effect has run once

### Requirement: Standalone component and module

`kbq-toggle` SHALL be a standalone component that `KbqToggleModule` also exports for NgModule consumers, and SHALL be available to a template reference variable as `kbqToggle`.

#### Scenario: Template reference

- **WHEN** a template declares `<kbq-toggle #t="kbqToggle">`
- **THEN** `t` is the toggle instance, with `checked` and `focus()`
