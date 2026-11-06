# button Specification

## Purpose

Describes what `@koobiq/components/button` guarantees to consumers: how `kbq-button` behaves on a `<button>` or an `<a>`, enabled or disabled, how it lays out and classifies its content, how it takes a style and a color, and how `kbq-button-group` and `kbqButtonGroupRoot` pass a shared style, color and disabled state to the buttons inside them.

## Requirements

### Requirement: The button and its styler come as a pair

The `kbq-button` attribute SHALL be matched by two declarations, `KbqButton` and `KbqButtonCssStyler`, and `KbqButtonModule` SHALL export both together with the slot, dropdown-trigger and group declarations. `KbqButtonCssStyler` used without `KbqButton` SHALL log the dev-mode warning "KbqButtonCssStyler should be imported together with KbqButton." and skip icon detection. `KbqButton` used without the styler MUST fail with Angular's missing-provider error.

#### Scenario: Styler without the button

- **WHEN** a component imports only `KbqButtonCssStyler` and renders `<div kbq-button>` in dev mode
- **THEN** that warning is logged

#### Scenario: Button without the styler

- **WHEN** a component imports only `KbqButton` and renders `<button kbq-button>`
- **THEN** creating the button throws a missing-provider error for `KbqButtonCssStyler`

### Requirement: Supported hosts

`kbq-button` SHALL be supported on native `<button>` and `<a>` elements. It SHALL render the projected content inside the host and keep the host's own attributes, event handlers and the classes the consumer puts on it when its style or color classes change. The button MUST NOT set a `type` attribute, so a `<button kbq-button>` without one keeps the native submit behaviour inside a form.

#### Scenario: Click on an enabled button

- **WHEN** the user clicks an enabled `<button kbq-button>` that has a `(click)` handler
- **THEN** the handler runs once

#### Scenario: Consumer classes survive a color change

- **WHEN** the host has the class `custom-class` and its `color` changes from `theme` to `contrast`
- **THEN** the host has `kbq-contrast` and `custom-class`, and no longer has `kbq-theme`

#### Scenario: No type is added

- **WHEN** a `<button kbq-button>` is rendered without a `type`
- **THEN** the host has no `type` attribute

### Requirement: Disabled native button

When the `disabled` input is true, a `<button kbq-button>` SHALL get the native `disabled` attribute, `tabindex="-1"` and the `kbq-disabled` class, and MUST NOT get `aria-disabled`. Its click handlers MUST NOT run. The input SHALL accept the bare attribute and the string forms of a boolean attribute.

#### Scenario: Disabling a native button

- **WHEN** `[disabled]` turns true on a `<button kbq-button>`
- **THEN** the host has `disabled` and `tabindex="-1"` and has no `aria-disabled`

#### Scenario: Click on a disabled native button

- **WHEN** the user clicks a disabled `<button kbq-button>` that has a `(click)` handler
- **THEN** the handler does not run

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

### Requirement: Tab order

An enabled `<button kbq-button>` with the default `tabIndex` of 0 SHALL render no `tabindex` attribute, and an `<a kbq-button>` SHALL render `tabindex="0"` so that it is focusable without `href`. A `tabIndex` input SHALL be rendered as given while enabled. A disabled button SHALL render `tabindex="-1"` and its `tabIndex` property SHALL read -1. A `null`, `undefined` or non-numeric `tabIndex` SHALL restore the default 0.

#### Scenario: Defaults

- **WHEN** an enabled `<button kbq-button>` and an enabled `<a kbq-button>` are rendered without `tabIndex`
- **THEN** the button has no `tabindex` attribute and the anchor has `tabindex="0"`

#### Scenario: Custom tab index

- **WHEN** `tabIndex` is 3 and the button is then disabled
- **THEN** the host has `tabindex="3"`, and `tabindex="-1"` once disabled

#### Scenario: Non-numeric tab index

- **WHEN** `tabIndex` is bound to `'not-a-number'`
- **THEN** the `tabIndex` property reads 0 and the host never renders `tabindex="NaN"`

