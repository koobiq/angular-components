# radio Specification

## Purpose

Describes what `kbq-radio-group` and `kbq-radio-button` from `@koobiq/components/radio` guarantee to consumers: how a user picks one option with a pointer, the keyboard or assistive technology, how the selection reaches the group value, change events, Angular forms and native forms, and how size, color, content, focus and accessibility attributes behave.

## Requirements

### Requirement: Group size

A `kbq-radio-group` SHALL have the class `kbq-radio-group_normal` by default and `kbq-radio-group_big` instead while its `big` input is `true`. Every button of a big group SHALL have the class `kbq-radio-button_big`; a button outside a group or in a normal group MUST NOT have it. The `big` input SHALL default to `false` and MUST NOT coerce attribute strings.

#### Scenario: Switching a group to big

- **WHEN** a group binds `[big]="true"`
- **THEN** the group has `kbq-radio-group_big` instead of `kbq-radio-group_normal`
- **AND** every button in it has `kbq-radio-button_big`

#### Scenario: Default size

- **WHEN** a group binds no `big`
- **THEN** no button in it has `kbq-radio-button_big`

### Requirement: Button height

A radio button without a `kbq-hint` whose label, if any, fits on one line SHALL be one line of text tall: 20 px in a normal group and 24 px in a big group. This SHALL hold for a button wrapped in another element inside the group and for a button that is a direct child of the group. A projected hint or a label that wraps makes the button taller.

#### Scenario: Button without a label

- **WHEN** a button with no projected text is rendered in a normal group
- **THEN** the button is 20 px tall

#### Scenario: Big group

- **WHEN** the same group switches to big
- **THEN** every button in it without a hint, with no label or a one-line label, is 24 px tall

### Requirement: Label position

The option text SHALL be placed after the circle by default. `labelPosition="before"` on a group SHALL place it before the circle for every button of the group; the group input SHALL treat any value other than `before` as `after`. A button's own `labelPosition` SHALL win over its group's, and when the button's binding changes to `undefined` the button SHALL fall back to its group's position.

#### Scenario: Group places labels before the circle

- **WHEN** a group binds `labelPosition="before"`
- **THEN** every button in it reports `labelPosition` as `before` and renders its text before the circle

#### Scenario: Button binding reset

- **WHEN** a button binds `labelPosition="before"` and the binding changes to `undefined` in a group with the default position
- **THEN** the button reports `after`

### Requirement: Color

The group and each button SHALL accept a `color` input and render it as a `kbq-<color>` host class, with `kbq-empty` while no color is given. A color written in code through the `color` signal SHALL hold until the input changes. `error` on a group SHALL draw every button of the group in the error palette; `error` on a button SHALL draw only that button in it.

#### Scenario: Error color on the group

- **WHEN** a group binds `color="error"`
- **THEN** the group has the class `kbq-error`
- **AND** every button in it is drawn in the error palette

### Requirement: Option content and hint

The default content of a `kbq-radio-button` SHALL be its option text. A `kbq-hint` that is a child of the button SHALL be rendered below the text. The whole label, hint included, SHALL be the click target: a click anywhere on it SHALL select the button.

#### Scenario: Option with a caption

- **WHEN** a button projects the text "William Anderson" and `<kbq-hint>Lawyer</kbq-hint>`
- **THEN** the caption is rendered below the option text

#### Scenario: Clicking the label

- **WHEN** the user clicks the label of an enabled, unchecked button
- **THEN** the button becomes checked

### Requirement: Group membership

A `kbq-radio-button` inside a `kbq-radio-group`, at any depth of the group's content, SHALL belong to that group. It SHALL take the group's size, and the group's name and label position unless it sets its own; it SHALL be disabled or required when either it or the group is. The group's `radios` SHALL list every button that belongs to it and SHALL be empty, not `undefined`, before the content is initialized.

#### Scenario: Button wrapped in another element

- **WHEN** a button sits inside a `div` inside a big group
- **THEN** the button takes the big size of the group

### Requirement: One selected button per group

Checking a button of a group SHALL uncheck every other button of the group that shares its name. The group's `value` SHALL then hold that button's value and its `selected` SHALL hold that button.

#### Scenario: Clicking two buttons in turn

- **WHEN** the user clicks the first button and then the second one
- **THEN** only the second button is checked
- **AND** the group's `value` is the second button's value and its `selected` is the second button

