# Spec Delta

## Purpose

Describes what `kbq-split-button` from `@koobiq/components/split-button` guarantees to consumers: how it joins the buttons it holds into one control, how its style, color and disabled state reach those buttons, how it sets up the menu of a nested dropdown trigger, and what it exposes to assistive technology.

## ADDED Requirements

### Requirement: Host element

The split button SHALL be available as the `kbq-split-button` element and as the `kbq-split-button` attribute, as a standalone component and through `KbqSplitButtonModule`, and SHALL put the `kbq-split-button` class on its host.

#### Scenario: Element form

- **WHEN** a template renders `<kbq-split-button>` with two `kbq-button` children
- **THEN** the host element has the class `kbq-split-button`

#### Scenario: Attribute form

- **WHEN** a template renders `<div kbq-split-button>` with two `kbq-button` children
- **THEN** that element is the split button and has the class `kbq-split-button`

### Requirement: Only direct button children are rendered

The split button SHALL render, in source order, only its direct children that carry the `kbq-button` attribute, including one placed in an `@if` block. Any other content MUST NOT be rendered, and a button wrapped in another element MUST NOT be rendered or counted as one of its buttons.

#### Scenario: Extra content

- **WHEN** the split button holds a `<span>` next to its two buttons
- **THEN** the span is not rendered

#### Scenario: Button in an @if block

- **WHEN** the second button sits in an `@if` block whose condition becomes true
- **THEN** the button is rendered after the first one and is treated as one of the split button's buttons

### Requirement: At least one button in development mode

In development mode the split button SHALL throw "kbq-split-button must contain at least one button" when its content is first initialized without a `kbq-button` child. Outside development mode it MUST NOT throw and SHALL render an empty group. The check SHALL run only once, so buttons removed later MUST NOT trigger it.

#### Scenario: No buttons in development mode

- **WHEN** `<kbq-split-button />` is rendered without children in development mode
- **THEN** the first change detection throws that error

#### Scenario: No buttons outside development mode

- **WHEN** the same template is rendered outside development mode
- **THEN** change detection completes without an error

### Requirement: Position classes on the nested buttons

The split button SHALL give every nested button the class `kbq-split-button_item`, the first one `kbq-split-button_first` and the last one `kbq-split-button_second`. A single button SHALL get both position classes, and a button between the first and the last SHALL get neither.

#### Scenario: Two buttons

- **WHEN** the split button holds two buttons
- **THEN** both have `kbq-split-button_item`
- **AND** the first has `kbq-split-button_first` and the second has `kbq-split-button_second`

#### Scenario: One button

- **WHEN** the split button holds a single button
- **THEN** that button has both `kbq-split-button_first` and `kbq-split-button_second`

### Requirement: Joined layout class on the host

The host SHALL have the class `kbq-split-button_styles-for-nested` while it holds more than one button, and MUST NOT have it while it holds one. This class is what joins the buttons visually into one control.

#### Scenario: Two buttons

- **WHEN** the split button holds two buttons
- **THEN** the host has `kbq-split-button_styles-for-nested`

#### Scenario: One button

- **WHEN** the split button holds one button
- **THEN** the host does not have `kbq-split-button_styles-for-nested`

### Requirement: Buttons added or removed later

When buttons are added or removed after initialization, the split button SHALL reassign the position classes and the joined layout class, and SHALL apply its current style, color and disabled state to every button it now holds.

#### Scenario: Adding a second button

- **WHEN** a split button with one button and `kbqStyle="outline"` gets a second button
- **THEN** the first button keeps `kbq-split-button_first` and loses `kbq-split-button_second`, and the new one has `kbq-split-button_second`
- **AND** the host has `kbq-split-button_styles-for-nested` and both buttons have the `outline` style

#### Scenario: Removing the second button

- **WHEN** the second of two buttons is removed
- **THEN** the remaining button has both position classes
- **AND** the host no longer has `kbq-split-button_styles-for-nested`

### Requirement: Style class on the host

`kbqStyle` SHALL accept a `KbqButtonStyles` value or any other string and render it on the host as the class `kbq-button_<value>`. While it is unbound, empty, `null` or `undefined`, the style SHALL be `filled`.

#### Scenario: Default style

- **WHEN** `kbqStyle` is not set
- **THEN** the host has `kbq-button_filled`

#### Scenario: Changing the style

- **WHEN** `kbqStyle` changes from `filled` to `outline`
- **THEN** the host has `kbq-button_outline` instead of `kbq-button_filled`

#### Scenario: Empty value

- **WHEN** `kbqStyle` is bound to `''`, or to `undefined` after another value
- **THEN** the host has `kbq-button_filled`

### Requirement: Style propagates to the nested buttons

The split button SHALL apply its style to every nested button whenever the style or the set of buttons changes.

#### Scenario: Outline split button

- **WHEN** `kbqStyle` changes to `outline`
- **THEN** every nested button has `kbq-button_outline`

### Requirement: A button's own style wins