#### Scenario: Unbinding the tab index

- **WHEN** `tabIndex` changes from 3 to `null` or `undefined` on a native button
- **THEN** the `tabIndex` property reads 0 and the host has no `tabindex` attribute

### Requirement: Role of an anchor button

An `<a kbq-button>` without `href` SHALL get `role="button"`, SHALL lose it once an `href` appears, including one applied by `routerLink`, and SHALL get it back when the `href` goes away. A host that is not an anchor MUST be left with the role it was authored with, including a role the consumer set on a native button.

#### Scenario: Anchor without href

- **WHEN** an `<a kbq-button>` is rendered without `href`
- **THEN** the host has `role="button"`

#### Scenario: href appears and goes away

- **WHEN** the anchor's bound `href` changes from `null` to `'/somewhere'` and back to `null`
- **THEN** the host loses `role="button"` and then has it again

#### Scenario: routerLink anchor

- **WHEN** an `<a kbq-button [routerLink]>` is rendered
- **THEN** the host has an `href` and no `role` attribute

#### Scenario: Native button keeps its role

- **WHEN** a `<button kbq-button>` is rendered with `role="radio"`, and another one without a role
- **THEN** the first keeps `role="radio"` and the second has no `role` attribute

### Requirement: Focus tracking

The button SHALL track the focus origin of its host and its descendants, so the host carries `cdk-focused` and one of `cdk-keyboard-focused`, `cdk-mouse-focused`, `cdk-touch-focused` or `cdk-program-focused` while focus is inside it, and SHALL stop tracking when destroyed. The `hasFocus` property SHALL be true between the host's `focus` and `blur` events.

#### Scenario: Keyboard focus

- **WHEN** the user tabs onto the button
- **THEN** the host has `cdk-focused` and `cdk-keyboard-focused`

#### Scenario: Focus and blur

- **WHEN** the host receives `focus` and then `blur`
- **THEN** `hasFocus` reads `true` and then `false`

#### Scenario: Destroying the button

- **WHEN** the button is destroyed
- **THEN** focus tracking of its host stops

### Requirement: Programmatic focus

`focus()` SHALL move DOM focus to the host, and `focusViaKeyboard()` SHALL focus it with the keyboard origin, so it gets the keyboard focus look. Both MUST do nothing while the button is disabled.

#### Scenario: Focusing from code

- **WHEN** `focus()` is called on an enabled button
- **THEN** the host is the active element and `hasFocus` is `true`

#### Scenario: Focusing with the keyboard origin

- **WHEN** `focusViaKeyboard()` is called on an enabled button
- **THEN** the host is focused with the `keyboard` origin

#### Scenario: Disabled button

- **WHEN** `focus()` and `focusViaKeyboard()` are called on a disabled button
- **THEN** focus does not move and `hasFocus` stays `false`

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

### Requirement: Loading indication

The global `kbq-progress` class from the core styles SHALL cover the button with a moving striped pattern, which SHALL stand still when the user prefers reduced motion. The class MUST NOT disable the button, change its ARIA attributes or block clicks.

#### Scenario: Progress class

- **WHEN** a button has the class `kbq-progress`
- **THEN** it shows the striped pattern over its own look

#### Scenario: Button in progress stays clickable

- **WHEN** the user clicks an enabled button that has `kbq-progress`
- **THEN** its click handlers run

### Requirement: Style class

The `kbqStyle` input SHALL put a `kbq-button_<style>` class on the host: `filled` by default and for any falsy value, `outline` or `transparent` from `KbqButtonStyles`, or any other string verbatim. Reading the `kbqStyle` property back SHALL return that class name, not the value that was set.

#### Scenario: Default style

- **WHEN** a button is rendered without `kbqStyle`
- **THEN** the host has `kbq-button_filled` and `kbqStyle` reads `'kbq-button_filled'`

#### Scenario: Falsy style

- **WHEN** `kbqStyle` changes from `outline` to `''`, or a bound style turns `undefined`
- **THEN** the host has `kbq-button_filled` and no longer has `kbq-button_outline`