### Requirement: Group value selects the matching button

Writing the group's `value` — through `[value]`, the `value` property or a form control — SHALL check the button whose `value` is strictly equal (`===`) to it and uncheck the others. Object values SHALL therefore match only the same object instance.

#### Scenario: Binding the group value

- **WHEN** the group's `[value]` changes from `'fire'` to `'water'`
- **THEN** the `'water'` button is checked and is the group's `selected`
- **AND** the `'fire'` button is unchecked

### Requirement: Value without a matching button is kept

A group value that matches no button SHALL be kept as the group's `value` with no button checked and `selected` empty. A button whose value later becomes equal to it, or that is added later with that value, SHALL become checked and the group's `selected`.

#### Scenario: Button value changes to the group value

- **WHEN** the group's value is `'apple'`, no button has that value, and a button's value is then set to `'apple'`
- **THEN** that button becomes checked and is the group's `selected`

### Requirement: Clearing the group value

Writing `null` to the group's `value`, or changing its `[value]` binding to `undefined`, SHALL uncheck every button that has a value and leave the group's `value` as written.

#### Scenario: Value binding changes to undefined

- **WHEN** the group's `[value]` binding changes from `'fire'` to `undefined`
- **THEN** the `'fire'` button is unchecked and the group's `value` is `undefined`

### Requirement: Selected button of a group

In a group whose buttons all have a value other than `null` (a button without a `value` has `null`), the group's `selected` SHALL hold the checked button or `null`. Writing a button to `selected`, through the property or the `[selected]` input, SHALL check that button and set the group's `value` to its value. In such a group, writing `null`, or changing the `[selected]` binding to `undefined`, SHALL set `selected` to `null` and uncheck the button.

#### Scenario: Selected binding cleared

- **WHEN** `[selected]` is bound to the second button of a group whose buttons all have a value other than `null`, and then changes to `undefined`
- **THEN** the group's `selected` is `null` and the second button is unchecked

### Requirement: Checked state of a button

A button's `checked` SHALL be writable through the property and the `[checked]` input. In a group whose buttons all have a value other than `null`, checking a button in code SHALL make it the group's `selected` and its value the group's `value`, and unchecking the group's selected button in code SHALL set the group's `selected` to `null` and its `value` to `null`.

#### Scenario: Checking in code

- **WHEN** code sets `checked` to `true` on the `'fire'` button
- **THEN** the group's `value` is `'fire'` and its `selected` is that button

#### Scenario: Unchecking the selected button in code

- **WHEN** code sets `checked` to `false` on the selected button of a group whose buttons all have a value other than `null`
- **THEN** no button is checked, the group's `selected` is `null` and its `value` is falsy

### Requirement: Button value

A button's `value` SHALL be writable through the property and the `[value]` input, and a binding that changes to `undefined` SHALL set it to `undefined`. When a button's value changes to the group's value, the button SHALL become checked.

#### Scenario: Value binding changes to undefined

- **WHEN** a button's `[value]` binding changes from `'water'` to `undefined`
- **THEN** the button's `value` is `undefined`

### Requirement: Button change event

A button's `change` output SHALL emit a `KbqRadioChange` whose `source` is the button and whose `value` is the button's value each time the user checks the button. It MUST NOT emit when the button is unchecked, when the user activates a button that is already checked, or when `checked` or `value` is written in code.

#### Scenario: Selecting another button

- **WHEN** the user clicks the first button and then the second one
- **THEN** the first button's `change` has emitted once and the second button's `change` has emitted once

### Requirement: Group change event

The group's `change` output SHALL emit a `KbqRadioChange` whose `source` is the newly checked button and whose `value` is the new group value when a user selection changes the group's value. It MUST NOT emit when `value`, `selected` or a button's `checked` is written in code.

#### Scenario: User selection

- **WHEN** the user clicks a button that is not checked
- **THEN** the group's `change` emits once

#### Scenario: Value written in code

- **WHEN** code sets the group's `value` to another button's value
- **THEN** the group's `change` does not emit

### Requirement: Order of notifications

When the user checks a button of a group, the button SHALL first be checked and the group value updated, then the button's `change` SHALL emit, then the bound form control SHALL receive the value and be marked touched, and then the group's `change` SHALL emit if the value changed.

#### Scenario: Reading the form control in a group change handler