A nested button whose own `kbqStyle` is set to a non-empty value SHALL keep that style, and the split button MUST NOT overwrite it.

#### Scenario: Button with its own style

- **WHEN** the first button binds `kbqStyle` to `transparent` and the split button's style becomes `outline`
- **THEN** the first button stays `transparent` and the second one becomes `outline`

### Requirement: Style property in code

The `kbqStyle` property SHALL read back as the host class `kbq-button_<style>`, not as the value that was set. Writing it in code SHALL apply the style to the nested buttons at once, and the next change of the bound input SHALL replace it.

#### Scenario: Reading the style

- **WHEN** `kbqStyle` is bound to `outline` and code reads the `kbqStyle` property
- **THEN** it returns `'kbq-button_outline'`

### Requirement: Host color class

The host SHALL have the class `kbq-<color>` for its own color: the bound `color` or a color set in code, and `contrast-fade` otherwise, whatever the style.

#### Scenario: Default host color

- **WHEN** neither `color` nor `kbqStyle` is set
- **THEN** the host has `kbq-contrast-fade`

#### Scenario: Transparent style without a color

- **WHEN** `kbqStyle` is `transparent` and `color` is not set
- **THEN** the host still has `kbq-contrast-fade`

### Requirement: Bound color propagates to the nested buttons

A non-empty `color` bound on the split button SHALL become the color of every nested button, whatever its value, and SHALL stay when the style changes.

#### Scenario: Theme color

- **WHEN** `color` is bound to `theme`
- **THEN** every nested button's color is `theme`

#### Scenario: Style changes under a bound color

- **WHEN** `color` is `theme` and `kbqStyle` changes to `transparent`
- **THEN** every nested button's color is still `theme`

### Requirement: Without a color the buttons follow their style

While `color` is unbound or bound to an empty value, the split button MUST NOT pass a color to the nested buttons. Each button SHALL use the default color of its style: `contrast` for `transparent`, `contrast-fade` for `filled`, `outline` and custom styles.

#### Scenario: Unbound color under the transparent style

- **WHEN** `kbqStyle` is `transparent` and `color` is not bound
- **THEN** every nested button's color is `contrast`

#### Scenario: Color cleared

- **WHEN** `color` changes from `contrast` to `null` under the `filled` style
- **THEN** every nested button's color returns to `contrast-fade`

### Requirement: Color set in code

A color written through `color.set()` SHALL be passed to the nested buttons when it differs from `contrast-fade`. Without a bound `color`, `contrast-fade` written in code MUST NOT be passed on, so the buttons keep the default color of their style.

#### Scenario: Theme set in code

- **WHEN** code calls `color.set('theme')` on a split button without a bound `color`
- **THEN** every nested button's color is `theme`

#### Scenario: Contrast-fade set in code under the transparent style

- **WHEN** `kbqStyle` is `transparent`, `color` is not bound and code calls `color.set('contrast-fade')`
- **THEN** the nested buttons keep the color `contrast`

### Requirement: A button's own color wins

A nested button whose own `color` is set SHALL keep it. The split button's color SHALL only replace the default color of that button's style.

#### Scenario: Button with its own color

- **WHEN** the first button binds `color` to `theme` and the split button has no color
- **THEN** the first button's color is `theme` and the second button's color is `contrast-fade`

### Requirement: Long label of the leading button is truncated

When the split button is narrower than the label of its leading button, the label SHALL stay on one line and be cut with an ellipsis, with or without an icon in `kbqButtonPrefix`.

#### Scenario: Narrow container

- **WHEN** a split button whose first button has a long label is placed in a 180 px wide container
- **THEN** the label is clipped on one line and ends with an ellipsis

### Requirement: Disabling the split button disables its buttons

`disabled`, coerced as a boolean attribute, SHALL disable every nested button while it is true, including buttons present on the first render and buttons added later, the same way the button's own `disabled` input does. A button's own `disabled` set to false MUST NOT enable it while the split button is disabled.

#### Scenario: Disabling after render

- **WHEN** `disabled` changes to `true`
- **THEN** every nested button is disabled

#### Scenario: Disabled on the first render

- **WHEN** the split button is first rendered with `[disabled]="true"`
- **THEN** every nested button is disabled

#### Scenario: Bare attribute

- **WHEN** the split button has the `disabled` attribute without a value
- **THEN** every nested button is disabled

### Requirement: Re-enabling keeps a button's own disabled state

Setting `disabled` to false SHALL enable the nested buttons that are not disabled through their own `disabled` input. A button disabled through its own input SHALL stay disabled.

#### Scenario: Re-enabling

- **WHEN** the first button binds `disabled` to `true`, and the split button is disabled and then enabled again
- **THEN** the first button is disabled and the second is enabled

### Requirement: Unset disabled leaves the buttons alone

While `disabled` has never been set, the split button MUST NOT change the disabled state of its buttons, and its `disabled` property SHALL read `undefined`.

