# Spec Delta

## MODIFIED Requirements

### Requirement: Disabled anchor

When the `disabled` input is true, an `<a kbq-button>` SHALL get `aria-disabled="true"`, `tabindex="-1"` and the `kbq-disabled` class, and MUST NOT get a `disabled` attribute. A click on it SHALL have its default action prevented and MUST NOT reach the click handlers on the host, inside it or on its ancestors while bubbling, so it neither navigates nor runs them; capture-phase listeners on its ancestors still run. Re-enabling SHALL remove `aria-disabled` rather than set it to `"false"`.

#### Scenario: Click on a disabled link

- **WHEN** the user clicks a disabled `<a href="#" kbq-button>` that has a `(click)` handler
- **THEN** the click's default action is prevented and the handler does not run

#### Scenario: Capture-phase listener on an ancestor

- **WHEN** an ancestor of a disabled `<a kbq-button>` listens for `click` in the capture phase, as the CDK overlay's outside-click handling does on `<body>`, and the link is clicked
- **THEN** that listener runs

#### Scenario: Re-enabling a link

- **WHEN** a disabled `<a kbq-button>` is enabled again
- **THEN** the host has no `aria-disabled` attribute

### Requirement: Disabled anchor ignores activation keys

While an `<a kbq-button>` is disabled, a keydown of Enter, Space, Down, Left or Right on it SHALL have its default action prevented and MUST NOT reach the keydown handlers on the host, inside it or on its ancestors while bubbling, so a directive on the same host, such as a dropdown trigger, does not react. Capture-phase listeners on its ancestors still run. Tab, Escape and the other keys MUST pass through, so focus can still leave the element.

#### Scenario: Enter and Space on a disabled link

- **WHEN** a disabled `<a kbq-button>` receives a keydown of Enter or Space
- **THEN** the event's default action is prevented

#### Scenario: Disabled dropdown trigger

- **WHEN** a disabled `<a kbq-button>` that is also a dropdown trigger is clicked, or receives Enter, Space or Down
- **THEN** the dropdown stays closed and the host does not get `kbq-active`

#### Scenario: Tab leaves a disabled link

- **WHEN** a disabled `<a kbq-button>` has focus and the user presses Tab
- **THEN** the keydown is not prevented and focus moves on

### Requirement: Keyboard focus ring

A button in one of the built-in styles `filled`, `outline` or `transparent` SHALL show a focus outline in the theme's focus color while it has keyboard focus. Mouse focus MUST NOT show it, and neither MUST a disabled button that still holds focus. The button theme MUST NOT draw it for a custom style, while the native focus outline stays removed, so whoever defines a custom style supplies its focus look.

#### Scenario: Keyboard focus look

- **WHEN** a `filled`, `outline` or `transparent` host has `cdk-keyboard-focused`
- **THEN** it shows the focus outline

#### Scenario: Disabled anchor keeps focus

- **WHEN** a focused `<a kbq-button>` becomes disabled
- **THEN** no focus outline is shown

#### Scenario: Custom style without a focus rule

- **WHEN** a button whose custom `kbqStyle` defines no focus look of its own has `cdk-keyboard-focused`
- **THEN** no focus outline is shown

### Requirement: Label truncation

A button with a label SHALL size to its content but never past the width of its container and keep the label on one line, whether the width comes from the container, a fixed width or a full-width rule. A label that does not fit SHALL be cut with an ellipsis, except when an unmarked icon sits directly in the label box: that box becomes a flex row and the label is clipped without an ellipsis. Icons in the slots SHALL keep their full size while the label shrinks.

#### Scenario: Long label in a narrow container

- **WHEN** a button without a width of its own has a long label in a 150 px container
- **THEN** the button is at most 150 px wide and its label is clipped with an ellipsis

#### Scenario: Short label

- **WHEN** a button with a two-letter label is in a 260 px container
- **THEN** the button stays narrower than 100 px

#### Scenario: Slot icons and a clipped label

- **WHEN** a button with a prefix and a suffix icon has a clipped label
- **THEN** both icons keep their 16 px width

#### Scenario: Unmarked icon next to a long label

- **WHEN** a button holds an unmarked icon followed by a long label in a 150 px container
- **THEN** the button is at most 150 px wide and its label is clipped without an ellipsis

### Requirement: Icons are centred

Icons SHALL be centred vertically in the prefix and suffix slots, in the label box when placed there unmarked, and in an icon-only button, which SHALL also centre its icon horizontally. When a button's only content is the consumer's own element wrapping an icon, the button SHALL centre that element both ways; the icon is centred inside it only if the element centres its own content.

#### Scenario: Unmarked icon next to the text

- **WHEN** an unmarked icon precedes a clipped label
- **THEN** the icon's centre is level with the button's centre

#### Scenario: Icon-only button

- **WHEN** an icon-only button is rendered, with or without a slot marker
- **THEN** its icon is centred both ways

#### Scenario: Icon wrapped in the consumer's element

- **WHEN** a button's only content is an icon inside the consumer's element, and that element centres its content as `display: flex; align-items: center` does
- **THEN** the element and the icon are centred both ways in the button

### Requirement: Right-to-left layout

The spacing between icons and the label SHALL follow the writing direction, so under `dir="rtl"` the prefix sits on the right of the label and the suffix on its left. Under `dir="rtl"` a horizontal button group SHALL lay its buttons out in mirrored order with mirrored outer corners, while the borders and dividers that join them stay on their physical sides: the first button's outer right border is transparent, and a group divider is drawn on the left side of every button but the first.

#### Scenario: Button with prefix and suffix

- **WHEN** a button with a prefix icon, text and a suffix icon is rendered under `dir="rtl"`
- **THEN** the prefix icon is on the right, the suffix icon on the left, and each is spaced from the text

#### Scenario: Button group

- **WHEN** a horizontal button group is rendered under `dir="rtl"`
- **THEN** its first button is the rightmost, the outer corners of the group are rounded, and the outer right border of that first button is transparent

#### Scenario: Dividers of a filled contrast-fade group

- **WHEN** a horizontal group with `kbqStyle="filled"` and the `contrast-fade` color is rendered under `dir="rtl"`
- **THEN** a divider is drawn on the group's outer left edge and none at the junction of its first two buttons