- **WHEN** the user picks a button and a handler of the group's `change` reads the bound form control
- **THEN** the control already holds the new value and is touched

### Requirement: Native events stay inside the button

The native `change` event of the inner radio input MUST NOT propagate past it, so a `(change)` listener on `kbq-radio-button` or `kbq-radio-group` SHALL receive only `KbqRadioChange` objects. The click that a label dispatches to its input MUST NOT propagate either, so ancestors SHALL see one click per activation of the label.

#### Scenario: Change listener on the button

- **WHEN** a template binds `(change)` on a `kbq-radio-button` and the user checks it
- **THEN** the handler receives a single `KbqRadioChange` and no native `Event`

### Requirement: Button outside a group

A `kbq-radio-button` used outside a group SHALL be unchecked by default, SHALL become checked when the user clicks it and SHALL emit its `change`. Without a name of its own it SHALL be named with an id unique to itself, so checking it MUST NOT uncheck any other button in the application.

#### Scenario: Two unnamed buttons outside a group

- **WHEN** two buttons without a name and without a group are both checked
- **THEN** both stay checked and their names differ

### Requirement: Shared name outside a group

Buttons outside a group that share an explicit `name` SHALL form one selection set: checking one SHALL uncheck the others.

#### Scenario: Two buttons named alike

- **WHEN** two buttons outside a group have `name="shared"` and the first and then the second is checked
- **THEN** only the second one is checked

### Requirement: Group name

The group's `name` SHALL default to a generated `kbq-radio-group-<n>` that is unique in the application, and an explicit `name` SHALL replace it. Every button of the group without a name of its own SHALL use the group's name, and its native input SHALL render it as the `name` attribute, updated when the group's name changes.

#### Scenario: Renaming the group

- **WHEN** a group bound to `name="test-name"` is rebound to `"renamed"`
- **THEN** the native inputs of its buttons have `name="renamed"`

#### Scenario: Every input shares one name

- **WHEN** a group with three buttons is rendered
- **THEN** all three native inputs have the same non-empty `name`

### Requirement: Button name

A button's own `name` SHALL win over its group's name. When the button's `[name]` binding changes to `undefined`, the button SHALL fall back to the group's name, or to its unique id outside a group.

#### Scenario: Explicit name inside a group

- **WHEN** one button of a group has `name="custom"` and another has no name
- **THEN** the first button's `name` is `custom` and the second one's is the group's name

### Requirement: Native form submission

The native input of a button SHALL carry the button's value converted to a string as its `value` attribute, and no `value` attribute while the button's value is `null` or `undefined`. Inside a native `<form>`, the form data SHALL hold the checked button's value under the `name` of its native input: the button's own name when it sets one, otherwise the name of its group.

#### Scenario: Submitting a native form

- **WHEN** a group named `answer` is inside a `<form>` and the user picks the `'water'` button
- **THEN** `new FormData(form).get('answer')` is `'water'`

#### Scenario: Value attributes

- **WHEN** buttons with the values `'fire'`, `'water'` and `'leaf'` are rendered
- **THEN** their native inputs have those `value` attributes

### Requirement: Angular forms

The group SHALL work as a form control with `ngModel`, `formControl` and `formControlName`. A value written by the form SHALL check the matching button, and a value the user picks SHALL be written back to the form.

#### Scenario: ngModel writes a value

- **WHEN** the `ngModel` value is `'water'`
- **THEN** only the `'water'` button is checked

#### Scenario: User picks a value bound to a form control

- **WHEN** the user clicks the `'water'` button of a group bound to a `FormControl`
- **THEN** the control's value is `'water'`

### Requirement: Code writes do not reach the form control

Writing the group's `value` or `selected`, or a button's `checked` or `value`, in code or through their inputs MUST NOT pass the new value to the bound form control. Only a user selection SHALL do that.

#### Scenario: Checking a button in code

- **WHEN** a group is bound to a `FormControl` holding `null` and code sets `checked` to `true` on a button
- **THEN** the button is checked and the control still holds `null`

### Requirement: Touched state

The group SHALL mark its form control touched when focus leaves one of its buttons and each time the user checks a button. Moving focus onto a button MUST NOT mark it touched.

#### Scenario: Focus leaves a button

- **WHEN** a button of a form-bound group receives focus and then loses it
- **THEN** the control is untouched while the button has focus and touched after it loses focus

#### Scenario: Clicking a button