#### Scenario: Custom style

- **WHEN** `kbqStyle` is `'changed-filter'`
- **THEN** the host has `kbq-button_changed-filter`

### Requirement: Default color follows the style

While neither the `color` input nor a value set in code gives a color, the button SHALL take its style's default color as a `kbq-<color>` class: `contrast-fade` for `filled` and `outline`, `contrast` for `transparent`, and `contrast-fade` for a custom style. It SHALL follow the style when the style changes.

#### Scenario: Default color of each style

- **WHEN** a button without a color has the style `filled`, `outline` or `transparent`
- **THEN** the host has `kbq-contrast-fade`, `kbq-contrast-fade` or `kbq-contrast` respectively

#### Scenario: Style changes back and forth

- **WHEN** a button without a color changes from `transparent` to `filled`
- **THEN** the host has `kbq-contrast` and then `kbq-contrast-fade`

#### Scenario: Custom style

- **WHEN** a button without a color has the style `'changed-filter'`
- **THEN** the host has `kbq-contrast-fade`

### Requirement: Explicit color

The `color` input SHALL put a `kbq-<color>` class on the host in place of the style's default and SHALL keep it when the style changes. A color set in code through the `color` signal SHALL hold until the input changes. A `null` or empty color SHALL fall back to the style's default.

#### Scenario: Bound color

- **WHEN** `color` is `theme-fade` and the style changes to `transparent`
- **THEN** the host has `kbq-theme-fade` and not `kbq-contrast`

#### Scenario: Color set in code

- **WHEN** `color.set('theme')` is called and the style then changes to `transparent`
- **THEN** `color()` reads `theme` and the host has `kbq-theme`

#### Scenario: Clearing the color

- **WHEN** a transparent button's `color` changes from `theme-fade` to `null`
- **THEN** the host has `kbq-contrast` and no longer has `kbq-theme-fade`

### Requirement: Supported style and color pairs

The button theme SHALL render six pairs of style and color: `filled` with `contrast` or `contrast-fade`, `outline` with `theme-fade` or `contrast-fade`, and `transparent` with `theme` or `contrast`. Any other color on a built-in style SHALL render that style's default look rather than an unstyled button. A custom style SHALL get no colors from the button theme; whoever defines it supplies them.

#### Scenario: Supported pairs

- **WHEN** each of the six pairs is rendered, along with each style without a color
- **THEN** every button shows the design system's look for its pair

#### Scenario: Pair the design system does not define

- **WHEN** a `filled` button has `color="theme"`
- **THEN** it looks like a `filled` button with its default color

### Requirement: Forced hover and pressed looks

The classes `kbq-hover` and `kbq-active`, set by the consumer or by another directive, SHALL give the button its hover and pressed looks without a pointer. Neither class nor the pointer hover and press SHALL change the look of a disabled button.

#### Scenario: Forced states

- **WHEN** one button has `kbq-hover` and another has `kbq-active`
- **THEN** they show the hover and the pressed look of their style and color

#### Scenario: Disabled button

- **WHEN** a disabled button has `kbq-active`
- **THEN** it keeps the disabled look

### Requirement: Content layout

Default content SHALL be rendered in the label box, the element `textElement` returns, which sits inside the row `parentTextElement` returns. Content marked `kbqButtonPrefix` SHALL be placed in that row before the label box, and content marked `kbqButtonSuffix` after it, whatever their order in the template. An icon without a marker SHALL stay in the label box.

#### Scenario: Prefix written after the text

- **WHEN** a button's template has the text and then an icon marked `kbqButtonPrefix`
- **THEN** the icon is rendered before the label box and outside it

#### Scenario: Suffix written before the text

- **WHEN** a button's template has an icon marked `kbqButtonSuffix` and then the text
- **THEN** the icon is rendered after the label box and outside it

#### Scenario: Icon without a marker

- **WHEN** a button's template has an unmarked icon before its text
- **THEN** the icon is rendered inside the label box

