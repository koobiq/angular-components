# Spec Delta

## MODIFIED Requirements

### Requirement: Button height

A radio button without a `kbq-hint` whose label, if any, fits on one line SHALL be one line of text tall: 20 px in a normal group and 24 px in a big group. This SHALL hold for a button wrapped in another element inside the group and for a button that is a direct child of the group. A projected hint or a label that wraps makes the button taller.

#### Scenario: Button without a label

- **WHEN** a button with no projected text is rendered in a normal group
- **THEN** the button is 20 px tall

#### Scenario: Big group

- **WHEN** the same group switches to big
- **THEN** every button in it without a hint, with no label or a one-line label, is 24 px tall

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

### Requirement: Native form submission

The native input of a button SHALL carry the button's value converted to a string as its `value` attribute, and no `value` attribute while the button's value is `null` or `undefined`. Inside a native `<form>`, the form data SHALL hold the checked button's value under the `name` of its native input: the button's own name when it sets one, otherwise the name of its group.

#### Scenario: Submitting a native form

- **WHEN** a group named `answer` is inside a `<form>` and the user picks the `'water'` button
- **THEN** `new FormData(form).get('answer')` is `'water'`

#### Scenario: Value attributes

- **WHEN** buttons with the values `'fire'`, `'water'` and `'leaf'` are rendered
- **THEN** their native inputs have those `value` attributes

### Requirement: Focusing a group

The group's `focus(origin)` SHALL focus its selected button while that button is enabled, or the first enabled button when none is selected, with the given `FocusOrigin`, `'program'` by default.

#### Scenario: Checked button

- **WHEN** the second button is checked and code calls `focus('keyboard')` on the group
- **THEN** the second button has `cdk-keyboard-focused`

#### Scenario: Nothing checked and the first button disabled

- **WHEN** nothing is checked, the first button is disabled and code calls `focus('keyboard')` on the group
- **THEN** the second button has `cdk-keyboard-focused`

### Requirement: Exports

`@koobiq/components/radio` SHALL export the standalone directive `KbqRadioGroup` (selector `kbq-radio-group`, `exportAs` `kbqRadioGroup`) and the standalone component `KbqRadioButton` (selector `kbq-radio-button`, `exportAs` `kbqRadioButton`), the `KbqRadioChange` event class, `KBQ_RADIO_GROUP_CONTROL_VALUE_ACCESSOR`, and `KbqRadioModule`, which re-exports both.

#### Scenario: Template reference to the group

- **WHEN** a template declares `#group="kbqRadioGroup"` on a `kbq-radio-group`
- **THEN** `group` refers to the group instance