- **WHEN** the user clicks a button of a form-bound group
- **THEN** the control is touched

### Requirement: Disabled group

A group SHALL be disabled through its `disabled` input, which coerces attribute strings (`""` is `true`, `"false"` is `false`), through the `disabled` property, or by disabling its form control. Every button of a disabled group SHALL be disabled, and a click on a button of a disabled group MUST NOT check it.

#### Scenario: Bare disabled attribute

- **WHEN** the group's `disabled` is bound to `""` and then to `"false"`
- **THEN** the group's `disabled` is `true` and then `false`

#### Scenario: Disabling the form control

- **WHEN** the bound form control is disabled
- **THEN** every native input of the group is disabled

#### Scenario: Clicking a button of a disabled group

- **WHEN** the group is disabled and the user clicks a button's label
- **THEN** the button stays unchecked

### Requirement: Disabled button

A button SHALL be disabled when its own `disabled` is set or its group is disabled. A disabled button SHALL have the host class `kbq-disabled` and a disabled native input with `tabindex="-1"`, and MUST NOT be checked by the user. Clearing `disabled` SHALL re-enable it.

#### Scenario: Toggling a button

- **WHEN** a button's `disabled` binding changes to `true` and back to `false`
- **THEN** its native input is disabled and then enabled again

### Requirement: Checked host class

A checked button SHALL have the host class `kbq-selected`; an unchecked button MUST NOT have it.

#### Scenario: Checking a button

- **WHEN** the user checks a button
- **THEN** that button has `kbq-selected` and the previously checked one no longer does

### Requirement: Required group

The group's `required` input SHALL coerce attribute strings and SHALL default to `false`. A required group SHALL have `aria-required="true"`, and every button of it SHALL report `required` as `true` and render a `required` native input. A button outside a required group SHALL report `required` as `false` unless it sets its own. The group MUST NOT add a validator of its own.

#### Scenario: Required group

- **WHEN** a group binds `[required]="true"`
- **THEN** the group has `aria-required="true"` and every button in it reports `required` as `true`

#### Scenario: Not required

- **WHEN** the group is not required
- **THEN** it has no `aria-required` attribute

### Requirement: Native keyboard interaction

The components MUST NOT install key handlers of their own; the keyboard SHALL be the browser's native radio behaviour. Buttons that share a name SHALL form one tab stop, entered at the checked button or the first enabled one. Arrow keys SHALL move between enabled buttons and select as they move; Space SHALL select the focused button. The browser's `change` SHALL update the group as a click does.

#### Scenario: Arrow key moves the selection

- **WHEN** the first button is checked and the browser checks the second one in response to an arrow key, firing `change` on its input
- **THEN** the group's value is the second button's value and the first button is unchecked

#### Scenario: Tabbing into a group

- **WHEN** the user tabs into a group whose second button is checked
- **THEN** focus lands on the second button, and the next Tab leaves the group

### Requirement: Tab index of a button

A button's `tabIndex` input SHALL set the `tabindex` of its native input and SHALL default to `0`. When the binding changes to `null` or `undefined`, the native input SHALL return to `tabindex="0"`. A disabled button SHALL report `tabIndex` as `-1`.

#### Scenario: Binding reset

- **WHEN** a button's `tabIndex` is bound to `3` and the binding then changes to `null`
- **THEN** the button reports `tabIndex` as `0` and its native input has `tabindex="0"`

### Requirement: Focusing a button

A button's `focus(origin)` SHALL move focus to its native input with the given `FocusOrigin`, `'program'` by default. The button host SHALL carry the CDK focus-origin classes: `cdk-keyboard-focused` for a keyboard origin, which draws the focus ring, and `cdk-program-focused` without a ring for the default origin.

#### Scenario: Keyboard origin

- **WHEN** code calls `focus('keyboard')` on a button
- **THEN** the button host has `cdk-keyboard-focused`

#### Scenario: Default origin

- **WHEN** code calls `focus()` on a button
- **THEN** the button host has `cdk-program-focused` and not `cdk-keyboard-focused`

### Requirement: Focusing a group

The group's `focus(origin)` SHALL focus its selected button while that button is enabled, or the first enabled button when none is selected, with the given `FocusOrigin`, `'program'` by default.

#### Scenario: Checked button

- **WHEN** the second button is checked and code calls `focus('keyboard')` on the group
- **THEN** the second button has `cdk-keyboard-focused`