#### Scenario: Label box and row

- **WHEN** `textElement` and `parentTextElement` are read
- **THEN** they return the label box and the row that contains it

### Requirement: Slot classes

`kbqButtonPrefix` and `kbqButtonSuffix` SHALL add the class `kbq-button-prefix` or `kbq-button-suffix` to their element whatever it holds, which spaces it from the label on the inline-start or inline-end side. On an icon-only button that spacing MUST NOT apply, so a lone marked icon stays centred.

#### Scenario: Non-icon slot content

- **WHEN** a `<span kbqButtonPrefix>` and a `<span kbqButtonSuffix>` surround the text
- **THEN** they have `kbq-button-prefix` and `kbq-button-suffix`

#### Scenario: Marked lone icon

- **WHEN** an icon-only button's single icon is marked `kbqButtonPrefix`
- **THEN** the icon is centred horizontally in the button

### Requirement: Icon-only detection

The host SHALL have `kbq-button-icon` instead of `kbq-button` when its content is one or two `kbq-icon` elements placed directly in it, in any slot, and nothing else, ignoring comments and whitespace. With more icons, any other content, or an icon nested in another element, it SHALL have `kbq-button`. The class SHALL be recomputed when icons or other content are added or removed.

#### Scenario: Single icon with whitespace

- **WHEN** a button holds one icon surrounded by whitespace, with `preserveWhitespaces` on
- **THEN** the host has `kbq-button-icon` and not `kbq-button`

#### Scenario: Three icons

- **WHEN** a button holds three icons and nothing else
- **THEN** the host has `kbq-button` and not `kbq-button-icon`

#### Scenario: Icon removed and added

- **WHEN** the only content of a button is an icon inside `@if` and the condition turns false, then true again
- **THEN** the host changes to `kbq-button`, then back to `kbq-button-icon`

#### Scenario: Many icon buttons at once

- **WHEN** 1500 icon-only buttons are rendered in one pass
- **THEN** all of them render without an error and the last one has `kbq-button-icon`

### Requirement: Icon position classes

When the content has more than one visible node, an icon that comes first SHALL get `kbq-icon_left` and the host `kbq-button-icon_left` (`buttonLeftIconClassName`), and an icon that comes last SHALL get `kbq-icon_right` and the host `kbq-button-icon_right` (`buttonRightIconClassName`). Order is taken after slot placement, with unmarked icons counted as siblings of the text. A lone icon, or one between other nodes, MUST NOT get either class.

#### Scenario: Two icons

- **WHEN** a button holds two icons and nothing else
- **THEN** the first has `kbq-icon_left`, the second `kbq-icon_right`, and the host has both host classes

#### Scenario: Icon before and after an element

- **WHEN** one button holds an icon then a `<span>`, and another a `<span>` then an icon
- **THEN** the first host has only `kbq-button-icon_left` and the second only `kbq-button-icon_right`

#### Scenario: Icon between other nodes

- **WHEN** a button holds text, an icon and more text
- **THEN** neither the icon nor the host gets a position class

#### Scenario: Three icons

- **WHEN** a button holds three icons
- **THEN** the first and the last get position classes and the middle one gets none

#### Scenario: Leading icon removed

- **WHEN** a leading icon inside `@if` is removed
- **THEN** the host loses `kbq-button-icon_left`

### Requirement: Label-free class

The host SHALL have `kbq-button_no-label` while the label box holds no text, including when its content is an icon nested in the consumer's own element, and MUST NOT have it when the label box holds any text.

#### Scenario: Icon only

- **WHEN** a button's only content is an icon, directly or wrapped in a `<span>`
- **THEN** the host has `kbq-button_no-label`

#### Scenario: Icon and text

- **WHEN** a button holds an icon and text, directly or wrapped in a `<span>`
- **THEN** the host does not have `kbq-button_no-label`

### Requirement: Accessible-name warning for icon-only buttons