#### Scenario: Button disabled on its own

- **WHEN** the split button has no `disabled` binding and its first button binds `disabled` to `true`
- **THEN** the first button is disabled and the second is enabled

### Requirement: Disabled state of the end buttons

`firstDisabled` SHALL be true while the first nested button is disabled, and `secondDisabled` while the last of two or more is; with a single button `secondDisabled` SHALL be false. The host SHALL have `kbq-split-button_first-disabled` and `kbq-split-button_second-disabled` while the matching property is true, whatever disabled the button.

#### Scenario: Leading button disabled

- **WHEN** the first button binds `disabled` to `true`
- **THEN** `firstDisabled` is true and the host has `kbq-split-button_first-disabled`
- **AND** the host does not have `kbq-split-button_second-disabled`

#### Scenario: Trailing button disabled

- **WHEN** the last of two buttons binds `disabled` to `true`
- **THEN** `secondDisabled` is true and the host has `kbq-split-button_second-disabled`

#### Scenario: Whole split button disabled

- **WHEN** the split button's `disabled` is `true`
- **THEN** the host has both `kbq-split-button_first-disabled` and `kbq-split-button_second-disabled`

#### Scenario: One button

- **WHEN** the split button holds a single button
- **THEN** `secondDisabled` is false

### Requirement: Menu opens toward the start

When one of its buttons is a dropdown trigger (`kbqDropdownTriggerFor`), the split button SHALL set that dropdown's `xPosition` to `before`. With the dropdown's default `overlapTriggerX`, the menu's end edge then lines up with the trigger's end edge and the menu extends toward the start; when it does not fit there, the dropdown's own fallback SHALL apply.

#### Scenario: Split button with a menu

- **WHEN** the second button of a split button is a dropdown trigger
- **THEN** the dropdown's `xPosition` is `before`

#### Scenario: Not enough room toward the start

- **WHEN** the open menu is wider than the space between the trigger's end edge and the start of the viewport
- **THEN** the menu opens from the trigger's start edge toward the end

### Requirement: Menu width follows the trigger by default

With `panelAutoWidth` false, its default, the menu SHALL be sized against the dropdown trigger alone, as a standalone dropdown is: never narrower than the trigger or than the dropdown's `panelMinWidth` (200 px by default).

#### Scenario: Narrow trigger

- **WHEN** `panelAutoWidth` is false, the trigger is 50 px wide and the split button 600 px
- **THEN** the open menu has a minimum width of 200 px

### Requirement: Menu width matching the whole split button

With `panelAutoWidth` true, the menu SHALL be sized against the whole split button instead of the trigger, measured each time the menu opens. With the dropdown's default `panelWidth` it SHALL be at least as wide as the split button; with `panelWidth="auto"` it SHALL match that width, never below `panelMinWidth`.

#### Scenario: Wide split button

- **WHEN** `panelAutoWidth` is true, the split button is 600 px wide and the trigger 50 px
- **THEN** the open menu has a minimum width of 600 px

#### Scenario: Exact width

- **WHEN** `panelAutoWidth` is true and the dropdown has `panelWidth="auto"` and `panelMinWidth` set to 0
- **THEN** the open menu is exactly as wide as the split button

### Requirement: Host is a group

The host SHALL have `role="group"` and MUST NOT set an accessible name of its own; a consumer names it with `aria-label` or `aria-labelledby` on the host.

#### Scenario: Default role

- **WHEN** a split button is rendered
- **THEN** its host has `role="group"` and no `aria-label`

### Requirement: Buttons stay separate tab stops

The split button MUST NOT be focusable itself and MUST NOT handle keys. Each enabled nested button SHALL stay its own tab stop in source order with its own activation keys, and a disabled one SHALL leave the tab order as a disabled `kbq-button` does.

#### Scenario: Tabbing through

- **WHEN** both buttons are enabled and the user presses Tab from the element before the split button
- **THEN** focus moves to the first button, and the next Tab moves it to the second

#### Scenario: Disabled leading button

- **WHEN** the first button is disabled and the user tabs into the split button
- **THEN** focus lands on the second button

### Requirement: Menu trigger reports its open state

The split button MUST NOT change the ARIA of a nested dropdown trigger: the trigger SHALL keep its `aria-expanded`, `false` while the menu is closed and `true` while it is open.

#### Scenario: Opening the menu

- **WHEN** the menu of the split button's trigger opens
- **THEN** the trigger's `aria-expanded` changes from `false` to `true`

### Requirement: No automated accessibility violations

A split button whose icon-only buttons have an `aria-label` SHALL pass the axe-core rules that run without rendering, both with its menu closed and with a nested button disabled.

#### Scenario: Closed menu

- **WHEN** a split button with a text button and a named icon-only dropdown trigger is checked with axe-core
- **THEN** no violation is reported

#### Scenario: Disabled nested button

- **WHEN** a split button with two named icon-only buttons, the first one disabled, is checked with axe-core
- **THEN** no violation is reported