#### Scenario: Nothing checked and the first button disabled

- **WHEN** nothing is checked, the first button is disabled and code calls `focus('keyboard')` on the group
- **THEN** the second button has `cdk-keyboard-focused`

### Requirement: Group role and name

The group host SHALL have `role="radiogroup"`. The group MUST NOT name itself: an `aria-label` or `aria-labelledby` attribute the consumer writes on the element SHALL be left as written.

#### Scenario: Labelled group

- **WHEN** a group has `aria-labelledby` pointing at a visible label
- **THEN** the group has `role="radiogroup"` and that `aria-labelledby` unchanged

### Requirement: Error state is announced

The group SHALL have `aria-invalid="true"` while its color is `error`, and no `aria-invalid` attribute otherwise. The group MUST NOT derive an error state from its form control; a consumer shows an error by binding the color.

#### Scenario: Error color

- **WHEN** a group's color changes from none to `error`
- **THEN** the group gets `aria-invalid="true"` and the class `kbq-error`

### Requirement: Accessible name and description of a button

The native input of a button SHALL be named by the option text alone through `aria-labelledby`, not by the whole label. When the button projects a `kbq-hint`, the input SHALL be described by that hint through `aria-describedby`; without a hint it MUST NOT have `aria-describedby`.

#### Scenario: Option with a hint

- **WHEN** a button projects "William Anderson" and `<kbq-hint>Lawyer</kbq-hint>`
- **THEN** the input's `aria-labelledby` points at an element whose text is "William Anderson"
- **AND** its `aria-describedby` points at an element whose text is "Lawyer"

#### Scenario: Option without a hint

- **WHEN** a button projects only its text
- **THEN** its native input has no `aria-describedby`

### Requirement: Element ids

A button's host SHALL carry its `id`, which defaults to a generated `kbq-radio-<n>`; binding `null` or an empty string SHALL keep the generated one. The native input SHALL have the id `<id>-input`, exposed as `inputId`, and the button's `<label>` SHALL point at it with `for`.

#### Scenario: Custom id

- **WHEN** a button binds `id="delivery"`
- **THEN** the host has `id="delivery"` and the native input has `id="delivery-input"`

### Requirement: Accessibility checks

A group named with `aria-labelledby` SHALL pass the axe checks, with and without hints projected into its buttons.

#### Scenario: Labelled group with hints

- **WHEN** axe runs on a labelled group whose buttons carry hints
- **THEN** it reports no violations

### Requirement: Code writes re-render without a forced check

A write in code to the group's `disabled`, `value` or `selected`, or to a button's `checked`, `disabled` or `value`, SHALL reach the DOM on the next change detection even inside `OnPush` views that nothing else marked for check.

#### Scenario: Disabling a group in code under OnPush

- **WHEN** a group sits in an `OnPush` host and code sets `group.disabled = true`
- **THEN** after the next application tick every native input of the group is disabled

### Requirement: Writes from an effect are untracked

Writing the group's `value` or a button's `checked` inside a consumer's `effect()` MUST NOT make that effect depend on the selection, so the effect SHALL NOT run again when the user later picks another button.

#### Scenario: Effect that sets the group value

- **WHEN** an effect sets the group's `value` to `'fire'` and the user then picks the `'water'` button
- **THEN** the group's value is `'water'` and the effect has run once

### Requirement: Back-compatible check methods

The group's `markRadiosForCheck()` and a button's `markForCheck()` SHALL stay public and callable. The components SHALL re-render without them.

#### Scenario: Calling markRadiosForCheck

- **WHEN** consumer code calls `markRadiosForCheck()` on a group
- **THEN** no error is thrown and the rendered state does not change

### Requirement: Exports

`@koobiq/components/radio` SHALL export the standalone directive `KbqRadioGroup` (selector `kbq-radio-group`, `exportAs` `kbqRadioGroup`) and the standalone component `KbqRadioButton` (selector `kbq-radio-button`, `exportAs` `kbqRadioButton`), the `KbqRadioChange` event class, `KBQ_RADIO_GROUP_CONTROL_VALUE_ACCESSOR`, and `KbqRadioModule`, which re-exports both.

#### Scenario: Template reference to the group

- **WHEN** a template declares `#group="kbqRadioGroup"` on a `kbq-radio-group`
- **THEN** `group` refers to the group instance