In dev mode, an icon-only button that has no text, `aria-label`, `aria-labelledby` or `title` SHALL log, once and after it has rendered, the warning "KbqButton: icon-only button has no accessible name. Add [aria-label] or [aria-labelledby] to it." The button MUST NOT give itself an accessible name.

#### Scenario: Unnamed icon button

- **WHEN** an icon-only button without a name renders in dev mode
- **THEN** that warning is logged with the host element

#### Scenario: Labelled icon button

- **WHEN** an icon-only button with `aria-label="Expand"` renders
- **THEN** no accessible-name warning is logged

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

### Requirement: Icon-only buttons are not shrunk

An icon-only button MUST NOT be narrowed by a container smaller than itself, so its icon is never clipped.

#### Scenario: Container narrower than the button

- **WHEN** an icon-only button is in a 20 px container
- **THEN** the button keeps its own width of more than 30 px and nothing in it is clipped

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

### Requirement: Tooltip for a clipped label

A button that also has `kbq-title` SHALL show its label in a tooltip on hover while the label is clipped.

#### Scenario: Hovering a clipped label

- **WHEN** a button with `kbq-title` has a clipped label and the user hovers it
- **THEN** a tooltip appears

### Requirement: Active class of a dropdown trigger

A `kbq-button` that also has `kbqDropdownTriggerFor` SHALL have the class `kbq-active` while its dropdown is open, which keeps its pressed look, and SHALL lose it when the dropdown closes.

#### Scenario: Opening the dropdown

- **WHEN** the user clicks a button that triggers a dropdown
- **THEN** the dropdown opens and the button has `kbq-active`

#### Scenario: Closing the dropdown

- **WHEN** that dropdown closes
- **THEN** the button no longer has `kbq-active`

### Requirement: Button group container

`kbq-button-group`, as an element or an attribute, SHALL have `role="group"`, the classes `kbq-button-group` and `kbq-button-group_<orientation>`, and SHALL join its buttons into one unit along its `orientation`, `'horizontal'` by default or `'vertical'`. It MUST NOT set `aria-orientation`, and it SHALL have no axe violations in either orientation.

#### Scenario: Orientation class

- **WHEN** `orientation` is `'vertical'`
- **THEN** the group has `kbq-button-group_vertical`

#### Scenario: Default orientation

- **WHEN** a group is rendered without `orientation`
- **THEN** it has `kbq-button-group_horizontal`, `role="group"` and no `aria-orientation`

#### Scenario: Accessibility

- **WHEN** a group of two text buttons is checked with axe in either orientation
- **THEN** there are no violations

### Requirement: Group inputs

`kbq-button-group` SHALL accept `color`, `kbqStyle` and `disabled` and pass them to its buttons exactly as `kbqButtonGroupRoot` does. `kbqButtonGroupRoot` SHALL do the same on any element without adding a role, an orientation or a layout.

#### Scenario: Group style and color

- **WHEN** a group has `kbqStyle="outline"` and `color="theme-fade"` from the first render
- **THEN** every button has `kbq-button_outline` and `kbq-theme-fade` and not `kbq-contrast-fade`

### Requirement: Group style propagation

A `kbqStyle` bound on the group SHALL be applied to every button in it that has no `kbqStyle` of its own, and a falsy value SHALL apply `filled`. A button with its own `kbqStyle` SHALL keep it when the group style changes. While the group's `kbqStyle` was never bound or set, the group MUST NOT change any button's style.

#### Scenario: Group style

- **WHEN** the group's `kbqStyle` is `outline`
- **THEN** every button has `kbq-button_outline`

#### Scenario: Group style turns undefined

- **WHEN** the group's bound `kbqStyle` changes from `outline` to `undefined`
- **THEN** every button has `kbq-button_filled`

#### Scenario: Button with its own style

- **WHEN** one button has `kbqStyle="transparent"` and the group's `kbqStyle` changes to `outline`
- **THEN** that button keeps `transparent` and the others become `outline`

### Requirement: Releasing a button's own style in a group

When a button's own `kbqStyle` turns falsy inside a group, the button SHALL fall back to `filled` and SHALL follow the group style again from the group's next style change.

