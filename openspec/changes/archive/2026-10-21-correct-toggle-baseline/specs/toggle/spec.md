# Spec Delta

## MODIFIED Requirements

### Requirement: Pointer click switches the toggle

A click anywhere on a toggle that is neither disabled nor loading — the switch, the label text or the hint — SHALL flip `checked`, unless the click action is `noop`, because the whole toggle is a `<label>` for its native checkbox.

#### Scenario: Two clicks

- **WHEN** the user clicks a toggle that is neither disabled nor loading, with the default click action, twice
- **THEN** `checked` becomes `true` and then `false` again

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