#### Scenario: Own style released

- **WHEN** a button's own `kbqStyle` changes from `transparent` to `undefined` in a `filled` group, and the group then changes to `outline`
- **THEN** the button is `filled` and then `outline`

### Requirement: Group color propagation

A color bound on the group, or set on it in code to a value other than `contrast-fade`, SHALL be applied to every button without a color of its own, over its style's default and through later style changes. While the group's color is unbound or `null`, every button SHALL keep its style's default color, and the group element SHALL have `kbq-contrast-fade`.

#### Scenario: Group color

- **WHEN** the group's `color` is `theme`
- **THEN** every button has `kbq-theme`, whatever its style

#### Scenario: Unbound group color

- **WHEN** the group's `color` is `null` and it holds a `filled` and a `transparent` button
- **THEN** they have `kbq-contrast-fade` and `kbq-contrast` respectively

#### Scenario: Group color removed at runtime

- **WHEN** the group's `color` changes from `theme` to `null`
- **THEN** each button returns to its style's default color and the group element has `kbq-contrast-fade`

#### Scenario: Group style changes after the color

- **WHEN** the group's `color` is `theme` and its `kbqStyle` then changes to `transparent`
- **THEN** every button keeps `kbq-theme` and does not get `kbq-contrast`

### Requirement: A button's own color wins over the group

A button with its own `color` input, or with a color set in code, SHALL keep that color when the group color changes.

#### Scenario: Own color input

- **WHEN** one button has `color="theme"` and the group's `color` changes to `theme-fade`
- **THEN** that button keeps `theme` and the others get `theme-fade`

#### Scenario: Color set in code

- **WHEN** `color.set('contrast')` is called on a button and the group's `color` then changes
- **THEN** the button keeps `kbq-contrast`

### Requirement: Group disabled state

Setting the group's `disabled` to true SHALL disable every button in it. Setting it back to false SHALL re-enable only the buttons that are not disabled through their own input. While the group's `disabled` is unbound, the group MUST NOT change any button's disabled state.

#### Scenario: Disabling the group

- **WHEN** the group's `disabled` turns true
- **THEN** every native button in it has the `disabled` attribute

#### Scenario: Re-enabling the group

- **WHEN** the group is disabled and then enabled again, and one button has `[disabled]="true"`
- **THEN** that button stays disabled and the others are enabled

#### Scenario: Unbound disabled input

- **WHEN** the group has no `disabled` binding
- **THEN** no button in it has the `disabled` attribute

### Requirement: Buttons added to a group later

A button added to a group after the first render, for example by `@if` or `@for`, SHALL receive the group's current style, color and disabled state, and the existing buttons SHALL keep their own overrides. Only buttons placed directly in the group's content SHALL be reached; a button inside another element of that content MUST NOT be.

#### Scenario: Button revealed by @if

- **WHEN** the group has `color="theme-fade"` or `kbqStyle="outline"` and a second button is revealed by `@if`
- **THEN** both buttons have that color or style

#### Scenario: Overrides survive an added button

- **WHEN** a button with its own `transparent` style is in an `outline` group and another button is added
- **THEN** the first button stays `transparent`

#### Scenario: Button inside a wrapper element

- **WHEN** a button sits inside a `<div>` within the group's content and the group's `kbqStyle` is `outline`
- **THEN** that button keeps its own default style

### Requirement: Group root style class

The element that carries `kbqButtonGroupRoot`, including `kbq-button-group`, SHALL have the class `kbq-button-group-root_<style>` once its `kbqStyle` has been bound or set, with `filled` for a falsy value, and no such class while it never was.

#### Scenario: Group style class

- **WHEN** the group's `kbqStyle` is bound to `filled`, or bound to `outline` and then to `undefined`
- **THEN** the group's style property and class read `kbq-button-group-root_filled`

#### Scenario: Unstyled group

- **WHEN** a group is rendered without `kbqStyle`
- **THEN** the group element has no `kbq-button-group-root_` class
